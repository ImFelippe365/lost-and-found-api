import z from 'zod';

export default function loadConfig(): void {
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
