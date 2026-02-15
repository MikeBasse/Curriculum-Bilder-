"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJsonField = exports.sanitizeFilename = exports.generateId = exports.getCurrentMonth = void 0;
const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};
exports.getCurrentMonth = getCurrentMonth;
const generateId = () => {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
};
exports.generateId = generateId;
const sanitizeFilename = (filename) => {
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
};
exports.sanitizeFilename = sanitizeFilename;
const parseJsonField = (value) => {
    if (!value)
        return null;
    try {
        return JSON.parse(value);
    }
    catch {
        return null;
    }
};
exports.parseJsonField = parseJsonField;
//# sourceMappingURL=helpers.js.map