# AI Resume Analyzer

A full-stack web application for analyzing resumes using AI technology. Upload your resume, get AI-powered insights, and chat with your resume data.

## 🚀 Features

- **📄 Resume Upload**: Support for PDF, DOCX, and TXT file formats
- **🤖 AI-Powered Analysis**: Uses Google AI Studio Gemini models for intelligent resume parsing
- **💾 Database Storage**: SQLite database to store and retrieve uploaded resumes
- **💬 Smart Chatbot**: Ask questions about your resume and get AI-powered answers
- **📱 Responsive Design**: Modern UI built with React, TypeScript, and Tailwind CSS
- **🔄 Fallback System**: Smart text parsing when AI models are unavailable

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Google AI Studio**: Advanced AI text analysis
- **Python-docx**: DOCX file processing
- **PyPDF2**: PDF file processing
- **Uvicorn**: ASGI server

### Frontend
- **React 18**: Modern JavaScript framework
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icons
- **Axios**: HTTP client

## Project Structure

```
resume-analyzer/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.tsx          # Main application
│   │   └── index.tsx        # Entry point
│   ├── package.json         # Node.js dependencies
│   └── tailwind.config.js   # Tailwind configuration
└── README.md               # This file
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- Google AI Studio API key

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   
   - **Windows:**
     ```bash
     venv\Scripts\activate
     ```
   
   - **Mac/Linux:**
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Set up environment variables:**
   
   - The `.env` file is already created with your API key:
     ```
     GOOGLE_AI_API_KEY=AIzaSyBMMM3WRZZKV5zJW60SzAcNzDVRtJIoxB8
     ```

6. **Start the backend server:**
   ```bash
   python main.py
   ```
   
   The API will be available at `http://localhost:8000`
   
   - **API Documentation**: `http://localhost:8000/docs`
   - **Health Check**: `http://localhost:8000/health`

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   
   *Note: If npm is not available, you can use yarn or pnpm*

3. **Start the development server:**
   ```bash
   npm start
   ```
   
   The application will be available at `http://localhost:3000`

## Usage

### 1. Upload Resume
- Navigate to the "Upload Resume" tab
- Choose a PDF, DOCX, or TXT file
- Click "Analyze Resume" to process the file

### 2. View Analysis
- After upload, switch to the "Resume Analysis" tab
- View extracted information organized by sections:
  - Personal Information
  - Technical Skills
  - Education
  - Work Experience
  - Additional Information (Projects, Certifications, Languages)

### 3. Chat with AI
- Switch to the "AI Chat" tab
- Ask questions about the resume
- Use suggested questions or type your own
- Get intelligent responses based on the resume content

## API Endpoints

### Upload Resume
```
POST /upload-resume
Content-Type: multipart/form-data
Body: file (resume file)
```

### Chat with Resume
```
POST /chat
Content-Type: application/json
Body: {
  "resume_data": {...},
  "question": "your question here"
}
```

### Health Check
```
GET /health
```

## Configuration

### Google AI Studio API
- The application uses Google's Gemini Pro model
- API key is configured in the backend `.env` file
- Make sure your API key has the necessary permissions

### CORS Settings
- Backend is configured to allow requests from `http://localhost:3000`
- For production, update the CORS settings accordingly

## Development

### Running in Development Mode

1. **Start the backend:**
   ```bash
   cd backend
   python main.py
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Access the application:**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`
   - API Docs: `http://localhost:8000/docs`

### Code Style

- Backend follows Python PEP 8 guidelines
- Frontend uses TypeScript for type safety
- Tailwind CSS for consistent styling
- Component-based architecture

## Troubleshooting

### Common Issues

1. **Backend won't start:**
   - Check if Python 3.8+ is installed
   - Verify virtual environment is activated
   - Ensure all dependencies are installed

2. **Frontend build errors:**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version (16+ required)

3. **API connection errors:**
   - Verify backend is running on port 8000
   - Check CORS settings
   - Ensure API key is valid

4. **File upload issues:**
   - Check file size limits
   - Verify file format (PDF, DOCX, TXT)
   - Check backend logs for errors

### Getting Help

- Check the browser console for frontend errors
- Review backend terminal output for API issues
- Visit the API documentation at `http://localhost:8000/docs`

## Production Deployment

### Backend Deployment
- Use a production ASGI server like Gunicorn with Uvicorn workers
- Set up environment variables properly
- Configure HTTPS and security headers
- Set up proper logging and monitoring

### Frontend Deployment
- Build the production bundle: `npm run build`
- Deploy to a static hosting service
- Configure environment variables for API endpoints
- Set up proper caching strategies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational and demonstration purposes. Please ensure you have the right to use any uploaded resumes and comply with data privacy regulations.

## Support

For issues and questions:
- Check the troubleshooting section
- Review the API documentation
- Verify your setup matches the requirements
