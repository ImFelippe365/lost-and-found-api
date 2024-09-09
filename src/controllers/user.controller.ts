import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../utils';
import { handleServerError } from '../helpers/errors.helper';
import { STANDARD } from '../constants/request';
import { UserResponseSchema } from '../schemas/User';
import { RequestIdParamSchema } from '../schemas/Utils';

export const getUserById = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = RequestIdParamSchema.parse(request.params);
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id,
      },
    });
    return reply
      .code(STANDARD.OK.statusCode)
      .send(UserResponseSchema.parse(user));
  } catch (err) {
    return handleServerError(reply, err);
  }
};
