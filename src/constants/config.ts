import dotenv from "dotenv";

dotenv.config();

const config = {
  NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  PRIVY_APP_SECRET: process.env.PRIVY_APP_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
  OPENFORMAT_API_KEY: process.env.OPENFORMAT_API_KEY,
  OPENFORMAT_API_URL: process.env.OPENFORMAT_API_URL,
  THIRDWEB_CLIENT_ID: process.env.THIRDWEB_CLIENT_ID,
  THIRDWEB_SECRET: process.env.THIRDWEB_SECRET,
} as const;

export default config;
