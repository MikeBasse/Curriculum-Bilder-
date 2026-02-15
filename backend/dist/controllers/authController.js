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
exports.logout = exports.refresh = exports.login = exports.register = void 0;
const zod_1 = require("zod");
const authService = __importStar(require("../services/authService"));
const errorHandler_1 = require("../middleware/errorHandler");
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    name: zod_1.z.string().min(1, 'Name is required'),
    school: zod_1.z.string().optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
const refreshSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
exports.register = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const data = registerSchema.parse(req.body);
    const result = await authService.registerUser(data.email, data.password, data.name, data.school);
    res.status(201).json({
        success: true,
        data: result,
    });
});
exports.login = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const result = await authService.loginUser(data.email, data.password);
    res.json({
        success: true,
        data: result,
    });
});
exports.refresh = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const data = refreshSchema.parse(req.body);
    const tokens = await authService.refreshTokens(data.refreshToken);
    res.json({
        success: true,
        data: { tokens },
    });
});
exports.logout = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.userId) {
        throw new errorHandler_1.AppError('Unauthorized', 401);
    }
    await authService.logoutUser(req.userId);
    res.json({
        success: true,
        message: 'Logged out successfully',
    });
});
//# sourceMappingURL=authController.js.map