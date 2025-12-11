# ThinkHire - AI-Powered Interview Platform

ThinkHire is an innovative interview platform that leverages artificial intelligence to provide comprehensive analysis of candidates' technical skills, communication abilities, and behavioral metrics during live interviews.

## Features

### 🎯 Adaptive Question Generation
- Intelligent question generation based on candidate performance
- Dynamic difficulty adjustment
- Domain-specific question targeting
- Conversation history tracking

### 🎤 Real-Time Speech Analysis
- Speech-to-text conversion
- Technical accuracy assessment
- Clarity and structure evaluation
- Depth of knowledge analysis

### 👁️ Video Behavioral Analysis
- Real-time facial feature tracking with MediaPipe
- Eye contact measurement
- Head movement analysis
- Posture evaluation
- Confidence scoring

### 📊 Comprehensive Scoring System
- Multi-dimensional performance metrics
- Detailed feedback and improvement suggestions
- Resource recommendations for skill development

## Technology Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **MongoDB** - Database for user and interview data
- **Groq API** - For LLM-powered analysis
- **Pydantic** - Data validation and serialization

### Frontend
- **React** - Component-based UI library
- **Vite** - Fast development build tool
- **MediaPipe** - Real-time facial feature detection
- **Web Speech API** - Browser-native speech recognition

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB Atlas account (or local MongoDB instance)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables in `.env`:
   ```env
   GROQ_API_KEY=your_groq_api_key
   MONGO_URI=your_mongodb_connection_string
   ```

4. Run the backend server:
   ```bash
   python -m uvicorn main:app --host 0.0.0.0 --port 8001
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/user/signup` - User registration
- `POST /api/user/login` - User authentication

### Interview Analysis
- `POST /api/analyze-text-answer` - Text answer analysis
- `POST /api/analyze-speech-answer` - Speech transcript analysis
- `POST /api/analyze-video-interview` - Video interview analysis
- `POST /api/generate-adaptive-question` - Adaptive question generation
- `POST /video-analyze` - Real-time video behavioral analysis

## Security Features
- Password hashing with SHA-256
- Backward compatibility for existing accounts
- Automatic migration of legacy password formats

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License
This project is licensed under the MIT License - see the LICENSE file for details.