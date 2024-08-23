import { User } from '@prisma/client';
import 'fastify';
import fastify from 'fastify';

declare global {
  namespace fastify {
    interface Request {
      user: User;
    }
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user: User;
  }
}

declare module 'jsonwebtoken' {
  export interface JwtPayload {
    id: number;
    name: string;
    registration: string;
  }
}
