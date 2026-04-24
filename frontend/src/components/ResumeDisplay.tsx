import React from 'react';
import { User, Briefcase, GraduationCap, Code, Award, Globe } from 'lucide-react';

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

interface ResumeDisplayProps {
  resumeData: ResumeData;
}

const ResumeDisplay: React.FC<ResumeDisplayProps> = ({ resumeData }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-xl font-semibold text-purple-900">{resumeData.name}</p>
        </div>
      </div>

      {/* Technical Skills */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Code className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Technical Skills</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {resumeData.technical_skills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Education</h2>
        </div>
        <div className="space-y-4">
          {resumeData.education.map((edu, index) => (
            <div key={index} className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
              <p className="text-gray-700">{edu.institution}</p>
              <p className="text-sm text-gray-500">{edu.year}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <Briefcase className="h-6 w-6 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Work Experience</h2>
        </div>
        <div className="space-y-4">
          {resumeData.experience.map((exp, index) => (
            <div key={index} className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-semibold text-gray-900">{exp.position}</h3>
              <p className="text-gray-700">{exp.company}</p>
              <p className="text-sm text-gray-500">{exp.duration}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Other Sections */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Additional Information</h2>
        
        {resumeData.other_sections.projects && resumeData.other_sections.projects.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <Code className="h-4 w-4 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
            </div>
            <div className="space-y-2">
              {resumeData.other_sections.projects.map((project, index) => (
                <div key={index} className="bg-indigo-50 rounded-lg p-3">
                  <p className="text-indigo-900">{project}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {resumeData.other_sections.certifications && resumeData.other_sections.certifications.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Award className="h-4 w-4 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>
            </div>
            <div className="space-y-2">
              {resumeData.other_sections.certifications.map((cert, index) => (
                <div key={index} className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-yellow-900">{cert}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {resumeData.other_sections.languages && resumeData.other_sections.languages.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                <Globe className="h-4 w-4 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Languages</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {resumeData.other_sections.languages.map((language, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium"
                >
                  {language}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeDisplay;
