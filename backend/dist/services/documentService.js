"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureUploadDir = exports.deleteFile = exports.extractTextFromFile = exports.extractTextFromPdf = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const extractTextFromPdf = async (filePath) => {
    try {
        const dataBuffer = fs_1.default.readFileSync(filePath);
        const data = await (0, pdf_parse_1.default)(dataBuffer);
        return data.text;
    }
    catch (error) {
        console.error('PDF extraction error:', error);
        return '';
    }
};
exports.extractTextFromPdf = extractTextFromPdf;
const extractTextFromFile = async (filePath, fileType) => {
    if (fileType === 'application/pdf') {
        return (0, exports.extractTextFromPdf)(filePath);
    }
    if (fileType === 'text/plain') {
        return fs_1.default.readFileSync(filePath, 'utf-8');
    }
    // For DOCX and other files, return empty for now
    // Could add docx parsing later
    return '';
};
exports.extractTextFromFile = extractTextFromFile;
const deleteFile = (filePath) => {
    try {
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
    }
    catch (error) {
        console.error('File deletion error:', error);
    }
};
exports.deleteFile = deleteFile;
const ensureUploadDir = () => {
    const uploadDir = path_1.default.join(__dirname, '../../uploads');
    if (!fs_1.default.existsSync(uploadDir)) {
        fs_1.default.mkdirSync(uploadDir, { recursive: true });
    }
    return uploadDir;
};
exports.ensureUploadDir = ensureUploadDir;
//# sourceMappingURL=documentService.js.map