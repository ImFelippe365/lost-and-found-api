import fastify from 'fastify';
import * as JWT from 'jsonwebtoken';
import loadConfig from './config/env.config';
import { prisma } from './utils';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'node:path';
import { itemRouter, studentRouter, userRouter } from './routes';
import { authRouter } from './routes/auth.router';
import { campusRouter } from './routes/campus.router';
import { fastifySchedule } from '@fastify/schedule';

loadConfig();
const port = Number(process.env.API_PORT) || 5001;
const host = String(process.env.API_HOST);

const startServer = async () => {
  const server = fastify({
    logger: {},
  });

  server.register(cors);
  // server.register(helmet);
  server.register(multipart);
  server.register(fastifyStatic, {
    root: path.join(__dirname, '../public'),
    prefix: '/public',
  });
  server.register(fastifySchedule);

  server.addHook('preValidation', async (request, reply) => {
    try {
      const authorizationToken = request.headers.authorization;
      if (!authorizationToken) {
        return;
      }

      const token = authorizationToken.split('Bearer ')[1];
      const decoded = JWT.verify(
        token,
        process.env.APP_JWT_SECRET as string,
      ) as JWT.JwtPayload;

      if (!decoded) {
        return;
      }

      const user = await prisma.user.findUnique({
        where: {
          id: decoded.id,
        },
      });

      if (user == null) return;

      request['user'] = user;
    } catch (err) {
      reply.send(err);
    }
  });

  server.register(authRouter, { prefix: '/api/auth' });
  server.register(userRouter, { prefix: '/api/users' });
  server.register(itemRouter, { prefix: '/api/items' });
  // server.register(publicRouter, { prefix: '/api/public' });
  server.register(studentRouter, { prefix: '/api/students' });
  server.register(campusRouter, { prefix: '/api/campi' });

  server.setErrorHandler((error, _request, reply) => {
    server.log.error(error);
    reply
      .status(error.statusCode || 500)
      .send({ error: error.message || 'Something went wrong' });
  });

  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      try {
        await server.close();
        server.log.error(`Closed application on ${signal}`);
        process.exit(0);
      } catch (err) {
        server.log.error(`Error closing application on ${signal}`, err);
        process.exit(1);
      }
    });
  });

  try {
    await server.listen({
      port,
      host,
    });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

startServer();
