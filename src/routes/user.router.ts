import { FastifyInstance } from 'fastify';
import * as controllers from '../controllers';
import { utils } from '../utils';
import { loginSchema } from '../schemas/User';

async function userRouter(fastify: FastifyInstance) {
  fastify.post(
    '/login',
    {
      config: {
        description: 'User login endpoint',
      },
      preValidation: utils.preValidation(loginSchema),
    },
    controllers.login,
  );

  fastify.post(
    '/signup',
    {
      config: {
        description: 'User signup endpoint',
      },
      preValidation: utils.preValidation(signupSchema),
    },
    controllers.signUp,
  );
}

export default userRouter;
