import { FastifyInstance } from 'fastify';
import * as controllers from '../controllers';
import { utils } from '../utils';
import { CreateItemSchema } from '../schemas/Item';

async function itemRouter(fastify: FastifyInstance) {
  fastify.post(
    '/item',
    {
      config: {
        description: 'Item entity management',
      },
      preValidation: utils.preBodyValidation(CreateItemSchema),
      preHandler: utils.auth,
    },
    controllers.create,
  );
}

export default itemRouter;
