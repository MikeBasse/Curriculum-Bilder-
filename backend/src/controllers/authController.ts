import { Request, Response } from 'express';
import { z } from 'zod';
import * as authService from '../services/authService';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  school: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  const result = await authService.registerUser(
    data.email,
    data.password,
    data.name,
    data.school
  );

  res.status(201).json({
    success: true,
    data: result,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);
  const result = await authService.loginUser(data.email, data.password);

  res.json({
    success: true,
    data: result,
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const data = refreshSchema.parse(req.body);
  const tokens = await authService.refreshTokens(data.refreshToken);

  res.json({
    success: true,
    data: { tokens },
  });
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    throw new AppError('Unauthorized', 401);
  }

  await authService.logoutUser(req.userId);

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});
