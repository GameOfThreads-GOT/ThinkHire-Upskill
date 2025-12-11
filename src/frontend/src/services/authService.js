/**
 * AuthService - Handles user authentication and session management
 */

const authService = {
  /**
   * Save user data to localStorage
   */
  saveUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  /**
   * Get user data from localStorage
   */
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Save authentication token
   */
  saveToken: (token) => {
    localStorage.setItem('authToken', token);
  },

  /**
   * Get authentication token
   */
  getToken: () => {
    return localStorage.getItem('authToken');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('user');
  },

  /**
   * Logout user - clear all session data
   */
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('sessionScores');
  },

  /**
   * Save session scores
   */
  saveSessionScores: (scores) => {
    localStorage.setItem('sessionScores', JSON.stringify(scores));
  },

  /**
   * Get session scores
   */
  getSessionScores: () => {
    const scores = localStorage.getItem('sessionScores');
    return scores ? JSON.parse(scores) : [];
  },

  /**
   * Clear session scores
   */
  clearSessionScores: () => {
    localStorage.removeItem('sessionScores');
  }
};

export default authService;
