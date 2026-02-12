export const JWT_EXPIRES_IN = '15m';
export const REFRESH_TOKEN_EXPIRES_IN = '7d';
export const BCRYPT_ROUNDS = 12;

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const GENERATION_TYPES = ['lesson', 'program', 'assessment'] as const;

export const SUBSCRIPTION_TIERS = {
  free: {
    generationsPerMonth: 5,
    maxDocuments: 10,
    maxProjects: 3,
  },
  basic: {
    generationsPerMonth: 50,
    maxDocuments: 100,
    maxProjects: 20,
  },
  premium: {
    generationsPerMonth: -1, // unlimited
    maxDocuments: -1,
    maxProjects: -1,
  },
} as const;
