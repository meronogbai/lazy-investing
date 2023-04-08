import { AxiosError } from "axios";
import { Broker } from "./broker";
import { parseCLIArguments } from "./utils";

const main = async () => {
  // @TODO spin up docker instance here
  const { amount } = await parseCLIArguments();
  const broker = new Broker();
  await broker.establishSession();
  console.log("Session established");
  await broker.submitOrder({
    amount,
  });
  console.log("🚀 Order submitted successfully!");
};

main().catch((e) => {
  process.exitCode = 1;

  if (e instanceof AxiosError) {
    console.error("Api error: " + e.message);
    console.error(e.response?.data);
    return;
  }

  console.error(e || "Unknown error");
});
