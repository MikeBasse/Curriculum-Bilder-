"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.refreshTokens = exports.loginUser = exports.registerUser = exports.verifyRefreshToken = exports.generateTokens = exports.verifyPassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const server_1 = require("../server");
const constants_1 = require("../utils/constants");
const errorHandler_1 = require("../middleware/errorHandler");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-refresh-secret';
const hashPassword = async (password) => {
    return bcryptjs_1.default.hash(password, constants_1.BCRYPT_ROUNDS);
};
exports.hashPassword = hashPassword;
const verifyPassword = async (password, hash) => {
    return bcryptjs_1.default.compare(password, hash);
};
exports.verifyPassword = verifyPassword;
const generateTokens = (userId) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId }, JWT_SECRET, {
        expiresIn: constants_1.JWT_EXPIRES_IN,
    });
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, REFRESH_SECRET, {
        expiresIn: constants_1.REFRESH_TOKEN_EXPIRES_IN,
    });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
const verifyRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, REFRESH_SECRET);
    }
    catch {
        throw new errorHandler_1.AppError('Invalid refresh token', 401);
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
const registerUser = async (email, password, name, school) => {
    const existingUser = await server_1.prisma.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        throw new errorHandler_1.AppError('Email already registered', 400);
    }
    const passwordHash = await (0, exports.hashPassword)(password);
    const user = await server_1.prisma.user.create({
        data: {
            email,
            passwordHash,
            name,
            school,
        },
        select: {
            id: true,
            email: true,
            name: true,
            school: true,
            subscriptionTier: true,
            createdAt: true,
        },
    });
    const tokens = (0, exports.generateTokens)(user.id);
    await server_1.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
    });
    return { user, tokens };
};
exports.registerUser = registerUser;
const loginUser = async (email, password) => {
    const user = await server_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new errorHandler_1.AppError('Invalid email or password', 401);
    }
    const isValidPassword = await (0, exports.verifyPassword)(password, user.passwordHash);
    if (!isValidPassword) {
        throw new errorHandler_1.AppError('Invalid email or password', 401);
    }
    const tokens = (0, exports.generateTokens)(user.id);
    await server_1.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
    });
    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            school: user.school,
            subscriptionTier: user.subscriptionTier,
            createdAt: user.createdAt,
        },
        tokens,
    };
};
exports.loginUser = loginUser;
const refreshTokens = async (refreshToken) => {
    const { userId } = (0, exports.verifyRefreshToken)(refreshToken);
    const user = await server_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user || user.refreshToken !== refreshToken) {
        throw new errorHandler_1.AppError('Invalid refresh token', 401);
    }
    const tokens = (0, exports.generateTokens)(userId);
    await server_1.prisma.user.update({
        where: { id: userId },
        data: { refreshToken: tokens.refreshToken },
    });
    return tokens;
};
exports.refreshTokens = refreshTokens;
const logoutUser = async (userId) => {
    await server_1.prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null },
    });
};
exports.logoutUser = logoutUser;
//# sourceMappingURL=authService.js.map