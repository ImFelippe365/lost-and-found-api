import z from 'zod';
import { ImageFileSchema, UserResponseSchema } from './User';

export const ShiftEnum = z.enum(['MORNING', 'AFTERNOON', 'NIGHT']);
export const ItemStatusEnum = z.enum(['LOST', 'CLAIMED', 'EXPIRED']);
export const ItemOrderEnum = z.enum(['asc', 'desc']);

export const ItemPictureSchema = z.object({
  id: z.number(),
  name: z.string(),
  filetype: z.string(),
  path: z.string(),
  size: z.number(),
});

export const CreateItemSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  foundBy: z.string().nullable().optional(),
  foundLocation: z.string().nullable().optional(),
  foundDate: z.string().datetime(),
  shift: ShiftEnum,
  withdrawalDeadline: z.string().datetime(),
  pickupLocation: z.string(),
  image: z.any().optional(),
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
  image: z.any().optional(),
});

export const ClaimItemSchema = z.object({
  name: z.string(),
  document: z.string(),
});

export const ClaimantSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  document: z.string(),
});

export const ItemResponseSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  status: ItemStatusEnum,
  description: z.string().nullable().optional(),
  foundBy: z.string().nullable(),
  foundLocation: z.string().nullable(),
  foundDate: z.date(),
  image: z.string().nullable().optional(),
  shift: ShiftEnum,
  withdrawalDeadline: z.date(),
  pickupLocation: z.string(),
});

export const ClaimedItemSchema = z.object({
  id: z.number().int(),
  user: UserResponseSchema,
  claimant: ClaimantSchema,
  withdrawalDate: z.date(),
});

export const ItemDetailedResponseSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  status: ItemStatusEnum,
  description: z.string().nullable().optional(),
  foundBy: z.string().nullable(),
  foundLocation: z.string().nullable(),
  foundDate: z.date(),
  shift: ShiftEnum,
  withdrawalDeadline: z.date(),
  pickupLocation: z.string(),
  createdBy: UserResponseSchema,
  claimedBy: ClaimedItemSchema.nullable().optional(),
  createdAt: z.date(),
  image: ImageFileSchema.optional().nullable(),
  imagePath: z.string().optional(),
});

export const ItemIDRequestParamSchema = z.object({
  itemId: z.string().transform((value) => Number(value)),
});

export const ItemQueriesSchema = z.object({
  name: z.string().optional(),
  status: ItemStatusEnum.optional(),
  orderNameBy: ItemOrderEnum.optional(),
  campusId: z
    .string()
    .transform((value) => Number(value))
    .optional(),
});

export interface ICreateItemSchema extends z.infer<typeof CreateItemSchema> {}
export interface IItemPictureSchema extends z.infer<typeof ItemPictureSchema> {}

export interface IItemIDRequestParams {
  itemId: number;
}
