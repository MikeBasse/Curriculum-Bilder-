import api from './client';

export const exportPdf = async (generationId: string): Promise<Blob> => {
  const response = await api.post(
    '/exports/pdf',
    { generationId },
    { responseType: 'blob' }
  );
  return response.data;
};

export const exportDocx = async (generationId: string): Promise<Blob> => {
  const response = await api.post(
    '/exports/docx',
    { generationId },
    { responseType: 'blob' }
  );
  return response.data;
};

export const downloadExport = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
