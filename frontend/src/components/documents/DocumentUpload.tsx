import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import * as documentsApi from '../../api/documents';
import { Document } from '../../types';

interface DocumentUploadProps {
  projectId: string;
  onUpload: (document: Document) => void;
}

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
};

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  projectId,
  onUpload,
}) => {
  const [uploading, setUploading] = useState<File | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploading(file);

      try {
        const document = await documentsApi.uploadDocument(projectId, file);
        onUpload(document);
        toast.success('Document uploaded successfully');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to upload document');
      } finally {
        setUploading(null);
      }
    },
    [projectId, onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: !!uploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-colors duration-200
        ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'}
        ${uploading ? 'pointer-events-none opacity-75' : ''}
      `}
    >
      <input {...getInputProps()} />

      {uploading ? (
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-3" />
          <p className="text-gray-600">Uploading {uploading.name}...</p>
        </div>
      ) : isDragActive ? (
        <div className="flex flex-col items-center">
          <Upload className="w-10 h-10 text-primary-600 mb-3" />
          <p className="text-primary-600 font-medium">Drop the file here</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <Upload className="w-10 h-10 text-gray-400 mb-3" />
          <p className="text-gray-600 mb-1">
            Drag and drop a file here, or click to select
          </p>
          <p className="text-sm text-gray-500">
            PDF, DOCX, or TXT files up to 10MB
          </p>
        </div>
      )}
    </div>
  );
};
