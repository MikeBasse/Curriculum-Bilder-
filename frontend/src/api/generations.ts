import api from './client';
import { ApiResponse, Generation, GenerationConfig } from '../types';

export const generateLesson = async (config: GenerationConfig): Promise<Generation> => {
  const response = await api.post<ApiResponse<Generation>>('/generations/lesson', config);
  return response.data.data!;
};

export const generateProgram = async (config: GenerationConfig): Promise<Generation> => {
  const response = await api.post<ApiResponse<Generation>>('/generations/program', config);
  return response.data.data!;
};

export const generateAssessment = async (config: GenerationConfig): Promise<Generation> => {
  const response = await api.post<ApiResponse<Generation>>('/generations/assessment', config);
  return response.data.data!;
};

export const getGenerations = async (
  projectId?: string,
  type?: string
): Promise<Generation[]> => {
  const params: Record<string, string> = {};
  if (projectId) params.projectId = projectId;
  if (type) params.type = type;

  const response = await api.get<ApiResponse<Generation[]>>('/generations', { params });
  return response.data.data!;
};

export const getGeneration = async (id: string): Promise<Generation> => {
  const response = await api.get<ApiResponse<Generation>>(`/generations/${id}`);
  return response.data.data!;
};

export const updateGeneration = async (
  id: string,
  data: { title?: string; content?: Record<string, any> }
): Promise<Generation> => {
  const response = await api.patch<ApiResponse<Generation>>(`/generations/${id}`, data);
  return response.data.data!;
};
