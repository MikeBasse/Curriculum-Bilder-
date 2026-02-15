"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGenerations = exports.updateGeneration = exports.getGeneration = exports.generateAssessment = exports.generateProgram = exports.generateLesson = void 0;
const zod_1 = require("zod");
const server_1 = require("../server");
const errorHandler_1 = require("../middleware/errorHandler");
const claudeService = __importStar(require("../services/claudeService"));
const generationSchema = zod_1.z.object({
    projectId: zod_1.z.string().min(1, 'Project ID is required'),
    title: zod_1.z.string().min(1, 'Title is required'),
    documentIds: zod_1.z.array(zod_1.z.string()).optional(),
    subject: zod_1.z.string().optional(),
    gradeLevel: zod_1.z.string().optional(),
    duration: zod_1.z.string().optional(),
    objectives: zod_1.z.array(zod_1.z.string()).optional(),
    additionalInstructions: zod_1.z.string().optional(),
});
const updateGenerationSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    content: zod_1.z.record(zod_1.z.any()).optional(),
});
const createGeneration = (type) => {
    return (0, errorHandler_1.asyncHandler)(async (req, res) => {
        if (!req.userId) {
            throw new errorHandler_1.AppError('Unauthorized', 401);
        }
        const data = generationSchema.parse(req.body);
        // Verify project belongs to user
        const project = await server_1.prisma.project.findFirst({
            where: { id: data.projectId, userId: req.userId },
        });
        if (!project) {
            throw new errorHandler_1.AppError('Project not found', 404);
        }
        // Get source text from documents
        let sourceText = '';
        if (data.documentIds && data.documentIds.length > 0) {
            const documents = await server_1.prisma.document.findMany({
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
        const content = await claudeService.generateContent(req.userId, {
            type,
            title: data.title,
            subject: data.subject || project.subject || undefined,
            gradeLevel: data.gradeLevel || project.gradeLevel || undefined,
            duration: data.duration,
            objectives: data.objectives,
            additionalInstructions: data.additionalInstructions,
        }, sourceText);
        // Save generation
        const generation = await server_1.prisma.generation.create({
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
exports.generateLesson = createGeneration('lesson');
exports.generateProgram = createGeneration('program');
exports.generateAssessment = createGeneration('assessment');
exports.getGeneration = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.userId) {
        throw new errorHandler_1.AppError('Unauthorized', 401);
    }
    const { id } = req.params;
    const generation = await server_1.prisma.generation.findFirst({
        where: { id, userId: req.userId },
    });
    if (!generation) {
        throw new errorHandler_1.AppError('Generation not found', 404);
    }
    res.json({
        success: true,
        data: generation,
    });
});
exports.updateGeneration = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.userId) {
        throw new errorHandler_1.AppError('Unauthorized', 401);
    }
    const { id } = req.params;
    const data = updateGenerationSchema.parse(req.body);
    const existing = await server_1.prisma.generation.findFirst({
        where: { id, userId: req.userId },
    });
    if (!existing) {
        throw new errorHandler_1.AppError('Generation not found', 404);
    }
    const generation = await server_1.prisma.generation.update({
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
exports.getGenerations = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.userId) {
        throw new errorHandler_1.AppError('Unauthorized', 401);
    }
    const { projectId, type } = req.query;
    const where = { userId: req.userId };
    if (projectId)
        where.projectId = projectId;
    if (type)
        where.type = type;
    const generations = await server_1.prisma.generation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    });
    res.json({
        success: true,
        data: generations,
    });
});
//# sourceMappingURL=generationController.js.map