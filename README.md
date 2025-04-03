# EduVerse

An intelligent education platform with comprehensive ERP capabilities, powered by RAG (Retrieval-Augmented Generation), LangChain, Marp, Mermaid CLI, and LLM integrations for automated quiz generation, personalized learning roadmaps, and AI-enhanced grading.

## Video demo 

[![Watch the video](https://img.youtube.com/vi/vr7aTSJolEk/maxresdefault.jpg)](https://www.youtube.com/watch?v=vr7aTSJolEk)


## Tech Stack

### Frontend
- **Next.js**: React framework for server-rendered applications
- **TailwindCSS**: Utility-first CSS framework
- **Zustand**: Data fetching and state management
- **Framer Motion**: Animation library for interactive UI

### Backend
- **Node.js**: JavaScript runtime environment
- **Express**: Web application framework
- **MongoDB**: NoSQL database for flexible data storage
- **JWT**: Authentication and authorization

### GenAI Services
- **Flask**: Python web framework for AI services
- **LangChain**: Framework for developing applications powered by language models
- **Groq API**: High-performance LLM provider
- **Gemini API**: Google's multimodal AI model
- **Qdrant**: Vector database for semantic search
- **Hugging Face**: For embedding models and transformers



## Quickstart Guide

Follow these instructions to set up and run EduVerse on a new machine.

### Prerequisites

- Node.js 18+ (for frontend and backend)
- Python 3.9+ (for GenAI services)
- Marp CLI for presentation generation
- Mermaid CLI for diagram generation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/eduverse.git
cd eduverse
```

### 2. Set Up Next.js Frontend

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev
```

The Next.js frontend will start on http://localhost:3000.

### 3. Set Up Node.js Backend

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Run development server
nodemon server.js
```

The Node.js backend will start on http://localhost:4000.

### 4. Set Up Flask GenAI Service

```bash
# Navigate to the genai directory
cd flask

# Create a virtual environment
python -m venv .venv

# Activate the virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 5. Environment Variables

Create `.env` files in each directory:

#### Frontend (.env.local)
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000/api/v1/user
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_next_public_google_client_id
```

#### Backend (.env)
```
PORT=4000
FRONTEND_URL=http://localhost:3000

MONGO_URI=your_mogo_uri

JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

FLASK_URL=http://localhost:5000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_secret
```

#### Flask Service (.env)
```
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key

QDRANT_API_KEY=your_qdrant_api_key
QDRANT_URL=your_qdrant_url

GEMINI_API_KEY=your_gemini_api_key
```


### 6. Core Features

#### LangChain-Powered RAG System

EduVerse uses LangChain to orchestrate sophisticated AI workflows:


#### Automated Quiz Generation

EduVerse uses LangChain and RAG to automatically generate quizzes from your course materials:

```bash
curl -X POST http://localhost:5000/api/generate-quiz \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "123",
    "topic": "Machine Learning Fundamentals",
    "difficulty": "medium"
  }'
```

Available difficulty levels:
- `beginner`: Basic recall and understanding questions
- `medium`: Application and analysis questions
- `advanced`: Synthesis and evaluation questions

#### Personalized Learning Roadmaps

Generate customized learning paths based on student performance and learning goals:

```bash
curl -X POST http://localhost:5000/api/generate-roadmap \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "456",
    "course_id": "123",
    "target_skill": "Data Science"
  }'
```

#### Presentation Generation

Create beautiful presentations automatically using Marp and Mermaid:

![image](https://github.com/user-attachments/assets/8f294a53-f835-4511-891e-94ab5832a372)

```bash
curl -X POST http://localhost:5000/api/generate-presentation \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "123",
    "topic": "Introduction to Python",
    "slides": 15
  }'
```

This will generate:
- A professionally formatted Markdown presentation
- Integrated diagrams and flowcharts using Mermaid
- PDF and HTML exports of the presentation

#### Assignment Grading

EduVerse's intelligent grading system provides:
- Automated grading with customizable rubrics
- Plagiarism detection
- AI-generated content identification
- Detailed feedback for students

To submit an assignment for grading:

```bash
curl -X POST http://localhost:5000/api/grade-assignment \
  -H "Content-Type: application/json" \
  -d '{
    "assignment_id": "789",
    "submission_text": "Assignment content here...",
    "rubric": "standard"
  }'
```

#### GitHub Integration

Track student progress on coding assignments by connecting to GitHub:

```bash
curl -X GET http://localhost:8000/api/github/stats \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "456",
    "repo_name": "student-project"
  }'
```

### 7. API Endpoints

#### Node.js Backend (http://localhost:4000)

- `/api/auth`: Authentication and user management
- `/api/courses`: Course management
- `/api/users`: User profile management
- `/api/github`: GitHub repository integration
- `/api/assignments`: Assignment submissions and results

#### Flask GenAI Service (http://localhost:5000)

- `/api/generate-quiz`: Generate quizzes using RAG and LangChain
- `/api/generate-roadmap`: Create personalized learning roadmaps
- `/api/generate-presentation`: Generate Marp presentations
- `/api/grade-assignment`: Grade assignments with plagiarism and AI detection
- `/api/search`: LangChain-powered semantic search across course materials
- `/api/chat`: Interactive AI tutor using conversational agents

### 8. LangChain Components

EduVerse leverages the following LangChain components:

- **Chains**: Orchestrate complex sequences of LLM operations
- **Agents**: Autonomous decision-making entities for tutoring and grading
- **Memory**: Store conversation context for personalized interactions
- **Retrievers**: Efficient document retrieval with contextual compression
- **Tools**: Specialized functions for data processing and external API calls
