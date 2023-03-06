import { z } from "zod";

import { config } from "dotenv-flow";
config();

const envSchema = z.object({
  GATEWAY_URL: z.string().url(),
  GATEWAY_PORT: z.string().min(1),
  IBKR_TICKER: z.string().min(1),
  YAHOO_FINANCE_TICKER: z.string().min(1),
});

export const env = envSchema.parse(process.env);
