import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../utils';
import { AppError, handleServerError } from '../helpers/errors.helper';
import { STANDARD } from '../constants/request';
import { UserResponseSchema } from '../schemas/User';
import {
  IRequestIdParamSchema,
  PaginationRequestSchema,
} from '../schemas/Utils';
