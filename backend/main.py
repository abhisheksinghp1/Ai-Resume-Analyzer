from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv
import PyPDF2
from docx import Document
import io
import json
from typing import Dict, Any
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

load_dotenv()

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./resumes.db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Resume database model
class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    raw_text = Column(Text)
    parsed_data = Column(Text)
    upload_date = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Resume Analyzer API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Google AI Studio with fallback models
GOOGLE_AI_API_KEY = os.getenv("GOOGLE_AI_API_KEY")
FALLBACK_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash", 
    "gemini-2.0-flash-lite",
    "gemini-flash-latest",
    "gemini-pro-latest"
]

class ResumeData(BaseModel):
    name: str
    technical_skills: list
    education: list
    experience: list
    other_sections: Dict[str, Any]

class ChatRequest(BaseModel):
    resume_data: ResumeData
    question: str

def parse_resume_text_manually(text: str) -> Dict[str, Any]:
    """Smart text-based resume parsing when AI models fail"""
    import re
    
    # Initialize result
    result = {
        "name": "Unknown",
        "technical_skills": [],
        "education": [],
        "experience": [],
        "other_sections": {}
    }
    
    # Extract name (look for patterns at the beginning of text)
    lines = text.split('\n')
    for i, line in enumerate(lines[:10]):  # Check first 10 lines
        line = line.strip()
        if len(line) > 3 and len(line) < 50 and not any(char.isdigit() for char in line):
            # Skip common non-name lines
            skip_words = ['resume', 'cv', 'curriculum', 'vitae', 'training', 'projects', 'education', 'skills']
            if not any(skip_word.lower() in line.lower() for skip_word in skip_words):
                result["name"] = line
                break
    
    # Extract technical skills
    skills_keywords = ['technical skills', 'skills', 'technologies', 'programming languages', 'languages']
    skills_section = extract_section(text, skills_keywords)
    if skills_section:
        # Parse skills from the section
        skills = []
        for line in skills_section.split('\n'):
            line = line.strip()
            # Remove bullet points and clean up
            clean_line = re.sub(r'^[•\-\*\+]\s*', '', line)
            clean_line = re.sub(r'^\d+\.\s*', '', clean_line)
            if clean_line and len(clean_line) > 1 and len(clean_line) < 50:
                # Split by common separators
                for skill in re.split(r'[,;\/\|]', clean_line):
                    skill = skill.strip()
                    if skill and len(skill) > 1:
                        skills.append(skill)
        result["technical_skills"] = list(set(skills))  # Remove duplicates
    
    # Extract education
    education_keywords = ['education', 'academic', 'university', 'college', 'degree']
    education_section = extract_section(text, education_keywords)
    if education_section:
        education = []
        for line in education_section.split('\n'):
            line = line.strip()
            if len(line) > 10 and any(keyword in line.lower() for keyword in ['university', 'college', 'school', 'bachelor', 'master', 'phd', 'bs', 'ms', 'ba', 'ma']):
                education.append({
                    "degree": "Degree",
                    "institution": line,
                    "year": "Year"
                })
        result["education"] = education
    
    # Extract experience
    experience_keywords = ['experience', 'work', 'employment', 'career', 'job']
    experience_section = extract_section(text, experience_keywords)
    if experience_section:
        experience = []
        for line in experience_section.split('\n'):
            line = line.strip()
            if len(line) > 10 and any(keyword in line.lower() for keyword in ['engineer', 'developer', 'manager', 'analyst', 'consultant']):
                experience.append({
                    "position": line,
                    "company": "Company",
                    "duration": "Duration"
                })
        result["experience"] = experience
    
    # Extract other sections
    other_keywords = {
        'projects': ['projects', 'project'],
        'certifications': ['certifications', 'certificates', 'certificate'],
        'languages': ['languages', 'language']
    }
    
    for section_name, keywords in other_keywords.items():
        section = extract_section(text, keywords)
        if section:
            items = []
            for line in section.split('\n'):
                line = re.sub(r'^[•\-\*\+]\s*', '', line.strip())
                if line and len(line) > 2:
                    items.append(line)
            result["other_sections"][section_name] = items[:5]  # Limit to 5 items
    
    return result

def extract_section(text: str, keywords: list) -> str:
    """Extract a section of text based on keywords"""
    lines = text.split('\n')
    section_lines = []
    capture = False
    
    for line in lines:
        line_lower = line.lower().strip()
        
        # Check if this line starts a section
        if any(keyword in line_lower for keyword in keywords):
            capture = True
            section_lines.append(line)
            continue
        
        # If we're capturing and hit a new major section, stop
        if capture and any(major_keyword in line_lower for major_keyword in 
                          ['education', 'experience', 'skills', 'projects', 'certifications', 'training']):
            if not any(keyword in line_lower for keyword in keywords):
                break
        
        # Capture lines while in section
        if capture and line.strip():
            section_lines.append(line)
    
    return '\n'.join(section_lines) if section_lines else ""

def extract_text_from_pdf(pdf_content: bytes) -> str:
    """Extract text from PDF file"""
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text

def extract_text_from_docx(docx_content: bytes) -> str:
    """Extract text from DOCX file"""
    doc = Document(io.BytesIO(docx_content))
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text

def extract_text_from_txt(txt_content: bytes) -> str:
    """Extract text from TXT file"""
    return txt_content.decode('utf-8')

def parse_resume_with_ai(text: str) -> Dict[str, Any]:
    """Use Google AI to parse and structure resume data"""
    prompt = f"""
    Please analyze the following resume text and extract the information into structured JSON format.
    Focus on these categories:
    1. Name - The person's full name
    2. Technical Skills - All technical skills, programming languages, tools, and technologies
    3. Education - Educational background with degrees, institutions, and dates
    4. Experience - Work experience with companies, positions, and durations
    5. Other sections - Any other relevant information like projects, certifications, etc.

    Resume Text:
    {text}

    Please return the response in this exact JSON format:
    {{
        "name": "Full Name",
        "technical_skills": ["skill1", "skill2", "skill3"],
        "education": [
            {{
                "degree": "Degree Name",
                "institution": "Institution Name",
                "year": "Year or Date Range"
            }}
        ],
        "experience": [
            {{
                "position": "Job Title",
                "company": "Company Name",
                "duration": "Duration"
            }}
        ],
        "other_sections": {{
            "projects": ["project1", "project2"],
            "certifications": ["cert1", "cert2"],
            "languages": ["language1", "language2"]
        }}
    }}
    """
    
    # Try each model in order with retry logic
    for model_name in FALLBACK_MODELS:
        try:
            headers = {"Content-Type": "application/json"}
            data = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.3}
            }
            
            api_url = f"https://generativelanguage.googleapis.com/v1/models/{model_name}:generateContent"
            print(f"Trying model: {model_name}")
            print(f"API Key present: {'Yes' if GOOGLE_AI_API_KEY else 'No'}")
            
            response = requests.post(
                f"{api_url}?key={GOOGLE_AI_API_KEY}",
                headers=headers,
                json=data,
                timeout=30
            )
            
            print(f"Response status: {response.status_code}")
            
            if response.status_code == 200:
                print(f"✅ Success with model: {model_name}")
                # Extract JSON from the response
                response_json = response.json()
                response_text = response_json["candidates"][0]["content"]["parts"][0]["text"]
                
                # Find JSON content in the response
                start_idx = response_text.find('{')
                end_idx = response_text.rfind('}') + 1
                if start_idx != -1 and end_idx != -1:
                    json_str = response_text[start_idx:end_idx]
                    return json.loads(json_str)
                else:
                    raise ValueError("Could not extract JSON from AI response")
            elif response.status_code == 503:
                print(f"❌ Model {model_name} unavailable, trying next...")
                continue
            else:
                print(f"❌ Error with {model_name}: {response.text}")
                continue
                
        except Exception as e:
            print(f"❌ Exception with {model_name}: {str(e)}")
            continue
    
    # If all models fail, use smart text-based parsing
    print("⚠️ All AI models failed, using smart text parsing")
    return parse_resume_text_manually(text)

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """Upload and analyze resume"""
    try:
        # Check file type
        file_extension = file.filename.split('.')[-1].lower()
        
        # Read file content
        content = await file.read()
        
        # Extract text based on file type
        if file_extension == 'pdf':
            text = extract_text_from_pdf(content)
        elif file_extension == 'docx':
            text = extract_text_from_docx(content)
        elif file_extension == 'txt':
            text = extract_text_from_txt(content)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, DOCX, or TXT files.")
        
        # Parse resume with AI
        resume_data = parse_resume_with_ai(text)
        
        # Save to database
        db = SessionLocal()
        try:
            resume_record = Resume(
                name=resume_data["name"],
                file_name=file.filename,
                file_type=file_extension,
                raw_text=text,
                parsed_data=json.dumps(resume_data)
            )
            db.add(resume_record)
            db.commit()
            db.refresh(resume_record)
            resume_id = resume_record.id
        finally:
            db.close()
        
        return JSONResponse(content={
            "success": True,
            "data": resume_data,
            "raw_text": text,
            "resume_id": resume_id
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")

@app.post("/chat")
async def chat_with_resume(request: ChatRequest):
    """Chat with AI about the resume"""
    try:
        # Create context from resume data
        context = f"""
        Resume Information:
        Name: {request.resume_data.name}
        Technical Skills: {', '.join(request.resume_data.technical_skills)}
        Education: {json.dumps(request.resume_data.education, indent=2)}
        Experience: {json.dumps(request.resume_data.experience, indent=2)}
        Other Sections: {json.dumps(request.resume_data.other_sections, indent=2)}
        
        User Question: {request.question}
        """
        
        prompt = f"""
        Based on the following resume information, answer the user's question accurately and professionally.
        If the information is not available in the resume, politely mention that.
        
        {context}
        
        Provide a helpful and detailed response.
        """
        
        # Try each model in order with retry logic
        for model_name in FALLBACK_MODELS:
            try:
                headers = {"Content-Type": "application/json"}
                data = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.7}
                }
                
                api_url = f"https://generativelanguage.googleapis.com/v1/models/{model_name}:generateContent"
                print(f"Chat trying model: {model_name}")
                
                response = requests.post(
                    f"{api_url}?key={GOOGLE_AI_API_KEY}",
                    headers=headers,
                    json=data,
                    timeout=30
                )
                
                if response.status_code == 200:
                    print(f"✅ Chat success with model: {model_name}")
                    return JSONResponse(content={
                        "success": True,
                        "answer": response.json()["candidates"][0]["content"]["parts"][0]["text"]
                    })
                elif response.status_code == 503:
                    print(f"❌ Chat model {model_name} unavailable, trying next...")
                    continue
                else:
                    print(f"❌ Chat error with {model_name}: {response.text}")
                    continue
                    
            except Exception as e:
                print(f"❌ Chat exception with {model_name}: {str(e)}")
                continue
        
        # If all models fail, return a helpful message
        return JSONResponse(content={
            "success": True,
            "answer": "I'm sorry, but all AI models are currently unavailable. Please try again in a few minutes. In the meantime, you can review the resume data that was extracted."
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Resume Analyzer API is running"}

@app.get("/resumes")
async def get_resumes():
    """Get all saved resumes"""
    db = SessionLocal()
    try:
        resumes = db.query(Resume).all()
        return JSONResponse(content={
            "success": True,
            "resumes": [
                {
                    "id": resume.id,
                    "name": resume.name,
                    "file_name": resume.file_name,
                    "file_type": resume.file_type,
                    "upload_date": resume.upload_date.isoformat(),
                    "parsed_data": json.loads(resume.parsed_data) if resume.parsed_data else {}
                }
                for resume in resumes
            ]
        })
    finally:
        db.close()

@app.get("/resumes/{name}")
async def get_resume_by_name(name: str):
    """Get resume by name"""
    db = SessionLocal()
    try:
        resumes = db.query(Resume).filter(Resume.name.contains(name)).all()
        return JSONResponse(content={
            "success": True,
            "resumes": [
                {
                    "id": resume.id,
                    "name": resume.name,
                    "file_name": resume.file_name,
                    "file_type": resume.file_type,
                    "upload_date": resume.upload_date.isoformat(),
                    "parsed_data": json.loads(resume.parsed_data) if resume.parsed_data else {}
                }
                for resume in resumes
            ]
        })
    finally:
        db.close()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
