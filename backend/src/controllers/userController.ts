import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  school: z.string().optional(),
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      email: true,
      name: true,
      school: true,
      subscriptionTier: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: user,
  });
});

export const updateMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const data = updateUserSchema.parse(req.body);

  const user = await prisma.user.update({
    where: { id: req.userId },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      school: true,
      subscriptionTier: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  res.json({
    success: true,
    data: user,
  });
});
