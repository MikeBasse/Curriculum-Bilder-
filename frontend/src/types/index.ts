export interface User {
  id: string;
  email: string;
  name: string;
  school?: string;
  subscriptionTier: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  description?: string;
  subject?: string;
  gradeLevel?: string;
  tags: string[];
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    documents: number;
    generations: number;
  };
  documents?: Document[];
  generations?: Generation[];
}

export interface Document {
  id: string;
  projectId: string;
  userId: string;
  filename: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  extractedText?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Generation {
  id: string;
  projectId: string;
  userId: string;
  type: 'lesson' | 'program' | 'assessment';
  title: string;
  content: Record<string, any>;
  sourceDocumentIds: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: TokenPair;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface GenerationConfig {
  projectId: string;
  title: string;
  documentIds?: string[];
  subject?: string;
  gradeLevel?: string;
  duration?: string;
  objectives?: string[];
  additionalInstructions?: string;
}
