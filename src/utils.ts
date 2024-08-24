import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import * as JWT from 'jsonwebtoken';
import Joi from 'joi';
import { FastifyReply, FastifyRequest } from 'fastify';
import Zod from 'zod';

export const prisma = new PrismaClient();

export const utils = {
  isJSON: (data: string) => {
    try {
      JSON.parse(data);
    } catch (e) {
      return false;
    }
    return true;
  },

  getTime: (): number => {
    return new Date().getTime();
  },

  genSalt: (saltRounds: number, value: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) return reject(err);
        bcrypt.hash(value, salt, (err, hash) => {
          if (err) return reject(err);
          resolve(hash);
        });
      });
    });
  },

  compareHash: (hash: string, value: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      bcrypt.compare(value, hash, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },

  healthCheck: async (): Promise<void> => {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (e: any) {
      throw new Error(`Health check failed: ${e.message}`);
    }
  },

  getTokenFromHeader: (
    authorizationHeader: string | undefined,
  ): string | null => {
    if (!authorizationHeader) return null;
    const token = authorizationHeader.replace('Bearer ', '');
    return token || null;
  },

  verifyToken: (token: string) => {
    try {
      const decoded = JWT.verify(token, process.env.APP_JWT_SECRET as string);

      return decoded as JWT.JwtPayload;
    } catch (err) {
      return null;
    }
  },

  validateSchema: (schema: Joi.ObjectSchema) => {
    return (data) => {
      const { error } = schema.validate(data);
      if (error) {
        throw new Error(error.details[0].message);
      }
    };
  },

  preBodyValidation: (schema: Zod.AnyZodObject) => {
    return (
      request: FastifyRequest,
      reply: FastifyReply,
      done: (err?: Error) => void,
    ) => {
      try {
        schema.parse(request.body);
      } catch (error: any) {
        return done(error);
      }
      done();
    };
  },

  preQueryValidation: (schema: Zod.AnyZodObject) => {
    return (
      request: FastifyRequest,
      reply: FastifyReply,
      done: (err?: Error) => void,
    ) => {
      try {
        schema.parse(request.query);
      } catch (error: any) {
        return done(error);
      }
      done();
    };
  },

  preParamsValidation: (schema: Zod.AnyZodObject) => {
    return (
      request: FastifyRequest,
      reply: FastifyReply,
      done: (err?: Error) => void,
    ) => {
      try {
        schema.parse(request.params);
      } catch (error: any) {
        return done(error);
      }
      done();
    };
  },

  auth: async (req: FastifyRequest, reply: FastifyReply) => {
    const token = req.headers.authorization;
    if (!token) {
      return reply.status(401).send({ message: 'É preciso informar um token' });
    }

    const decoded = JWT.verify(
      token,
      process.env.APP_JWT_SECRET as string,
    ) as JWT.JwtPayload;

    if (!decoded) {
      return reply.status(401).send({ message: 'Token inválido' });
    }

    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: decoded.id,
      },
    });
    req['user'] = user;
  },
};
