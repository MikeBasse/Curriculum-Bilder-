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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDocument = exports.getDocument = exports.getDocuments = exports.uploadDocument = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const server_1 = require("../server");
const errorHandler_1 = require("../middleware/errorHandler");
const documentService = __importStar(require("../services/documentService"));
const constants_1 = require("../utils/constants");
const helpers_1 = require("../utils/helpers");
// Configure multer storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = documentService.ensureUploadDir();
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const safeName = (0, helpers_1.sanitizeFilename)(file.originalname);
        cb(null, `${uniqueSuffix}-${safeName}`);
    },
});
const fileFilter = (req, file, cb) => {
    if (constants_1.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: constants_1.MAX_FILE_SIZE },
});
exports.uploadDocument = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.userId) {
        throw new errorHandler_1.AppError('Unauthorized', 401);
    }
    if (!req.file) {
        throw new errorHandler_1.AppError('No file uploaded', 400);
    }
    const { projectId } = req.body;
    if (!projectId) {
        documentService.deleteFile(req.file.path);
        throw new errorHandler_1.AppError('Project ID is required', 400);
    }
    // Verify project belongs to user
    const project = await server_1.prisma.project.findFirst({
        where: { id: projectId, userId: req.userId },
    });
    if (!project) {
        documentService.deleteFile(req.file.path);
        throw new errorHandler_1.AppError('Project not found', 404);
    }
    // Extract text from document
    const extractedText = await documentService.extractTextFromFile(req.file.path, req.file.mimetype);
    const document = await server_1.prisma.document.create({
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
exports.getDocuments = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.userId) {
        throw new errorHandler_1.AppError('Unauthorized', 401);
    }
    const { projectId } = req.query;
    const where = { userId: req.userId };
    if (projectId) {
        where.projectId = projectId;
    }
    const documents = await server_1.prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    });
    res.json({
        success: true,
        data: documents,
    });
});
exports.getDocument = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.userId) {
        throw new errorHandler_1.AppError('Unauthorized', 401);
    }
    const { id } = req.params;
    const document = await server_1.prisma.document.findFirst({
        where: { id, userId: req.userId },
    });
    if (!document) {
        throw new errorHandler_1.AppError('Document not found', 404);
    }
    res.json({
        success: true,
        data: document,
    });
});
exports.deleteDocument = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.userId) {
        throw new errorHandler_1.AppError('Unauthorized', 401);
    }
    const { id } = req.params;
    const document = await server_1.prisma.document.findFirst({
        where: { id, userId: req.userId },
    });
    if (!document) {
        throw new errorHandler_1.AppError('Document not found', 404);
    }
    // Delete file from storage
    documentService.deleteFile(document.storagePath);
    await server_1.prisma.document.delete({
        where: { id },
    });
    res.json({
        success: true,
        message: 'Document deleted successfully',
    });
});
//# sourceMappingURL=documentController.js.map