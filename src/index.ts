import { Broker } from "./broker";
import { startIbeam, stopIbeam } from "./ibeam";
import { parseCLIArguments } from "./utils";

const main = async () => {
  const { amount, ticker, yahooFinanceTicker } = await parseCLIArguments();

  try {
    await startIbeam();
  } catch (e) {
    console.error("Error while starting ibeam");
    console.error(e);
    throw e;
  }

  const broker = new Broker();

  try {
    await broker.establishSession();
  } catch (e) {
    console.error("Error while establishing session");
    console.error(e);
    throw e;
  }

  try {
    await broker.submitOrder({
      amount,
      ticker,
      yahooFinanceTicker,
    });
  } catch (e) {
    console.error("Error while submitting order");
    console.error(e);
    throw e;
  }
};

main()
  .catch(() => {
    process.exitCode = 1;
  })
  .finally(stopIbeam);
