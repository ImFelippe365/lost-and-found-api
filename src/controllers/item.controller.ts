import { *asbcrypt } from 'bcryptjs';
import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma, utils } from '../utils';
import { AppError, handleServerError } from '../helpers/errors.helper';
import { STANDARD } from '../constants/request';
import {
  ClaimItemSchema,
  CreateItemSchema,
  IItemIDRequestParams,
  ItemDetailedResponseSchema,
  ItemIDRequestParamSchema,
  ItemQueriesSchema,
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
import { IImageFileSchema } from 'src/schemas/User';
import path from 'node:path';

const pump = util.promisify(pipeline);

const IMAGE_DIR_PATH = './public/images';

export const listPageable = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { user } = request as ISecureRequest;
    const { name, orderNameBy, status, campusId } = ItemQueriesSchema.parse(
      request.query,
    );
    const { page, size } = PaginationRequestSchema.parse(request.query);

    const totalContentCount = (+page - 1) * +size;

    const items = await prisma.item.findMany({
      where: {
        campusId: user?.campusId || campusId,
        name: {
          mode: 'insensitive',
          contains: name,
        },
        status: status,
      },
      orderBy: {
        name: orderNameBy,
      },
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
      where: {
        campusId: user?.campusId || campusId,
        name: {
          mode: 'insensitive',
          contains: name,
        },
        status: status,
      },
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
    const { itemId } = ItemIDRequestParamSchema.parse(request.params);

    const item = await prisma.item.findUniqueOrThrow({
      where: { id: itemId, campusId: user.campusId },
      include: {
        ClaimedItem: {
          include: {
            claimant: true,
            user: true,
          },
        },
        createdBy: true,
        image: true,
      },
    });

    let imageToInclude;
    if (item?.imageId) {
      const filePath = path.join(path.resolve(), item?.image?.path || '');
      const fileBuffer = fs.readFileSync(filePath);

      if (fileBuffer) {
        const imageBase64 = fileBuffer.toString('base64');
        imageToInclude = {
          fileDataInBase64: imageBase64,
          name: item.image?.name.split('.')[0],
          type: item.image?.filetype,
        } as IImageFileSchema;
      }
    }

    return reply.code(STANDARD.OK.statusCode).send(
      ItemDetailedResponseSchema.parse({
        ...item,
        claimedBy: item.ClaimedItem,
        image: imageToInclude,
        imagePath: item.image?.path,
      }),
    );
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

interface IImageAttachment {
  fileDataInBase64: string;
  name: string;
  type: string;
}

export const create = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { user } = request as ISecureRequest;
    const payload = CreateItemSchema.parse(request.body);

    let createdImage;
    if (payload?.image) {
      const imageFile = payload?.image as IImageAttachment;
      const imageType = imageFile.type.split('/')[1];
      const filename = imageFile.name;
      const path = `${IMAGE_DIR_PATH}/${randomUUID()}.${imageType}`;
      const buffer = Buffer.from(imageFile?.fileDataInBase64, 'base64');

      if (!fs.existsSync(IMAGE_DIR_PATH)) {
        fs.mkdirSync(IMAGE_DIR_PATH, { recursive: true });
      }

      fs.writeFileSync(path, buffer);

      createdImage = await prisma.image.create({
        data: {
          name: filename,
          filetype: imageFile.type,
          path: path.slice(1),
          size: 0,
        },
      });
    }
    delete payload?.image;
    const createdItem = await prisma.item.create({
      data: {
        ...payload,
        userId: user.id,
        campusId: user.campusId,
        imageId: createdImage?.id,
      },
      include: {
        image: {
          select: {
            path: true,
          },
        },
      },
    });

    return reply.code(STANDARD.OK.statusCode).send(
      ItemResponseSchema.parse({
        ...createdItem,
        image: null,
      }),
    );
  } catch (err) {
    return handleServerError(reply, err);
  }
};

export const update = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { itemId } = ItemIDRequestParamSchema.parse(request.params);
    const payload = UpdateItemSchema.parse(request.body);

    const item = await prisma.item.findUniqueOrThrow({
      where: {
        id: itemId,
      },
      include: {
        image: true,
      },
    });

    if (item.imageId && payload?.image) {
      const imagePath = path.join(path.resolve(), item?.image?.path || '');
      fs.unlink(imagePath as string, async function () {
        await prisma.image.delete({
          where: { id: item.imageId || 0 },
        });
      });
    }

    const updatedItem = await prisma.item.update({
      where: {
        id: itemId,
      },
      data: { ...payload },
    });

    if (payload?.image) {
      const imageFile = payload?.image as IImageAttachment;
      const imageType = imageFile.type.split('/')[1];
      const filename = imageFile.name;
      const path = `${IMAGE_DIR_PATH}/${randomUUID()}.${imageType}`;
      const buffer = Buffer.from(imageFile?.fileDataInBase64, 'base64');

      if (!fs.existsSync(IMAGE_DIR_PATH)) {
        fs.mkdirSync(IMAGE_DIR_PATH, { recursive: true });
      }

      fs.writeFileSync(path, buffer);

      // if (item.imageId) {
      //   updatedImage = await prisma.image.update({
      //     data: {
      //       name: filename,
      //       filetype: imageFile.type,
      //       path: path.slice(1),
      //       size: 0,
      //     },
      //     where: { id: item.imageId },
      //   });
      // } else {
      await prisma.image.create({
        data: {
          name: filename,
          filetype: imageFile.type,
          path: path.slice(1),
          size: 0,
          Item: {
            connect: {
              id: itemId,
            },
          },
        },
      });
    }

    return reply
      .code(STANDARD.OK.statusCode)
      .send(ItemResponseSchema.parse(updatedItem));
  } catch (err) {
    return handleServerError(reply, err);
  }
};

export const remove = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { itemId } = ItemIDRequestParamSchema.parse(request.params);

    const item = await prisma.item.findUniqueOrThrow({
      where: {
        id: itemId,
      },
    });

    if (item.status === 'EXPIRED') {
      throw new AppError('Você não pode remover um item expirado', 400);
    }

    await prisma.item.delete({
      where: {
        id: itemId,
      },
    });

    return reply.code(STANDARD.NO_CONTENT.statusCode).send();
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
        itemId: Number(itemId),
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

    return reply.code(STANDARD.NO_CONTENT.statusCode).send();
  } catch (err) {
    return handleServerError(reply, err);
  }
};

export const countItemsPerType = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const lostItemsCount = await prisma.item.count({
      where: {
        status: 'LOST',
      },
    });

    const claimedItemsCount = await prisma.item.count({
      where: {
        status: 'CLAIMED',
      },
    });

    const expiredtemsCount = await prisma.item.count({
      where: {
        status: 'EXPIRED',
      },
    });

    return reply.code(STANDARD.OK.statusCode).send({
      lost: lostItemsCount,
      claimed: claimedItemsCount,
      expired: expiredtemsCount,
    });
  } catch (err) {
    return handleServerError(reply, err);
  }
};
