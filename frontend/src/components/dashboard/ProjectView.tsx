import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, FileText, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { Layout, Button, Modal } from '../common';
import { DocumentUpload, DocumentList } from '../documents';
import { Project, Document, Generation } from '../../types';
import * as projectsApi from '../../api/projects';
import * as documentsApi from '../../api/documents';

export const ProjectView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'documents' | 'generations'>('documents');

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const data = await projectsApi.getProject(id!);
      setProject(data);
      setDocuments(data.documents || []);
      setGenerations(data.generations || []);
    } catch (error) {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentUpload = (document: Document) => {
    setDocuments([document, ...documents]);
  };

  const handleDocumentDelete = async (documentId: string) => {
    try {
      await documentsApi.deleteDocument(documentId);
      setDocuments(documents.filter((d) => d.id !== documentId));
      toast.success('Document deleted');
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const handleProjectDelete = async () => {
    try {
      await projectsApi.deleteProject(id!);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 lg:p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </Layout>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/projects"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Projects
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
              {project.description && (
                <p className="text-gray-600 mt-1">{project.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                {project.subject && <span>{project.subject}</span>}
                {project.gradeLevel && <span>{project.gradeLevel}</span>}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link to={`/projects/${id}/generate`}>
                <Button>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(true)}
                className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'documents'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Documents ({documents.length})
            </button>
            <button
              onClick={() => setActiveTab('generations')}
              className={`py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'generations'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Generations ({generations.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'documents' ? (
          <div className="space-y-6">
            <DocumentUpload projectId={id!} onUpload={handleDocumentUpload} />
            <DocumentList documents={documents} onDelete={handleDocumentDelete} />
          </div>
        ) : (
          <div>
            {generations.length > 0 ? (
              <div className="space-y-3">
                {generations.map((gen) => (
                  <Link
                    key={gen.id}
                    to={`/generations/${gen.id}`}
                    className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary-50 rounded">
                          <FileText className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{gen.title}</h3>
                          <p className="text-sm text-gray-500 capitalize">
                            {gen.type} Plan • Version {gen.version}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-400">
                        {new Date(gen.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white border border-gray-200 border-dashed rounded-lg">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No generations yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Upload documents and generate lesson plans, programs, or assessments.
                </p>
                <Link to={`/projects/${id}/generate`}>
                  <Button>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Now
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Delete Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Project"
        >
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete "{project.title}"? This will also delete all
            documents and generations associated with this project. This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleProjectDelete}>
              Delete Project
            </Button>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};
