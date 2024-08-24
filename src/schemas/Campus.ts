import z from 'zod';

export const CampusSchema = z.object({
  id: z.number(),
  name: z.string(),
  acronym: z.string(),
});

export interface ICampusSchema extends z.infer<typeof CampusSchema> {}
