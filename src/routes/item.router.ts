import { FastifyInstance } from 'fastify';
import * as controllers from '../controllers';
import { utils } from '../utils';
import {
  ClaimItemSchema,
  CreateItemSchema,
  UpdateItemSchema,
} from '../schemas/Item';

export async function itemRouter(fastify: FastifyInstance) {
  fastify.get(
    '/pageable',
    {
      preHandler: utils.auth,
    },
    controllers.listPageable,
  );

  fastify.get(
    '/:itemId',
    {
      preHandler: utils.auth,
    },
    controllers.listById,
  );

  fastify.post(
    '/',
    {
      preValidation: utils.preBodyValidation(CreateItemSchema),
      preHandler: utils.auth,
    },
    controllers.create,
  );

  fastify.patch(
    '/:itemId/claim',
    {
      preValidation: utils.preBodyValidation(ClaimItemSchema),
      preHandler: utils.auth,
    },
    controllers.claimItem,
  );

  fastify.put(
    '/:itemId',
    {
      preValidation: utils.preBodyValidation(UpdateItemSchema),
      preHandler: utils.auth,
    },
    controllers.update,
  );

  fastify.delete(
    '/:itemId',
    {
      preHandler: utils.auth,
    },
    controllers.remove,
  );

  fastify.post(
    '/:itemId/upload-image',
    {
      preHandler: utils.auth,
    },
    controllers.uploadItemImage,
  );

  fastify.get('/count', {}, controllers.countItemsPerType);
}
