import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Upload, Sparkles, Download, CheckCircle } from 'lucide-react';
import { Button } from './common';

const features = [
  {
    icon: Upload,
    title: 'Upload Your Materials',
    description: 'Import syllabi, textbooks, and curriculum documents in PDF, DOCX, or TXT format.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Generation',
    description: 'Generate lesson plans, program outlines, and assessments using advanced AI.',
  },
  {
    icon: Download,
    title: 'Export Anywhere',
    description: 'Download your generated content as PDF or DOCX files ready for use.',
  },
];

const benefits = [
  'Save hours of planning time',
  'Aligned with educational standards',
  'Customizable to your needs',
  'Rich text editing included',
  'Multiple export formats',
  'Secure document storage',
];

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-semibold text-gray-900">
                Curriculum Builder
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Build Curriculum
            <span className="text-primary-600"> Effortlessly</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Transform your teaching materials into comprehensive lesson plans, program outlines,
            and assessments using AI-powered tools designed for educators.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button size="lg">
                Start Building Free
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three simple steps to create professional curriculum materials.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all"
              >
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Everything You Need to Create Great Curriculum
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our AI-powered platform helps educators save time and create better
                learning experiences for their students.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">1</span>
                  </div>
                  <p className="font-medium text-gray-900">Upload your syllabus or materials</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">2</span>
                  </div>
                  <p className="font-medium text-gray-900">Configure your generation settings</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">3</span>
                  </div>
                  <p className="font-medium text-gray-900">Review, edit, and export</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Curriculum Planning?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join educators who are saving time and creating better learning experiences.
          </p>
          <Link to="/register">
            <Button size="lg">Get Started Free</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 sm:mb-0">
              <BookOpen className="w-6 h-6 text-primary-600" />
              <span className="font-semibold text-gray-900">Curriculum Builder</span>
            </div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Curriculum Builder. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
