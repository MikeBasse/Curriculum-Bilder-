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
exports.downloadExport = exports.exportDocx = exports.exportPdf = void 0;
const zod_1 = require("zod");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const server_1 = require("../server");
const errorHandler_1 = require("../middleware/errorHandler");
const exportService = __importStar(require("../services/exportService"));
const claudeService_1 = require("../services/claudeService");
const exportSchema = zod_1.z.object({
    generationId: zod_1.z.string().min(1, 'Generation ID is required'),
});
exports.exportPdf = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.userId) {
        throw new errorHandler_1.AppError('Unauthorized', 401);
    }
    const data = exportSchema.parse(req.body);
    const generation = await server_1.prisma.generation.findFirst({
        where: { id: data.generationId, userId: req.userId },
    });
    if (!generation) {
        throw new errorHandler_1.AppError('Generation not found', 404);
    }
    const content = generation.content;
    const pdfBuffer = await exportService.generatePdf({
        title: generation.title,
        type: generation.type,
        content,
    });
    await (0, claudeService_1.trackUsage)(req.userId, 'export');
    // Save to exports directory in development
    if (process.env.NODE_ENV !== 'production') {
        const exportDir = exportService.ensureExportDir();
        const filename = `${generation.id}-${Date.now()}.pdf`;
        const filePath = path_1.default.join(exportDir, filename);
        fs_1.default.writeFileSync(filePath, pdfBuffer);
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${generation.title}.pdf"`);
    res.send(pdfBuffer);
});
exports.exportDocx = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.userId) {
        throw new errorHandler_1.AppError('Unauthorized', 401);
    }
    const data = exportSchema.parse(req.body);
    const generation = await server_1.prisma.generation.findFirst({
        where: { id: data.generationId, userId: req.userId },
    });
    if (!generation) {
        throw new errorHandler_1.AppError('Generation not found', 404);
    }
    const content = generation.content;
    const docxBuffer = await exportService.generateDocx({
        title: generation.title,
        type: generation.type,
        content,
    });
    await (0, claudeService_1.trackUsage)(req.userId, 'export');
    // Save to exports directory in development
    if (process.env.NODE_ENV !== 'production') {
        const exportDir = exportService.ensureExportDir();
        const filename = `${generation.id}-${Date.now()}.docx`;
        const filePath = path_1.default.join(exportDir, filename);
        fs_1.default.writeFileSync(filePath, docxBuffer);
    }
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${generation.title}.docx"`);
    res.send(docxBuffer);
});
exports.downloadExport = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.userId) {
        throw new errorHandler_1.AppError('Unauthorized', 401);
    }
    const { id } = req.params;
    const { format } = req.query;
    const generation = await server_1.prisma.generation.findFirst({
        where: { id, userId: req.userId },
    });
    if (!generation) {
        throw new errorHandler_1.AppError('Generation not found', 404);
    }
    const content = generation.content;
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
//# sourceMappingURL=exportController.js.map