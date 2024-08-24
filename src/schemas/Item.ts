import z from 'zod';
import { CampusSchema } from './Campus';

export const ShiftEnum = z.enum(['MORNING', 'AFTERNOON', 'NIGHT']);

export const ItemPictureSchema = z.object({
  id: z.number(),
  name: z.string(),
  filetype: z.string(),
  path: z.string(),
  size: z.number(),
});

export const CreateItemSchema = z.object({
  name: z.string(),
  description: z.string(),
  foundBy: z.string().nullable().optional(),
  foundLocation: z.string().nullable().optional(),
  foundDate: z.string().datetime(),
  shift: ShiftEnum,
  withdrawalDeadline: z.string().datetime(),
  pickupLocation: z.string(),
});

export const UpdateItemSchema = z.object({
  name: z.string(),
  description: z.string(),
  foundBy: z.string().nullable().optional(),
  foundLocation: z.string().nullable().optional(),
  foundDate: z.string().datetime(),
  shift: ShiftEnum,
  withdrawalDeadline: z.string().datetime(),
  pickupLocation: z.string(),
});

export const ClaimItemSchema = z.object({
  name: z.string(),
  document: z.string().nullish(),
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

export const ItemIDRequestParamSchema = z.object({
  itemId: z.string().transform((value) => Number(value)),
});

export interface ICreateItemSchema extends z.infer<typeof CreateItemSchema> {}
export interface IItemPictureSchema extends z.infer<typeof ItemPictureSchema> {}

export interface IItemIDRequestParams {
  itemId: number;
}
