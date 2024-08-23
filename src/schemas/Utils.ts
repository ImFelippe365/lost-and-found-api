import { z } from 'zod';

export const PaginationSchema = <T extends z.ZodTypeAny>(contentType: T) =>
  z.object({
    totalElements: z.number().int().gte(0),
    totalPages: z.number().int().gte(0),
    size: z.number().int().gte(0),
    number: z.number().int().gte(0),
    content: z.array(contentType).default([]),
  });

export const PaginationRequestSchema = z.object({
  page: z.string().transform((value) => Number(value)),
  size: z.string().transform((value) => Number(value)),
});

export interface IPaginationSchema<T extends z.ZodTypeAny>
  extends z.infer<ReturnType<typeof PaginationSchema<T>>> {}

export interface IPaginationRequestSchema
  extends z.infer<typeof PaginationRequestSchema> {}
