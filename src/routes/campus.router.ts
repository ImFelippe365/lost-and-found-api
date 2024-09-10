import { FastifyInstance } from 'fastify';
import * as controllers from './../controllers';

export async function campusRouter(fastify: FastifyInstance) {
  fastify.get('/', {}, controllers.listAllCampi);
}
