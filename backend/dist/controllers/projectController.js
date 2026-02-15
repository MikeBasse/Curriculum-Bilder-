"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.createProject = exports.getProject = exports.getProjects = void 0;
const zod_1 = require("zod");
const server_1 = require("../server");
const errorHandler_1 = require("../middleware/errorHandler");
const createProjectSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    description: zod_1.z.string().optional(),
    subject: zod_1.z.string().optional(),
    gradeLevel: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
const updateProjectSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    subject: zod_1.z.string().optional(),
    gradeLevel: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    archived: zod_1.z.boolean().optional(),
});
exports.getProjects = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.userId) {
        throw new errorHandler_1.AppError('Unauthorized', 401);
    }
    const projects = await server_1.prisma.project.findMany({
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
exports.getProject = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.userId) {
        throw new errorHandler_1.AppError('Unauthorized', 401);
    }
    const { id } = req.params;
    const project = await server_1.prisma.project.findFirst({
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
        throw new errorHandler_1.AppError('Project not found', 404);
    }
    res.json({
        success: true,
        data: project,
    });
});
exports.createProject = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.userId) {
        throw new errorHandler_1.AppError('Unauthorized', 401);
    }
    const data = createProjectSchema.parse(req.body);
    const project = await server_1.prisma.project.create({
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
exports.updateProject = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.userId) {
        throw new errorHandler_1.AppError('Unauthorized', 401);
    }
    const { id } = req.params;
    const data = updateProjectSchema.parse(req.body);
    const existing = await server_1.prisma.project.findFirst({
        where: { id, userId: req.userId },
    });
    if (!existing) {
        throw new errorHandler_1.AppError('Project not found', 404);
    }
    const project = await server_1.prisma.project.update({
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
exports.deleteProject = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.userId) {
        throw new errorHandler_1.AppError('Unauthorized', 401);
    }
    const { id } = req.params;
    const existing = await server_1.prisma.project.findFirst({
        where: { id, userId: req.userId },
    });
    if (!existing) {
        throw new errorHandler_1.AppError('Project not found', 404);
    }
    await server_1.prisma.project.delete({
        where: { id },
    });
    res.json({
        success: true,
        message: 'Project deleted successfully',
    });
});
//# sourceMappingURL=projectController.js.map