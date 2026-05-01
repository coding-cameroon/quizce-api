import { config } from "dotenv";

const dotenv = config({ override: true, quiet: true });

export const {
  PORT,
  NODE_ENV,
  CLIENT_URL,
  DATABASE_URL,
  IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_URL_ENDPOINT,
} = process.env;
