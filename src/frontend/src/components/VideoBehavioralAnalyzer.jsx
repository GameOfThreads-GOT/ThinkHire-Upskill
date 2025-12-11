import React, { useState, useEffect, useRef } from 'react';

const VideoBehavioralAnalyzer = ({ videoRef, onAnalysisUpdate }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [behavioralScores, setBehavioralScores] = useState({
    eyeContact: 0,
    headStability: 0,
    posture: 0,
    confidence: 0
  });
  const analysisIntervalRef = useRef(null);

  // Simulate behavioral analysis (in a real app, this would use the videoFeatures library)
  const analyzeBehavior = () => {
    // Generate realistic scores that vary over time
    const newScores = {
      eyeContact: Math.max(60, Math.min(100, behavioralScores.eyeContact + (Math.random() * 10 - 5))),
      headStability: Math.max(70, Math.min(100, behavioralScores.headStability + (Math.random() * 8 - 4))),
      posture: Math.max(65, Math.min(100, behavioralScores.posture + (Math.random() * 6 - 3))),
      confidence: Math.max(50, Math.min(100, behavioralScores.confidence + (Math.random() * 12 - 6)))
    };
    
    setBehavioralScores(newScores);
    
    // Pass data to parent component
    if (onAnalysisUpdate) {
      onAnalysisUpdate(newScores);
    }
  };

  // Start behavioral analysis
  const startAnalysis = () => {
    if (!isAnalyzing) {
      setIsAnalyzing(true);
      // Analyze every 2 seconds
      analysisIntervalRef.current = setInterval(analyzeBehavior, 2000);
    }
  };

  // Stop behavioral analysis
  const stopAnalysis = () => {
    setIsAnalyzing(false);
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAnalysis();
    };
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-lg">Behavioral Analysis</h3>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${isAnalyzing ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-sm">{isAnalyzing ? 'Analyzing' : 'Stopped'}</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Eye Contact</span>
            <span>{Math.round(behavioralScores.eyeContact)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ width: `${behavioralScores.eyeContact}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Head Stability</span>
            <span>{Math.round(behavioralScores.headStability)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${behavioralScores.headStability}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Posture</span>
            <span>{Math.round(behavioralScores.posture)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full" 
              style={{ width: `${behavioralScores.posture}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Confidence</span>
            <span>{Math.round(behavioralScores.confidence)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full" 
              style={{ width: `${behavioralScores.confidence}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex gap-2">
        {!isAnalyzing ? (
          <button
            onClick={startAnalysis}
            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            Start Analysis
          </button>
        ) : (
          <button
            onClick={stopAnalysis}
            className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Stop Analysis
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoBehavioralAnalyzer;