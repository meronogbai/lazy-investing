import { AxiosError } from "axios";
import { Broker } from "./broker";

const main = async () => {
  // @TODO spin up docker instance here
  const broker = new Broker();
  await broker.establishSession();
  console.log("Session established");
  await broker.submitOrder();
  console.log("🚀 Order submitted successfully!");
};

main().catch((e) => {
  process.exitCode = 1;

  if (e instanceof AxiosError) {
    console.error(e.response?.data);
    return;
  }

  console.error(e);
});
