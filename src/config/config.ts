import * as dotenv from "dotenv";

interface ENV {
  DATA_BASE_NAME?: string;
  DATA_BASE_HOST?: string;
  DATA_BASE_PORT?: string;
  JWT_SECRET_KEY?: string;
}

interface Config {
  DATA_BASE_NAME: string;
  DATA_BASE_HOST: string;
  DATA_BASE_PORT: number;
  JWT_SECRET_KEY: string;
}

dotenv.config();

const getConfig = (): Config => {
  // Loading process.env as ENV interface
  const env = process.env as ENV;

  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) {
      throw new Error(`Missing key ${key} in config.env`);
    }
  }

  return {
    DATA_BASE_NAME: process.env.DATA_BASE_NAME!,
    DATA_BASE_HOST: process.env.DATA_BASE_HOST!,
    DATA_BASE_PORT: Number(process.env.DATA_BASE_PORT)!,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY!,
  };
};

const config = getConfig();

export default config;
