import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { startFeatureCapture, stopFeatureCapture } from '../lib/videoFeatures';

// Add custom CSS for animations
const customStyles = `
  @keyframes spinReverse {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(-360deg); }
  }
  .animate-reverse {
    animation: spinReverse 1s linear infinite;
  }
`;

const EnhancedLiveInterviewPage = () => {
  console.log('EnhancedLiveInterviewPage component initializing...');
  
  // Inject custom styles
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = customStyles;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState("Please introduce yourself and share your professional background.");
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isGeneratingNextQuestion, setIsGeneratingNextQuestion] = useState(false);
  // Track total questions asked (different from questionIndex which tracks predefined questions)
  const [totalQuestionsAsked, setTotalQuestionsAsked] = useState(1);
  // Track user's performance scores
  const [performanceScores, setPerformanceScores] = useState([]);
  // Track used questions to avoid repetition
  const [usedQuestions, setUsedQuestions] = useState([]);
  // Track if question is being spoken
  const [isSpeaking, setIsSpeaking] = useState(false);
  // Track video analysis windows
  const [videoWindows, setVideoWindows] = useState([]);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const countdownRef = useRef(null);
  const transcriptBufferRef = useRef(null);

  // Domain questions (fallback for when adaptive system fails)
  const domainQuestions = {
    'ml': [
      "Please introduce yourself and share your experience with Machine Learning.",
      "Explain the difference between supervised and unsupervised learning with examples.",
      "How do you handle overfitting in your ML models?",
      "Describe a challenging ML project you've worked on from start to finish.",
      "What evaluation metrics would you use for a classification problem and why?",
      "How do you approach feature selection and engineering in ML projects?",
      "Explain the bias-variance tradeoff and its impact on model performance.",
      "What techniques do you use for model validation and cross-validation?",
      "How do you deal with imbalanced datasets in classification problems?",
      "Describe your experience with deep learning frameworks like TensorFlow or PyTorch."
    ],
    'ds': [
      "Please introduce yourself and share your experience with Data Science.",
      "How do you approach exploratory data analysis for a new dataset?",
      "Explain the central limit theorem and its importance in statistics.",
      "Describe a time when you had to clean a messy dataset. What steps did you take?",
      "How would you design an A/B test to evaluate a new feature?",
      "What methods do you use for handling missing data in datasets?",
      "Explain the difference between correlation and causation with examples.",
      "How do you determine which statistical test to use for a given problem?",
      "What visualization techniques do you find most effective for communicating insights?",
      "Describe a data science project where your findings directly impacted business decisions."
    ],
    'se': [
      "Please introduce yourself and share your experience with Software Engineering.",
      "Explain the difference between REST and GraphQL APIs.",
      "How would you optimize a slow database query?",
      "Describe the MVC pattern and its benefits in software development.",
      "What are the differences between TCP and UDP protocols?",
      "How do you approach debugging a complex production issue?",
      "Explain the concept of microservices and when you would use them.",
      "What strategies do you use for code review and ensuring code quality?",
      "How do you handle version control and branching strategies in team environments?",
      "Describe your experience with containerization technologies like Docker."
    ],
    'fin': [
      "Please introduce yourself and share your experience in Finance.",
      "How do you calculate the cost of capital for a company?",
      "Explain the concept of time value of money with a practical example.",
      "What factors affect a company's credit rating?",
      "Describe the difference between fiscal and monetary policy.",
      "How do you evaluate investment opportunities using financial metrics?",
      "Explain the concept of portfolio diversification and its importance.",
      "What are the key components of a company's financial statements?",
      "How do interest rate changes affect financial markets?",
      "Describe your experience with financial modeling and forecasting."
    ],
    'pm': [
      "Please introduce yourself and share your experience in Product Management.",
      "How do you prioritize features in a product roadmap?",
      "Describe a time when you had to manage conflicting stakeholder priorities.",
      "How do you measure product success?",
      "Explain the difference between Agile and Waterfall methodologies.",
      "How do you conduct market research for a new product idea?",
      "What techniques do you use for user story mapping and backlog refinement?",
      "How do you handle scope creep in product development?",
      "Describe your approach to product pricing strategy.",
      "How do you collaborate with engineering teams during product development?"
    ],
    'ux': [
      "Please introduce yourself and share your experience in UX Design.",
      "What is the difference between UX and UI design?",
      "How do you conduct user research for a new product?",
      "Explain the concept of information architecture.",
      "How do you approach designing for accessibility?",
      "What methods do you use for usability testing and gathering feedback?",
      "How do you create user personas and journey maps?",
      "Explain the importance of iterative design and prototyping.",
      "What tools do you use for wireframing and creating design systems?",
      "How do you balance user needs with business objectives in your designs?"
    ],
    'hr': [
      "Please introduce yourself and share your experience in Human Resources.",
      "How do you handle workplace conflict between team members?",
      "Describe your approach to performance management.",
      "What strategies do you use for employee engagement?",
      "Explain the importance of diversity and inclusion in the workplace.",
      "How do you develop and implement training programs for employees?",
      "What methods do you use for talent acquisition and recruitment?",
      "How do you handle disciplinary actions and terminations?",
      "Describe your experience with HR compliance and regulations.",
      "How do you measure the effectiveness of HR initiatives?"
    ],
    'sales': [
      "Please introduce yourself and share your experience in Sales.",
      "How do you approach a cold call to a potential client?",
      "Describe your sales process from prospecting to closing.",
      "How do you handle objections during a sales conversation?",
      "What metrics do you use to measure sales performance?",
      "How do you qualify leads and identify decision-makers?",
      "Describe a time when you lost a deal and what you learned from it.",
      "How do you build and maintain long-term client relationships?",
      "What CRM tools have you used and how have they helped your sales process?",
      "How do you adapt your sales approach for different types of clients?"
    ],
    'general': [
      "Please introduce yourself and share your professional background.",
      "Why do you want to work for our company?",
      "Describe a challenging project you worked on and your role in it.",
      "How do you handle working under pressure and tight deadlines?",
      "Where do you see yourself in five years?",
      "What motivates you in your work?",
      "How do you approach continuous learning and skill development?",
      "Describe a time when you had to work with a difficult colleague.",
      "What are your greatest strengths and weaknesses?",
      "How do you handle feedback and criticism?"
    ]
  };

  // Parse query parameters
  useEffect(() => {
    console.log('Location changed:', location);
    const searchParams = new URLSearchParams(location.search);
    const domain = searchParams.get('domain') || 'general';
    
    // Set the first question based on domain
    const questions = domainQuestions[domain] || domainQuestions['general'];
    console.log('Setting first question for domain:', domain, questions[0]);
    if (questions.length > 0) {
      setCurrentQuestion(questions[0]);
    }
    
    // Auto-start interview if domain is provided in URL (and not the default)
    // Only auto-start if interview hasn't started yet
    if (domain && !interviewStarted && !interviewComplete) {
      console.log('Auto-starting interview for domain:', domain);
      // Delay slightly to ensure component is fully mounted
      setTimeout(() => {
        initWebcam();
      }, 500);
    }
  }, [location]);

  // Track state changes
  useEffect(() => {
    console.log('State changed - interviewStarted:', interviewStarted);
  }, [interviewStarted]);

  useEffect(() => {
    console.log('State changed - countdown:', countdown);
  }, [countdown]);

  useEffect(() => {
    console.log('State changed - isRecording:', isRecording);
  }, [isRecording]);

  useEffect(() => {
    console.log('State changed - currentQuestion:', currentQuestion);
  }, [currentQuestion]);

  useEffect(() => {
    console.log('State changed - questionIndex:', questionIndex);
  }, [questionIndex]);

  // Initialize webcam
  const initWebcam = async () => {
    try {
      console.log('Initializing webcam...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 } }, 
        audio: true 
      });
      
      console.log('Webcam stream acquired:', stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsWebcamActive(true);
        console.log('Webcam stream set to video element');
        // Force a re-render to ensure the video element updates
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play().catch(e => {
              console.error('Video play error:', e);
              alert('Error playing video feed. Please check your camera settings.');
            });
          }
        }, 100);
      }
      
      // Initialize media recorder for video analysis
      initMediaRecorder(stream);
      
      // Initialize speech recognition
      initSpeechRecognition();
      
      // Start countdown
      startCountdown();
    } catch (err) {
      console.error('Error accessing webcam:', err);
      if (err.name === 'NotAllowedError') {
        alert('Camera and microphone access denied. Please enable permissions in your browser settings and try again.');
      } else if (err.name === 'NotFoundError') {
        alert('No camera or microphone found. Please connect devices and try again.');
      } else if (err.name === 'OverconstrainedError') {
        // Try again with less constrained settings
        try {
          console.log('Trying less constrained settings...');
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            streamRef.current = fallbackStream;
            setIsWebcamActive(true);
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.play().catch(e => {
                  console.error('Video play error:', e);
                  alert('Error playing video feed. Please check your camera settings.');
                });
              }
            }, 100);
          }
          
          initMediaRecorder(fallbackStream);
          initSpeechRecognition();
          startCountdown();
        } catch (fallbackErr) {
          console.error('Fallback also failed:', fallbackErr);
          alert('Could not access webcam. Please check permissions and try again.');
          startCountdown();
        }
      } else {
        alert('Could not access webcam. Please check permissions and try again.');
        startCountdown();
      }
    }
  };

  // Initialize media recorder for video capture
  const initMediaRecorder = (stream) => {
    try {
      console.log('Initializing media recorder...');
      recordedChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
          console.log('Recorded chunk size:', event.data.size);
        }
      };
      
      mediaRecorder.onstop = () => {
        console.log('Media recorder stopped. Recorded chunks:', recordedChunksRef.current.length);
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('Media recorder error:', event.error);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      console.log('Media recorder initialized');
    } catch (err) {
      console.error('Error initializing media recorder:', err);
    }
  };

  // Start recording when interview starts
  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      try {
        mediaRecorderRef.current.start(1000); // Collect data every second
        console.log('Media recorder started');
      } catch (err) {
        console.error('Error starting media recorder:', err);
      }
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
        console.log('Media recorder stopped');
      } catch (err) {
        console.error('Error stopping media recorder:', err);
      }
    }
  };

  // Initialize speech recognition
  const initSpeechRecognition = () => {
    try {
      console.log('Initializing speech recognition...');
      // Check if speech recognition is already initialized
      if (recognitionRef.current) {
        console.log('Speech recognition already initialized');
        return;
      }
      
      let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        let silenceTimer = null;
        const SILENCE_THRESHOLD = 5000; // 5 seconds of silence
        
        recognitionRef.current.onresult = (event) => {
          // Process speech results in the background
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
            transcriptBufferRef.current += finalTranscript;
            
            // Reset silence timer when we get speech
            if (silenceTimer) {
              clearTimeout(silenceTimer);
            }
            
            // Set a timer to stop recording after silence
            if (finalTranscript) {
              silenceTimer = setTimeout(() => {
                if (isRecording) {
                  console.log('Detected silence, stopping recording');
                  setIsRecording(false);
                  if (recognitionRef.current) {
                    recognitionRef.current.stop();
                  }
                }
              }, SILENCE_THRESHOLD);
            }
          }
        };
        
        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          // Handle different types of errors appropriately
          if (event.error === 'not-allowed') {
            alert('Microphone access denied. Please enable microphone permissions and try again.');
          } else if (event.error === 'audio-capture') {
            alert('No microphone detected. Please connect a microphone and try again.');
          } else if (event.error === 'no-speech') {
            // This is normal when user hasn't spoken yet
            console.log('No speech detected yet, continuing to listen');
          } else if (event.error === 'aborted') {
            // This is normal when we stop/restart recognition
            console.log('Speech recognition aborted, this is expected during normal operation');
          } else if (event.error === 'network') {
            // Network issues, but we can continue
            console.warn('Network error in speech recognition, continuing');
          } else if (event.error === 'bad-grammar') {
            // Grammar issues, but we can continue
            console.warn('Grammar error in speech recognition, continuing');
          } else {
            // Only show alert for truly unexpected errors
            console.warn('Unexpected speech recognition error:', event.error);
          }
        };
        
        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended');
          // Restart recognition if still recording
          if (isRecording) {
            console.log('Restarting speech recognition');
            // Add a small delay and check if we should still restart
            setTimeout(() => {
              if (isRecording && recognitionRef.current) {
                // Check state before starting
                const currentState = recognitionRef.current.state;
                console.log('Current recognition state:', currentState);
                
                // Only restart if in inactive/ended state
                if (currentState === 'inactive' || currentState === 'ended') {
                  try {
                    recognitionRef.current.start();
                    console.log('Speech recognition restarted successfully');
                  } catch (error) {
                    console.error('Error restarting speech recognition:', error);
                    // Don't show alert for restart errors, just log them
                  }
                } else {
                  console.log('Not restarting recognition, current state:', currentState);
                }
              }
            }, 300);
          }
        };

        recognitionRef.current.onstart = () => {
          console.log('Speech recognition started successfully');
        };
        
        recognitionRef.current.onaudiostart = () => {
          console.log('Audio capturing started');
        };
        
        recognitionRef.current.onsoundstart = () => {
          console.log('Sound detected');
        };
        
        console.log('Speech recognition initialized successfully');
        // Note: We don't start recognition here, only initialize it
      } else {
        console.warn('Speech recognition not supported in this browser.');
        alert('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
      }
    } catch (err) {
      console.error('Error initializing speech recognition:', err);
      alert('Error initializing speech recognition. Please refresh the page and try again.');
    }
  };

  // Start countdown before interview
  const startCountdown = () => {
    console.log('Starting countdown...');
    setInterviewStarted(true);
    setCountdown(3); // Reset countdown to 3
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        console.log('Countdown:', prev);
        if (prev <= 1) {
          console.log('Countdown finished, starting interview...');
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
    console.log('Starting interview...');
    setIsRecording(true);
    setUserAnswer('');
    transcriptBufferRef.current = '';
    // Start video recording
    startRecording();
    // Start video feature capture
    if (videoRef.current) {
      startFeatureCapture(videoRef.current, (windowData) => {
        console.log('Received video window data:', windowData);
        setVideoWindows(prev => [...prev, windowData]);
        
        // Send to backend for analysis
        analyzeVideoWindow(windowData);
      }, 3000, 1000);
    }
    // Start speech recognition with proper state checking
    if (recognitionRef.current) {
      try {
        // Check if recognition is already running
        if (recognitionRef.current.state === 'listening' || recognitionRef.current.state === 'started' || recognitionRef.current.state === 'running') {
          console.log('Speech recognition already running');
        } else {
          recognitionRef.current.start();
          console.log('Speech recognition started for interview');
        }
      } catch (error) {
        console.error('Error starting speech recognition for interview:', error);
        // Try to restart
        try {
          recognitionRef.current.stop();
          setTimeout(() => {
            if (recognitionRef.current) {
              recognitionRef.current.start();
              console.log('Speech recognition restarted for interview');
            }
          }, 100);
        } catch (restartError) {
          console.error('Error restarting speech recognition for interview:', restartError);
        }
      }
    }
  };

  // Analyze video window data
  const analyzeVideoWindow = async (windowData) => {
    try {
      const response = await fetch('/video-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(windowData),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Video analysis result:', result);
        // You can store or display these results as needed
      } else {
        console.error('Video analysis failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error sending video window for analysis:', error);
    }
  };

  // Generate next adaptive question
  const generateNextQuestion = async (previousAnswer) => {
    setIsGeneratingNextQuestion(true);
    
    try {
      // First, analyze the user's answer to get scores and weaknesses
      // We'll use both speech analysis and video analysis for a comprehensive evaluation
      
      // Add a timeout for the analysis requests
      const timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      
      // Speech analysis with timeout
      let speechAnalysisResponse = null;
      try {
        const speechAnalysisPromise = fetch('/api/analyze-speech-answer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transcript: previousAnswer
          }),
        });
        
        // Race between the actual request and a 5-second timeout
        speechAnalysisResponse = await Promise.race([
          speechAnalysisPromise,
          timeout(5000).then(() => {
            throw new Error('Speech analysis timeout');
          })
        ]);
      } catch (error) {
        console.error('Speech analysis error or timeout:', error);
      }
      
      // Video analysis (if we have video data) with timeout
      let videoAnalysisResponse = null;
      if (recordedChunksRef.current && recordedChunksRef.current.length > 0) {
        try {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const base64data = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]); // Remove data URL prefix
            reader.readAsDataURL(blob);
          });
          
          const videoAnalysisPromise = fetch('/api/analyze-video-interview', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              video_data: base64data,
              question: currentQuestion,
              answer: previousAnswer
            }),
          });
          
          // Race between the actual request and a 5-second timeout
          videoAnalysisResponse = await Promise.race([
            videoAnalysisPromise,
            timeout(5000).then(() => {
              throw new Error('Video analysis timeout');
            })
          ]);
        } catch (videoError) {
          console.error('Video analysis error or timeout:', videoError);
        }
      }
      
      let scores = {};
      let weaknesses = [];
      let overallScore = 50; // Default score
      
      // Process speech analysis results
      if (speechAnalysisResponse && speechAnalysisResponse.ok) {
        const speechData = await speechAnalysisResponse.json();
        
        // Process video analysis results if available
        if (videoAnalysisResponse && videoAnalysisResponse.ok) {
          const videoData = await videoAnalysisResponse.json();
          
          // Combine speech and video scores for a more comprehensive evaluation
          // Keep all scores on the same 0-100 scale for consistency
          scores = {
            technical_accuracy: Math.floor((speechData.technical_accuracy + (videoData.technical_accuracy || speechData.technical_accuracy)) / 2),
            reasoning: Math.floor((speechData.reasoning + (videoData.reasoning || speechData.reasoning)) / 2),
            clarity_structure: Math.floor((speechData.clarity_structure + (videoData.clarity_structure || speechData.clarity_structure)) / 2),
            confidence: Math.floor((speechData.confidence + (videoData.confidence || speechData.confidence)) / 2),
            communication: Math.floor((speechData.communication + (videoData.communication || speechData.communication)) / 2),
            emotion: Math.floor((speechData.emotion + (videoData.emotion || speechData.emotion)) / 2),
            // Add video-specific metrics (keep on 0-100 scale)
            eye_contact: videoData.eye_contact_score || speechData.eye_contact_score || 50,
            body_language: videoData.body_language_score || speechData.body_language_score || 50
          };
          
          // Calculate overall score as average of all scores (now all on 0-100 scale)
          overallScore = Math.round((scores.technical_accuracy + scores.reasoning + scores.clarity_structure + scores.confidence + scores.communication + scores.emotion + scores.eye_contact + scores.body_language) / 8);
          
          // Combine weaknesses from both analyses
          const speechWeaknesses = speechData.improvements || [];
          const videoWeaknesses = [
            (videoData.eye_contact_score || 50) < 70 ? "Poor eye contact" : "",
            (videoData.body_language_score || 50) < 70 ? "Inadequate body language" : "",
            (videoData.posture || "").includes("poor") ? "Poor posture" : ""
          ].filter(Boolean);
          
          weaknesses = [...speechWeaknesses, ...videoWeaknesses];
        } else {
          // Only speech analysis available
          // Keep all scores on 0-100 scale for consistency
          scores = {
            technical_accuracy: speechData.technical_accuracy || 50,
            reasoning: speechData.reasoning || 50,
            clarity_structure: speechData.clarity_structure || 50,
            confidence: speechData.confidence || 50,
            communication: speechData.communication || 50,
            emotion: speechData.emotion || 50
          };
          
          // Calculate overall score as average of all scores
          overallScore = Math.round((scores.technical_accuracy + scores.reasoning + scores.clarity_structure + scores.confidence + scores.communication + scores.emotion) / 6);
          
          // Extract weaknesses from the analysis
          weaknesses = speechData.improvements || [];
        }
        
        // Store performance scores for final report
        setPerformanceScores(prev => [...prev, {
          question: currentQuestion,
          answer: previousAnswer,
          scores: scores,
          overallScore: overallScore * 10, // Convert back to percentage for display
          weaknesses: weaknesses
        }]);
      }
      
      // Check if we've reached the maximum number of questions (5)
      if (totalQuestionsAsked >= 5) {
        completeInterview();
        return;
      }
      
      // Log the data being sent to the adaptive questioning API
      console.log('Sending to adaptive API:', {
        previous_question: currentQuestion,
        user_answer: previousAnswer,
        scores: scores,
        weaknesses: weaknesses
      });
      
      // Now send the answer along with scores and weaknesses to generate adaptive question
      // Add timeout for adaptive question generation
      let adaptiveQuestionResponse = null;
      try {
        const adaptiveQuestionPromise = fetch('/api/generate-adaptive-question', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            previous_question: currentQuestion,
            user_answer: previousAnswer,
            scores: scores,
            weaknesses: weaknesses
          }),
        });
        
        // Race between the actual request and a 10-second timeout (increased timeout for better reliability)
        adaptiveQuestionResponse = await Promise.race([
          adaptiveQuestionPromise,
          timeout(10000).then(() => {
            throw new Error('Adaptive question generation timeout');
          })
        ]);
      } catch (error) {
        console.error('Adaptive question generation error or timeout:', error);
      }
      
      // Log the raw response
      if (adaptiveQuestionResponse) {
        console.log('Adaptive API response status:', adaptiveQuestionResponse.status);
      }
      
      if (adaptiveQuestionResponse && adaptiveQuestionResponse.ok) {
        const data = await adaptiveQuestionResponse.json();
        // Log the parsed response
        console.log('Adaptive API response data:', data);
        
        // Use the adaptive question from the backend
        if (data.next_question) {
          setCurrentQuestion(data.next_question);
        } else {
          // If no next_question in response, fallback to predefined questions
          console.warn('No next_question in adaptive response, falling back to predefined questions');
          fallbackToPredefinedQuestion(overallScore);
        }
      } else {
        // Log error response
        if (adaptiveQuestionResponse) {
          console.error('Adaptive API error response:', adaptiveQuestionResponse.status, adaptiveQuestionResponse.statusText);
          // Try to parse error response
          try {
            const errorData = await adaptiveQuestionResponse.json();
            console.error('Adaptive API error data:', errorData);
          } catch (e) {
            console.error('Could not parse error response');
          }
        } else {
          console.error('Adaptive API timeout or connection error');
        }
        // Fallback to next predefined question based on performance
        fallbackToPredefinedQuestion(overallScore);
      }
      
      // Increment question counters
      setQuestionIndex(prev => prev + 1);
      setTotalQuestionsAsked(prev => prev + 1);
      
      // Reset for next question
      setUserAnswer('');
      transcriptBufferRef.current = '';
      recordedChunksRef.current = []; // Clear recorded video chunks
      
      // Restart speech recognition for new question
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setTimeout(() => {
          // Don't automatically start recording - let user choose when to start
          // recognitionRef.current.start();
        }, 100);
      }
    } catch (error) {
      console.error('Error generating next question:', error);
      // Fallback to next predefined question
      const searchParams = new URLSearchParams(location.search);
      const domain = searchParams.get('domain') || 'general';
      const questions = domainQuestions[domain] || domainQuestions['general'];
      
      // Simple fallback - just pick next question in sequence
      const nextIndex = Math.min(totalQuestionsAsked, questions.length - 1);
      setCurrentQuestion(questions[nextIndex]);
      
      // Increment question counters
      setQuestionIndex(prev => prev + 1);
      setTotalQuestionsAsked(prev => prev + 1);
      
      setUserAnswer('');
      transcriptBufferRef.current = '';
      recordedChunksRef.current = []; // Clear recorded video chunks
      
      // Restart speech recognition for new question
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setTimeout(() => {
          // Don't automatically start recording - let user choose when to start
          // recognitionRef.current.start();
        }, 100);
      }
    } finally {
      setIsGeneratingNextQuestion(false);
    }
  };

  // Helper function for fallback to predefined questions
  const fallbackToPredefinedQuestion = (overallScore) => {
    const searchParams = new URLSearchParams(location.search);
    const domain = searchParams.get('domain') || 'general';
    const questions = domainQuestions[domain] || domainQuestions['general'];
    
    // Make sure we have questions
    if (!questions || questions.length === 0) {
      console.error('No questions available for domain:', domain);
      setCurrentQuestion("Please tell us about your experience and skills.");
      return;
    }
    
    // Filter out already used questions
    const availableQuestions = questions.filter(q => !usedQuestions.includes(q));
    
    // If all questions have been used, reset the used questions array
    if (availableQuestions.length === 0) {
      setUsedQuestions([]);
      availableQuestions.push(...questions);
    }
    
    // Select question based on performance
    let nextQuestion;
    if (overallScore >= 8) { // 80% on 1-10 scale
      // Strong performance - ask harder questions
      const hardQuestions = availableQuestions.filter((_, index) => index >= 3);
      nextQuestion = hardQuestions.length > 0 
        ? hardQuestions[Math.floor(Math.random() * hardQuestions.length)] 
        : availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    } else if (overallScore >= 6) { // 60% on 1-10 scale
      // Medium performance - ask medium difficulty questions
      const mediumQuestions = availableQuestions.filter((_, index) => index >= 1 && index <= 3);
      nextQuestion = mediumQuestions.length > 0 
        ? mediumQuestions[Math.floor(Math.random() * mediumQuestions.length)] 
        : availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    } else {
      // Weak performance - ask easier questions
      const easyQuestions = availableQuestions.filter((_, index) => index <= 1);
      nextQuestion = easyQuestions.length > 0 
        ? easyQuestions[Math.floor(Math.random() * easyQuestions.length)] 
        : availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    }
    
    // Fallback to any available question if selection failed
    if (!nextQuestion) {
      nextQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)] || 
                    questions[Math.floor(Math.random() * questions.length)] || 
                    "Please tell us about your experience and skills.";
    }
    
    // Add the selected question to used questions
    setUsedQuestions(prev => [...prev, nextQuestion]);
    
    setCurrentQuestion(nextQuestion);
  };

  // Complete the interview
  const completeInterview = () => {
    console.log('Completing interview');
    setIsRecording(false);
    setInterviewComplete(true);
    
    // Stop video feature capture
    stopFeatureCapture();
    
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Reset used questions for next interview
    setUsedQuestions([]);
  };

  // Handle next question
  const handleNextQuestion = () => {
    // Stop current recording and generate next question
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Send current answer to backend for analysis and get next question
    generateNextQuestion(userAnswer);
  };

  // Handle answer submission
  const handleSubmitAnswer = () => {
    console.log('Submit answer button clicked');
    // Stop current recording
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Stop video recording
    stopRecording();
    
    // Stop video feature capture
    stopFeatureCapture();
    
    // Set loading state before generating next question
    setIsGeneratingNextQuestion(true);
    
    // Small delay to ensure state update is visible
    setTimeout(() => {
      // Send current answer to backend for analysis and get next question
      generateNextQuestion(userAnswer);
    }, 100);
  };

  // Handle start answering button click
  const handleStartAnswering = () => {
    console.log('Start answering button clicked');
    console.log('Starting answer recording...');
    if (recognitionRef.current) {
      try {
        // Check if recognition is already running
        if (recognitionRef.current.state === 'listening' || recognitionRef.current.state === 'started' || recognitionRef.current.state === 'running') {
          console.log('Speech recognition already running');
          setIsRecording(true);
        } else {
          recognitionRef.current.start();
          setIsRecording(true);
          console.log('Speech recognition started for answering');
        }
      } catch (error) {
        console.error('Error starting speech recognition for answering:', error);
        // Fallback: show a message to the user
        alert('Could not start recording. Please ensure your microphone is enabled.');
      }
    } else {
      console.warn('Speech recognition not initialized');
      // Fallback: show a message to the user
      alert('Recording system not ready. Please try again.');
    }
  };

  // Handle start interview button click
  const handleStartInterview = () => {
    console.log('Start interview button clicked');
    // Reset any previous state
    setInterviewStarted(false);
    setCountdown(3);
    setIsRecording(false);
    setUserAnswer('');
    transcriptBufferRef.current = '';
    recordedChunksRef.current = [];
    setVideoWindows([]);
    
    // Initialize webcam after a short delay to ensure state is reset
    setTimeout(() => {
      initWebcam();
    }, 100);
  };

  // Cleanup on unmount
  useEffect(() => {
    console.log('EnhancedLiveInterviewPage component mounted');
    return () => {
      console.log('EnhancedLiveInterviewPage component unmounting');
      // Stop all media streams
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Stop video feature capture
      stopFeatureCapture();
      
      // Stop speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      // Clear intervals
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  // Exit fullscreen and go back to dashboard
  const exitInterview = async () => {
    console.log('Exit interview button clicked');
    // Stop recording
    setIsRecording(false);
    
    // Stop video feature capture
    stopFeatureCapture();
    
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Exit fullscreen if active
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      await document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      await document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      await document.msExitFullscreen();
    }
    
    navigate('/dashboard');
  };

  // Speak the current question using text-to-speech
  const speakQuestion = (question) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Create speech utterance
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.rate = 1.0; // Normal speed
      utterance.pitch = 1.0; // Normal pitch
      utterance.volume = 1.0; // Full volume
      
      // Set voice to a natural sounding voice if available
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(voice => 
        voice.lang.startsWith('en') && (voice.name.includes('Natural') || voice.name.includes('Premium'))
      ) || voices.find(voice => voice.lang.startsWith('en'));
      
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      
      // Set speaking state
      setIsSpeaking(true);
      
      // Handle speech events
      utterance.onend = () => {
        console.log('Finished speaking question');
        setIsSpeaking(false);
      };
      
      utterance.onerror = (event) => {
        console.error('Error speaking question:', event);
        setIsSpeaking(false);
      };
      
      // Speak the question
      window.speechSynthesis.speak(utterance);
      console.log('Speaking question:', question);
    } else {
      console.warn('Speech synthesis not supported in this browser');
    }
  };

  // Effect to speak question when it changes
  useEffect(() => {
    if (currentQuestion && interviewStarted && !isGeneratingNextQuestion && countdown <= 0) {
      // Small delay to ensure UI is updated
      const timer = setTimeout(() => {
        speakQuestion(currentQuestion);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentQuestion, interviewStarted, isGeneratingNextQuestion, countdown]);

  // Load voices when component mounts
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Load voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('Available voices:', voices.length);
      };
      
      // Chrome loads voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      
      // Load immediately if voices are already available
      if (window.speechSynthesis.getVoices().length > 0) {
        loadVoices();
      }
    }
  }, []);

  if (interviewComplete) {
    // Calculate average score
    const averageScore = performanceScores.length > 0 
      ? Math.round(performanceScores.reduce((sum, item) => sum + item.overallScore, 0) / performanceScores.length)
      : 0;
    
    // Determine performance level
    let performanceLevel = "Beginner";
    if (averageScore >= 80) {
      performanceLevel = "Expert";
    } else if (averageScore >= 60) {
      performanceLevel = "Intermediate";
    } else if (averageScore >= 40) {
      performanceLevel = "Novice";
    }
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-center">Interview Complete</h2>
          <p className="mb-6 text-center">Thank you for completing the interview. Here's your performance analysis:</p>
          
          {/* Performance Summary - Responsive Grid */}
          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h3 className="text-xl font-bold mb-4">Performance Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="text-3xl font-bold text-blue-600">{averageScore}%</div>
                <div className="text-gray-600">Average Score</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="text-3xl font-bold text-green-600">{performanceLevel}</div>
                <div className="text-gray-600">Performance Level</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="text-3xl font-bold text-purple-600">{performanceScores.length}</div>
                <div className="text-gray-600">Questions Answered</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="text-3xl font-bold text-orange-600">
                  {Math.round(performanceScores.reduce((acc, item) => acc + (item.scores.eye_contact || 0), 0) / performanceScores.length) || 'N/A'}
                </div>
                <div className="text-gray-600">Avg. Eye Contact</div>
              </div>
            </div>
          </div>
          
          {/* Detailed Performance - Responsive Layout */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4">Question-by-Question Analysis</h3>
            {performanceScores.map((item, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 mb-6">
                <div className="font-semibold text-lg mb-3">Q{index + 1}: {item.question.substring(0, 60)}...</div>
                
                {/* Responsive Score Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-bold text-lg">{item.scores.technical_accuracy || 'N/A'}</div>
                    <div className="text-xs text-gray-500">Technical</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-bold text-lg">{item.scores.reasoning || 'N/A'}</div>
                    <div className="text-xs text-gray-500">Reasoning</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-bold text-lg">{item.scores.clarity_structure || 'N/A'}</div>
                    <div className="text-xs text-gray-500">Clarity</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-bold text-lg">{item.scores.confidence || 'N/A'}</div>
                    <div className="text-xs text-gray-500">Confidence</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-bold text-lg">{item.scores.eye_contact || 'N/A'}</div>
                    <div className="text-xs text-gray-500">Eye Contact</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-bold text-lg">{item.scores.body_language || 'N/A'}</div>
                    <div className="text-xs text-gray-500">Body Lang.</div>
                  </div>
                </div>
                
                {/* Answer Preview - Collapsible */}
                <div className="mb-3">
                  <div className="font-medium mb-2">Your Answer:</div>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    {item.answer.substring(0, 150)}{item.answer.length > 150 ? '...' : ''}
                  </div>
                </div>
                
                {/* Weaknesses */}
                {item.weaknesses && item.weaknesses.length > 0 && (
                  <div>
                    <div className="font-medium mb-2">Areas for Improvement:</div>
                    <div className="flex flex-wrap gap-2">
                      {item.weaknesses.map((weakness, idx) => (
                        <span key={idx} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          {weakness}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Action Buttons - Responsive */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={exitInterview}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Return to Dashboard
            </button>
            <button
              onClick={() => {
                // Reset interview state
                setInterviewComplete(false);
                setQuestionIndex(0);
                setTotalQuestionsAsked(1);
                setPerformanceScores([]);
                setUserAnswer('');
                transcriptBufferRef.current = '';
                recordedChunksRef.current = [];
                setVideoWindows([]);
                setCurrentQuestion("Please introduce yourself and share your professional background.");
                // Restart interview
                initWebcam();
              }}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Take Another Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Video Feed Container */}
      <div className="w-full h-full bg-black relative">
        {/* Video Feed */}
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-full object-cover"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', opacity: 0.7, zIndex: 10 }}
          onError={(e) => console.error('Video error:', e)}
          onLoadedData={() => {
            console.log('Video loaded successfully');
          }}
          onLoadStart={() => console.log('Video load started')}
          onPlaying={() => console.log('Video is now playing')}
        />
        {/* Fallback background in case video doesn't load */}
        {!isWebcamActive && (
          <div className="absolute inset-0 bg-black z-0 flex items-center justify-center">
            <div className="text-white text-xl">Initializing camera...</div>
          </div>
        )}
      </div>
      
      {/* Overlay UI */}
      <div className="absolute inset-0 flex flex-col z-20">
        {/* Top bar with exit button */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-30">
          <div className="text-white text-lg font-bold">
            Live Interview
          </div>
          <button
            onClick={exitInterview}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-lg z-30 cursor-pointer active:scale-95 transform transition-transform duration-100"
          >
            Exit Interview
          </button>
        </div>
        
        {/* Main content area - empty space in the middle */}
        <div className="flex-1"></div>
        
        {/* Question display at the bottom */}
        <div className="p-4 pb-8 z-30">
          {interviewStarted ? (
            countdown > 0 ? (
              // Countdown display at bottom center
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{countdown}</div>
                <div className="text-lg text-white">Get ready...</div>
              </div>
            ) : isGeneratingNextQuestion ? (
              // Loading indicator for next question with translucent glass card style at bottom
              <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 max-w-md mx-auto text-center shadow-2xl">
                <div className="relative inline-block mb-4">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-500 border-b-transparent rounded-full animate-spin animate-reverse"></div>
                </div>
                <div className="mt-1 text-xl font-bold text-white">Analyzing your response...</div>
                <div className="mt-1 text-sm text-gray-200">Generating personalized question</div>
                <div className="mt-4 flex justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mx-1 animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full mx-1 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full mx-1 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            ) : (
              // Question display with answer controls at bottom
              <div className="max-w-4xl mx-auto">
                <div className="text-xl md:text-2xl font-bold text-white bg-black bg-opacity-50 p-4 rounded-xl mb-3 backdrop-blur-sm border border-white/20 shadow-lg">
                  Question: {currentQuestion || "Please introduce yourself and share your professional background."}
                  {/* Speaking indicator */}
                  {isSpeaking && (
                    <div className="mt-1 flex items-center text-blue-400 text-sm">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-1"></div>
                      <span>Reading question aloud...</span>
                    </div>
                  )}
                </div>
                
                {/* Recording controls */}
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  {!isRecording ? (
                    <button
                      onClick={handleStartAnswering}
                      className="px-5 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transform transition-transform duration-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                      </svg>
                      Start Answering
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitAnswer}
                      className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transform transition-transform duration-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Submit Answer
                    </button>
                  )}
                  
                  {/* Skip Question Button */}
                  <button
                    onClick={() => {
                      console.log('Skip question button clicked');
                      // Stop any ongoing recording
                      if (recognitionRef.current) {
                        recognitionRef.current.stop();
                      }
                      setIsRecording(false);
                      // Generate next question with empty answer
                      generateNextQuestion("");
                    }}
                    className="px-5 py-2.5 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transform transition-transform duration-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Skip Question
                  </button>
                </div>
                
                {/* Recording indicator */}
                {isRecording && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-red-500 font-semibold text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span>Recording - Speak your answer now</span>
                  </div>
                )}
                
                {/* Show user's current answer */}
                {userAnswer && (
                  <div className="mt-4 text-left">
                    <div className="text-white text-sm mb-1 font-semibold flex justify-between items-center">
                      <span>Your answer preview:</span>
                      <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">
                        {userAnswer.split(' ').length} words
                      </span>
                    </div>
                    <div className="text-white bg-black bg-opacity-30 p-3 rounded-lg text-left max-h-32 overflow-y-auto backdrop-blur-sm border border-white/20 shadow-lg text-sm">
                      {userAnswer}
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            // Start screen - centered in middle of screen
            <div className="absolute inset-0 flex items-center justify-center z-30">
              <div className="text-center bg-black bg-opacity-50 p-6 rounded-xl max-w-md backdrop-blur-sm border border-white/20 shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-4">Ready for Your Live Interview?</h2>
                <p className="text-lg text-white mb-6">Click below to start. You'll have a few seconds to prepare before the interview begins.</p>
                <button
                  onClick={handleStartInterview}
                  className="px-6 py-3 bg-blue-600 text-white text-lg font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg z-30 cursor-pointer active:scale-95 transform transition-transform duration-100"
                >
                  Start Live Interview
                </button>
                <p className="text-white mt-4 text-sm">
                  Note: Your webcam and microphone will be activated. 
                  Only the webcam feed and questions will be visible during the interview.
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute bottom-4 right-4 flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-1.5"></div>
            <span className="text-white font-semibold text-sm">Recording</span>
          </div>
        )}
        
        {/* Question counter */}
        <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/20 text-sm">
          Question {totalQuestionsAsked}/5
        </div>
      </div>
    </div>
  );
};

export default EnhancedLiveInterviewPage;