import { AxiosError } from "axios";
import { Broker } from "./broker";
import { startIbeam, stopIbeam } from "./ibeam";
import { parseCLIArguments } from "./utils";

const main = async () => {
  const { amount } = await parseCLIArguments();
  await startIbeam();
  const broker = new Broker();
  await broker.establishSession();
  await broker.submitOrder({
    amount,
  });
};

main()
  .catch((e) => {
    process.exitCode = 1;

    if (e instanceof AxiosError) {
      console.error("Api error: " + e.message);
      console.error(e.response?.data);
      return;
    }

    console.error(e?.message || "Unknown error");
  })
  .finally(stopIbeam);
