import config from "@/constants/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!config.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(config.DATABASE_URL);
export const db = drizzle(client, { schema });

export * from "./queries/communities";
