import { z } from 'zod';

export const SuapAPITokenResponse = z.object({
  access: z.string(),
  refresh: z.string(),
});

export const SuapAPIUserDataResponseSchema = z.object({
  id: z.number(),
  matricula: z.string(),
  nome_usual: z.string(),
  cpf: z.string(),
  rg: z.string(),
  data_nascimento: z.string(),
  naturalidade: z.string(),
  email: z.string(),
  url_foto_75x100: z.string(),
  url_foto_150x200: z.string(),
  tipo_vinculo: z.string(),
  vinculo: z.object({
    nome: z.string(),
    curso: z.string(),
    campus: z.string(),
    situacao: z.string(),
    setor_suap: z.string().nullish(),
    situacao_sistemica: z.string(),
    matricula_regular: z.boolean(),
  }),
});

export interface ISuapAPITokenResponse
  extends z.infer<typeof SuapAPITokenResponse> {}

export interface ISuapAPIUserDataResponseSchema
  extends z.infer<typeof SuapAPIUserDataResponseSchema> {}
