import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Layout, Button, Modal, Input } from '../common';
import { ProjectCard } from './ProjectCard';
import { Project } from '../../types';
import * as projectsApi from '../../api/projects';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await projectsApi.getProjects();
      setProjects(data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const project = await projectsApi.createProject({
        title,
        description: description || undefined,
        subject: subject || undefined,
        gradeLevel: gradeLevel || undefined,
      });
      setProjects([project, ...projects]);
      setShowCreateModal(false);
      resetForm();
      toast.success('Project created successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSubject('');
    setGradeLevel('');
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600">Manage your curriculum projects</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Projects grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchQuery ? 'No projects match your search.' : 'No projects yet. Create your first project to get started.'}
            </p>
          </div>
        )}

        {/* Create Project Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          title="Create New Project"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Project Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., 10th Grade Biology Curriculum"
              required
            />
            <Input
              label="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the project"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Subject (optional)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Biology"
              />
              <Input
                label="Grade Level (optional)"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                placeholder="e.g., 10th Grade"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isCreating}>
                Create Project
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};
