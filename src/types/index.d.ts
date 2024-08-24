import { User } from '@prisma/client';
import 'fastify';
import { FastifyRequest } from 'fastify';

interface ISecureRequest extends FastifyRequest {
  user: User;
}

declare module 'jsonwebtoken' {
  export interface JwtPayload {
    id: number;
    name: string;
    registration: string;
  }
}
