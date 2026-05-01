import { defineConfig } from "drizzle-kit";
import { DATABASE_URL } from "./src/config/env.ts";

export default defineConfig({
  out: "./src/db/migration",
  schema: "./src/db/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL!,
  },
});
