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
import { SuapAPI } from '../services/suap';
import { Department } from '@prisma/client';

const SALT_ROUNDS = 10;

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { registration, password } = LoginSchema.parse(request.body);

    const suap = new SuapAPI(registration, password);
    await suap.authenticate();
    const suapUser = await suap.getUserData();

    if (
      suapUser.vinculo.situacao !== 'Matriculado' &&
      suapUser.vinculo.situacao !== 'Matrícula Vínculo Institucional'
    ) {
      throw new AppError(
        'Você não tem permissão',
        ERRORS.unauthorizedAccess.statusCode,
      );
    }

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

    const alreadyScholarshipHolder = await prisma.scholarshipHolder.findFirst({
      where: {
        registration,
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
      scholarshipHolderId: alreadyScholarshipHolder?.id,
    };

    const user = await prisma.user.upsert({
      create: payload,
      update: payload,
      where: { registration },
      include: { campus: true },
    });

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
      user: UserResponseSchema.parse({
        ...user,
        isScholarshipHolder: !!user.scholarshipHolderId,
      }),
    });
  } catch (err) {
    return handleServerError(reply, err);
  }
};
