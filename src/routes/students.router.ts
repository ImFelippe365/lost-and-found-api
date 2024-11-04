import { FastifyInstance } from 'fastify';
import * as controllers from '../controllers';
import { utils } from '../utils';
import {
  PaginationRequestSchema,
  RequestRegistrationParamSchema,
} from '../schemas/Utils';

export async function studentRouter(fastify: FastifyInstance) {
  fastify.patch(
    '/:id/scholarship/toggle',
    {
      preHandler: utils.auth,
    },
    controllers.toggleStudentPermissionAsScholarshipStudent,
  );

  fastify.get(
    '/',
    {
      preValidation: utils.preQueryValidation(PaginationRequestSchema),
      preHandler: utils.auth,
    },
    controllers.listStudents,
  );

  fastify.post(
    '/:registration/scholarship',
    {
      preValidation: utils.preParamsValidation(RequestRegistrationParamSchema),
      preHandler: utils.auth,
    },
    controllers.addStudentPermissionAsScholarshipStudent,
  );

  fastify.delete(
    '/:registration/scholarship',
    {
      preValidation: utils.preParamsValidation(RequestRegistrationParamSchema),
      preHandler: utils.auth,
    },
    controllers.removeStudentAsPendingScholarshipStudent,
  );
}
