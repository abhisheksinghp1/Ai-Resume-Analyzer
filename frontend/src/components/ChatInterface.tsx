import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, User, Bot } from 'lucide-react';
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

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatInterfaceProps {
  resumeData: ResumeData;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ resumeData }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hello! I'm your AI resume assistant. I can help you analyze ${resumeData.name}'s resume. What would you like to know?`,
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/chat', {
        resume_data: resumeData,
        question: inputText,
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.answer,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error while processing your question. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    `What are ${resumeData.name}'s main technical skills?`,
    `Tell me about ${resumeData.name}'s work experience`,
    `What education does ${resumeData.name} have?`,
    `What projects has ${resumeData.name} worked on?`,
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">AI Resume Chat</h2>
              <p className="text-purple-100">Ask questions about {resumeData.name}'s resume</p>
            </div>
          </div>
        </div>

        {/* Suggested Questions */}
        <div className="bg-gray-50 p-4 border-b">
          <p className="text-sm text-gray-600 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInputText(question)}
                className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-purple-50 hover:border-purple-300 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Container */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender === 'bot' && (
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-purple-600" />
                </div>
              )}
              <div
                className={`max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-purple-200' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
              {message.sender === 'user' && (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start space-x-3 justify-start">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-purple-600" />
              </div>
              <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about the resume..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={2}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Chat Features:</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
            Ask questions about skills, experience, and education
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
            Get insights about career progression
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
            Discuss project details and achievements
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
            AI-powered analysis based on resume content
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ChatInterface;
