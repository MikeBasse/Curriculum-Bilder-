import { Response } from 'express';
import path from 'path';
import multer from 'multer';
import { prisma } from '../server';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import * as documentService from '../services/documentService';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../utils/constants';
import { sanitizeFilename } from '../utils/helpers';

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = documentService.ensureUploadDir();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeName = sanitizeFilename(file.originalname);
    cb(null, `${uniqueSuffix}-${safeName}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

export const uploadDocument = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw new AppError('Unauthorized', 401);
  }

  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const { projectId } = req.body;

  if (!projectId) {
    documentService.deleteFile(req.file.path);
    throw new AppError('Project ID is required', 400);
  }

  // Verify project belongs to user
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: req.userId },
  });

  if (!project) {
    documentService.deleteFile(req.file.path);
    throw new AppError('Project not found', 404);
  }

  // Extract text from document
  const extractedText = await documentService.extractTextFromFile(
    req.file.path,
    req.file.mimetype
  );

  const document = await prisma.document.create({
    data: {
      projectId,
      userId: req.userId,
      filename: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      storagePath: req.file.path,
      extractedText,
    },
  });

  res.status(201).json({
    success: true,
    data: document,
  });
});

export const getDocuments = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const { projectId } = req.query;

  const where: any = { userId: req.userId };
  if (projectId) {
    where.projectId = projectId;
  }

  const documents = await prisma.document.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: documents,
  });
});

export const getDocument = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;

  const document = await prisma.document.findFirst({
    where: { id, userId: req.userId },
  });

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  res.json({
    success: true,
    data: document,
  });
});

export const deleteDocument = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;

  const document = await prisma.document.findFirst({
    where: { id, userId: req.userId },
  });

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  // Delete file from storage
  documentService.deleteFile(document.storagePath);

  await prisma.document.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Document deleted successfully',
  });
});
