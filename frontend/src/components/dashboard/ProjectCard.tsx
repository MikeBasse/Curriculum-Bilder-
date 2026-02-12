import React from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, FileText, Calendar } from 'lucide-react';
import { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="block bg-white rounded-lg border border-gray-200 p-5 hover:border-primary-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-primary-50 rounded-lg">
          <FolderOpen className="w-5 h-5 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{project.title}</h3>
          {project.subject && (
            <p className="text-sm text-gray-500 truncate">{project.subject}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-3">
          <span className="flex items-center">
            <FileText className="w-4 h-4 mr-1" />
            {project._count?.documents || 0}
          </span>
        </div>
        <span className="flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          {new Date(project.updatedAt).toLocaleDateString()}
        </span>
      </div>

      {project.tags && project.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {project.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 2 && (
            <span className="px-2 py-0.5 text-xs text-gray-400">
              +{project.tags.length - 2}
            </span>
          )}
        </div>
      )}
    </Link>
  );
};
