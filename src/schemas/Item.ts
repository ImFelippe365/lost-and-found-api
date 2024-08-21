import z from 'zod';

export const ShiftEnum = z.enum(['MORNING', 'AFTERNOON', 'NIGHT']);

export const CreateItemSchema = z.object({
  name: z.string(),
  description: z.string(),
  foundBy: z.string().nullable().optional(),
  foundLocation: z.string().nullable().optional(),
  foundDate: z.string().date(),
  image: z.string().nullable().optional(),
  shift: ShiftEnum,
  withdrawalDeadline: z.string().date(),
  pickupLocation: z.string(),
  // Ainda precisa adicionar a parte do campus
});

export const UpdateItemSchema = z.object({
  name: z.string(),
  description: z.string(),
  foundBy: z.string().nullable().optional(),
  foundLocation: z.string().nullable().optional(),
  foundDate: z.string().date(),
  image: z.string().nullable().optional(),
  shift: ShiftEnum,
  withdrawalDeadline: z.string().date(),
  pickupLocation: z.string(),
});

export const ItemResponseSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string(),
  foundBy: z.string().nullable(),
  foundLocation: z.string().nullable(),
  foundDate: z.date(),
  image: z.string().nullable(),
  shift: ShiftEnum,
  withdrawalDeadline: z.date(),
  pickupLocation: z.string(),
});

export interface ICreateItemSchema extends z.infer<typeof CreateItemSchema> {}
