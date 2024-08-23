import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../utils';
import { ERRORS, handleServerError } from '../helpers/errors.helper';
import * as JWT from 'jsonwebtoken';
import { utils } from '../utils';
import { STANDARD } from '../constants/request';
import { LoginSchema, UserResponseSchema } from '../schemas/User';
import { PaginationRequestSchema, PaginationSchema } from '../schemas/Utils';

const SALT_ROUNDS = 10;

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { registration, password } = LoginSchema.parse(request.body);
    const user = await prisma.user.findUnique({ where: { registration } });
    if (!user) {
      // const hashPass = await utils.genSalt(10, password);
      // const createUser = await prisma.user.create({
      //   data: {
      //     registration,
      //     first_name: firstName.trim(),
      //     last_name: lastName.trim(),
      //     password: String(hashPass),
      //   },
      // });

      return reply
        .code(ERRORS.userNotExists.statusCode)
        .send('Não existe um usuário com essa matrícula');
    }

    const checkPass = await utils.compareHash(password, user.password);
    if (!checkPass) {
      return reply
        .code(ERRORS.userCredError.statusCode)
        .send('A senha inserida está incorreta');
    }

    const token = JWT.sign(
      {
        id: user.id,
        registration: user.registration,
      },
      process.env.APP_JWT_SECRET as string,
    );

    return reply.code(STANDARD.OK.statusCode).send({
      token,
      user,
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

// export const signUp = async (
//   request: FastifyRequest<{
//     Body: IUserSignupDto;
//   }>,
//   reply: FastifyReply,
// ) => {
//   try {
//     const { email, password, firstName, lastName } = request.body;
//     const user = await prisma.user.findUnique({ where: { email } });
//     if (user) {
//       return reply.code(ERRORS.userExists.statusCode).send(ERRORS.userExists);
//     }

//     const hashPass = await utils.genSalt(10, password);
//     const createUser = await prisma.user.create({
//       data: {
//         email,
//         first_name: firstName.trim(),
//         last_name: lastName.trim(),
//         password: String(hashPass),
//       },
//     });

//     const token = JWT.sign(
//       {
//         id: createUser.id,
//         email: createUser.email,
//       },
//       process.env.APP_JWT_SECRET as string,
//     );

//     delete createUser.password;

//     return reply.code(STANDARD.OK.statusCode).send({
//       token,
//       user: createUser,
//     });
//   } catch (err) {
//     return handleServerError(reply, err);
//   }
// };

// const createUser = async () => {
//   const { password, email, name } = req.body;
//   const user = await prisma.user.findUnique({
//     where: {
//       email: email,
//     },
//   });
//   if (user) {
//     return reply.code(401).send({
//       message: 'Usuário com este e-mail já existe',
//     });
//   }
//   try {
//     const hash = await bcrypt.hash(password, SALT_ROUNDS);
//     const user = await prisma.user.create({
//       data: {
//         password: hash,
//         email,
//         name,
//       },
//     });
//     return reply.code(201).send(user);
//   } catch (e) {
//     return reply.code(500).send(e);
//   }
// };
