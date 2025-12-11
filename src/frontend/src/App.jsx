import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import HowItWorksPage from './pages/HowItWorksPage';
import AnalysisPage from './pages/AnalysisPage';
import JobOpeningsPage from './pages/JobOpeningsPage';
import ExplorePage from './pages/ExplorePage';
import InternshipsPage from './pages/InternshipsPage';
import GroupDiscussionPage from './pages/GroupDiscussionPage';
import AnalysisReportPage from './pages/AnalysisReportPage';
import LiveInterviewPage from './pages/LiveInterviewPage';
import EnhancedLiveInterviewAnalysisPage from './pages/EnhancedLiveInterviewAnalysisPage';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/analysis-report" element={<AnalysisReportPage />} />
        <Route path="/jobs" element={<JobOpeningsPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/internships" element={<InternshipsPage />} />
        <Route path="/group-discussion" element={<GroupDiscussionPage />} />
        <Route path="/live-interview" element={<LiveInterviewPage />} />
        <Route path="/enhanced-live-analysis" element={<EnhancedLiveInterviewAnalysisPage />} />
        {/* Catch-all route for debugging */}
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </div>
  );
}

export default App;