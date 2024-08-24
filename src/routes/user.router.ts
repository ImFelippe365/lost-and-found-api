import { FastifyInstance } from 'fastify';
import * as controllers from '../controllers';
import { utils } from '../utils';
import { LoginSchema } from '../schemas/User';
import { PaginationRequestSchema } from '../schemas/Utils';

export async function userRouter(fastify: FastifyInstance) {
  fastify.post(
    '/login',
    {
      preValidation: utils.preBodyValidation(LoginSchema),
    },
    controllers.login,
  );

  fastify.get(
    '/scholarship-students',
    {
      preValidation: utils.preQueryValidation(PaginationRequestSchema),
      preHandler: utils.auth,
    },
    controllers.listScholarshipStudents,
  );
}
