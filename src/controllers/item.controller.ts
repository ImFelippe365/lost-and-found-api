import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma, utils } from '../utils';
import { AppError, handleServerError } from '../helpers/errors.helper';
import { STANDARD } from '../constants/request';
import {
  ClaimItemSchema,
  CreateItemSchema,
  ItemIDRequestParamSchema,
  ItemResponseSchema,
  UpdateItemSchema,
} from '../schemas/Item';
import { ISecureRequest } from '../types';
import {
  IRequestIdParamSchema,
  PaginationRequestSchema,
} from '../schemas/Utils';
import fs from 'fs';
import { pipeline } from 'stream';

import util from 'node:util';
import { randomUUID } from 'node:crypto';
import { ItemStatus } from '@prisma/client';

const pump = util.promisify(pipeline);

export const listPageable = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { user } = request as ISecureRequest;
    const { page, size } = PaginationRequestSchema.parse(request.query);

    const totalContentCount = (+page - 1) * +size;

    const items = await prisma.item.findMany({
      where: { campusId: user.campusId },
      take: size,
      skip: totalContentCount,
      include: {
        image: {
          select: {
            path: true,
          },
        },
      },
    });

    const totalItemsCount = await prisma.item.count({
      where: { campusId: user.campusId },
    });

    const totalPages = Math.ceil(totalItemsCount / size);

    const response = items.map((u) =>
      ItemResponseSchema.parse({
        ...u,
        image: u?.image ? u?.image.path : null,
      }),
    );

    return reply.code(STANDARD.OK.statusCode).send({
      totalPages,
      totalCount: totalItemsCount,
      content: response,
      totalContentCount,
      lastPage: totalPages === page,
    });
  } catch (err) {
    return handleServerError(reply, err);
  }
};

export const listById = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { user } = request as ISecureRequest;
    const id = 0;

    const item = await prisma.item.findUniqueOrThrow({
      where: { id, campusId: user.campusId },
      include: {
        image: {
          select: {
            path: true,
          },
        },
      },
    });

    return reply
      .code(STANDARD.OK.statusCode)
      .send(ItemResponseSchema.parse(item));
  } catch (err) {
    return handleServerError(reply, err);
  }
};

export const uploadItemImage = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { itemId } = ItemIDRequestParamSchema.parse(request.params);
    const imageFile = await request.file();
    if (!imageFile) {
      throw new AppError('É preciso passar o arquivo de imagem', 400);
    }
    const imageType = imageFile.mimetype.split('/')[1];
    const filename = imageFile.filename;
    const path = `./public/images/${randomUUID()}.${imageType}`;

    await pump(imageFile.file, fs.createWriteStream(path));

    const item = await prisma.item.findUniqueOrThrow({
      where: {
        id: itemId,
      },
      include: {
        image: true,
      },
    });

    if (item.imageId) {
      fs.unlink(('.' + item.image?.path) as string, async function () {
        await prisma.image.delete({
          where: { id: item.imageId || 0 },
        });
      });
    }

    const image = await prisma.image.create({
      data: {
        name: filename,
        filetype: imageFile.mimetype,
        path: path.slice(1),
        size: imageFile.file.bytesRead,
      },
    });

    await prisma.item.update({
      where: {
        id: itemId,
      },
      data: {
        imageId: image.id,
      },
    });

    return reply.code(STANDARD.OK.statusCode).send(image);
  } catch (err) {
    return handleServerError(reply, err);
  }
};

export const create = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { user } = request as ISecureRequest;
    const payload = CreateItemSchema.parse(request.body);
    const createdItem = await prisma.item.create({
      data: {
        ...payload,
        userId: user.id,
        campusId: user.campusId,
      },
      include: {
        image: {
          select: {
            path: true,
          },
        },
      },
    });

    return reply
      .code(STANDARD.OK.statusCode)
      .send(ItemResponseSchema.parse(createdItem));
  } catch (err) {
    return handleServerError(reply, err);
  }
};

export const update = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as IRequestIdParamSchema;
    const payload = UpdateItemSchema.parse(request.body);
    const updatedItem = await prisma.item.update({
      where: {
        id: Number(id),
      },
      data: payload,
    });

    return reply
      .code(STANDARD.OK.statusCode)
      .send(ItemResponseSchema.parse(updatedItem));
  } catch (err) {
    return handleServerError(reply, err);
  }
};

export const remove = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as IRequestIdParamSchema;

    const item = await prisma.item.findFirstOrThrow({
      where: {
        id,
      },
    });

    if (item.status === 'EXPIRED') {
      throw new AppError('Você não pode remover um item expirado', 400);
    }

    await prisma.item.delete({
      where: {
        id,
      },
    });

    return reply.code(STANDARD.NO_CONTENT.statusCode);
  } catch (err) {
    return handleServerError(reply, err);
  }
};

export const claimItem = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { user } = request as ISecureRequest;
    const { itemId } = ItemIDRequestParamSchema.parse(request.params);
    const claimantData = ClaimItemSchema.parse(request.body);

    const item = await prisma.item.findFirstOrThrow({
      where: {
        id: itemId,
      },
    });

    if (item.status === 'EXPIRED') {
      throw new AppError('Você não pode remover um item expirado', 400);
    }

    let claimant = await prisma.claimant.findFirst({
      where: {
        document: claimantData.document,
      },
    });

    if (!claimant) {
      claimant = await prisma.claimant.create({
        data: {
          name: claimantData.name,
          document: claimantData.document,
        },
      });
    }

    await prisma.claimedItem.create({
      data: {
        itemId,
        claimantId: claimant.id,
        userId: user.id,
      },
    });

    await prisma.item.update({
      where: {
        id: itemId,
      },
      data: {
        status: ItemStatus.CLAIMED,
      },
    });

    return reply.code(STANDARD.NO_CONTENT.statusCode);
  } catch (err) {
    return handleServerError(reply, err);
  }
};
