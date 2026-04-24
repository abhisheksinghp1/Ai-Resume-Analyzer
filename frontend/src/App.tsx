import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ResumeDisplay from './components/ResumeDisplay';
import ChatInterface from './components/ChatInterface';
import { Upload, FileText, MessageCircle } from 'lucide-react';
import './App.css';

interface ResumeData {
  name: string;
  technical_skills: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  experience: Array<{
    position: string;
    company: string;
    duration: string;
  }>;
  other_sections: {
    projects?: string[];
    certifications?: string[];
    languages?: string[];
  };
}

function App() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'display' | 'chat'>('upload');

  const handleResumeProcessed = (data: ResumeData) => {
    setResumeData(data);
    setActiveTab('display');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="gradient-bg text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8" />
              <h1 className="text-2xl font-bold">AI Resume Analyzer</h1>
            </div>
            <p className="text-sm opacity-90">Upload • Analyze • Chat</p>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'upload'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Upload Resume</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('display')}
              disabled={!resumeData}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'display'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Resume Analysis</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              disabled={!resumeData}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'chat'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>AI Chat</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'upload' && (
          <FileUpload onResumeProcessed={handleResumeProcessed} />
        )}
        {activeTab === 'display' && resumeData && (
          <ResumeDisplay resumeData={resumeData} />
        )}
        {activeTab === 'chat' && resumeData && (
          <ChatInterface resumeData={resumeData} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm opacity-75">
            Powered by Google AI Studio • Built with FastAPI & React
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
