import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

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

interface FileUploadProps {
  onResumeProcessed: (data: ResumeData) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onResumeProcessed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setError(null);
        setSuccess(false);
      } else {
        setError('Please upload a PDF, DOCX, or TXT file');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSuccess(true);
        onResumeProcessed(response.data.data);
      } else {
        setError('Failed to process resume');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <Upload className="h-8 w-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Resume</h2>
          <p className="text-gray-600">
            Upload your resume in PDF, DOCX, or TXT format for AI-powered analysis
          </p>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-flex flex-col items-center"
          >
            <FileText className="h-12 w-12 text-gray-400 mb-3" />
            <span className="text-lg font-medium text-gray-700 mb-1">
              {file ? file.name : 'Choose a file or drag it here'}
            </span>
            <span className="text-sm text-gray-500">
              PDF, DOCX, or TXT up to 10MB
            </span>
          </label>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-700">Resume processed successfully!</span>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="mt-6 w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? 'Processing...' : 'Analyze Resume'}
        </button>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">What we extract:</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
            Personal Information (Name, Contact)
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
            Technical Skills & Technologies
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
            Education Background
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
            Work Experience
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
            Projects & Certifications
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;
