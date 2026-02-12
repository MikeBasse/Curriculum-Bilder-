import { Response } from 'express';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';
import { prisma } from '../server';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import * as exportService from '../services/exportService';
import { trackUsage } from '../services/claudeService';

const exportSchema = z.object({
  generationId: z.string().min(1, 'Generation ID is required'),
});

export const exportPdf = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const data = exportSchema.parse(req.body);

  const generation = await prisma.generation.findFirst({
    where: { id: data.generationId, userId: req.userId },
  });

  if (!generation) {
    throw new AppError('Generation not found', 404);
  }

  const content = generation.content as Record<string, any>;

  const pdfBuffer = await exportService.generatePdf({
    title: generation.title,
    type: generation.type,
    content,
  });

  await trackUsage(req.userId, 'export');

  // Save to exports directory in development
  if (process.env.NODE_ENV !== 'production') {
    const exportDir = exportService.ensureExportDir();
    const filename = `${generation.id}-${Date.now()}.pdf`;
    const filePath = path.join(exportDir, filename);
    fs.writeFileSync(filePath, pdfBuffer);
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${generation.title}.pdf"`);
  res.send(pdfBuffer);
});

export const exportDocx = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const data = exportSchema.parse(req.body);

  const generation = await prisma.generation.findFirst({
    where: { id: data.generationId, userId: req.userId },
  });

  if (!generation) {
    throw new AppError('Generation not found', 404);
  }

  const content = generation.content as Record<string, any>;

  const docxBuffer = await exportService.generateDocx({
    title: generation.title,
    type: generation.type,
    content,
  });

  await trackUsage(req.userId, 'export');

  // Save to exports directory in development
  if (process.env.NODE_ENV !== 'production') {
    const exportDir = exportService.ensureExportDir();
    const filename = `${generation.id}-${Date.now()}.docx`;
    const filePath = path.join(exportDir, filename);
    fs.writeFileSync(filePath, docxBuffer);
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename="${generation.title}.docx"`);
  res.send(docxBuffer);
});

export const downloadExport = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;
  const { format } = req.query;

  const generation = await prisma.generation.findFirst({
    where: { id, userId: req.userId },
  });

  if (!generation) {
    throw new AppError('Generation not found', 404);
  }

  const content = generation.content as Record<string, any>;

  if (format === 'pdf') {
    const pdfBuffer = await exportService.generatePdf({
      title: generation.title,
      type: generation.type,
      content,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${generation.title}.pdf"`);
    return res.send(pdfBuffer);
  }

  const docxBuffer = await exportService.generateDocx({
    title: generation.title,
    type: generation.type,
    content,
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename="${generation.title}.docx"`);
  res.send(docxBuffer);
});
