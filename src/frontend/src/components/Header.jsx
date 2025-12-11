import { Link, useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import authService from '../services/authService';
import logo from '../assets/thinkhire-logo.svg';
import { useState, useRef, useEffect } from 'react';

const Header = ({ showDashboardLink = false, title = "ThinkHire" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const user = authService.getUser();

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
    setShowProfileMenu(false);
  };

  const handleViewProfile = () => {
    // TODO: Navigate to profile page
    setShowProfileMenu(false);
  };

  const handleSettings = () => {
    // TODO: Navigate to settings page
    setShowProfileMenu(false);
  };

  const isDashboard = location.pathname === '/dashboard';
  const isAnalysis = location.pathname === '/analysis';
  const isAnalysisReport = location.pathname === '/analysis-report';

  return (
    <header className="bg-[var(--xai-bg-secondary)]/80 backdrop-blur-md px-8 py-4 flex justify-between items-center border-b border-[var(--xai-border)] z-40 relative">
      <div className="flex items-center gap-3 group">
        <img 
          src={logo} 
          alt="ThinkHire Logo" 
          className="h-10 w-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" 
        />
        <h1 className="m-0 text-2xl font-bold text-[var(--xai-text-primary)]">
          {title}
        </h1>
      </div>
      
      <div className="flex gap-6 items-center">
        <nav>
          <ul className="flex gap-4 list-none m-0 p-0">
            {isDashboard ? (
              <>
                <li style={{ marginRight: '10px' }}>
                  <Link 
                    to="/explore" 
                    className="text-[var(--xai-text-secondary)] no-underline hover:text-[var(--xai-text-primary)] transition-colors font-medium"
                  >
                    Explore
                  </Link>
                </li>
                <li style={{ marginRight: '10px' }}>
                  <Link 
                    to="/" 
                    className="text-[var(--xai-text-secondary)] no-underline hover:text-[var(--xai-text-primary)] transition-colors font-medium"
                  >
                    Home
                  </Link>
                </li>
              </>
            ) : isAnalysis ? (
              <>
                <li style={{ marginRight: '10px' }}>
                  <Link 
                    to="/explore" 
                    className="text-[var(--xai-text-secondary)] no-underline hover:text-[var(--xai-text-primary)] transition-colors font-medium"
                  >
                    Explore
                  </Link>
                </li>
                <li style={{ marginRight: '10px' }}>
                  <Link 
                    to="/dashboard" 
                    className="text-[var(--xai-text-secondary)] no-underline hover:text-[var(--xai-text-primary)] transition-colors font-medium"
                  >
                    Dashboard
                  </Link>
                </li>
                <li style={{ marginRight: '10px' }}>
                  <Link 
                    to="/" 
                    className="text-[var(--xai-text-secondary)] no-underline hover:text-[var(--xai-text-primary)] transition-colors font-medium"
                  >
                    Home
                  </Link>
                </li>
              </>
            ) : isAnalysisReport ? (
              <>
                <li style={{ marginRight: '10px' }}>
                  <Link 
                    to="/explore" 
                    className="text-[var(--xai-text-secondary)] no-underline hover:text-[var(--xai-text-primary)] transition-colors font-medium"
                  >
                    Explore
                  </Link>
                </li>
                <li style={{ marginRight: '10px' }}>
                  <Link 
                    to="/dashboard" 
                    className="text-[var(--xai-text-secondary)] no-underline hover:text-[var(--xai-text-primary)] transition-colors font-medium"
                  >
                    Dashboard
                  </Link>
                </li>
                <li style={{ marginRight: '10px' }}>
                  <Link 
                    to="/" 
                    className="text-[var(--xai-text-secondary)] no-underline hover:text-[var(--xai-text-primary)] transition-colors font-medium"
                  >
                    Home
                  </Link>
                </li>
              </>
            ) : (
              // Show Dashboard link on all other pages
              <>
                <li style={{ marginRight: '10px' }}>
                  <Link 
                    to="/explore" 
                    className="text-[var(--xai-text-secondary)] no-underline hover:text-[var(--xai-text-primary)] transition-colors font-medium"
                  >
                    Explore
                  </Link>
                </li>
                <li style={{ marginRight: '10px' }}>
                  <Link 
                    to="/dashboard" 
                    className="text-[var(--xai-text-secondary)] no-underline hover:text-[var(--xai-text-primary)] transition-colors font-medium"
                  >
                    Dashboard
                  </Link>
                </li>
                <li style={{ marginRight: '10px' }}>
                  <Link 
                    to="/" 
                    className="text-[var(--xai-text-secondary)] no-underline hover:text-[var(--xai-text-primary)] transition-colors font-medium"
                  >
                    Home
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
        
        <ThemeToggle />

        {/* Profile Button with Dropdown */}
        {authService.isAuthenticated() && (
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--xai-bg-tertiary)] hover:bg-[var(--xai-border)] transition-colors text-[var(--xai-text-primary)] font-medium border border-[var(--xai-border)] cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-[var(--xai-primary)] flex items-center justify-center text-[var(--xai-text-primary)] text-xs font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:inline">{user?.name || 'Profile'}</span>
              <svg 
                className={`w-4 h-4 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="fixed right-8 top-14 w-48 bg-[var(--xai-bg-secondary)] border border-[var(--xai-border)] rounded-lg overflow-hidden z-[9999]">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-[var(--xai-border)]">
                  <p className="text-sm font-semibold text-[var(--xai-text-primary)]">Signed in as</p>
                  <p className="text-xs text-[var(--xai-text-secondary)]">{user?.email || user?.name}</p>
                </div>

                {/* Menu Items */}
                <button
                  onClick={handleViewProfile}
                  className="w-full px-4 py-2 text-left text-[var(--xai-text-primary)] hover:bg-[var(--xai-bg-tertiary)] transition-colors text-sm flex items-center gap-2 border-none bg-none cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>View Profile</span>
                </button>

                <button
                  onClick={handleSettings}
                  className="w-full px-4 py-2 text-left text-[var(--xai-text-primary)] hover:bg-[var(--xai-bg-tertiary)] transition-colors text-sm flex items-center gap-2 border-none bg-none cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </button>

                {/* Divider */}
                <div className="border-t border-[var(--xai-border)]"></div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-red-500 hover:bg-[var(--xai-bg-tertiary)] transition-colors text-sm flex items-center gap-2 border-none bg-none cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
