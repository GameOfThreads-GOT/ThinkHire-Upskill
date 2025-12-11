import React, { useState, useRef, useEffect } from 'react';
import { startFeatureCapture, stopFeatureCapture } from '../lib/videoFeatures';

const VideoAnalysisDemo = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [videoWindows, setVideoWindows] = useState([]);
  const [analysisResults, setAnalysisResults] = useState([]);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize webcam
  const initWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 640 }, height: { ideal: 480 } }, 
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        // Start playing the video
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
      alert('Could not access webcam. Please check permissions.');
    }
  };

  // Start feature capture
  const startCapture = async () => {
    if (!videoRef.current) {
      await initWebcam();
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      setIsCapturing(true);
      
      // Start feature capture with a callback for window results
      startFeatureCapture(videoRef.current, (windowData) => {
        console.log('Received video window data:', windowData);
        setVideoWindows(prev => [...prev, windowData]);
        
        // Send to backend for analysis
        analyzeVideoWindow(windowData);
      }, 3000, 1000); // 3-second windows, 1-second steps
    }
  };

  // Analyze video window data by sending to backend
  const analyzeVideoWindow = async (windowData) => {
    try {
      // In a real implementation, you would send this to your backend
      // For demo purposes, we'll just simulate a response
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create simulated analysis results
      const simulatedResult = {
        window_start: windowData.window_start,
        window_end: windowData.window_end,
        eye_contact_score: Math.floor(Math.random() * 40) + 60, // 60-100
        head_stability_score: Math.floor(Math.random() * 30) + 70, // 70-100
        posture_score: Math.floor(Math.random() * 35) + 65, // 65-100
        confidence_score: Math.floor(Math.random() * 40) + 60, // 60-100
        notes: "Simulated analysis result"
      };
      
      setAnalysisResults(prev => [...prev, simulatedResult]);
      
      // In a real implementation, you would do something like this:
      /*
      const response = await fetch('/api/video-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(windowData),
      });
      
      if (response.ok) {
        const result = await response.json();
        setAnalysisResults(prev => [...prev, result]);
      }
      */
    } catch (error) {
      console.error('Error analyzing video window:', error);
    }
  };

  // Stop feature capture
  const stopCapture = () => {
    setIsCapturing(false);
    stopFeatureCapture();
    
    // Stop all media streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCapture();
    };
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Video Analysis Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Video Feed */}
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-auto"
            style={{ minHeight: '240px' }}
          />
          
          <div className="p-4">
            <div className="flex gap-3">
              {!isCapturing ? (
                <button
                  onClick={startCapture}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Start Capture
                </button>
              ) : (
                <button
                  onClick={stopCapture}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Stop Capture
                </button>
              )}
              
              <button
                onClick={initWebcam}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Init Webcam
              </button>
            </div>
            
            <div className="mt-3 text-sm text-gray-300">
              Status: {isCapturing ? 'Capturing features...' : 'Not capturing'}
            </div>
          </div>
        </div>
        
        {/* Analysis Results */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
          
          {analysisResults.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              No analysis results yet. Start capture to begin.
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {[...analysisResults].reverse().map((result, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4">
                  <div className="font-medium mb-2">
                    Window: {new Date(result.window_start).toLocaleTimeString()} - {new Date(result.window_end).toLocaleTimeString()}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Eye Contact:</span>
                      <span className={result.eye_contact_score > 80 ? 'text-green-400' : result.eye_contact_score > 60 ? 'text-yellow-400' : 'text-red-400'}>
                        {result.eye_contact_score}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Head Stability:</span>
                      <span className={result.head_stability_score > 80 ? 'text-green-400' : result.head_stability_score > 60 ? 'text-yellow-400' : 'text-red-400'}>
                        {result.head_stability_score}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Posture:</span>
                      <span className={result.posture_score > 80 ? 'text-green-400' : result.posture_score > 60 ? 'text-yellow-400' : 'text-red-400'}>
                        {result.posture_score}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Confidence:</span>
                      <span className={result.confidence_score > 80 ? 'text-green-400' : result.confidence_score > 60 ? 'text-yellow-400' : 'text-red-400'}>
                        {result.confidence_score}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-300">
                    {result.notes}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Raw Data Display */}
      <div className="mt-6 bg-gray-800 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Raw Feature Windows</h2>
        
        {videoWindows.length === 0 ? (
          <div className="text-gray-400 text-center py-4">
            No feature windows captured yet.
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto">
            <pre className="text-xs text-gray-300 bg-gray-900 p-3 rounded">
              {JSON.stringify([...videoWindows].slice(-3), null, 2)}
            </pre>
            <div className="mt-2 text-sm text-gray-400">
              Showing last 3 windows. Total windows captured: {videoWindows.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoAnalysisDemo;