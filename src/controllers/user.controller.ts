import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../utils';
import { AppError, ERRORS, handleServerError } from '../helpers/errors.helper';
import { STANDARD } from '../constants/request';
import { UserResponseSchema } from '../schemas/User';
import { RequestIdParamSchema } from '../schemas/Utils';

export const getUserById = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = RequestIdParamSchema.parse(request.params);
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (user == null) throw new AppError('Usuário não encontrado', 404);

    return reply.code(STANDARD.OK.statusCode).send(
      UserResponseSchema.parse({
        ...user,
        isScholarshipHolder: !!user?.scholarshipHolderId,
      }),
    );
  } catch (err) {
    return handleServerError(reply, err);
  }
};
