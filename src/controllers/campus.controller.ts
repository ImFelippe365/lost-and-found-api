import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../utils';
import { handleServerError } from '../helpers/errors.helper';
import { STANDARD } from '../constants/request';
import { CampusSchema } from '../schemas/Campus';

export const listAllCampi = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const campi = await prisma.campus.findMany();

    const response = campi.map((c) => CampusSchema.parse(c));

    return reply.code(STANDARD.OK.statusCode).send(response);
  } catch (err) {
    return handleServerError(reply, err);
  }
};
