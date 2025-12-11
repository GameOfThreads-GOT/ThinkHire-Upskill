# ThinkHire Backend API

This is the backend API for the ThinkHire application, built with FastAPI. It integrates with the ML models to analyze interview answers.

## Features

- Text answer analysis
- Speech transcript analysis
- Video interview analysis
- Adaptive question generation
- Group discussion analysis

## API Endpoints

- `POST /api/analyze-text-answer` - Analyze a text-based interview answer
- `POST /api/analyze-speech-answer` - Analyze a speech transcript
- `POST /api/analyze-video-interview` - Analyze a video interview
- `POST /api/generate-adaptive-question` - Generate an adaptive follow-up question
- `POST /api/analyze-gd` - Analyze a group discussion response
- `GET /health` - Health check endpoint

## ML Model Integration

The backend integrates with the ML models through the `models/groq_analyzer.py` module. This module provides functions to analyze text answers, speech transcripts, and video interviews using the Groq API.

## Environment Variables

- `GROQ_API_KEY` - Your Groq API key
- `BACKEND_HOST` - Host for the backend server (default: 0.0.0.0)
- `BACKEND_PORT` - Port for the backend server (default: 8001)
- `FRONTEND_URL` - URL of the frontend application (for CORS)