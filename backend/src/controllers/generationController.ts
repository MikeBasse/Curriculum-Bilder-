import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import * as claudeService from '../services/claudeService';

const generationSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  title: z.string().min(1, 'Title is required'),
  documentIds: z.array(z.string()).optional(),
  subject: z.string().optional(),
  gradeLevel: z.string().optional(),
  duration: z.string().optional(),
  objectives: z.array(z.string()).optional(),
  additionalInstructions: z.string().optional(),
});

const updateGenerationSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.record(z.any()).optional(),
});

const createGeneration = (type: 'lesson' | 'program' | 'assessment') => {
  return asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      throw new AppError('Unauthorized', 401);
    }

    const data = generationSchema.parse(req.body);

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { id: data.projectId, userId: req.userId },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Get source text from documents
    let sourceText = '';
    if (data.documentIds && data.documentIds.length > 0) {
      const documents = await prisma.document.findMany({
        where: {
          id: { in: data.documentIds },
          userId: req.userId,
        },
      });

      sourceText = documents
        .map((doc) => doc.extractedText || '')
        .filter(Boolean)
        .join('\n\n');
    }

    // Generate content using Claude
    const content = await claudeService.generateContent(
      req.userId,
      {
        type,
        title: data.title,
        subject: data.subject || project.subject || undefined,
        gradeLevel: data.gradeLevel || project.gradeLevel || undefined,
        duration: data.duration,
        objectives: data.objectives,
        additionalInstructions: data.additionalInstructions,
      },
      sourceText
    );

    // Save generation
    const generation = await prisma.generation.create({
      data: {
        projectId: data.projectId,
        userId: req.userId,
        type,
        title: data.title,
        content: content,
        sourceDocumentIds: data.documentIds || [],
      },
    });

    res.status(201).json({
      success: true,
      data: generation,
    });
  });
};

export const generateLesson = createGeneration('lesson');
export const generateProgram = createGeneration('program');
export const generateAssessment = createGeneration('assessment');

export const getGeneration = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;

  const generation = await prisma.generation.findFirst({
    where: { id, userId: req.userId },
  });

  if (!generation) {
    throw new AppError('Generation not found', 404);
  }

  res.json({
    success: true,
    data: generation,
  });
});

export const updateGeneration = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;
  const data = updateGenerationSchema.parse(req.body);

  const existing = await prisma.generation.findFirst({
    where: { id, userId: req.userId },
  });

  if (!existing) {
    throw new AppError('Generation not found', 404);
  }

  const generation = await prisma.generation.update({
    where: { id },
    data: {
      title: data.title,
      content: data.content,
      version: { increment: 1 },
    },
  });

  res.json({
    success: true,
    data: generation,
  });
});

export const getGenerations = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const { projectId, type } = req.query;

  const where: any = { userId: req.userId };
  if (projectId) where.projectId = projectId;
  if (type) where.type = type;

  const generations = await prisma.generation.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: generations,
  });
});
