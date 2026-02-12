import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderOpen, FileText, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Layout, Button } from '../common';
import { ProjectCard } from './ProjectCard';
import { useAuth } from '../../contexts/AuthContext';
import { Project, Generation } from '../../types';
import * as projectsApi from '../../api/projects';
import * as generationsApi from '../../api/generations';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentGenerations, setRecentGenerations] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsData, generationsData] = await Promise.all([
          projectsApi.getProjects(),
          generationsApi.getGenerations(),
        ]);
        setProjects(projectsData.slice(0, 4));
        setRecentGenerations(generationsData.slice(0, 5));
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      label: 'Total Projects',
      value: projects.length,
      icon: FolderOpen,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Generations',
      value: recentGenerations.length,
      icon: FileText,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Subscription',
      value: user?.subscriptionTier || 'Free',
      icon: Clock,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="mt-1 text-gray-600">
            Here's an overview of your curriculum builder activity.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-lg border border-gray-200 p-5"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Projects */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Projects
            </h2>
            <Link to="/projects">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 border-dashed p-8 text-center">
              <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No projects yet
              </h3>
              <p className="text-gray-500 mb-4">
                Create your first project to get started.
              </p>
              <Link to="/projects">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Recent Generations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Generations
            </h2>
            <Link to="/generations">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : recentGenerations.length > 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
              {recentGenerations.map((gen) => (
                <Link
                  key={gen.id}
                  to={`/generations/${gen.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{gen.title}</h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {gen.type} Plan
                      </p>
                    </div>
                    <span className="text-sm text-gray-400">
                      {new Date(gen.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 border-dashed p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No generations yet
              </h3>
              <p className="text-gray-500">
                Upload documents and generate lesson plans to see them here.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
