import z from 'zod';
import { CampusSchema } from './Campus';

export const LoginSchema = z.object({
  registration: z.string(),
  password: z.string(),
});

export const DepartmentEnum = z.enum(['STUDENT', 'EMPLOYEE']);

export const UserResponseSchema = z.object({
  id: z.number().int(),
  registration: z.string(),
  name: z.string(),
  email: z.string().nullable(),
  department: DepartmentEnum,
  isScholarshipHolder: z.boolean().nullable().optional(),
  createdAt: z.date(),
  picture: z.string().nullable(),
  campus: CampusSchema.nullable().optional(),
});

export const TokenDataSchema = z.object({
  id: z.number().int(),
  registration: z.string(),
  name: z.string(),
});

export const TokenResponseSchema = z.object({
  token: z.string(),
});

export const StudentUserQueryParams = z.object({
  scholarshipStudent: z
    .string()
    .optional()
    .transform((val) => (val ? Boolean(val) : undefined)),
  search: z.string().optional(),
});

export const ImageFileSchema = z.object({
  fileDataInBase64: z.string(),
  name: z.string(),
  type: z.string(),
});

export interface ILoginSchema extends z.infer<typeof LoginSchema> {}
export interface IUserResponseSchema
  extends z.infer<typeof UserResponseSchema> {}

export interface ITokenDataSchema extends z.infer<typeof TokenDataSchema> {}

export interface ITokenResponseSchema
  extends z.infer<typeof TokenResponseSchema> {}
export interface IImageFileSchema extends z.infer<typeof ImageFileSchema> {}
