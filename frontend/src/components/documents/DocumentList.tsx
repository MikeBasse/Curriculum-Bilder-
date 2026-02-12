import React from 'react';
import { FileText, Trash2, Eye } from 'lucide-react';
import { Document } from '../../types';
import { Button } from '../common';

interface DocumentListProps {
  documents: Document[];
  onDelete: (id: string) => void;
  onPreview?: (document: Document) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const getFileIcon = (fileType: string): string => {
  if (fileType.includes('pdf')) return 'PDF';
  if (fileType.includes('word')) return 'DOCX';
  if (fileType.includes('text')) return 'TXT';
  return 'FILE';
};

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onDelete,
  onPreview,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
}) => {
  const toggleSelection = (id: string) => {
    if (!onSelectionChange) return;

    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className={`
            flex items-center justify-between p-3 bg-white border rounded-lg
            ${selectable ? 'cursor-pointer hover:border-primary-300' : ''}
            ${selectedIds.includes(doc.id) ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}
          `}
          onClick={() => selectable && toggleSelection(doc.id)}
        >
          <div className="flex items-center space-x-3">
            {selectable && (
              <input
                type="checkbox"
                checked={selectedIds.includes(doc.id)}
                onChange={() => toggleSelection(doc.id)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded">
              <span className="text-xs font-medium text-gray-600">
                {getFileIcon(doc.fileType)}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900 truncate max-w-xs">
                {doc.filename}
              </p>
              <p className="text-sm text-gray-500">
                {formatFileSize(doc.fileSize)} • {new Date(doc.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {!selectable && (
            <div className="flex items-center space-x-2">
              {onPreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPreview(doc)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(doc.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
