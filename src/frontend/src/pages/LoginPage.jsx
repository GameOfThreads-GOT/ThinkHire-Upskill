import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import authService from '../services/authService';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Add class to body when component mounts
    document.body.classList.add('login-page');
    
    // Remove class when component unmounts
    return () => {
      document.body.classList.remove('login-page');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail);
        setLoading(false);
        return;
      }

      console.log("Login successful:", data);

      // Save user to localStorage
      authService.saveUser(data.user);

      // Redirect to dashboard
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--xai-bg-primary)] p-4 relative overflow-hidden transition-colors duration-300">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[var(--xai-text-primary)] rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[var(--xai-highlight)] rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Theme Toggle */}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-4xl mb-8 text-center text-[var(--xai-text-primary)] font-extrabold mt-8">Welcome Back</h2>
        
        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
          
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-4 bg-[var(--xai-primary)] text-[var(--xai-text-primary)] rounded-xl font-bold text-lg hover:bg-[var(--xai-bg-tertiary)] transition-all duration-300 border border-[var(--xai-border)] cursor-pointer active:scale-95 transform"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--xai-text-primary)] mr-2"></div>
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center text-[var(--xai-text-secondary)]">
          Don't have an account? <Link to="/signup" className="text-[var(--xai-text-primary)] hover:text-[var(--xai-highlight)] transition-colors font-bold hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;