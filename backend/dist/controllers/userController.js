"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMe = exports.getMe = void 0;
const zod_1 = require("zod");
const server_1 = require("../server");
const errorHandler_1 = require("../middleware/errorHandler");
const updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    school: zod_1.z.string().optional(),
});
exports.getMe = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.userId) {
        throw new errorHandler_1.AppError('Unauthorized', 401);
    }
    const user = await server_1.prisma.user.findUnique({
        where: { id: req.userId },
        select: {
            id: true,
            email: true,
            name: true,
            school: true,
            subscriptionTier: true,
            emailVerified: true,
            createdAt: true,
        },
    });
    if (!user) {
        throw new errorHandler_1.AppError('User not found', 404);
    }
    res.json({
        success: true,
        data: user,
    });
});
exports.updateMe = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.userId) {
        throw new errorHandler_1.AppError('Unauthorized', 401);
    }
    const data = updateUserSchema.parse(req.body);
    const user = await server_1.prisma.user.update({
        where: { id: req.userId },
        data,
        select: {
            id: true,
            email: true,
            name: true,
            school: true,
            subscriptionTier: true,
            emailVerified: true,
            createdAt: true,
        },
    });
    res.json({
        success: true,
        data: user,
    });
});
//# sourceMappingURL=userController.js.map