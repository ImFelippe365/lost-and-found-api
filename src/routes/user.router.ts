import { FastifyInstance } from 'fastify';
import * as controllers from './../controllers';
import { utils } from '../utils';

export async function userRouter(fastify: FastifyInstance) {
  fastify.get(
    '/:id',
    {
      preHandler: utils.auth,
    },
    controllers.getUserById,
  );
}
