import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import authService from '../services/authService';
import ResumeGenerator from '../components/ResumeGenerator';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state
  const [showResumeGenerator, setShowResumeGenerator] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('signup-page');
    return () => {
      document.body.classList.remove('signup-page');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Set loading to true when starting signup

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/user/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail);
        setLoading(false);
        return;
      }

      console.log("Signup successful:", data);

      // Save user data
      authService.saveUser({ name, email });

      // Show resume generator instead of redirecting immediately
      setShowResumeGenerator(true);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  const handleResumeGenerated = (resumeData) => {
    // Save resume data to localStorage or send to backend
    authService.saveUser({ name, email, resume: resumeData });
    navigate("/dashboard");
  };

  if (showResumeGenerator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--xai-bg-primary)] p-4 relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-96 h-96 bg-[var(--xai-text-primary)] rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-[var(--xai-highlight)] rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="absolute top-6 right-6 z-50">
          <ThemeToggle />
        </div>

        <ResumeGenerator 
          onResumeGenerated={handleResumeGenerated}
          userDetails={{ name, email }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--xai-bg-primary)] p-4 relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-20 w-96 h-96 bg-[var(--xai-text-primary)] rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[var(--xai-highlight)] rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="bg-[var(--xai-bg-secondary)]/80 backdrop-blur-md p-10 rounded-2xl border border-[var(--xai-border)] w-full max-w-md relative z-10">
        <Link to="/" className="absolute top-4 left-4 text-[var(--xai-text-secondary)] hover:text-[var(--xai-text-primary)] transition-all duration-300 flex items-center gap-2 group">
          <svg className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
        
        <div className="flex justify-center mb-8 mt-8">
          <div className="bg-[var(--xai-primary)] p-3 rounded-xl">
            <svg className="w-12 h-12 text-[var(--xai-text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-4xl mb-8 text-center text-[var(--xai-text-primary)] font-extrabold mt-8">Create Account</h2>
        
        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block mb-2 font-semibold text-[var(--xai-text-primary)] transition-colors duration-300">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 border border-[var(--xai-border)] rounded-xl bg-[var(--xai-bg-tertiary)] text-[var(--xai-text-primary)] placeholder:text-[var(--xai-text-secondary)] focus:outline-none focus:border-[var(--xai-text-primary)] transition-all duration-300"
              placeholder="John Doe"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block mb-2 font-semibold text-[var(--xai-text-primary)] transition-colors duration-300">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 border border-[var(--xai-border)] rounded-xl bg-[var(--xai-bg-tertiary)] text-[var(--xai-text-primary)] placeholder:text-[var(--xai-text-secondary)] focus:outline-none focus:border-[var(--xai-text-primary)] transition-all duration-300"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block mb-2 font-semibold text-[var(--xai-text-primary)] transition-colors duration-300">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border border-[var(--xai-border)] rounded-xl bg-[var(--xai-bg-tertiary)] text-[var(--xai-text-primary)] placeholder:text-[var(--xai-text-secondary)] focus:outline-none focus:border-[var(--xai-text-primary)] transition-all duration-300"
              placeholder="••••••••"
              required
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block mb-2 font-semibold text-[var(--xai-text-primary)] transition-colors duration-300">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-4 border border-[var(--xai-border)] rounded-xl bg-[var(--xai-bg-tertiary)] text-[var(--xai-text-primary)] placeholder:text-[var(--xai-text-secondary)] focus:outline-none focus:border-[var(--xai-text-primary)] transition-all duration-300"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-4 bg-[var(--xai-primary)] text-[var(--xai-text-primary)] rounded-xl font-bold text-lg hover:bg-[var(--xai-bg-tertiary)] transition-all duration-300 border border-[var(--xai-border)] cursor-pointer active:scale-95 transform disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--xai-text-primary)] mr-2"></div>
                Creating Account...
              </div>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center text-[var(--xai-text-secondary)]">
          Already have an account? <Link to="/login" className="text-[var(--xai-text-primary)] hover:text-[var(--xai-highlight)] transition-colors font-bold hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;