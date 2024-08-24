import { FastifyInstance } from 'fastify';
import * as controllers from '../controllers';
import { utils } from '../utils';

export async function studentRouter(fastify: FastifyInstance) {
  fastify.patch(
    '/:studentId/scholarship/toggle',
    {
      preHandler: utils.auth,
    },
    controllers.toggleStudentPermissionAsScholarshipStudent,
  );
}
