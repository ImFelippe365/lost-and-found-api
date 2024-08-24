import { MultipartFile } from '@fastify/multipart';
import { User } from '@prisma/client';
import 'fastify';
import { FastifyRequest } from 'fastify';

interface ISecureRequest extends FastifyRequest {
  user: User;
}

interface IMultipartRequest extends FastifyRequest, ISecureRequest {}

declare module 'jsonwebtoken' {
  export interface JwtPayload {
    id: number;
    name: string;
    registration: string;
  }
}
