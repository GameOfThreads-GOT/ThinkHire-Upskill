import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import logo from '../assets/thinkhire-logo.svg';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--xai-bg-primary)] font-['Inter','SF_Pro','Segoe_UI',system-ui,sans-serif] text-[var(--xai-text-primary)] transition-colors duration-300">
      <header className="bg-[var(--xai-bg-secondary)]/80 backdrop-blur-md text-[var(--xai-text-primary)] px-8 py-4 flex justify-between items-center border-b border-[var(--xai-border)] sticky top-0 z-[100]">
        <div className="flex items-center gap-3 group">
          <img src={logo} alt="ThinkHire Logo" className="h-10 w-10 transition-transform duration-300 group-hover:scale-110" />
          <h1 className="m-0 text-[1.75rem] text-[var(--xai-text-primary)] font-bold">ThinkHire</h1>
        </div>
        <nav className="flex gap-8">
          <a href="#features" className="text-[var(--xai-text-secondary)] no-underline font-medium transition-all duration-300 hover:text-[var(--xai-text-primary)] hover:scale-105">Features</a>
          <Link to="/how-it-works" className="text-[var(--xai-text-secondary)] no-underline font-medium transition-all duration-300 hover:text-[var(--xai-text-primary)] hover:scale-105">How It Works</Link>
          <Link to="/explore" className="text-[var(--xai-text-secondary)] no-underline font-medium transition-all duration-300 hover:text-[var(--xai-text-primary)] hover:scale-105">Explore</Link>
          <Link to="/jobs" className="text-[var(--xai-text-secondary)] no-underline font-medium transition-all duration-300 hover:text-[var(--xai-text-primary)] hover:scale-105">Job Openings</Link>
          <a href="#testimonials" className="text-[var(--xai-text-secondary)] no-underline font-medium transition-all duration-300 hover:text-[var(--xai-text-primary)] hover:scale-105">Testimonials</a>
        </nav>
        <div className="flex gap-4 items-center">
          <ThemeToggle />
          <Link to="/login" className="px-6 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 bg-[var(--xai-bg-tertiary)] text-[var(--xai-text-primary)] border border-[var(--xai-border)] hover:border-[var(--xai-text-primary)] hover:scale-105">Log in</Link>
          <Link to="/signup" className="px-6 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-300 bg-[var(--xai-text-primary)] text-[var(--xai-bg-primary)] hover:bg-[var(--xai-text-secondary)] hover:scale-105">Sign up</Link>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-[1200px] mx-auto w-full">
        {/* Hero Section */}
        <section className="text-center px-8 py-20 mb-12 bg-[var(--xai-bg-secondary)] rounded-xl border border-[var(--xai-border)] relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-5xl mb-6 text-[var(--xai-text-primary)] font-bold">Master Your Next Interview With AI</h2>
            <p className="text-xl text-[var(--xai-text-secondary)] max-w-[700px] mx-auto mb-8 leading-relaxed">
              Get real practice with video and text-based mock interviews that help you improve your skills and boost your confidence.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/signup" className="px-8 py-3.5 rounded-lg text-base font-medium cursor-pointer transition-all duration-300 bg-[var(--xai-text-primary)] text-[var(--xai-bg-primary)] hover:bg-[var(--xai-text-secondary)] hover:scale-105">Start Practicing Now</Link>
              <Link to="/how-it-works" className="px-8 py-3.5 rounded-lg text-base font-medium cursor-pointer transition-all duration-300 bg-transparent text-[var(--xai-text-primary)] border border-[var(--xai-border)] hover:border-[var(--xai-text-primary)] hover:scale-105">Learn More</Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12" id="features">
          <h2 className="text-center text-4xl mb-4 text-[var(--xai-text-primary)] font-bold">Why This Platform Works</h2>
          <p className="text-center text-lg text-[var(--xai-text-secondary)] max-w-[700px] mx-auto mb-12">
            Stop guessing what interviewers want. Practice with real simulations, real feedback, and real improvements.
          </p>
          
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
            <div className="bg-[var(--xai-bg-secondary)] rounded-xl p-6 border border-[var(--xai-border)] transition-all duration-200 hover:border-[var(--xai-border-light)]">
              <h3 className="mt-0 text-[var(--xai-text-primary)] text-xl font-bold mb-3">Realistic Video Interview Practice</h3>
              <p className="text-[var(--xai-text-secondary)] leading-relaxed">
                Step into a lifelike interview experience that helps you practice speaking clearly, maintaining eye contact, and presenting yourself confidently.
              </p>
            </div>
            
            <div className="bg-[var(--xai-bg-secondary)] rounded-xl p-6 border border-[var(--xai-border)] transition-all duration-200 hover:border-[var(--xai-border-light)]">
              <h3 className="mt-0 text-[var(--xai-text-primary)] text-xl font-bold mb-3">Knowledge Check to Test Your Readiness</h3>
              <p className="text-[var(--xai-text-secondary)] leading-relaxed">
                Unsure if your preparation is enough?
                Answer domain-specific questions and evaluate the accuracy, depth, and clarity of your responses — so you instantly know where you stand.
              </p>
            </div>
            
            <div className="bg-[var(--xai-bg-secondary)] rounded-xl p-6 border border-[var(--xai-border)] transition-all duration-200 hover:border-[var(--xai-border-light)]">
              <h3 className="mt-0 text-[var(--xai-text-primary)] text-xl font-bold mb-3">Communication Skills Assessment</h3>
              <p className="text-[var(--xai-text-secondary)] leading-relaxed">
                Your performance isn't judged only on answers — it's judged on how you deliver them.
                We help you measure your communication style, logical thinking, and confidence level to paint a complete picture of your interview ability.
              </p>
            </div>
            
            <div className="bg-[var(--xai-bg-secondary)] rounded-xl p-6 border border-[var(--xai-border)] transition-all duration-200 hover:border-[var(--xai-border-light)]">
              <h3 className="mt-0 text-[var(--xai-text-primary)] text-xl font-bold mb-3">Detailed Performance Insights</h3>
              <div>
                <p className="text-[var(--xai-text-secondary)] mb-3">Your results are turned into clean, powerful analytics:</p>
                <ul className="list-none pl-0 mt-4 space-y-2">
                  <li className="text-[var(--xai-text-secondary)] leading-relaxed flex items-center gap-2"><span className="text-[var(--xai-text-primary)]">•</span> Strengths & weaknesses</li>
                  <li className="text-[var(--xai-text-secondary)] leading-relaxed flex items-center gap-2"><span className="text-[var(--xai-text-primary)]">•</span> Communication patterns</li>
                  <li className="text-[var(--xai-text-secondary)] leading-relaxed flex items-center gap-2"><span className="text-[var(--xai-text-primary)]">•</span> Response quality</li>
                  <li className="text-[var(--xai-text-secondary)] leading-relaxed flex items-center gap-2"><span className="text-[var(--xai-text-primary)]">•</span> Confidence indicators</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-[var(--xai-bg-secondary)] rounded-xl p-6 border border-[var(--xai-border)] transition-all duration-200 hover:border-[var(--xai-border-light)]">
              <h3 className="mt-0 text-[var(--xai-text-primary)] text-xl font-bold mb-3">AI-Powered Interview Practice</h3>
              <p className="text-[var(--xai-text-secondary)] leading-relaxed">
                Practice with our AI interviewer that adapts to your skill level and asks follow-up questions in real-time — just like a real technical interview.
              </p>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--xai-text-primary)] rounded-full blur-3xl opacity-20"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[var(--xai-highlight)] rounded-full blur-3xl opacity-20"></div>
          </div>
          
          <div className="relative z-10 max-w-3xl mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--xai-text-primary)]">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="text-xl mb-10 text-[var(--xai-text-secondary)] max-w-2xl mx-auto">
              Join thousands of professionals who have improved their interview skills with ThinkHire's AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/signup" 
                className="px-8 py-4 bg-[var(--xai-text-primary)] text-[var(--xai-bg-primary)] rounded-xl font-bold text-lg hover:opacity-90 transition-all duration-200 no-underline text-center"
              >
                Get Started Free
              </Link>
              <Link 
                to="/login" 
                className="px-8 py-4 bg-transparent text-[var(--xai-text-primary)] border border-[var(--xai-border)] rounded-xl font-bold text-lg hover:border-[var(--xai-border-light)] transition-all duration-200 no-underline text-center"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="text-center p-8 bg-[var(--xai-bg-secondary)] border-t border-[var(--xai-border)]">
        <p className="text-[var(--xai-text-secondary)]">&copy; 2025 ThinkHire. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;