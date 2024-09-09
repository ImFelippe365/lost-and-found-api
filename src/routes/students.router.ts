import { FastifyInstance } from 'fastify';
import * as controllers from '../controllers';
import { utils } from '../utils';
import { PaginationRequestSchema } from '../schemas/Utils';

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
}
