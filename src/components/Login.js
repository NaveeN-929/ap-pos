import React, { useState, createContext, useContext, useEffect } from 'react';

// Create Auth Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for saved authentication state on component mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('pos-admin-auth');
    const authTimestamp = localStorage.getItem('pos-admin-timestamp');
    
    if (savedAuth === 'true' && authTimestamp) {
      const now = new Date().getTime();
      const authTime = parseInt(authTimestamp);
      // Keep session for 24 hours (86400000 ms)
      const sessionDuration = 24 * 60 * 60 * 1000;
      
      if (now - authTime < sessionDuration) {
        setIsAuthenticated(true);
      } else {
        // Session expired, clear localStorage
        localStorage.removeItem('pos-admin-auth');
        localStorage.removeItem('pos-admin-timestamp');
      }
    }
    setIsLoading(false);
  }, []);
  
  const login = (password) => {
    // Simple password check - in production, use proper authentication
    if (password === 'admin123') {
      setIsAuthenticated(true);
      // Save authentication state to localStorage
      localStorage.setItem('pos-admin-auth', 'true');
      localStorage.setItem('pos-admin-timestamp', new Date().getTime().toString());
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    // Clear authentication state from localStorage
    localStorage.removeItem('pos-admin-auth');
    localStorage.removeItem('pos-admin-timestamp');
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const Login = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate a brief loading state
    setTimeout(() => {
      const success = onLogin(password);
      if (!success) {
        setError('Invalid password. Please try again.');
      }
      setPassword('');
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Access</h2>
            <p className="text-gray-600 mb-8">Enter password to access the POS system</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                placeholder="Enter admin password"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-700">
                <strong>Demo Password:</strong> 
                <span className="font-mono font-semibold ml-2 bg-blue-100 px-2 py-1 rounded">admin123</span>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Session will remain active for 24 hours
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <a 
            href="/" 
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            ← Back to Digital Menu
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;