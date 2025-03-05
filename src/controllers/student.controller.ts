import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../utils';
import { AppError, handleServerError } from '../helpers/errors.helper';
import { STANDARD } from '../constants/request';
import { StudentUserQueryParams, UserResponseSchema } from '../schemas/User';
import {
  PaginationRequestSchema,
  RequestIdParamSchema,
  RequestRegistrationParamSchema,
} from '../schemas/Utils';
import { ISecureRequest } from 'src/types';

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

    const scholarshipRegistrations = await prisma.scholarshipHolder.findMany({
      select: {
        registration: true,
      },
    });

    const scholarshipRegistrationIds = scholarshipRegistrations.map(
      (s) => s.registration,
    );

    const users = await prisma.user.findMany({
      where: {
        department: 'STUDENT',
        scholarshipHolder: scholarshipStudent
          ? {
              isNot: undefined,
            }
          : undefined,
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
        scholarshipHolder: scholarshipStudent
          ? {
              isNot: undefined,
            }
          : undefined,
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

    const response = users.map((u) =>
      UserResponseSchema.parse({
        ...u,
        isScholarshipHolder: !!u?.scholarshipHolderId,
      }),
    );

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

    const isScholarshipHolder = await prisma.user.isScholarshipHolder(
      student.registration,
    );
    if (isScholarshipHolder) {
      await prisma.scholarshipHolder.delete({
        where: {
          registration: student.registration,
        },
      });
    } else {
      await prisma.user.update({
        where: {
          id,
        },
        data: {
          scholarshipHolder: {
            create: {
              name: student.name,
              registration: student.registration,
              campusId: student.campusId,
            },
          },
        },
      });
    }

    const updatedStudent = await prisma.user.findUniqueOrThrow({
      where: {
        id,
      },
    });

    return reply.code(STANDARD.OK.statusCode).send(
      UserResponseSchema.parse({
        ...updatedStudent,
        isScholarshipHolder: !!updatedStudent?.scholarshipHolderId,
      }),
    );
  } catch (err) {
    return handleServerError(reply, err);
  }
};

export const addStudentPermissionAsScholarshipStudent = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { user } = request as ISecureRequest;

    const { name, registration } = RequestRegistrationParamSchema.parse(
      request.body,
    );

    const student = await prisma.user.findUnique({
      where: {
        registration,
      },
    });

    if (student != null) {
      if (student.department !== 'STUDENT')
        throw new AppError(
          'Não é possível tornar esse usuário como bolsista do sistema',
          400,
        );

      if (student.scholarshipHolderId)
        throw new AppError('Matrícula já cadastrada', 400);

      await prisma.user.update({
        where: {
          registration,
        },
        data: {
          scholarshipHolder: {
            create: {
              name: student.name,
              registration: student.registration,
              campusId: student.campusId,
            },
          },
        },
      });

      return reply.code(STANDARD.NO_CONTENT.statusCode).send();
    }

    const registrationExists = await prisma.scholarshipHolder.findFirst({
      where: {
        registration,
      },
    });

    if (registrationExists != null)
      throw new AppError('Matrícula já cadastrada', 400);

    await prisma.scholarshipHolder.create({
      data: {
        name,
        registration,
        campusId: user.campusId,
      },
    });

    return reply.code(STANDARD.NO_CONTENT.statusCode).send();
  } catch (err) {
    return handleServerError(reply, err);
  }
};

export const removeStudentAsPendingScholarshipStudent = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { registration } = RequestRegistrationParamSchema.parse(
      request.params,
    );

    const registrationExists = await prisma.scholarshipHolder.findFirst({
      where: {
        registration,
      },
    });

    if (registrationExists == null)
      throw new AppError('Matrícula não cadastrada', 404);

    await prisma.scholarshipHolder.delete({
      where: {
        registration,
      },
    });

    return reply.code(STANDARD.NO_CONTENT.statusCode).send();
  } catch (err) {
    return handleServerError(reply, err);
  }
};

export const listPendingScholarshipStudents = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { user } = request as ISecureRequest;
    const registrations = await prisma.scholarshipHolder.findMany({
      where: {
        campusId: user.campusId,
        AND: {
          User: {
            is: null,
          },
        },
      },
    });

    return reply.code(STANDARD.OK.statusCode).send(registrations);
  } catch (err) {
    return handleServerError(reply, err);
  }
};
