import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, BookOpen, GraduationCap, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import { Layout, Button } from '../common';
import { Generation } from '../../types';
import * as generationsApi from '../../api/generations';

const TYPE_ICONS = {
  lesson: BookOpen,
  program: GraduationCap,
  assessment: ClipboardList,
};

export const GenerationsPage: React.FC = () => {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchGenerations();
  }, []);

  const fetchGenerations = async () => {
    try {
      const data = await generationsApi.getGenerations();
      setGenerations(data);
    } catch (error) {
      toast.error('Failed to load generations');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGenerations = generations.filter((gen) => {
    const matchesSearch = gen.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || gen.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Generations</h1>
          <p className="text-gray-600">View and manage your generated content</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search generations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Types</option>
            <option value="lesson">Lesson Plans</option>
            <option value="program">Programs</option>
            <option value="assessment">Assessments</option>
          </select>
        </div>

        {/* Generations List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse"
              >
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : filteredGenerations.length > 0 ? (
          <div className="space-y-3">
            {filteredGenerations.map((gen) => {
              const Icon = TYPE_ICONS[gen.type] || FileText;
              return (
                <Link
                  key={gen.id}
                  to={`/generations/${gen.id}`}
                  className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary-50 rounded">
                        <Icon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{gen.title}</h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {gen.type} Plan • Version {gen.version}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-400">
                        {new Date(gen.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white border border-gray-200 border-dashed rounded-lg">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No generations found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || typeFilter !== 'all'
                ? 'Try adjusting your filters.'
                : 'Create a project and generate your first content.'}
            </p>
            {!searchQuery && typeFilter === 'all' && (
              <Link to="/projects">
                <Button>Go to Projects</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};
