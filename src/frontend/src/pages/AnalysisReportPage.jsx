import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import StatisticsSection from '../components/StatisticsSection';
import SessionAnalysis from '../components/SessionAnalysis';
import authService from '../services/authService';

const AnalysisReportPage = () => {
  const [interviewResults, setInterviewResults] = useState(null);
  const [sessionScores, setSessionScores] = useState([]);

  useEffect(() => {
    // Retrieve session scores from localStorage
    const savedScores = authService.getSessionScores();
    setSessionScores(savedScores);

    // Retrieve interview results from localStorage
    const storedResults = localStorage.getItem('interviewResults');
    if (storedResults) {
      try {
        const results = JSON.parse(storedResults);
        setInterviewResults(results);
        
        // Add this interview to session scores
        const newScore = {
          id: savedScores.length + 1,
          score: Math.round(results.overallScore),
          date: new Date().toISOString().split('T')[0],
          timestamp: new Date().toISOString()
        };
        
        const updatedScores = [...savedScores, newScore];
        setSessionScores(updatedScores);
        
        // Save updated scores to localStorage
        authService.saveSessionScores(updatedScores);
      } catch (error) {
        console.error('Error parsing interview results:', error);
      }
    }
  }, []);

  const handleResetScores = () => {
    setSessionScores([]);
    authService.clearSessionScores();
  };

  // If we have interview results, show detailed analysis
  if (interviewResults) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--xai-bg-primary)] text-[var(--xai-text-primary)] transition-colors duration-300">
        <Header title="Interview Analysis Report" />
        
        <main className="flex-1 p-8 max-w-[1400px] mx-auto w-full">
          {/* Interview Summary */}
          <div className="mb-8 bg-[var(--xai-bg-secondary)]/60 backdrop-blur-sm p-8 rounded-2xl border border-[var(--xai-border)] transition-all duration-300">
            <h2 className="text-3xl mb-2 text-[var(--xai-text-primary)] font-bold">Interview Completed</h2>
            <p className="text-[var(--xai-text-secondary)] mb-4">Domain: {interviewResults.domain.toUpperCase()} | Questions: {interviewResults.totalQuestions}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-[var(--xai-bg-tertiary)] p-6 rounded-xl text-center">
                <h3 className="text-lg font-semibold text-[var(--xai-text-primary)] mb-2">Overall Score</h3>
                <div className="text-5xl font-bold text-[var(--xai-text-primary)]">{Math.round(interviewResults.overallScore)}</div>
                <div className="text-[var(--xai-text-secondary)]">out of 100</div>
              </div>
              
              <div className="bg-[var(--xai-bg-tertiary)] p-6 rounded-xl text-center">
                <h3 className="text-lg font-semibold text-[var(--xai-text-primary)] mb-2">Questions Answered</h3>
                <div className="text-5xl font-bold text-[var(--xai-text-primary)]">{interviewResults.questionScores.length}</div>
                <div className="text-[var(--xai-text-secondary)]">out of {interviewResults.totalQuestions}</div>
              </div>
              
              <div className="bg-[var(--xai-bg-tertiary)] p-6 rounded-xl text-center">
                <h3 className="text-lg font-semibold text-[var(--xai-text-primary)] mb-2">Performance</h3>
                <div className="text-5xl font-bold text-[var(--xai-text-primary)]">
                  {interviewResults.overallScore >= 80 ? 'Excellent' : 
                   interviewResults.overallScore >= 60 ? 'Good' : 
                   interviewResults.overallScore >= 40 ? 'Fair' : 'Needs Work'}
                </div>
                <div className="text-[var(--xai-text-secondary)]">Keep practicing!</div>
              </div>
            </div>
          </div>
          
          {/* Question-by-Question Analysis */}
          <div className="mb-8 bg-[var(--xai-bg-secondary)]/60 backdrop-blur-sm p-8 rounded-2xl border border-[var(--xai-border)] transition-all duration-300">
            <h3 className="text-2xl mb-6 text-[var(--xai-text-primary)] font-bold">Detailed Question Analysis</h3>
            
            <div className="space-y-6">
              {interviewResults.questionScores.map((q, index) => (
                <div key={index} className="bg-[var(--xai-bg-tertiary)] p-6 rounded-xl border border-[var(--xai-border)]">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-semibold text-[var(--xai-text-primary)]">Q{index + 1}: {q.question}</h4>
                    <span className="text-2xl font-bold text-[var(--xai-text-primary)]">{Math.round(q.score)}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                    <div 
                      className="bg-blue-600 h-4 rounded-full" 
                      style={{ width: `${q.score}%` }}
                    ></div>
                  </div>
                  
                  {/* Detailed metrics for each question */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    <div className="bg-[var(--xai-bg-secondary)] p-4 rounded-lg">
                      <h5 className="font-semibold text-[var(--xai-text-primary)] mb-2">Technical Accuracy</h5>
                      <div className="text-2xl font-bold text-blue-500">{q.analysis.technical_accuracy}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${q.analysis.technical_accuracy}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="bg-[var(--xai-bg-secondary)] p-4 rounded-lg">
                      <h5 className="font-semibold text-[var(--xai-text-primary)] mb-2">Clarity & Structure</h5>
                      <div className="text-2xl font-bold text-green-500">{q.analysis.clarity_structure}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${q.analysis.clarity_structure}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="bg-[var(--xai-bg-secondary)] p-4 rounded-lg">
                      <h5 className="font-semibold text-[var(--xai-text-primary)] mb-2">Depth of Knowledge</h5>
                      <div className="text-2xl font-bold text-purple-500">{q.analysis.depth_of_knowledge}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${q.analysis.depth_of_knowledge}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="bg-[var(--xai-bg-secondary)] p-4 rounded-lg">
                      <h5 className="font-semibold text-[var(--xai-text-primary)] mb-2">Communication</h5>
                      <div className="text-2xl font-bold text-yellow-500">{q.analysis.communication}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${q.analysis.communication}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Feedback */}
                  <div className="mt-6">
                    <h5 className="font-semibold text-[var(--xai-text-primary)] mb-2">Feedback</h5>
                    <p className="text-[var(--xai-text-secondary)] italic">"{q.analysis.feedback}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 justify-center">
            <Link 
              to="/dashboard" 
              className="px-6 py-3 bg-gradient-to-r from-[var(--xai-primary)] to-[var(--xai-secondary)] text-white rounded-xl font-semibold hover:from-[var(--xai-secondary)] hover:to-[var(--xai-primary)] hover:scale-105 shadow-lg hover:shadow-2xl transition-all active:scale-95 no-underline"
            >
              Back to Dashboard
            </Link>
            <Link 
              to="/live-interview" 
              className="px-6 py-3 bg-[var(--xai-bg-tertiary)] text-[var(--xai-text-primary)] border-2 border-[var(--xai-border)] rounded-xl font-semibold hover:border-[var(--xai-primary)] hover:bg-[var(--xai-border)] hover:scale-105 shadow-lg hover:shadow-2xl transition-all active:scale-95 no-underline"
            >
              Take Another Interview
            </Link>
          </div>
        </main>
        
        <footer className="text-center p-6 bg-[var(--xai-bg-secondary)] border-t border-[var(--xai-border)] mt-auto">
          <p className="text-[var(--xai-text-secondary)]">&copy; 2025 ThinkHire. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  // Fallback to original mock data view if no interview results
  return (
    <div className="min-h-screen flex flex-col bg-[var(--xai-bg-primary)] text-[var(--xai-text-primary)] transition-colors duration-300">
      <Header title="Analysis Report" />
      
      <main className="flex-1 p-8 max-w-[1400px] mx-auto w-full">
        {/* Welcome Section */}
        <div className="mb-8 bg-[var(--xai-bg-secondary)]/60 backdrop-blur-sm p-8 rounded-2xl border border-[var(--xai-border)] transition-all duration-300">
          <h2 className="text-3xl mb-2 text-[var(--xai-text-primary)] font-bold">Your Progress Report</h2>
          <p className="text-[var(--xai-text-secondary)] mb-4">Track your interview preparation journey and see how you're improving over time.</p>
        </div>
        
        {/* Statistics Section */}
        <StatisticsSection sessionScores={sessionScores} />
        
        {/* Session Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <SessionAnalysis sessionScores={sessionScores} onReset={handleResetScores} />
          
          {/* Additional Analysis Card */}
          <div className="bg-[var(--xai-bg-secondary)]/60 backdrop-blur-sm p-6 rounded-2xl border border-[var(--xai-border)] transition-all duration-300">
            <h3 className="text-xl mb-2 text-[var(--xai-text-primary)] font-bold">Performance Trends</h3>
            <p className="text-[var(--xai-text-secondary)] mb-4">Your scores are improving consistently over the past weeks.</p>
            
            {/* Mock trend visualization */}
            <div className="flex items-end justify-between h-32 mt-6">
              {[65, 70, 75, 80, 85, 82, 88].map((score, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="w-8 bg-gradient-to-t from-[var(--xai-text-primary)] to-[var(--xai-highlight)] rounded-t-lg"
                    style={{ height: `${score}%` }}
                  ></div>
                  <span className="text-xs mt-2 text-[var(--xai-text-secondary)]">{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Detailed Performance Breakdown */}
        <div className="bg-[var(--xai-bg-secondary)]/60 backdrop-blur-sm p-8 rounded-2xl border border-[var(--xai-border)] transition-all duration-300">
          <h3 className="text-2xl mb-6 text-[var(--xai-text-primary)] font-bold">Detailed Performance Breakdown</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Technical Skills */}
            <div className="bg-[var(--xai-bg-tertiary)]/60 p-6 rounded-xl border border-[var(--xai-border)]">
              <h4 className="text-lg font-bold text-[var(--xai-text-primary)] mb-3">Technical Skills</h4>
              <div className="text-3xl font-bold text-[var(--xai-text-primary)] mb-2">85%</div>
              <p className="text-sm text-[var(--xai-text-secondary)]">Above average performance in technical domains</p>
              <div className="mt-4 w-full bg-[var(--xai-border)] rounded-full h-2">
                <div className="bg-[var(--xai-text-primary)] h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            
            {/* Communication */}
            <div className="bg-[var(--xai-bg-tertiary)]/60 p-6 rounded-xl border border-[var(--xai-border)]">
              <h4 className="text-lg font-bold text-[var(--xai-text-primary)] mb-3">Communication</h4>
              <div className="text-3xl font-bold text-[var(--xai-text-primary)] mb-2">78%</div>
              <p className="text-sm text-[var(--xai-text-secondary)]">Clear and structured responses</p>
              <div className="mt-4 w-full bg-[var(--xai-border)] rounded-full h-2">
                <div className="bg-[var(--xai-text-primary)] h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            
            {/* Problem Solving */}
            <div className="bg-[var(--xai-bg-tertiary)]/60 p-6 rounded-xl border border-[var(--xai-border)]">
              <h4 className="text-lg font-bold text-[var(--xai-text-primary)] mb-3">Problem Solving</h4>
              <div className="text-3xl font-bold text-[var(--xai-text-primary)] mb-2">82%</div>
              <p className="text-sm text-[var(--xai-text-secondary)]">Effective approach to complex questions</p>
              <div className="mt-4 w-full bg-[var(--xai-border)] rounded-full h-2">
                <div className="bg-[var(--xai-text-primary)] h-2 rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>
            
            {/* Confidence */}
            <div className="bg-[var(--xai-bg-tertiary)]/60 p-6 rounded-xl border border-[var(--xai-border)]">
              <h4 className="text-lg font-bold text-[var(--xai-text-primary)] mb-3">Confidence</h4>
              <div className="text-3xl font-bold text-[var(--xai-text-primary)] mb-2">75%</div>
              <p className="text-sm text-[var(--xai-text-secondary)]">Demonstrated self-assurance in responses</p>
              <div className="mt-4 w-full bg-[var(--xai-border)] rounded-full h-2">
                <div className="bg-[var(--xai-text-primary)] h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalysisReportPage;