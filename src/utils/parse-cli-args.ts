import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export const parseCLIArguments = async () => {
  const argv = yargs(hideBin(process.argv))
    .option("amount", {
      type: "number",
      demandOption: true,
      description: "total amount",
    })
    .parse();

  return argv;
};
