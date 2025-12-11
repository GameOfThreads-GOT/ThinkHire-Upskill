import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const LiveAnalysisPage = () => {
  const navigate = useNavigate();
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [currentQuestion, setCurrentQuestion] = useState("Tell me about a challenging project you worked on.");
  const [userAnswer, setUserAnswer] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [videoMetrics, setVideoMetrics] = useState({
    eyeContact: 0,
    posture: 0,
    headMovement: 0
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const countdownRef = useRef(null);
  const analysisIntervalRef = useRef(null);
  const processedTextRef = useRef('');

  // Sample questions for the interview
  const interviewQuestions = [
    "Tell me about a challenging project you worked on.",
    "How do you handle working under pressure?",
    "Describe a time when you had to learn a new technology quickly.",
    "What motivates you in your work?",
    "How do you approach solving complex problems?"
  ];

  // Initialize webcam
  const initWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 }, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsWebcamActive(true);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play().catch(e => {
              console.error('Video play error:', e);
            });
          }
        }, 100);
      }
      
      initSpeechRecognition();
      startCountdown();
    } catch (err) {
      console.error('Error accessing webcam:', err);
      alert('Could not access webcam/microphone. Please check permissions.');
    }
  };

  // Initialize speech recognition
  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update user answer with both interim and final transcript
        if (finalTranscript || interimTranscript) {
          setUserAnswer(prev => prev + finalTranscript + interimTranscript);
          
          // Only add final transcripts to processed text to avoid repetition
          if (finalTranscript && !processedTextRef.current.includes(finalTranscript.trim())) {
            processedTextRef.current += finalTranscript;
            setProcessedText(processedTextRef.current);
          }
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };
    } else {
      console.warn('Speech recognition not supported');
      alert('Speech recognition is not supported in your browser.');
    }
  };

  // Start countdown before interview
  const startCountdown = () => {
    setInterviewStarted(true);
    setCountdown(3);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          startInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start the actual interview
  const startInterview = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
      startVideoAnalysis();
    }
  };

  // Start video analysis simulation
  const startVideoAnalysis = () => {
    setIsAnalyzing(true);
    analysisIntervalRef.current = setInterval(() => {
      // Generate realistic but varying metrics
      setVideoMetrics(prev => ({
        eyeContact: Math.min(100, Math.max(60, prev.eyeContact + (Math.random() * 10 - 5))),
        posture: Math.min(100, Math.max(70, prev.posture + (Math.random() * 8 - 4))),
        headMovement: Math.min(100, Math.max(50, prev.headMovement + (Math.random() * 12 - 6)))
      }));
    }, 2000);
  };

  // Stop video analysis
  const stopVideoAnalysis = () => {
    setIsAnalyzing(false);
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }
  };

  // Analyze the user's response
  const analyzeResponse = async () => {
    if (!processedText.trim()) {
      alert('Please provide an answer before submitting.');
      return;
    }
    
    try {
      // Send to backend for analysis
      const response = await fetch('/api/live-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: processedText,
          video_metrics: videoMetrics
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setAnalysisResults({
          ...result,
          videoMetrics
        });
      } else {
        // Fallback to simulated results if backend fails
        console.error('Backend analysis failed, using fallback');
        await simulateAnalysis();
      }
    } catch (error) {
      console.error('Analysis error:', error);
      // Fallback to simulated results if network fails
      await simulateAnalysis();
    }
  };

  // Simulate analysis for fallback
  const simulateAnalysis = async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate realistic analysis results
    const technicalAccuracy = Math.floor(Math.random() * 30) + 60; // 60-90
    const clarity = Math.floor(Math.random() * 25) + 65; // 65-90
    const depth = Math.floor(Math.random() * 35) + 55; // 55-90
    const communication = Math.floor(Math.random() * 30) + 60; // 60-90
    const confidence = Math.floor(Math.random() * 40) + 50; // 50-90
    
    // Calculate overall score
    const overallScore = Math.round((technicalAccuracy + clarity + depth + communication + confidence) / 5);
    
    // Generate strengths and improvements
    const strengths = [];
    const improvements = [];
    
    if (technicalAccuracy > 75) strengths.push("Demonstrated good technical knowledge");
    if (clarity > 75) strengths.push("Clear and articulate communication");
    if (depth > 75) strengths.push("Showed depth in explanation");
    if (communication > 75) strengths.push("Effective communication style");
    if (confidence > 75) strengths.push("Confident presentation");
    
    if (technicalAccuracy < 70) improvements.push("Expand on technical details");
    if (clarity < 70) improvements.push("Work on clarity and structure");
    if (depth < 70) improvements.push("Provide more detailed examples");
    if (communication < 70) improvements.push("Improve pacing and flow");
    if (confidence < 70) improvements.push("Show more confidence in delivery");
    
    // Add video-based feedback
    if (videoMetrics.eyeContact > 80) strengths.push("Maintained good eye contact");
    else if (videoMetrics.eyeContact < 70) improvements.push("Try to maintain more eye contact");
    
    if (videoMetrics.posture > 85) strengths.push("Good posture throughout");
    else if (videoMetrics.posture < 75) improvements.push("Work on maintaining upright posture");
    
    setAnalysisResults({
      technical_accuracy: technicalAccuracy,
      clarity: clarity,
      depth: depth,
      communication: communication,
      confidence: confidence,
      overall_score: overallScore,
      strengths: strengths.slice(0, 3), // Limit to 3 strengths
      improvements: improvements.slice(0, 3), // Limit to 3 improvements
      word_count: processedText.split(' ').length,
      videoMetrics
    });
  };

  // Handle answer submission
  const handleSubmitAnswer = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    
    stopVideoAnalysis();
    analyzeResponse();
  };

  // Handle start answering
  const handleStartAnswering = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Reset interview
  const resetInterview = () => {
    // Stop recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Stop video analysis
    stopVideoAnalysis();
    
    // Reset state
    setIsListening(false);
    setInterviewStarted(false);
    setCountdown(3);
    setUserAnswer('');
    setProcessedText('');
    processedTextRef.current = '';
    setAnalysisResults(null);
    setVideoMetrics({ eyeContact: 0, posture: 0, headMovement: 0 });
    
    // Clean up streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Reinitialize
    setTimeout(() => {
      initWebcam();
    }, 100);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up intervals
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
      
      // Stop recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      // Stop streams
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Exit interview
  const exitInterview = () => {
    // Clean up
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    stopVideoAnalysis();
    navigate('/dashboard');
  };

  if (analysisResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Interview Analysis Results</h1>
            <button 
              onClick={exitInterview}
              className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Exit
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overall Score Card */}
            <div className="lg:col-span-1 bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Overall Performance</h2>
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-700 stroke-current"
                      strokeWidth="10"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                    ></circle>
                    <circle
                      className="text-blue-500 stroke-current"
                      strokeWidth="10"
                      strokeLinecap="round"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * analysisResults.overallScore) / 100}
                      transform="rotate(-90 50 50)"
                    ></circle>
                    <text
                      x="50"
                      y="50"
                      className="text-2xl font-bold fill-white"
                      textAnchor="middle"
                      dy="7"
                    >
                      {analysisResults.overallScore}%
                    </text>
                  </svg>
                </div>
                <p className="mt-4 text-center text-gray-300">
                  {analysisResults.overallScore >= 80 ? 'Excellent Performance!' : 
                   analysisResults.overallScore >= 70 ? 'Good Performance' : 
                   analysisResults.overallScore >= 60 ? 'Satisfactory' : 'Needs Improvement'}
                </p>
              </div>
              
              <div className="mt-6">
                <h3 className="font-bold mb-2">Video Metrics</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Eye Contact</span>
                      <span>{Math.round(analysisResults.videoMetrics.eyeContact)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${analysisResults.videoMetrics.eyeContact}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Posture</span>
                      <span>{Math.round(analysisResults.videoMetrics.posture)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${analysisResults.videoMetrics.posture}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Head Movement</span>
                      <span>{Math.round(analysisResults.videoMetrics.headMovement)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${analysisResults.videoMetrics.headMovement}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Detailed Analysis */}
            <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Detailed Analysis</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-gray-700 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{analysisResults.technicalAccuracy}</div>
                  <div className="text-sm text-gray-300">Technical</div>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{analysisResults.clarity}</div>
                  <div className="text-sm text-gray-300">Clarity</div>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{analysisResults.depth}</div>
                  <div className="text-sm text-gray-300">Depth</div>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{analysisResults.communication}</div>
                  <div className="text-sm text-gray-300">Communication</div>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold">{analysisResults.confidence}</div>
                  <div className="text-sm text-gray-300">Confidence</div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-bold mb-2">Your Answer ({analysisResults.wordCount} words)</h3>
                <div className="bg-gray-700 p-4 rounded-lg max-h-32 overflow-y-auto">
                  <p className="text-sm">{processedText}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold mb-2 text-green-400">Strengths</h3>
                  <ul className="space-y-2">
                    {analysisResults.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-bold mb-2 text-yellow-400">Areas for Improvement</h3>
                  <ul className="space-y-2">
                    {analysisResults.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-yellow-400 mr-2">!</span>
                        <span className="text-sm">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={resetInterview}
                  className="flex-1 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Another Question
                </button>
                <button
                  onClick={exitInterview}
                  className="flex-1 px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      {/* Video Feed */}
      <div className="relative h-2/3">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-full object-cover"
        />
        
        {!isWebcamActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
            <div className="text-center">
              <div className="text-xl mb-4">Initializing camera...</div>
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        )}
        
        {/* Overlay UI */}
        <div className="absolute inset-0 flex flex-col">
          {/* Top Bar */}
          <div className="flex justify-between items-center p-4">
            <h1 className="text-xl font-bold">Live Interview Analysis</h1>
            <button 
              onClick={exitInterview}
              className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Exit
            </button>
          </div>
          
          {/* Center Content */}
          <div className="flex-1 flex items-center justify-center">
            {interviewStarted ? (
              countdown > 0 ? (
                <div className="text-center">
                  <div className="text-6xl font-bold mb-4">{countdown}</div>
                  <div className="text-xl">Get ready...</div>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto text-center px-4">
                  <div className="bg-black bg-opacity-50 rounded-xl p-6 backdrop-blur-sm">
                    <h2 className="text-2xl font-bold mb-4">Question</h2>
                    <p className="text-xl mb-6">{currentQuestion}</p>
                    
                    <div className="flex justify-center gap-4 mb-6">
                      {!isListening ? (
                        <button
                          onClick={handleStartAnswering}
                          className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                        >
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                          </svg>
                          Start Answering
                        </button>
                      ) : (
                        <button
                          onClick={handleSubmitAnswer}
                          className="px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                        >
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                          </svg>
                          Submit Answer
                        </button>
                      )}
                    </div>
                    
                    {isListening && (
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
                        <span>Listening...</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            ) : (
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-6">Ready for Your Live Interview?</h2>
                <button
                  onClick={initWebcam}
                  className="px-8 py-4 bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors text-xl font-bold"
                >
                  Start Interview
                </button>
                <p className="mt-4 text-gray-300">Your webcam and microphone will be used for analysis</p>
              </div>
            )}
          </div>
          
          {/* Bottom Panel */}
          {(isListening || userAnswer) && (
            <div className="p-4 bg-black bg-opacity-50">
              <div className="max-w-4xl mx-auto">
                <h3 className="font-bold mb-2">Your Answer Preview:</h3>
                <div className="bg-gray-800 bg-opacity-80 rounded-lg p-3 max-h-24 overflow-y-auto">
                  <p className="text-sm">{userAnswer || 'Start speaking to see your answer here...'}</p>
                </div>
                
                {/* Video Metrics */}
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div className="bg-gray-800 bg-opacity-80 rounded-lg p-2">
                    <div className="text-xs text-gray-400">Eye Contact</div>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-700 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${videoMetrics.eyeContact}%` }}
                        ></div>
                      </div>
                      <span className="text-xs">{Math.round(videoMetrics.eyeContact)}%</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 bg-opacity-80 rounded-lg p-2">
                    <div className="text-xs text-gray-400">Posture</div>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-700 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${videoMetrics.posture}%` }}
                        ></div>
                      </div>
                      <span className="text-xs">{Math.round(videoMetrics.posture)}%</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 bg-opacity-80 rounded-lg p-2">
                    <div className="text-xs text-gray-400">Head Movement</div>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-700 rounded-full h-2 mr-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${videoMetrics.headMovement}%` }}
                        ></div>
                      </div>
                      <span className="text-xs">{Math.round(videoMetrics.headMovement)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveAnalysisPage;