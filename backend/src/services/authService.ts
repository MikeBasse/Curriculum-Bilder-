import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';
import { BCRYPT_ROUNDS, JWT_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from '../utils/constants';
import { AppError } from '../middleware/errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-refresh-secret';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
};

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateTokens = (userId: string): TokenPair => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  try {
    return jwt.verify(token, REFRESH_SECRET) as { userId: string };
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }
};

export const registerUser = async (
  email: string,
  password: string,
  name: string,
  school?: string
) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
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

  const tokens = generateTokens(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken },
  });

  return { user, tokens };
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);

  if (!isValidPassword) {
    throw new AppError('Invalid email or password', 401);
  }

  const tokens = generateTokens(user.id);

  await prisma.user.update({
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

export const refreshTokens = async (refreshToken: string) => {
  const { userId } = verifyRefreshToken(refreshToken);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.refreshToken !== refreshToken) {
    throw new AppError('Invalid refresh token', 401);
  }

  const tokens = generateTokens(userId);

  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: tokens.refreshToken },
  });

  return tokens;
};

export const logoutUser = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
};
