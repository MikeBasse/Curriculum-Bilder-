import api from './client';
import { ApiResponse, Project } from '../types';

export const getProjects = async (): Promise<Project[]> => {
  const response = await api.get<ApiResponse<Project[]>>('/projects');
  return response.data.data!;
};

export const getProject = async (id: string): Promise<Project> => {
  const response = await api.get<ApiResponse<Project>>(`/projects/${id}`);
  return response.data.data!;
};

export const createProject = async (data: {
  title: string;
  description?: string;
  subject?: string;
  gradeLevel?: string;
  tags?: string[];
}): Promise<Project> => {
  const response = await api.post<ApiResponse<Project>>('/projects', data);
  return response.data.data!;
};

export const updateProject = async (
  id: string,
  data: {
    title?: string;
    description?: string;
    subject?: string;
    gradeLevel?: string;
    tags?: string[];
    archived?: boolean;
  }
): Promise<Project> => {
  const response = await api.patch<ApiResponse<Project>>(`/projects/${id}`, data);
  return response.data.data!;
};

export const deleteProject = async (id: string): Promise<void> => {
  await api.delete(`/projects/${id}`);
};
