import z from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export interface ILoginSchema extends z.infer<typeof loginSchema> {}
