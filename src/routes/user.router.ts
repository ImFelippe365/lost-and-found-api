import { FastifyInstance } from 'fastify';
import * as controllers from '../controllers';
import { utils } from '../utils';
import { PaginationRequestSchema } from '../schemas/Utils';

export async function userRouter(fastify: FastifyInstance) {
  fastify.get(
    '/scholarship-students',
    {
      preValidation: utils.preQueryValidation(PaginationRequestSchema),
      preHandler: utils.auth,
    },
    controllers.listScholarshipStudents,
  );
}
