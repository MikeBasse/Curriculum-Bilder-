import api from './client';
import { ApiResponse, Document } from '../types';

export const getDocuments = async (projectId?: string): Promise<Document[]> => {
  const params = projectId ? { projectId } : {};
  const response = await api.get<ApiResponse<Document[]>>('/documents', { params });
  return response.data.data!;
};

export const getDocument = async (id: string): Promise<Document> => {
  const response = await api.get<ApiResponse<Document>>(`/documents/${id}`);
  return response.data.data!;
};

export const uploadDocument = async (
  projectId: string,
  file: File
): Promise<Document> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('projectId', projectId);

  const response = await api.post<ApiResponse<Document>>('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data!;
};

export const deleteDocument = async (id: string): Promise<void> => {
  await api.delete(`/documents/${id}`);
};
