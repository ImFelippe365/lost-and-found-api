import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../utils';
import { AppError, handleServerError } from '../helpers/errors.helper';
import { STANDARD } from '../constants/request';
import { StudentUserQueryParams, UserResponseSchema } from '../schemas/User';
import {
  IRequestIdParamSchema,
  PaginationRequestSchema,
  RequestIdParamSchema,
} from '../schemas/Utils';

export const listStudents = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { page, size } = request.query
      ? PaginationRequestSchema.parse(request.query)
      : {
          page: 1,
          size: 10,
        };

    const { scholarshipStudent, search } = StudentUserQueryParams.parse(
      request.query,
    );

    const currentPage = (+page - 1) * +size;

    const users = await prisma.user.findMany({
      where: {
        department: 'STUDENT',
        isScholarshipHolder: scholarshipStudent,
        OR: [
          {
            email: {
              mode: 'insensitive',
              contains: search,
            },
          },
          {
            name: {
              mode: 'insensitive',
              contains: search,
            },
          },
          {
            registration: {
              mode: 'insensitive',
              contains: search,
            },
          },
        ],
      },
      take: size,
      skip: currentPage,
    });

    const totalUsersCount = await prisma.user.count({
      where: {
        department: 'STUDENT',
        isScholarshipHolder: scholarshipStudent,
        OR: [
          {
            email: {
              mode: 'insensitive',
              contains: search,
            },
          },
          {
            name: {
              mode: 'insensitive',
              contains: search,
            },
          },
          {
            registration: {
              mode: 'insensitive',
              contains: search,
            },
          },
        ],
      },
    });

    const totalPages = Math.round(totalUsersCount / size);

    const response = users.map((u) => UserResponseSchema.parse(u));

    return reply.code(STANDARD.OK.statusCode).send({
      totalPages,
      totalCount: totalUsersCount,
      content: response,
      currentPage,
    });
  } catch (err) {
    return handleServerError(reply, err);
  }
};

export const toggleStudentPermissionAsScholarshipStudent = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = RequestIdParamSchema.parse(request.params);
    const student = await prisma.user.findUniqueOrThrow({
      where: {
        id,
      },
    });

    if (student.department !== 'STUDENT')
      throw new AppError(
        'Não é possível tornar esse usuário como bolsista do sistema',
        400,
      );

    const updatedStudent = await prisma.user.update({
      where: {
        id,
      },
      data: {
        isScholarshipHolder: !student.isScholarshipHolder,
      },
    });

    return reply
      .code(STANDARD.OK.statusCode)
      .send(UserResponseSchema.parse(updatedStudent));
  } catch (err) {
    return handleServerError(reply, err);
  }
};
