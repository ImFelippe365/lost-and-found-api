import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../utils';
import { AppError, ERRORS, handleServerError } from '../helpers/errors.helper';
import * as JWT from 'jsonwebtoken';
import { utils } from '../utils';
import { STANDARD } from '../constants/request';
import {
  LoginSchema,
  TokenDataSchema,
  UserResponseSchema,
} from '../schemas/User';
import {
  IRequestIdParamSchema,
  PaginationRequestSchema,
} from '../schemas/Utils';
import { SuapAPI } from '../services/suap';
import { Department } from '@prisma/client';

const SALT_ROUNDS = 10;

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { registration, password } = LoginSchema.parse(request.body);

    const suap = new SuapAPI(registration, password);
    await suap.authenticate();
    const suapUser = await suap.getUserData();

    if (suapUser.vinculo.situacao !== 'Matriculado') {
      throw new AppError(
        'Você não tem permissão',
        ERRORS.unauthorizedAccess.statusCode,
      );
    }

    let user = await prisma.user.findUnique({
      where: { registration },
      include: { campus: true },
    });
    if (!user) {
      const hashPass = await utils.genSalt(SALT_ROUNDS, password);

      const isEmployeeUser =
        suapUser.vinculo?.setor_suap != null &&
        (suapUser.vinculo?.setor_suap.includes('COAPAC') ||
          suapUser.vinculo?.setor_suap.includes('COADES'));

      if (suapUser.tipo_vinculo !== 'Aluno' && !isEmployeeUser) {
        throw new AppError(
          'Seu cargo não tem acesso as funcionalidades do sistema',
          ERRORS.unauthorizedAccess.statusCode,
        );
      }

      const campus = await prisma.campus.findUniqueOrThrow({
        where: {
          acronym: suapUser.vinculo.campus,
        },
      });

      const payload = {
        registration,
        name: suapUser.nome_usual,
        department: isEmployeeUser ? Department.EMPLOYEE : Department.STUDENT,
        picture: suapUser.url_foto_150x200,
        email: suapUser.email,
        password: String(hashPass),
        campusId: campus.id,
      };

      user = await prisma.user.create({
        data: payload,
        include: { campus: true },
      });
    }

    const checkPass = await utils.compareHash(user.password, password);
    if (!checkPass) {
      throw new AppError('Senha incorreta', ERRORS.userCredError.statusCode);
    }

    const token = JWT.sign(
      TokenDataSchema.parse(user),
      process.env.APP_JWT_SECRET as string,
    );

    return reply.code(STANDARD.OK.statusCode).send({
      token,
      user: UserResponseSchema.parse(user),
    });
  } catch (err) {
    return handleServerError(reply, err);
  }
};

export const listScholarshipStudents = async (
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

    const currentPage = (+page - 1) * +size;

    const users = await prisma.user.findMany({
      where: { department: 'STUDENT', isScholarshipHolder: true },
      take: size,
      skip: currentPage,
    });

    const totalUsersCount = await prisma.user.count({
      where: { department: 'STUDENT', isScholarshipHolder: true },
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
    const { id } = request.params as IRequestIdParamSchema;
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
