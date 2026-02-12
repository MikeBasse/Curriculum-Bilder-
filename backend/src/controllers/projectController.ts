import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  subject: z.string().optional(),
  gradeLevel: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const updateProjectSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  subject: z.string().optional(),
  gradeLevel: z.string().optional(),
  tags: z.array(z.string()).optional(),
  archived: z.boolean().optional(),
});

export const getProjects = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const projects = await prisma.project.findMany({
    where: {
      userId: req.userId,
      archived: false,
    },
    include: {
      _count: {
        select: {
          documents: true,
          generations: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  res.json({
    success: true,
    data: projects,
  });
});

export const getProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;

  const project = await prisma.project.findFirst({
    where: {
      id,
      userId: req.userId,
    },
    include: {
      documents: {
        orderBy: { createdAt: 'desc' },
      },
      generations: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  res.json({
    success: true,
    data: project,
  });
});

export const createProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const data = createProjectSchema.parse(req.body);

  const project = await prisma.project.create({
    data: {
      userId: req.userId,
      title: data.title,
      description: data.description,
      subject: data.subject,
      gradeLevel: data.gradeLevel,
      tags: data.tags || [],
    },
  });

  res.status(201).json({
    success: true,
    data: project,
  });
});

export const updateProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;
  const data = updateProjectSchema.parse(req.body);

  const existing = await prisma.project.findFirst({
    where: { id, userId: req.userId },
  });

  if (!existing) {
    throw new AppError('Project not found', 404);
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...data,
      tags: data.tags !== undefined ? data.tags : undefined,
    },
  });

  res.json({
    success: true,
    data: project,
  });
});

export const deleteProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;

  const existing = await prisma.project.findFirst({
    where: { id, userId: req.userId },
  });

  if (!existing) {
    throw new AppError('Project not found', 404);
  }

  await prisma.project.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Project deleted successfully',
  });
});
