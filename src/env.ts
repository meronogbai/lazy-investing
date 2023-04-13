import { z } from "zod";

import { config } from "dotenv-flow";
config();

const envSchema = z.object({
  GATEWAY_URL: z.string().url(),
  GATEWAY_PORT: z.coerce.number(),
});

export const env = envSchema.parse(process.env);
