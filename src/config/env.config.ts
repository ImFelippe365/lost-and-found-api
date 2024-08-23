import path from 'path';
import z from 'zod';
import dotenv from 'dotenv';

export default function loadConfig(): void {
  const envPath = path.join(__dirname, '..', '..', '.env');

  const result = dotenv.config({ path: envPath });

  if (result.error) {
    throw new Error(
      `Failed to load .env file from path ${envPath}: ${result.error.message}`,
    );
  }

  const schema = z
    .object({
      NODE_ENV: z.enum(['development', 'testing', 'production']),
      LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'fatal']),
      API_HOST: z.string(),
      API_PORT: z.string(),
      DATABASE_URL: z.string(),
      APP_JWT_SECRET: z.string(),
    })
    .nullable();

  try {
    schema.parse(process.env);
  } catch (error: any) {
    throw new Error(`Config validation error: ${error.message}`);
  }
}
