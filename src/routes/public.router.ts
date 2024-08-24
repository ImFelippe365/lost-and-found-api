import * as controller from './../controllers/public.controller';
import { FastifyInstance } from 'fastify';

export async function publicRouter(fastify: FastifyInstance) {
  fastify.get('images', {}, controller.handleImage);
}
