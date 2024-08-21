import { User } from '@prisma/client';
import 'fastify';

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
