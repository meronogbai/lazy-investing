import { config } from "dotenv-flow";
import yahooFinance from "yahoo-finance2";
config();

const currentMidPrice = async () => {
  const { regularMarketPrice } = await yahooFinance.quote("ISAC.L");

  if (regularMarketPrice === undefined) {
    throw new Error(`Invalid regularMarketPrice: ${regularMarketPrice}`);
  }

  return regularMarketPrice;
};

const main = async () => {
  console.log(await currentMidPrice());
};

main().catch((err) => {
  process.exitCode = 1;
  console.error(err);
});
