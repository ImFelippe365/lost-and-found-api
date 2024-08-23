import z from 'zod';

export const LoginSchema = z.object({
  registration: z.string().email(),
  password: z.string(),
});

export const DepartmentEnum = z.enum(['STUDENT', 'EMPLOYEE']);

export const UserResponseSchema = z.object({
  id: z.number().int(),
  registration: z.string(),
  name: z.string(),
  department: DepartmentEnum,
  isScholarshipHolder: z.boolean(),
  createdAt: z.date(),
  picture: z.string().nullable(),
});

export interface ILoginSchema extends z.infer<typeof LoginSchema> {}
export interface IUserResponseSchema
  extends z.infer<typeof UserResponseSchema> {}
