import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import StartInterview from '../components/StartInterview';
import KnowledgeCheck from '../components/KnowledgeCheck';
import PracticeCalendar from '../components/PracticeCalendar';
import authService from '../services/authService';

const Dashboard = () => {
  const [sessionScores, setSessionScores] = useState([]);

  useEffect(() => {
    // Retrieve session scores from localStorage
    const savedScores = authService.getSessionScores();
    setSessionScores(savedScores);
  }, []);

  const handleResetScores = () => {
    setSessionScores([]);
    authService.clearSessionScores();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--xai-bg-primary)] text-[var(--xai-text-primary)] transition-colors duration-300">
      <Header title="Mock Interview Dashboard" />
      
      <main className="flex-1 p-8 max-w-[1400px] mx-auto w-full">
        {/* Welcome Section */}
        <div className="mb-8 bg-[var(--xai-bg-secondary)] p-8 rounded-xl border border-[var(--xai-border)] transition-all duration-200 hover:border-[var(--xai-border-light)] text-center">
          <h2 className="text-3xl mb-2 text-[var(--xai-text-primary)] font-bold">Welcome back!</h2>
          <p className="text-[var(--xai-text-secondary)] mb-6 max-w-2xl mx-auto">Ready to improve your interview skills today? Track your progress and practice with our AI-powered tools.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/analysis-report" className="px-6 py-3 bg-[var(--xai-text-primary)] text-[var(--xai-bg-primary)] rounded-lg font-medium hover:opacity-90 transition-all active:scale-95 no-underline">
              View Analysis Reports
            </Link>
            <Link to="/how-it-works" className="px-6 py-3 bg-transparent text-[var(--xai-text-primary)] border border-[var(--xai-border)] rounded-lg font-medium hover:border-[var(--xai-border-light)] transition-all active:scale-95 no-underline">
              How It Works
            </Link>
          </div>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* Interview and Knowledge Check */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StartInterview />
            <KnowledgeCheck />
          </div>
          
          {/* Group Discussion Practice and Practice Days */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[var(--xai-bg-secondary)] p-6 rounded-xl border border-[var(--xai-border)] transition-all duration-200 hover:border-[var(--xai-border-light)]">
              <h3 className="text-xl font-bold text-[var(--xai-text-primary)] mb-4">Group Discussion Practice</h3>
              <p className="text-[var(--xai-text-secondary)] mb-4">Practice collaborative problem-solving in simulated group settings.</p>
              <Link to="/group-discussion" className="inline-block px-4 py-2 bg-[var(--xai-primary)] text-[var(--xai-text-primary)] border border-[var(--xai-border)] rounded-lg font-medium hover:bg-[var(--xai-bg-tertiary)] transition-all no-underline">
                Start Practice
              </Link>
            </div>
            
            <PracticeCalendar sessionScores={sessionScores} />
          </div>
        </div>
      </main>
      
      <footer className="text-center p-6 bg-[var(--xai-bg-secondary)] border-t border-[var(--xai-border)] mt-auto">
        <p className="text-[var(--xai-text-secondary)]">&copy; 2025 ThinkHire. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;