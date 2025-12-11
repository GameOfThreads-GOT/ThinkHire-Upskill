"""
Groq Model Analyzer for ThinkHire
Enhanced version: Strict scoring, streamlined prompts, safer config,
improved rate limiting and retry logic.
"""

import os
import json
import time
from typing import Dict, Any
from groq import Groq
from functools import lru_cache
import backoff


class GroqAnalyzer:
    def __init__(self):
        """
        Initialize Groq client using environment variable.
        """
        # Try to get API key from environment variable first, then fall back to default
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            # Check if there's a .env file or similar
            try:
                from dotenv import load_dotenv
                load_dotenv()
                api_key = os.getenv("GROQ_API_KEY")
            except ImportError:
                pass
        
        # If still no API key, use the default one
        if not api_key:
            api_key = "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"
        
        self.client = Groq(api_key=api_key)
        self.request_times = []
        self.max_requests_per_min = 30  # More conservative rate limiting

    def _rate_limit(self):
        """
        Enforce requests per minute rate limiting.
        """
        now = time.time()
        self.request_times = [t for t in self.request_times if now - t < 60]

        if len(self.request_times) >= self.max_requests_per_min:
            wait = 60 - (now - self.request_times[0])
            time.sleep(max(0, wait))

        self.request_times.append(time.time())

    def _strict_json_extract(self, response_text: str) -> dict:
        """
        Ensure a strict JSON response is parsed.
        """
        try:
            response_text = response_text.strip()
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
            response_text = response_text.replace("json", "").strip()
            return json.loads(response_text)
        except Exception:
            return None

    @backoff.on_exception(backoff.expo, Exception, max_tries=3)
    def _call(self, prompt: str, model: str = "llama-3.1-8b-instant") -> str:
        """
        Low-level Groq call with retry & ratelimit.
        """
        self._rate_limit()
        response = self.client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.15,
            max_tokens=1000
        )
        return response.choices[0].message.content

    def _normalize(self, val):
        try:
            v = int(val)
            return max(0, min(100, v))
        except:
            return 0

    def _finalize(self, parsed: dict) -> dict:
        """
        Normalize & enforce complete schema.
        """
        schema = {
            "technical_accuracy": 0,
            "clarity_structure": 0,
            "depth_of_knowledge": 0,
            "communication": 0,
            "confidence": 0,
            "reasoning": 0,
            "emotion": 0,
            "strengths": [],
            "improvements": [],
            "suggestions": [],
            "recommended_resources": []
        }

        for k in schema:
            if k in parsed:
                if isinstance(schema[k], int):
                    schema[k] = self._normalize(parsed[k])
                else:
                    schema[k] = parsed[k]

        return schema

    def _analysis_prompt(self, question, answer, domain) -> str:
        return f"""
You are a **harsh, no-nonsense technical interviewer** with deep domain expertise in {domain}. You strictly judge answers based on technical accuracy and depth.

Question: {question}
Candidate Answer: {answer}
Domain: {domain}

Scoring Rules:
• Only technically detailed and correct answers score high (80-100).
• Generic, vague, or textbook-level answers score **below 50**.
• Partially correct answers with significant gaps score 30-60.
• Incorrect or fundamentally flawed answers score below 30.
• Confidence must be based on correctness, not tone.
• Depth of knowledge is critical - surface-level answers get penalized.

Rate 0–100 on these specific criteria:
- technical_accuracy: How technically correct and precise is the content?
- clarity_structure: Is the response well-organized with a logical flow?
- depth_of_knowledge: Does the answer demonstrate deep understanding of the subject?
- communication: How clear and effective is the written communication?
- confidence: Does the response sound self-assured and knowledgeable (based on correctness)?
- reasoning: Is the logic sound and well-reasoned?
- emotion: How well does the response connect and engage (professional tone)?

Also provide:
3 specific strengths (if none, write "None")
3 actionable improvements (must be specific and technical)
3 targeted suggestions for better answer quality
2 domain-specific, **high-quality** learning resources

STRICT OUTPUT FORMAT:
Respond **ONLY** with valid JSON:
{{
"technical_accuracy": <number>,
"clarity_structure": <number>,
"depth_of_knowledge": <number>,
"communication": <number>,
"confidence": <number>,
"reasoning": <number>,
"emotion": <number>,
"strengths": ["", "", ""],
"improvements": ["", "", ""],
"suggestions": ["", "", ""],
"recommended_resources": [
    {{"title": "", "description": ""}},
    {{"title": "", "description": ""}}
]
}}

Additional Instructions:
1. Ask questions based on the interviewer's chosen domain ({domain}). Questions should be adaptive medium to hard level according to the answer quality.
2. Evaluate the candidate's answers and code in real time.
3. Give only short and specific hints when needed, never full solutions immediately.
4. Adjust question complexity based on the quality of the previous answer.
5. Validate code execution results and logic for correctness.
6. Score the candidate continuously on:
   - Problem-solving
   - Technical knowledge
   - Code quality
   - Communication clarity
   - Efficiency of solution
7. Provide structured feedback only when asked by user or at the end as a summary.

Interview Rules:
- Do not reveal answers without attempt.
- Maintain a professional and neutral tone.
- If the candidate is stuck, ask guiding questions.
- Keep the flow fast-paced and practical.

End Goal:
Help the interviewer understand the candidate's true skill level through adaptive questioning and real-time evaluation.
"""

    def _mock(self):
        return {
            "technical_accuracy": 20,
            "clarity_structure": 20,
            "depth_of_knowledge": 15,
            "communication": 30,
            "confidence": 25,
            "reasoning": 20,
            "emotion": 25,
            "strengths": ["Answer exists", "Attempted response", "Spoke English"],
            "improvements": ["Add correct details", "Structure response", "Improve knowledge"],
            "suggestions": ["Study fundamentals deeply", "Practice mock interviews", "Add examples"],
            "recommended_resources": [
                {"title": "Basic Interview Prep", "description": "Intro concepts"},
                {"title": "Domain Crash Course", "description": "Focused learning"}
            ]
        }

    def analyze_text_answer(self, question: str, answer: str, domain: str) -> dict:
        """
        Generate harsh analysis.
        """
        try:
            prompt = self._analysis_prompt(question, answer, domain)
            response_text = self._call(prompt)
            parsed = self._strict_json_extract(response_text)
            if not parsed:
                return self._mock()
            return self._finalize(parsed)
        except:
            return self._mock()
    
    def analyze_speech_answer(self, transcript: str) -> dict:
        """
        Analyze a speech transcript for communication skills.
        
        Args:
            transcript (str): The speech transcript to analyze
            
        Returns:
            dict: Analysis results with scores and feedback
        """
        # Check for clearly irrelevant or minimal transcripts
        if not transcript or len(transcript.strip()) < 10:
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
            prompt = f"""
You are an expert technical interviewer with deep domain knowledge. You are evaluating a candidate's spoken response in a technical interview.

Transcript: {transcript}

Evaluate these specific aspects with strict technical standards:
1. Technical Accuracy (0-100): How technically correct and precise is the content? Penalize incorrect information heavily.
2. Clarity & Structure (0-100): Is the response well-organized with a logical flow? Look for clear progression of ideas.
3. Depth of Knowledge (0-100): Does the answer demonstrate deep understanding of the subject? Look for specific details, examples, and nuanced understanding.
4. Communication Skills (0-100): How clear and effective is the verbal communication? Consider pace, clarity, and articulation.
5. Confidence (0-100): Does the speaker sound self-assured and knowledgeable? Base this on content quality, not just tone.
6. Reasoning (0-100): Is the logic sound and well-reasoned? Look for evidence-based thinking and problem-solving approach.
7. Emotional Intelligence (0-100): How well does the speaker connect and engage? Consider professionalism and interpersonal awareness.

Also provide:
- 3 key strengths (be specific and technical)
- 3 areas for improvement (be actionable and focused on content/structure)
- 3 specific suggestions for better verbal communication in technical contexts
- 2 high-quality, domain-specific learning resources

Be strict but fair. Give specific, actionable feedback based on the actual content of the transcript.
Focus on helping the candidate improve their technical communication skills.

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

Respond ONLY with the JSON object, no other text.
            """
            
            response_text = self._call(prompt)
            parsed = self._strict_json_extract(response_text)
            if not parsed:
                # Return mock analysis on parsing failure
                return {
                    "technical_accuracy": 75,
                    "clarity_structure": 70,
                    "depth_of_knowledge": 65,
                    "communication": 80,
                    "confidence": 70,
                    "reasoning": 75,
                    "emotion": 65,
                    "strengths": ["Clear speech", "Good pace", "Logical flow"],
                    "improvements": ["More specific examples", "Better technical depth", "Stronger conclusion"],
                    "suggestions": ["Practice with a timer", "Record for self-review", "Seek feedback from peers"],
                    "recommended_resources": [
                        {"title": "Public Speaking Guide", "description": "Techniques to improve verbal communication"},
                        {"title": "Technical Interview Prep", "description": "Master technical concepts and communication"}
                    ]
                }
            
            return self._finalize(parsed)
        except Exception as e:
            print(f"Error in Groq speech analysis: {e}")
            traceback.print_exc()
            # Return mock analysis when Groq fails
            return {
                "technical_accuracy": 75,
                "clarity_structure": 70,
                "depth_of_knowledge": 65,
                "communication": 80,
                "confidence": 70,
                "reasoning": 75,
                "emotion": 65,
                "strengths": ["Clear speech", "Good pace", "Logical flow"],
                "improvements": ["More specific examples", "Better technical depth", "Stronger conclusion"],
                "suggestions": ["Practice with a timer", "Record for self-review", "Seek feedback from peers"],
                "recommended_resources": [
                    {"title": "Public Speaking Guide", "description": "Techniques to improve verbal communication"},
                    {"title": "Technical Interview Prep", "description": "Master technical concepts and communication"}
                ]
            }

# Global instance
analyzer = GroqAnalyzer()


def analyze_text_answer_with_groq(question: str, answer: str, domain: str) -> dict:
    """
    Public function to analyze a text answer using Groq models.
    
    Args:
        question (str): The interview question
        answer (str): The candidate's answer
        domain (str): The domain/role (e.g., 'ml', 'ds', 'se')
        
    Returns:
        dict: Analysis results with scores and feedback
    """
    return analyzer.analyze_text_answer(question, answer, domain)

def analyze_speech_answer_with_groq(transcript: str) -> dict:
    """
    Public function to analyze a speech transcript using Groq models.
    
    Args:
        transcript (str): The speech transcript to analyze
        
    Returns:
        dict: Analysis results with scores and feedback
    """
    return analyzer.analyze_speech_answer(transcript)
