from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import traceback
import base64
import hashlib
from functools import lru_cache

# Import routes
from routes.user_routes import router as user_router

# Import analyzer modules
try:
    from models.groq_analyzer import (
        analyze_text_answer_with_groq,
        analyze_speech_answer_with_groq
    )
    from models.groq_video_analyzer import (
        analyze_video_interview_with_groq,
        generate_adaptive_question_with_groq
    )
    from models.advanced_video_analyzer import analyze_video_interview_advanced
    MODEL_IMPORT_SUCCESS = True
except ImportError as e:
    print(f"Warning: Could not import ML models: {e}")
    MODEL_IMPORT_SUCCESS = False

app = FastAPI()

# Include routes
app.include_router(user_router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class AnswerAnalysisRequest(BaseModel):
    question: str
    answer: str
    domain: str

class SpeechAnalysisRequest(BaseModel):
    transcript: str

class GDAnalysisRequest(BaseModel):
    topic: str
    answer: str
    timeTaken: Optional[int] = None

class VideoAnalysisRequest(BaseModel):
    video_data: str  # Base64 encoded video data
    question: str
    answer: str

class AdaptiveQuestionRequest(BaseModel):
    previous_question: str
    user_answer: str
    scores: dict
    weaknesses: list

class AdaptiveQuestionResponse(BaseModel):
    category: str
    action: str
    next_question: str

class TextAnalysisResponse(BaseModel):
    technical_accuracy: int
    clarity_structure: int
    depth_of_knowledge: int
    communication: int
    confidence: int
    reasoning: int
    emotion: int
    strengths: List[str]
    improvements: List[str]
    suggestions: List[str]
    recommended_resources: List[dict]

class VideoAnalysisResponse(TextAnalysisResponse):
    eye_contact_score: int
    body_language_score: int
    distraction_score: int
    facial_expression_score: int
    posture_score: int
    facial_expressions: str
    posture: str
    gestures: str
    eye_contact: str

class NextQuestionRequest(BaseModel):
    domain: str
    history: List[dict]

class MockNextQuestionRequest(BaseModel):
    performance: dict

# Video window model for feature capture
class VideoWindow(BaseModel):
    window_start: int
    window_end: int
    fps: int
    features: dict

@app.post("/video-analyze")
async def video_analyze(payload: VideoWindow):
    """
    Analyze video features from the frontend feature capture library.
    Accepts numerical feature windows and returns JSON scores.
    """
    try:
        features = payload.features or {}
        start = payload.window_start
        end = payload.window_end

        # Simple local heuristics (demo). Use LLM if GROQ_KEY present.
        head_disp = features.get("head_disp", [])
        bbox_w = features.get("bbox_width", [])
        avg_iris = features.get("avg_iris_x", [])
        blink_rate = features.get("blink_rate", 0.0)

        def mean(x):
            return sum(x) / len(x) if x else 0.0

        hv = (sum((v - mean(head_disp)) ** 2 for v in head_disp) / len(head_disp)) if head_disp else 0.0
        pv = (sum((v - mean(bbox_w)) ** 2 for v in bbox_w) / len(bbox_w)) if bbox_w else 0.0
        iris_center_dev = abs(mean(avg_iris) - 0.5) if avg_iris else 0.5

        # heuristics -> 0..100
        eye_score = max(0, round(100 - iris_center_dev * 200))
        head_score = max(0, round(100 - hv * 3000))
        posture_score = max(0, round(100 - pv * 1000))
        # combine
        conf_score = max(0, round((eye_score * 0.4 + head_score * 0.35 + posture_score * 0.25) - blink_rate * 10))

        result = {
            "window_start": start,
            "window_end": end,
            "eye_contact_score": int(eye_score),
            "head_stability_score": int(head_score),
            "posture_score": int(posture_score),
            "confidence_score": int(conf_score),
            "notes": "Heuristic scores calculated from facial features"
        }

        # if GROQ_KEY present, call LLM to interpret the numeric window for more humanlike explanations
        if MODEL_IMPORT_SUCCESS:
            prompt = f"""
You receive numeric sequences measured between {start} and {end} ms:

head_disp: {head_disp}
bbox_width: {bbox_w}
avg_iris_x: {avg_iris}
blink_rate: {blink_rate}

Interpret the window and return ONLY this JSON:
{{"window_start": {start}, "window_end": {end}, "eye_contact_score": 0, "head_stability_score": 0, "posture_score": 0, "confidence_score": 0, "notes": ""}}
Consider eye contact high when avg_iris_x close to 0.5 with low jitter; head stability penalize large changes; posture uses bbox width stability.
"""

            try:
                # Import the analyzer properly
                from models.groq_analyzer import analyzer
                response_text = analyzer._call(prompt)
                parsed = analyzer._strict_json_extract(response_text)
                if parsed:
                    return parsed
            except Exception as e:
                print("video LLM error", e)
                # fall back to heuristic result

        return result
    except Exception as e:
        print("video analysis error", e)
        raise HTTPException(status_code=500, detail=f"Video analysis failed: {str(e)}")

@app.get("/")
async def root():
    return {"message": "ThinkHire API is running"}

@app.post("/api/analyze-text-answer", response_model=TextAnalysisResponse)
async def analyze_text_answer(request: AnswerAnalysisRequest):
    """
    Analyze an interview answer using ML models.
    """
    if not MODEL_IMPORT_SUCCESS:
        raise HTTPException(status_code=500, detail="ML models not available. Please check backend configuration.")
    
    try:
        # Call your ML models to analyze the answer
        analysis_result = analyze_text_answer_with_groq(
            request.question, 
            request.answer, 
            request.domain
        )
        return analysis_result
    except Exception as e:
        error_details = f"Analysis failed: {str(e)}"
        print(f"Error in text analysis: {error_details}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_details)

@app.post("/api/analyze-speech-answer", response_model=TextAnalysisResponse)
async def analyze_speech_answer(request: SpeechAnalysisRequest):
    """
    Analyze a speech transcript using ML models.
    """
    if not MODEL_IMPORT_SUCCESS:
        raise HTTPException(status_code=500, detail="ML models not available. Please check backend configuration.")
    
    # Handle empty transcripts
    if not request.transcript or len(request.transcript.strip()) < 5:
        return {
            "technical_accuracy": 30,
            "clarity_structure": 25,
            "depth_of_knowledge": 20,
            "communication": 30,
            "confidence": 25,
            "reasoning": 30,
            "emotion": 25,
            "strengths": ["Response recorded"],
            "improvements": ["Provide a more substantial answer", "Include specific examples"],
            "suggestions": ["Take more time to formulate your response", "Practice explaining concepts clearly"],
            "recommended_resources": [
                {"title": "Communication Skills Guide", "description": "Techniques to improve verbal communication"},
                {"title": "Interview Speaking Tips", "description": "Tips for clear and confident speaking"}
            ]
        }
    
    try:
        analysis_result = analyze_speech_answer_with_groq(request.transcript)
        return analysis_result
    except Exception as e:
        error_details = f"Speech analysis failed: {str(e)}"
        print(f"Error in speech analysis: {error_details}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_details)

@app.post("/api/analyze-video-interview", response_model=VideoAnalysisResponse)
async def analyze_video_interview(request: VideoAnalysisRequest):
    """
    Analyze a video interview using advanced multimodal ML models.
    """
    if not MODEL_IMPORT_SUCCESS:
        # Return mock analysis when models are not available
        return {
            "technical_accuracy": 85,
            "clarity_structure": 80,
            "depth_of_knowledge": 75,
            "communication": 90,
            "confidence": 80,
            "reasoning": 85,
            "emotion": 75,
            "eye_contact_score": 85,
            "body_language_score": 78,
            "distraction_score": 15,
            "facial_expression_score": 82,
            "posture_score": 88,
            "facial_expressions": "Generally positive with good engagement",
            "posture": "Good posture maintained throughout",
            "gestures": "Appropriate hand gestures used for emphasis",
            "eye_contact": "Maintained good eye contact throughout",
            "strengths": ["Clear speech", "Good engagement", "Confident delivery"],
            "improvements": ["Reduce filler words", "Vary vocal tone"],
            "suggestions": ["Practice with timer", "Record for self-review"],
            "recommended_resources": [
                {"title": "Public Speaking Guide", "description": "Techniques to improve verbal communication"},
                {"title": "Interview Prep Kit", "description": "Comprehensive interview preparation materials"}
            ]
        }
    
    try:
        # Decode base64 video data
        import base64
        video_bytes = base64.b64decode(request.video_data)
        
        # Use the advanced video analyzer that uses real STT data
        analysis_result = analyze_video_interview_advanced(
            video_bytes,
            request.question,
            request.answer
        )
        return analysis_result
    except Exception as e:
        error_details = f"Video analysis failed: {str(e)}"
        print(f"Error in video analysis: {error_details}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_details)

@app.post("/api/generate-adaptive-question", response_model=AdaptiveQuestionResponse)
async def generate_adaptive_question(request: AdaptiveQuestionRequest):
    """
    Generate an adaptive follow-up question based on user performance.
    """
    if not MODEL_IMPORT_SUCCESS:
        # Return mock adaptive question when models are not available
        return {
            "category": "medium",
            "action": "moderate_followup",
            "next_question": "Can you tell me more about your experience with this topic?"
        }
    
    try:
        # Call your ML models to generate adaptive question
        adaptive_result = generate_adaptive_question_with_groq(
            request.previous_question,
            request.user_answer,
            request.scores,
            request.weaknesses
        )
        return adaptive_result
    except Exception as e:
        error_details = f"Adaptive question generation failed: {str(e)}"
        print(f"Error in adaptive question generation: {error_details}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_details)

@app.post("/api/analyze-gd", response_model=TextAnalysisResponse)
async def analyze_gd(request: GDAnalysisRequest):
    """
    Analyze a group discussion response using ML models.
    """
    if not MODEL_IMPORT_SUCCESS:
        # Return mock analysis when models are not available
        return {
            "technical_accuracy": 80,
            "clarity_structure": 75,
            "depth_of_knowledge": 70,
            "communication": 85,
            "confidence": 75,
            "reasoning": 80,
            "emotion": 65,
            "strengths": ["Good participation", "Relevant contributions"],
            "improvements": ["More structured responses", "Better listening"],
            "suggestions": ["Practice active listening", "Prepare key points"],
            "recommended_resources": [
                {"title": "Group Discussion Guide", "description": "Techniques for effective group discussions"},
                {"title": "Leadership Skills", "description": "Developing leadership in team settings"}
            ]
        }
    
    try:
        # For now, we'll return mock analysis for GD
        # In a real implementation, this would call actual GD analysis models
        return {
            "technical_accuracy": 80,
            "clarity_structure": 75,
            "depth_of_knowledge": 70,
            "communication": 85,
            "confidence": 75,
            "reasoning": 80,
            "emotion": 65,
            "strengths": ["Good participation", "Relevant contributions"],
            "improvements": ["More structured responses", "Better listening"],
            "suggestions": ["Practice active listening", "Prepare key points"],
            "recommended_resources": [
                {"title": "Group Discussion Guide", "description": "Techniques for effective group discussions"},
                {"title": "Leadership Skills", "description": "Developing leadership in team settings"}
            ]
        }
    except Exception as e:
        error_details = f"GD analysis failed: {str(e)}"
        print(f"Error in GD analysis: {error_details}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_details)

@app.post("/api/next-question")
async def next_question(request: NextQuestionRequest):
    """
    Generate the next question based on user performance and history.
    """
    try:
        # For now, we'll return a mock next question
        # In a real implementation, this would call actual ML models
        return {
            "next_question": "Can you tell me more about your experience with this topic?",
            "reason": "Using mock implementation"
        }
    except Exception as e:
        error_details = f"Next question generation failed: {str(e)}"
        print(f"Error in next question generation: {error_details}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_details)

@app.post("/api/mock-next-question")
async def mock_next_question(request: MockNextQuestionRequest):
    """
    Mock endpoint to generate the next question based on performance.
    This is a temporary endpoint for testing purposes.
    """
    try:
        # For now, we'll return a mock next question
        # In a real implementation, this would call actual ML models
        return {
            "next_question": "Can you tell me more about your experience with this topic?",
            "reason": "Testing mock endpoint"
        }
    except Exception as e:
        error_details = f"Mock next question generation failed: {str(e)}"
        print(f"Error in mock next question generation: {error_details}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_details)

# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Health check endpoint to verify the API is running and models are available.
    """
    return {"status": "healthy", "models_available": MODEL_IMPORT_SUCCESS}

if __name__ == "__main__":
    import uvicorn
    # Run the server on all interfaces to allow LAN access
    uvicorn.run(app, host="0.0.0.0", port=8001)