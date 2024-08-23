import { FastifyInstance } from 'fastify';
import * as controllers from '../controllers';
import { utils } from '../utils';
import { LoginSchema } from '../schemas/User';
import { PaginationRequestSchema } from '../schemas/Utils';

async function userRouter(fastify: FastifyInstance) {
  fastify.post(
    '/login',
    {
      config: {
        description: 'User login endpoint',
      },
      preValidation: utils.preBodyValidation(LoginSchema),
      preHandler: utils.auth,
    },
    controllers.login,
  );

  fastify.get(
    '/scholarship-students',
    {
      config: {
        description: 'List scholarship students',
      },
      preValidation: utils.preQueryValidation(PaginationRequestSchema),
      // preHandler: utils.auth,
    },
    controllers.listScholarshipStudents,
  );
}

export default userRouter;
