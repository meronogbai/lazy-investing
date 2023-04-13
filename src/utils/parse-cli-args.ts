import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export const parseCLIArguments = async () => {
  const argv = yargs(hideBin(process.argv))
    .option("amount", {
      type: "number",
      demandOption: true,
      description: "Total amount of stock in USD",
    })
    .option("ticker", {
      type: "string",
      demandOption: true,
      description: "Ticker of stock in IBKR",
    })
    .option("yahooFinanceTicker", {
      type: "string",
      demandOption: true,
      description: "Ticker of stock in Yahoo Finance",
    })
    .parse();

  return argv;
};
