import React, { useState } from 'react';
import { FileText, File } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal, Button } from '../common';
import { Generation } from '../../types';
import * as exportsApi from '../../api/exports';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  generation: Generation;
}

type ExportFormat = 'pdf' | 'docx';

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  generation,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      let blob: Blob;
      let filename: string;

      if (selectedFormat === 'pdf') {
        blob = await exportsApi.exportPdf(generation.id);
        filename = `${generation.title}.pdf`;
      } else {
        blob = await exportsApi.exportDocx(generation.id);
        filename = `${generation.title}.docx`;
      }

      exportsApi.downloadExport(blob, filename);
      toast.success('Export downloaded successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to export');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Content">
      <div className="space-y-4">
        <p className="text-gray-600">
          Choose a format to export "{generation.title}".
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setSelectedFormat('pdf')}
            className={`
              p-4 rounded-lg border-2 text-left transition-all
              ${selectedFormat === 'pdf'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <FileText
              className={`w-8 h-8 mb-2 ${
                selectedFormat === 'pdf' ? 'text-primary-600' : 'text-gray-400'
              }`}
            />
            <h3 className="font-medium text-gray-900">PDF</h3>
            <p className="text-sm text-gray-500">
              Best for printing and sharing
            </p>
          </button>

          <button
            onClick={() => setSelectedFormat('docx')}
            className={`
              p-4 rounded-lg border-2 text-left transition-all
              ${selectedFormat === 'docx'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <File
              className={`w-8 h-8 mb-2 ${
                selectedFormat === 'docx' ? 'text-primary-600' : 'text-gray-400'
              }`}
            />
            <h3 className="font-medium text-gray-900">DOCX</h3>
            <p className="text-sm text-gray-500">
              Best for editing in Word
            </p>
          </button>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport} isLoading={isExporting}>
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
