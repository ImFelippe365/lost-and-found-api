import { FastifyInstance } from 'fastify';
import * as controllers from '../controllers';
import { utils } from '../utils';
import { LoginSchema } from '../schemas/User';

export async function authRouter(fastify: FastifyInstance) {
  fastify.post(
    '/login',
    {
      preValidation: utils.preBodyValidation(LoginSchema),
    },
    controllers.login,
  );
}
