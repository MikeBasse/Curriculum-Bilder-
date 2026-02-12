import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, GraduationCap, ClipboardList, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Layout, Button, Input } from '../common';
import { DocumentList } from '../documents';
import { Project, Document, GenerationConfig } from '../../types';
import * as projectsApi from '../../api/projects';
import * as generationsApi from '../../api/generations';

type GenerationType = 'lesson' | 'program' | 'assessment';

interface Step {
  number: number;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  { number: 1, title: 'Select Materials', description: 'Choose documents to use as source material' },
  { number: 2, title: 'Configure', description: 'Set up your generation parameters' },
  { number: 3, title: 'Generate', description: 'Review and generate your content' },
];

const GENERATION_TYPES = [
  {
    type: 'lesson' as GenerationType,
    icon: BookOpen,
    title: 'Lesson Plan',
    description: 'Create a detailed lesson plan with objectives, activities, and assessments',
  },
  {
    type: 'program' as GenerationType,
    icon: GraduationCap,
    title: 'Program Outline',
    description: 'Generate a comprehensive program or unit outline with weekly breakdowns',
  },
  {
    type: 'assessment' as GenerationType,
    icon: ClipboardList,
    title: 'Assessment',
    description: 'Create quizzes, tests, or rubrics based on your curriculum materials',
  },
];

export const GenerationWizard: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [generationType, setGenerationType] = useState<GenerationType>('lesson');
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [objectives, setObjectives] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const data = await projectsApi.getProject(projectId!);
      setProject(data);
      setDocuments(data.documents || []);
    } catch (error) {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setIsGenerating(true);

    const config: GenerationConfig = {
      projectId: projectId!,
      title,
      documentIds: selectedDocuments.length > 0 ? selectedDocuments : undefined,
      subject: project?.subject || undefined,
      gradeLevel: project?.gradeLevel || undefined,
      duration: duration || undefined,
      objectives: objectives ? objectives.split('\n').filter(Boolean) : undefined,
      additionalInstructions: additionalInstructions || undefined,
    };

    try {
      let result;
      switch (generationType) {
        case 'lesson':
          result = await generationsApi.generateLesson(config);
          break;
        case 'program':
          result = await generationsApi.generateProgram(config);
          break;
        case 'assessment':
          result = await generationsApi.generateAssessment(config);
          break;
      }

      toast.success('Content generated successfully!');
      navigate(`/generations/${result.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true; // Documents are optional
      case 2:
        return title.trim().length > 0;
      case 3:
        return true;
      default:
        return false;
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

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to={`/projects/${projectId}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to {project?.title}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Generate Content</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-medium
                      ${currentStep >= step.number
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                      }
                    `}
                  >
                    {step.number}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className="font-medium text-gray-900">{step.title}</p>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded ${
                      currentStep > step.number ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {currentStep === 1 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Select Source Materials</h2>
              <p className="text-gray-600 mb-6">
                Choose documents to use as source material for generation. You can skip this step
                if you want to generate without specific source documents.
              </p>

              {documents.length > 0 ? (
                <DocumentList
                  documents={documents}
                  onDelete={() => {}}
                  selectable
                  selectedIds={selectedDocuments}
                  onSelectionChange={setSelectedDocuments}
                />
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">
                    No documents uploaded to this project yet. You can still generate content
                    without source materials.
                  </p>
                </div>
              )}

              {selectedDocuments.length > 0 && (
                <p className="mt-4 text-sm text-gray-600">
                  {selectedDocuments.length} document(s) selected
                </p>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Generation Type</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {GENERATION_TYPES.map((gt) => (
                    <button
                      key={gt.type}
                      onClick={() => setGenerationType(gt.type)}
                      className={`
                        p-4 rounded-lg border-2 text-left transition-all
                        ${generationType === gt.type
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <gt.icon
                        className={`w-6 h-6 mb-2 ${
                          generationType === gt.type ? 'text-primary-600' : 'text-gray-400'
                        }`}
                      />
                      <h3 className="font-medium text-gray-900">{gt.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{gt.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`e.g., Introduction to ${project?.subject || 'Topic'}`}
                  required
                />

                {generationType === 'lesson' && (
                  <Input
                    label="Duration (optional)"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g., 45 minutes"
                  />
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Learning Objectives (optional, one per line)
                  </label>
                  <textarea
                    value={objectives}
                    onChange={(e) => setObjectives(e.target.value)}
                    placeholder="Students will be able to..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Instructions (optional)
                  </label>
                  <textarea
                    value={additionalInstructions}
                    onChange={(e) => setAdditionalInstructions(e.target.value)}
                    placeholder="Any specific requirements or focus areas..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Review & Generate</h2>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium capitalize">{generationType} Plan</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Title</span>
                  <span className="font-medium">{title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Source Documents</span>
                  <span className="font-medium">
                    {selectedDocuments.length || 'None selected'}
                  </span>
                </div>
                {duration && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{duration}</span>
                  </div>
                )}
                {objectives && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Objectives</span>
                    <span className="font-medium">
                      {objectives.split('\n').filter(Boolean).length} specified
                    </span>
                  </div>
                )}
              </div>

              <p className="mt-4 text-sm text-gray-500">
                Click "Generate" to create your {generationType} plan. This may take a moment.
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < 3 ? (
            <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={!canProceed()}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleGenerate} isLoading={isGenerating} disabled={!canProceed()}>
              Generate
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
};
