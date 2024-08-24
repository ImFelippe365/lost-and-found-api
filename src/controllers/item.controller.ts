import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../utils';
import { ERRORS, handleServerError } from '../helpers/errors.helper';
import { STANDARD } from '../constants/request';
import {
  CreateItemSchema,
  ItemResponseSchema,
  UpdateItemSchema,
} from '../schemas/Item';
import { ISecureRequest } from '../types';
import { User } from '@prisma/client';
import { IRequestIdParamSchema } from '../schemas/Utils';

export const create = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { user } = request as ISecureRequest;
    const payload = CreateItemSchema.parse(request.body);
    const createdItem = await prisma.item.create({
      data: {
        ...payload,
        userId: user.id,
      },
    });

    return reply
      .code(STANDARD.OK.statusCode)
      .send(ItemResponseSchema.parse(createdItem));
  } catch (err) {
    return handleServerError(reply, err);
  }
};

export const update = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as IRequestIdParamSchema;
    const payload = UpdateItemSchema.parse(request.body);
    const updatedItem = await prisma.item.update({
      where: {
        id: Number(id),
      },
      data: payload,
    });

    return reply
      .code(STANDARD.OK.statusCode)
      .send(ItemResponseSchema.parse(updatedItem));
  } catch (err) {
    return handleServerError(reply, err);
  }
};

export const remove = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as IRequestIdParamSchema;

    await prisma.item.delete({
      where: {
        id: Number(id),
      },
    });

    return reply.code(STANDARD.NO_CONTENT.statusCode);
  } catch (err) {
    return handleServerError(reply, err);
  }
};
