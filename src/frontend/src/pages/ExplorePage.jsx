import { Link } from 'react-router-dom';
import Header from '../components/Header';

const ExplorePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--xai-bg-primary)] text-[var(--xai-text-primary)] transition-colors duration-300">
      <Header title="Explore Opportunities" />
      
      <main className="flex-1 p-4 md:p-8 max-w-[1400px] mx-auto w-full">
        <div className="mb-8 bg-[var(--xai-bg-secondary)]/60 backdrop-blur-sm p-6 rounded-2xl border border-[var(--xai-border)] transition-all duration-300">
          <h2 className="text-3xl mb-2 text-[var(--xai-text-primary)] font-bold">Explore Career Opportunities</h2>
          <p className="text-[var(--xai-text-secondary)] mb-4">Discover jobs and internships to advance your career</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {/* Jobs Card */}
            <Link to="/jobs" className="bg-[var(--xai-bg-tertiary)]/80 backdrop-blur-sm p-8 rounded-xl border border-[var(--xai-border)] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl no-underline">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--xai-text-primary)]/10 flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-[var(--xai-text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-[var(--xai-text-primary)] mb-3">Job Openings</h3>
                <p className="text-[var(--xai-text-secondary)] mb-4">
                  Browse thousands of job opportunities from top companies in various fields and locations.
                </p>
                <div className="mt-4 px-6 py-2 bg-[var(--xai-primary)] text-[var(--xai-text-primary)] rounded-lg font-semibold hover:bg-[var(--xai-bg-tertiary)] transition-colors border border-[var(--xai-border)]">
                  Explore Jobs
                </div>
              </div>
            </Link>
            
            {/* Internships Card */}
            <Link to="/internships" className="bg-[var(--xai-bg-tertiary)]/80 backdrop-blur-sm p-8 rounded-xl border border-[var(--xai-border)] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl no-underline">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--xai-highlight)]/10 flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-[var(--xai-highlight)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-[var(--xai-text-primary)] mb-3">Internships</h3>
                <p className="text-[var(--xai-text-secondary)] mb-4">
                  Find remote internship opportunities to gain valuable experience and kickstart your career.
                </p>
                <div className="mt-4 px-6 py-2 bg-[var(--xai-primary)] text-[var(--xai-text-primary)] rounded-lg font-semibold hover:bg-[var(--xai-bg-tertiary)] transition-colors border border-[var(--xai-border)]">
                  Explore Internships
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExplorePage;