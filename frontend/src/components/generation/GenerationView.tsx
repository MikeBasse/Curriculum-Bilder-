import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Layout, Button } from '../common';
import { ExportModal } from '../export/ExportModal';
import { Generation } from '../../types';
import * as generationsApi from '../../api/generations';

export const GenerationView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [generation, setGeneration] = useState<Generation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start editing...',
      }),
    ],
    content: '',
    onUpdate: () => {
      setHasChanges(true);
    },
  });

  useEffect(() => {
    if (id) {
      fetchGeneration();
    }
  }, [id]);

  useEffect(() => {
    if (generation && editor) {
      const htmlContent = formatContentToHtml(generation.content);
      editor.commands.setContent(htmlContent);
      setHasChanges(false);
    }
  }, [generation, editor]);

  const fetchGeneration = async () => {
    try {
      const data = await generationsApi.getGeneration(id!);
      setGeneration(data);
    } catch (error) {
      toast.error('Failed to load generation');
      navigate('/generations');
    } finally {
      setIsLoading(false);
    }
  };

  const formatContentToHtml = (content: Record<string, any>): string => {
    let html = '';

    for (const [key, value] of Object.entries(content)) {
      const title = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();

      html += `<h2>${title}</h2>`;

      if (Array.isArray(value)) {
        html += '<ul>';
        value.forEach((item) => {
          if (typeof item === 'object') {
            html += `<li>${Object.entries(item)
              .map(([k, v]) => `<strong>${k}:</strong> ${v}`)
              .join(', ')}</li>`;
          } else {
            html += `<li>${item}</li>`;
          }
        });
        html += '</ul>';
      } else if (typeof value === 'object' && value !== null) {
        html += '<ul>';
        Object.entries(value).forEach(([k, v]) => {
          html += `<li><strong>${k}:</strong> ${v}</li>`;
        });
        html += '</ul>';
      } else {
        html += `<p>${value}</p>`;
      }
    }

    return html;
  };

  const handleSave = async () => {
    if (!editor || !generation) return;

    setIsSaving(true);

    try {
      // For now, we save the raw content without parsing HTML back to structured format
      // In a full implementation, you'd parse the HTML or use a structured editor
      const updatedContent = { ...generation.content, _editedHtml: editor.getHTML() };

      await generationsApi.updateGeneration(id!, {
        content: updatedContent,
      });

      setHasChanges(false);
      toast.success('Changes saved');
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </Layout>
    );
  }

  if (!generation) {
    return null;
  }

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/generations"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Generations
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{generation.title}</h1>
              <p className="text-gray-600 capitalize">
                {generation.type} Plan • Version {generation.version}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleSave}
                isLoading={isSaving}
                disabled={!hasChanges}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button onClick={() => setShowExportModal(true)}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Editor Toolbar */}
        {editor && (
          <div className="bg-white border border-gray-200 rounded-t-lg border-b-0 p-2 flex items-center space-x-1">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor.isActive('bold') ? 'bg-gray-200' : ''
              }`}
            >
              <strong>B</strong>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor.isActive('italic') ? 'bg-gray-200' : ''
              }`}
            >
              <em>I</em>
            </button>
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''
              }`}
            >
              H2
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''
              }`}
            >
              H3
            </button>
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor.isActive('bulletList') ? 'bg-gray-200' : ''
              }`}
            >
              • List
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor.isActive('orderedList') ? 'bg-gray-200' : ''
              }`}
            >
              1. List
            </button>
          </div>
        )}

        {/* Editor */}
        <div className="bg-white border border-gray-200 rounded-b-lg p-6 min-h-[500px] prose prose-sm max-w-none">
          <EditorContent editor={editor} />
        </div>

        {/* Export Modal */}
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          generation={generation}
        />
      </div>
    </Layout>
  );
};
