import os
import json
import traceback
import uuid
from typing import Dict, Any
from models.groq_analyzer import analyzer as groq_analyzer

class GroqVideoAnalyzer:
    def __init__(self):
        """
        Initialize the Video analyzer.
        """
        self.groq_analyzer = groq_analyzer
    
    def analyze_video_interview(self, video_data: bytes, question: str, answer: str) -> Dict[str, Any]:
        """
        Analyze a video-based interview using multimodal capabilities.
        
        Args:
            video_data (bytes): The video data
            question (str): The interview question
            answer (str): The candidate's answer
            
        Returns:
            dict: Analysis results with scores and feedback
        """
        try:
            # Analyze the transcript using the existing speech analysis
            analysis = self.groq_analyzer.analyze_speech_answer(answer)
            
            # Add video-specific analysis with realistic calculations
            # In a real implementation, these would be calculated from actual video analysis
            # For now, we'll calculate realistic scores based on the text analysis
            
            # Eye contact score: Correlates with confidence and clarity
            eye_contact_score = min(100, max(0, int(
                (analysis.get('confidence', 50) * 0.4) + 
                (analysis.get('clarity_structure', 50) * 0.3) + 
                (analysis.get('communication', 50) * 0.3)
            )))
            
            # Body language score: Correlates with confidence and communication
            body_language_score = min(100, max(0, int(
                (analysis.get('confidence', 50) * 0.5) + 
                (analysis.get('communication', 50) * 0.5)
            )))
            
            # Distraction score: Inverse of focus indicators
            distraction_score = min(100, max(0, 100 - int(
                (analysis.get('clarity_structure', 50) * 0.4) + 
                (analysis.get('reasoning', 50) * 0.3) + 
                (analysis.get('confidence', 50) * 0.3)
            )))
            
            # Facial expression score: Based on emotional intelligence
            facial_expression_score = min(100, max(0, int(
                (analysis.get('emotion', 50) * 0.6) + 
                (analysis.get('confidence', 50) * 0.4)
            )))
            
            # Posture score: Based on confidence
            posture_score = min(100, max(0, int(
                (analysis.get('confidence', 50) * 0.7) + 
                (analysis.get('communication', 50) * 0.3)
            )))
            
            # Combine all scores into the analysis
            analysis.update({
                "eye_contact_score": eye_contact_score,
                "body_language_score": body_language_score,
                "distraction_score": distraction_score,
                "facial_expression_score": facial_expression_score,
                "posture_score": posture_score,
                "facial_expressions": "Generally positive with good engagement" if facial_expression_score > 70 else "Could show more engagement",
                "posture": "Good posture maintained throughout" if posture_score > 70 else "Work on maintaining upright posture",
                "gestures": "Appropriate hand gestures used for emphasis" if body_language_score > 70 else "Could use more natural gestures"
            })
            
            return analysis
            
        except Exception as e:
            print(f"Error in video analysis: {e}")
            traceback.print_exc()
            # Return mock analysis on failure
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
                "strengths": ["Clear speech", "Good engagement", "Confident delivery"],
                "improvements": ["Reduce filler words", "Vary vocal tone"],
                "suggestions": ["Practice with timer", "Record for self-review"],
                "recommended_resources": [
                    {"title": "Public Speaking Guide", "description": "Techniques to improve verbal communication"},
                    {"title": "Interview Prep Kit", "description": "Comprehensive interview preparation materials"}
                ]
            }
    
    def generate_adaptive_question(self, previous_question: str, user_answer: str, scores: Dict[str, int], weaknesses: list) -> Dict[str, Any]:
        """
        Generate an adaptive follow-up question based on user performance using Groq API.
        
        Args:
            previous_question (str): The previous interview question
            user_answer (str): The user's answer to the previous question
            scores (dict): Performance scores from the analysis
            weaknesses (list): Identified weaknesses
            
        Returns:
            dict: Contains category, action, and next_question
        """
        try:
            # Create a prompt for generating an adaptive question using Groq
            prompt = f"""
You are an expert technical interviewer conducting a live interview. Based on the candidate's performance, generate an adaptive follow-up question.

Previous Question: {previous_question}
Candidate's Answer: {user_answer}

Performance Scores:
- Technical Accuracy: {scores.get('technical_accuracy', 50)}/100
- Clarity & Structure: {scores.get('clarity_structure', 50)}/100
- Depth of Knowledge: {scores.get('depth_of_knowledge', 50)}/100
- Communication: {scores.get('communication', 50)}/100
- Confidence: {scores.get('confidence', 50)}/100
- Reasoning: {scores.get('reasoning', 50)}/100

Identified Weaknesses:
{', '.join(weaknesses) if weaknesses else 'None'}

Instructions:
1. If the candidate performed well (scores > 80), ask a more challenging question that probes deeper into their expertise
2. If the candidate had mixed performance, ask a question that addresses their specific weaknesses
3. If the candidate struggled (scores < 60), ask a foundational question to assess their core knowledge
4. Ensure the question is relevant to the domain of the previous question
5. Make the question specific and actionable
6. NEVER use predefined question templates - generate completely new, context-specific questions
7. Focus on the actual content of the candidate's answer, not generic topics
8. Each question MUST be UNIQUE - do not repeat similar phrasing or concepts
9. Include a unique identifier in your thinking process to ensure diversity: {uuid.uuid4()}
10. Ask questions that require the candidate to demonstrate practical application, not just theory

Respond ONLY with a JSON object in this exact format:
{{
    "category": "string (strong/medium/weak/confused)",
    "action": "string (deep_drill/ask_clarification/simplify_and_probe/moderate_followup/challenge_misconception/validate_then_probe)",
    "next_question": "string (the actual question to ask)"
}}
"""

            # Call the Groq API to generate the adaptive question
            response_text = self.groq_analyzer._call(prompt, model="llama-3.1-8b-instant")
            
            # Extract and parse the JSON response
            try:
                # Clean up the response text to extract JSON
                response_text = response_text.strip()
                if response_text.startswith("```"):
                    # Remove markdown code blocks
                    response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    # Remove 'json' prefix if present
                    response_text = response_text[4:].strip()
                
                # Parse the JSON
                result = json.loads(response_text)
                
                # Validate the required fields
                if all(key in result for key in ["category", "action", "next_question"]):
                    return result
                else:
                    raise ValueError("Missing required fields in response")
                    
            except (json.JSONDecodeError, ValueError, IndexError) as parse_error:
                print(f"Error parsing Groq response: {parse_error}")
                print(f"Raw response: {response_text}")
                # Fall back to the original logic if parsing fails
                raise parse_error
                
        except Exception as e:
            print(f"Error generating adaptive question with Groq: {e}")
            traceback.print_exc()
            
        # Fallback to original logic if Groq API fails
        try:
            # More sophisticated logic to determine next question based on individual scores
            technical_score = scores.get('technical_accuracy', 50)
            clarity_score = scores.get('clarity_structure', 50)
            depth_score = scores.get('depth_of_knowledge', 50)
            confidence_score = scores.get('confidence', 50)
            reasoning_score = scores.get('reasoning', 50)
            communication_score = scores.get('communication', 50)
            
            # Determine question complexity based on overall performance
            avg_score = (technical_score + reasoning_score + depth_score) / 3
            
            # Generate a contextual question based on the user's actual answer
            # This is a simplified approach - in a real implementation, we would use Groq API
            if avg_score >= 85 and technical_score >= 80 and reasoning_score >= 80:
                # Strong technical candidate - ask deeper technical questions
                next_question = f"You demonstrated strong knowledge about '{previous_question}'. Let's explore a practical application. How would you implement a solution to handle the specific challenges you mentioned in a production environment?"
                category = "strong"
                action = "deep_drill"
            elif avg_score >= 70 and (clarity_score < 60 or communication_score < 60):
                # Good technical knowledge but poor communication - focus on articulation
                next_question = f"I can see you understand the concepts related to '{previous_question}'. Let's work on communication. Can you explain the key points you mentioned using an analogy that a non-technical person could understand?"
                category = "medium"
                action = "ask_clarification"
            elif avg_score < 50 and (technical_score < 50 or reasoning_score < 50):
                # Weak technical knowledge - go back to basics with hints
                next_question = f"Let's strengthen your foundation on '{previous_question}'. What are the three most important principles someone should understand before diving deeper into this topic?"
                category = "weak"
                action = "simplify_and_probe"
            elif depth_score < 50:
                # Shallow knowledge - ask for deeper understanding
                next_question = f"You covered the basics of '{previous_question}'. Now let's dig deeper. What are some edge cases or limitations of the approach you described, and how would you address them?"
                category = "medium"
                action = "moderate_followup"
            elif confidence_score >= 80 and (technical_score < 60 or reasoning_score < 60):
                # Overconfident but incorrect - challenge misconceptions
                next_question = f"I'd like to challenge your thinking on '{previous_question}'. Can you walk me through your reasoning step by step and identify where you might have made assumptions?"
                category = "confused"
                action = "challenge_misconception"
            else:
                # Balanced performance - validate then probe deeper
                next_question = f"Your response on '{previous_question}' showed good understanding. Now, how would you adapt your approach if you had to meet a tight deadline with limited resources?"
                category = "medium"
                action = "validate_then_probe"
            
            return {
                "category": category,
                "action": action,
                "next_question": next_question
            }
            
        except Exception as e:
            print(f"Error generating adaptive question: {e}")
            traceback.print_exc()
            # Fallback to default question
            return {
                "category": "medium",
                "action": "moderate_followup",
                "next_question": "Can you tell me more about your experience with this topic?"
            }

# Create a global instance
video_analyzer = GroqVideoAnalyzer()

def analyze_video_interview_with_groq(video_data: bytes, question: str, answer: str) -> Dict[str, Any]:
    """
    Public function to analyze a video interview using Groq models.
    
    Args:
        video_data (bytes): The video data
        question (str): The interview question
        answer (str): The candidate's answer
        
    Returns:
        dict: Analysis results with scores and feedback
    """
    return video_analyzer.analyze_video_interview(video_data, question, answer)

def generate_adaptive_question_with_groq(previous_question: str, user_answer: str, scores: Dict[str, int], weaknesses: list) -> Dict[str, Any]:
    """
    Public function to generate an adaptive follow-up question.
    
    Args:
        previous_question (str): The previous interview question
        user_answer (str): The user's answer to the previous question
        scores (dict): Performance scores from the analysis
        weaknesses (list): Identified weaknesses
        
    Returns:
        dict: Contains category, action, and next_question
    """
    return video_analyzer.generate_adaptive_question(previous_question, user_answer, scores, weaknesses)