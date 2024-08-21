import { FastifyInstance } from 'fastify';
import * as controllers from '../controllers';
import { utils } from '../utils';
import { CreateItemSchema } from 'src/schemas/Item';

async function itemRouter(fastify: FastifyInstance) {
  fastify.post(
    '/item',
    {
      config: {
        description: 'Item entity management',
      },
      preValidation: utils.preValidation(CreateItemSchema),
    },
    controllers.create,
  );
}

export default itemRouter;
