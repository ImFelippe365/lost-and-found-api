import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../utils';
import { handleServerError } from '../helpers/errors.helper';
import { STANDARD } from '../constants/request';
import { RequestUUIDParamSchema } from '../schemas/Utils';

export const handleImage = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { uuid } = RequestUUIDParamSchema.parse(request.params);
    const { path } = await prisma.image.findUniqueOrThrow({
      where: {
        uuid,
      },
    });

    return reply.code(STANDARD.OK.statusCode).sendFile(path);
  } catch (err) {
    return handleServerError(reply, err);
  }
};
