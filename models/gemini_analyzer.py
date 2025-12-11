"""
Gemini Model Analyzer for ThinkHire
This module integrates with the Gemini models in the geminiModels folder.
"""

import os
import json
import traceback
from typing import Dict, Any
import google.generativeai as genai
from google.api_core import exceptions
from functools import lru_cache
import time

class GeminiAnalyzer:
    def __init__(self):
        """
        Initialize the Gemini analyzer with API key from environment.
        """
        try:
            # Get API key from environment variable
            api_key = os.getenv("GEMINI_API_KEY", "AIzaSyDiPhnQTFir5W8GVY9tApLA_8pI68UagOk")
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel("gemini-2.5-pro")
            # Add request tracking
            self.last_request_time = 0
            self.request_count = 0
            self.max_requests_per_minute = 10  # Limit requests to prevent quota exhaustion
        except Exception as e:
            print(f"Warning: Failed to initialize Gemini: {e}")
            self.model = None
    
    def _rate_limit(self):
        """Implement basic rate limiting to prevent quota exhaustion"""
        current_time = time.time()
        # Ensure at least 6 seconds between requests (10 requests per minute max)
        time_since_last = current_time - self.last_request_time
        if time_since_last < 6:
            sleep_time = 6 - time_since_last
            print(f"Rate limiting: sleeping for {sleep_time:.2f} seconds")
            time.sleep(sleep_time)
        self.last_request_time = time.time()
        self.request_count += 1
    
    def analyze_text_answer(self, question: str, answer: str, domain: str) -> dict:
        """
        Analyze a text-based interview answer using Gemini models with comprehensive metrics.
        
        Args:
            question (str): The interview question
            answer (str): The candidate's answer
            domain (str): The domain/role (e.g., 'ml', 'ds', 'se')
            
        Returns:
            dict: Analysis results with scores and feedback
        """
        if not self.model:
            return self._mock_analysis(question, answer, domain)
        
        try:
            # Apply rate limiting
            self._rate_limit()
            
            # Create comprehensive prompt for detailed analysis
            prompt = self._create_detailed_analysis_prompt(question, answer, domain)
            
            # Generate response from Gemini
            response = self.model.generate_content(prompt)
            
            # Parse the response
            analysis = self._parse_gemini_response(response.text)
            
            return analysis
        except exceptions.ResourceExhausted as e:
            print(f"Gemini API quota exceeded: {e}")
            # Return mock analysis when quota is exceeded
            return self._mock_analysis(question, answer, domain)
        except Exception as e:
            print(f"Error in Gemini text analysis: {e}")
            # Fallback to simpler model if the detailed one fails
            try:
                return self._analyze_with_simple_model(answer)
            except:
                return self._mock_analysis(question, answer, domain)
    
    def analyze_speech_answer(self, transcript: str) -> dict:
        """
        Analyze a speech transcript using Gemini models with comprehensive metrics.
        
        Args:
            transcript (str): The speech transcript to analyze
            
        Returns:
            dict: Analysis results with scores and feedback
        """
        if not self.model:
            return self._mock_speech_analysis(transcript)
        
        try:
            # Create comprehensive prompt for speech analysis
            prompt = self._create_speech_analysis_prompt(transcript)
            
            # Generate response from Gemini
            response = self.model.generate_content(prompt)
            
            # Parse the response
            raw = response.text.strip()
            start = raw.find("{"); end = raw.rfind("}")
            result = json.loads(raw[start:end+1])
            
            # Convert to our format
            return {
                "technical_accuracy": int(result["llm_score"] * 10),  # Convert 1-10 to 0-100
                "clarity_structure": int(result["clarity_score"] * 10),
                "depth_of_knowledge": int(result["llm_score"] * 10),  # Use llm_score as proxy
                "communication": int(result["clarity_score"] * 10),
                "confidence": int(result["coherence_score"] * 10),
                "reasoning": int(result["coherence_score"] * 10),
                "emotion": 70,  # Default value
                "strengths": ["Good response structure" if result["llm_score"] > 7 else "Clear communication"],
                "improvements": ["Could provide more details" if result["llm_score"] < 8 else "Add more examples"],
                "suggestions": ["Expand on key points", "Provide specific examples"],
                "recommended_resources": [
                    {"title": "Domain-Specific Guide", "description": "Specialized resources for your field"},
                    {"title": "Interview Preparation Kit", "description": "Comprehensive interview preparation materials"}
                ]
            }
        except exceptions.ResourceExhausted as e:
            print(f"Gemini API quota exceeded: {e}")
            # Return mock analysis when quota is exceeded
            return self._mock_speech_analysis(transcript)
        except Exception as e:
            print(f"Error in Gemini speech analysis: {e}")
            # Fallback to mock analysis
            return self._mock_speech_analysis(transcript)
    
    def _create_detailed_analysis_prompt(self, question: str, answer: str, domain: str) -> str:
        """
        Create a detailed prompt for comprehensive answer analysis.
        """
        domain_guidance = {
            'ml': "Focus on machine learning concepts, algorithms, model evaluation, and practical implementation.",
            'ds': "Focus on statistical analysis, data interpretation, visualization, and data-driven decision making.",
            'se': "Focus on software design principles, coding practices, system architecture, and problem-solving approaches.",
            'fin': "Focus on financial concepts, valuation methods, market analysis, and risk assessment.",
            'pm': "Focus on product strategy, user research, prioritization frameworks, and cross-functional collaboration.",
            'ux': "Focus on user-centered design, usability principles, research methods, and interface design.",
            'hr': "Focus on people management, organizational behavior, recruitment practices, and employee development.",
            'sales': "Focus on sales strategies, customer relationship management, negotiation techniques, and revenue generation."
        }
        
        guidance = domain_guidance.get(domain, "Provide a balanced evaluation appropriate for the question and answer.")
        
        # Check for clearly irrelevant or minimal answers
        if len(answer.strip()) < 10 or answer.strip().lower() in ['hindi', 'english', 'french', 'spanish']:
            return f"""
            You are an expert {domain.upper() if domain else 'Professional'} interviewer evaluating a candidate's response.
            
            Question: {question}
            Candidate's Answer: {answer}
            
            This answer is clearly irrelevant or insufficient to evaluate properly. The candidate has provided minimal information that does not demonstrate any meaningful knowledge or skills.
            
            Please provide a strict evaluation with very low scores and appropriate feedback:
            
            {{
                "technical_accuracy": 0,
                "clarity_structure": 20,
                "depth_of_knowledge": 0,
                "communication": 30,
                "confidence": 10,
                "reasoning": 0,
                "emotion": 40,
                "strengths": ["Provided a direct answer"],
                "improvements": ["Need to provide detailed explanations", "Should elaborate on relevant experiences", "Must demonstrate deeper understanding of the topic"],
                "suggestions": ["Structure responses with clear explanations", "Provide specific examples and context", "Showcase relevant skills and knowledge"],
                "recommended_resources": [
                    {{"title": "Interview Response Structuring", "description": "Learn how to structure comprehensive interview answers"}},
                    {{"title": "Domain-Specific Knowledge", "description": "Study fundamental concepts in your field"}}
                ]
            }}
            
            Respond ONLY with the JSON object, no other text.
            """
        
        prompt = f"""
        You are an expert {domain.upper() if domain else 'Professional'} interviewer evaluating a candidate's response.
        
        Question: {question}
        Candidate's Answer: {answer}
        
        {guidance}
        
        Please analyze this response and provide a detailed evaluation with the following metrics:
        1. Technical Accuracy (0-100): How technically correct and accurate is the response?
        2. Clarity & Structure (0-100): How clear, organized, and well-structured is the response?
        3. Depth of Knowledge (0-100): How deep and comprehensive is the knowledge demonstrated?
        4. Communication (0-100): How effective is the communication style and language used?
        5. Confidence (0-100): How confident and assertive is the tone without being arrogant?
        6. Reasoning (0-100): How logical and well-reasoned is the thought process?
        7. Emotional Intelligence (0-100): How appropriate is the emotional tone and empathy shown?
        
        Also provide:
        - 3 key strengths of the response
        - 3 areas for improvement
        - 3 specific suggestions for better answers
        - 2 relevant learning resources for this domain
        
        Format your response as JSON with this exact structure:
        {{
            "technical_accuracy": <number>,
            "clarity_structure": <number>,
            "depth_of_knowledge": <number>,
            "communication": <number>,
            "confidence": <number>,
            "reasoning": <number>,
            "emotion": <number>,
            "strengths": ["strength1", "strength2", "strength3"],
            "improvements": ["improvement1", "improvement2", "improvement3"],
            "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
            "recommended_resources": [
                {{"title": "Resource 1", "description": "Description 1"}},
                {{"title": "Resource 2", "description": "Description 2"}}
            ]
        }}
        
        Be strict but fair in your evaluation. Scores should reflect genuine performance:
        90-100: Exceptional quality - Rarely achieved, only for truly outstanding responses
        80-89: Strong quality - Well above average, demonstrates expertise
        70-79: Good quality - Solid performance, minor improvements needed
        60-69: Satisfactory quality - Meets basic requirements but lacks depth
        50-59: Below average - Significant gaps in knowledge or presentation
        40-49: Poor quality - Fundamental weaknesses evident
        30-39: Very poor quality - Minimal understanding shown
        0-29: Extremely poor quality - Irrelevant or nonsensical response
        
        Be more stringent in your scoring. A score of 80+ should be rare and only given for truly exceptional responses.
        Look for specific examples, concrete details, and deep understanding of the subject matter.
        Generic or vague responses should score in the 50-60 range at best.
        
        Respond ONLY with the JSON object, no other text.
        """
        
        return prompt
    
    def _create_speech_analysis_prompt(self, transcript: str) -> str:
        """
        Create a detailed prompt for speech transcript analysis.
        """
        # Check for clearly irrelevant or minimal transcripts
        if len(transcript.strip()) < 10 or transcript.strip().lower() in ['hindi', 'english', 'french', 'spanish']:
            return f"""
            You are a fair and moderately strict interview evaluator. You will score the candidate's answer based on its quality, clarity, and coherence.

            Definitions:
            - llm_score: Overall answer quality (structure, depth, relevance, professionalism).
            - clarity_score: How clearly the answer is communicated (easy to follow, understandable).
            - coherence_score: How logically the ideas flow from one to another.

            The candidate's answer is clearly irrelevant or insufficient to evaluate properly. They have provided minimal information that does not demonstrate any meaningful knowledge or skills.

            Please provide a strict evaluation with very low scores:
            
            {{
              "llm_score": 1,
              "clarity_score": 3,
              "coherence_score": 2,
              "comments": "The response is too brief and lacks substance to evaluate properly. Need to provide detailed explanations with relevant examples."
            }}

            Return ONLY this JSON, no other text.
            """
        
        # Use the scoring prompt from your multimodal model (from Multimodal_Gemini_Interview_Analyzer.ipynb)
        prompt = f"""
        You are a fair and moderately strict interview evaluator. You will score the candidate's answer based on its quality, clarity, and coherence.

        Definitions:
        - llm_score: Overall answer quality (structure, depth, relevance, professionalism).
        - clarity_score: How clearly the answer is communicated (easy to follow, understandable).
        - coherence_score: How logically the ideas flow from one to another.

        SCORING SCALE (1–10):
        1–3  = weak
        4–5  = below average
        6–7  = acceptable / decent
        8–9  = strong
        10   = outstanding (rare - only for truly exceptional responses)
        
        Be much more stringent in your evaluation. 
        Scores of 8-10 should be rare and only given when the response demonstrates:
        - Specific examples with concrete details
        - Deep understanding of the subject matter
        - Clear, logical structure and flow
        - Professional language and communication
        
        Generic, vague, or surface-level responses should score in the 4-6 range.
        Only give a score above 7 if the response includes specific examples and demonstrates genuine expertise.
        
        Be fair but do NOT give 9–10 unless the answer is genuinely exceptional.

        Return ONLY this JSON:
        {{
          "llm_score": <1-10>,
          "clarity_score": <1-10>,
          "coherence_score": <1-10>,
          "comments": "short, neutral feedback on strengths and weaknesses"
        }}
        
        CANDIDATE ANSWER:
        {transcript}
        """
        
        return prompt
    
    def _analyze_with_simple_model(self, answer: str) -> dict:
        """
        Fallback analysis using the simpler scoring model from your existing code.
        """
        # Check for clearly irrelevant or minimal answers even in fallback
        if len(answer.strip()) < 10 or answer.strip().lower() in ['hindi', 'english', 'french', 'spanish']:
            return {
                "technical_accuracy": 0,
                "clarity_structure": 20,
                "depth_of_knowledge": 0,
                "communication": 30,
                "confidence": 10,
                "reasoning": 0,
                "emotion": 40,
                "strengths": ["Provided a direct answer"],
                "improvements": ["Need to provide detailed explanations", "Should elaborate on relevant experiences", "Must demonstrate deeper understanding of the topic"],
                "suggestions": ["Structure responses with clear explanations", "Provide specific examples and context", "Showcase relevant skills and knowledge"],
                "recommended_resources": [
                    {"title": "Interview Response Structuring", "description": "Learn how to structure comprehensive interview answers"},
                    {"title": "Domain-Specific Knowledge", "description": "Study fundamental concepts in your field"}
                ]
            }
        
        if not self.model_latest:
            raise Exception("No model available")
        
        # Use the scoring prompt from your existing model (from GeminiMainModel.ipynb)
        SCORING_PROMPT = """
        You are an interview evaluator. Your task is to score a candidate's answer based on the provided guidelines.
        Be professional, moderately strict, but not harsh. Your assessment should be fair and balanced. Avoid giving extremely high (10/10) or extremely low (1/10) scores unless the justification is overwhelmingly clear.

        Evaluate the following candidate text on three distinct dimensions:

        1. llm_score (1–10)
            - Overall quality and substance of the answer.
            - How well the primary idea or argument is explained and supported.
            - Completeness, depth, and relevance to the likely prompt (e.g., a behavioral question).
            - Dont be too harsh on answer

        2. clarity_score (1–10)
            - The effectiveness and clearness of the candidate's communication.
            - Quality of sentence structure, grammar, and overall readability.
            - Are the ideas and narrative flow understandable without confusion or ambiguity?
            - Minor structural or grammatical issues should reduce the score slightly, not heavily.

        3. coherence_score (1–10)
            - The logical connection and flow from one sentence or idea to the next.
            - Do the narrative segments or points connect naturally and smoothly?
            - Small jumps in topic or mild drift should reduce the score a little, not severely.

        SCORING GUIDELINES (STRICT):
        1–3 = weak (Significantly fails to meet requirements)
        4–5 = below average (Meets some requirements but is largely superficial or flawed)
        6–7 = acceptable / decent (Solid, meets most requirements; good but not exceptional)
        8–9 = strong (Clearly exceeds expectations; well-structured and insightful)
        10 = excellent (Virtually flawless and deeply insightful; extremely rare)
        
        Be much more stringent in your evaluation.
        Scores of 8-10 should be rare and only given when the response demonstrates:
        - Specific examples with concrete details
        - Deep understanding of the subject matter
        - Clear, logical structure and flow
        - Professional language and communication
        
        Generic, vague, or surface-level responses should score in the 4-6 range.
        Only give a score above 7 if the response includes specific examples and demonstrates genuine expertise.
        
        Return ONLY this JSON object. The "comments" field should contain short, neutral feedback summarizing the main points of the evaluation.

        {
          "llm_score": <1-10>,
          "clarity_score": <1-10>,
          "coherence_score": <1-10>,
          "comments": "short neutral feedback"
        }


        """
        
        prompt = SCORING_PROMPT + "\n\nTEXT:\n\"\"\"\n" + answer + "\n\"\"\"\n"
        response = self.model_latest.generate_content(prompt)
        raw = response.text.strip()
        start = raw.find("{"); end = raw.rfind("}")
        result = json.loads(raw[start:end+1])
        
        # Convert to our format
        return {
            "technical_accuracy": int(result["llm_score"] * 10),  # Convert 1-10 to 0-100
            "clarity_structure": int(result["clarity_score"] * 10),
            "depth_of_knowledge": int(result["llm_score"] * 10),  # Use llm_score as proxy
            "communication": int(result["clarity_score"] * 10),
            "confidence": int(result["coherence_score"] * 10),
            "reasoning": int(result["coherence_score"] * 10),
            "emotion": 70,  # Default value
            "strengths": ["Good response structure" if result["llm_score"] > 7 else "Clear communication"],
            "improvements": ["Could provide more details" if result["llm_score"] < 8 else "Add more examples"],
            "suggestions": ["Expand on key points", "Provide specific examples"],
            "recommended_resources": [
                {"title": "Domain-Specific Guide", "description": "Specialized resources for your field"},
                {"title": "Interview Preparation Kit", "description": "Comprehensive interview preparation materials"}
            ]
        }
    
    def _parse_gemini_response(self, response_text: str) -> dict:
        """
        Parse the Gemini response and ensure it has the correct structure.
        """
        try:
            # Handle cases where Gemini wraps JSON in code blocks
            if "```" in response_text:
                # Extract JSON from code block
                start = response_text.find("```")
                end = response_text.rfind("```")
                if start != -1 and end != -1 and end > start:
                    json_text = response_text[start+3:end].strip()
                    # Remove 'json' prefix if present
                    if json_text.startswith("json"):
                        json_text = json_text[4:].strip()
                    analysis = json.loads(json_text)
                else:
                    analysis = json.loads(response_text)
            else:
                analysis = json.loads(response_text)
            
            # Ensure all required fields are present
            required_fields = [
                "technical_accuracy", "clarity_structure", "depth_of_knowledge",
                "communication", "confidence", "reasoning", "emotion",
                "strengths", "improvements", "suggestions", "recommended_resources"
            ]
            
            for field in required_fields:
                if field not in analysis:
                    # Provide default values if missing
                    if field in ["technical_accuracy", "clarity_structure", "depth_of_knowledge",
                               "communication", "confidence", "reasoning", "emotion"]:
                        analysis[field] = 75
                    elif field in ["strengths", "improvements", "suggestions"]:
                        analysis[field] = ["Default feedback"]
                    elif field == "recommended_resources":
                        analysis[field] = [
                            {"title": "General Guide", "description": "Standard interview preparation"},
                            {"title": "Skill Development", "description": "Resources for improvement"}
                        ]
            
            return analysis
        except Exception as e:
            print(f"Error parsing Gemini response: {e}")
            print(f"Response text: {response_text}")
            # Return mock data as fallback
            return self._mock_comprehensive_analysis()
    
    def _mock_analysis(self, question: str, answer: str, domain: str) -> dict:
        """
        Provide mock analysis when Gemini is not available.
        """
        import random
        
        # Generate mock scores
        technical_accuracy = random.randint(70, 95)
        clarity_structure = random.randint(65, 90)
        depth_of_knowledge = random.randint(60, 85)
        communication = random.randint(75, 95)
        confidence = random.randint(60, 80)
        reasoning = random.randint(65, 85)
        emotion = random.randint(50, 80)
        
        # Generate mock feedback
        strengths = [
            "Clear explanation of core concepts",
            "Good use of technical terminology",
            "Structured response with logical flow"
        ]
        
        improvements = [
            "Could provide more specific examples",
            "Consider elaborating on practical applications",
            "Add more quantitative data where possible"
        ]
        
        suggestions = [
            "Include real-world case studies",
            "Mention relevant frameworks or tools",
            "Address potential counterarguments"
        ]
        
        # Generate mock resources based on domain
        resources = []
        if domain == "ml":
            resources = [
                {"title": "Machine Learning Mastery", "description": "Advanced ML techniques and best practices"},
                {"title": "Deep Learning Specialization", "description": "Comprehensive deep learning course"}
            ]
        elif domain == "ds":
            resources = [
                {"title": "Statistics for Data Science", "description": "Essential statistical concepts for data analysis"},
                {"title": "Data Visualization Best Practices", "description": "Effective data storytelling techniques"}
            ]
        elif domain == "se":
            resources = [
                {"title": "System Design Primer", "description": "Scalable system architecture patterns"},
                {"title": "Clean Code Principles", "description": "Writing maintainable and efficient code"}
            ]
        else:
            resources = [
                {"title": "Domain-Specific Guide", "description": "Specialized resources for your field"},
                {"title": "Interview Preparation Kit", "description": "Comprehensive interview preparation materials"}
            ]
        
        return {
            "technical_accuracy": technical_accuracy,
            "clarity_structure": clarity_structure,
            "depth_of_knowledge": depth_of_knowledge,
            "communication": communication,
            "confidence": confidence,
            "reasoning": reasoning,
            "emotion": emotion,
            "strengths": strengths,
            "improvements": improvements,
            "suggestions": suggestions,
            "recommended_resources": resources
        }
    
    def _mock_speech_analysis(self, transcript: str) -> dict:
        """
        Provide mock speech analysis when Gemini is not available.
        """
        import random
        
        # Handle empty or very short transcripts
        if not transcript or len(transcript.strip()) < 5:
            return {
                "technical_accuracy": 30,
                "clarity_structure": 25,
                "depth_of_knowledge": 20,
                "communication": 30,
                "confidence": 25,
                "reasoning": 30,
                "emotion": 20,
                "strengths": [
                    "Response received"
                ],
                "improvements": [
                    "Need to provide a more detailed answer",
                    "Response is too brief to evaluate properly",
                    "Lacks specific examples or explanations"
                ],
                "suggestions": [
                    "Take more time to formulate a complete response",
                    "Provide specific examples to support your points",
                    "Structure your answer with clear introduction, body, and conclusion"
                ],
                "recommended_resources": [
                    {"title": "Interview Response Structure", "description": "Learn how to structure comprehensive interview answers"},
                    {"title": "Answer Development Techniques", "description": "Techniques for expanding brief responses"}
                ]
            }
        
        # Generate mock scores for speech analysis
        technical_accuracy = random.randint(70, 95)
        clarity_structure = random.randint(65, 90)
        depth_of_knowledge = random.randint(60, 85)
        communication = random.randint(75, 95)
        confidence = random.randint(60, 80)
        reasoning = random.randint(65, 85)
        emotion = random.randint(50, 80)
        
        # Generate mock feedback for speech
        strengths = [
            "Clear and articulate speech delivery",
            "Good pace and rhythm in speaking",
            "Confident tone throughout the response"
        ]
        
        improvements = [
            "Could work on reducing filler words",
            "Consider varying vocal tone for better engagement",
            "Try to speak more slowly in complex sections"
        ]
        
        suggestions = [
            "Practice with a timer to improve pacing",
            "Record yourself to identify areas for improvement",
            "Focus on clear enunciation of technical terms"
        ]
        
        resources = [
            {"title": "Public Speaking Mastery", "description": "Techniques to improve verbal communication skills"},
            {"title": "Interview Speaking Guide", "description": "Tips for effective verbal interview responses"}
        ]
        
        return {
            "technical_accuracy": technical_accuracy,
            "clarity_structure": clarity_structure,
            "depth_of_knowledge": depth_of_knowledge,
            "communication": communication,
            "confidence": confidence,
            "reasoning": reasoning,
            "emotion": emotion,
            "strengths": strengths,
            "improvements": improvements,
            "suggestions": suggestions,
            "recommended_resources": resources
        }
    
    def _mock_comprehensive_analysis(self) -> dict:
        """
        Provide comprehensive mock analysis.
        """
        return {
            "technical_accuracy": 80,
            "clarity_structure": 75,
            "depth_of_knowledge": 70,
            "communication": 85,
            "confidence": 75,
            "reasoning": 80,
            "emotion": 65,
            "strengths": [
                "Demonstrates solid understanding of core concepts",
                "Well-structured response with clear points",
                "Uses appropriate technical terminology"
            ],
            "improvements": [
                "Could provide more specific examples",
                "Consider addressing potential counterarguments",
                "Add more quantitative data where relevant"
            ],
            "suggestions": [
                "Include real-world case studies to illustrate points",
                "Mention relevant frameworks or tools in your field",
                "Practice structuring responses using the STAR method"
            ],
            "recommended_resources": [
                {"title": "Domain-Specific Guide", "description": "Specialized resources for your field"},
                {"title": "Interview Preparation Kit", "description": "Comprehensive interview preparation materials"}
            ]
        }

# Create a global instance
analyzer = GeminiAnalyzer()

def analyze_text_answer_with_gemini(question: str, answer: str, domain: str) -> dict:
    """
    Public function to analyze a text answer using Gemini models.
    
    Args:
        question (str): The interview question
        answer (str): The candidate's answer
        domain (str): The domain/role (e.g., 'ml', 'ds', 'se')
        
    Returns:
        dict: Analysis results with scores and feedback
    """
    return analyzer.analyze_text_answer(question, answer, domain)

def analyze_speech_answer_with_gemini(transcript: str) -> dict:
    """
    Public function to analyze a speech transcript using Gemini models.
    
    Args:
        transcript (str): The speech transcript to analyze
        
    Returns:
        dict: Analysis results with scores and feedback
    """
    return analyzer.analyze_speech_answer(transcript)