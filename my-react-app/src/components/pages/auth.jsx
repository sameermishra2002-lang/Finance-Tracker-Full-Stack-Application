import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './auth.css';

const Login = () => {
  const { loginUser, registerUser } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let result;
      
      if (mode === 'login') {
        // Login
        result = await loginUser(formData.username, formData.password);
        
        if (result.success) {
          setSuccess(`✓ Login successful! Welcome ${result.user.username} (${result.user.role})`);
          console.log('Login successful! User:', result.user);
          console.log('Tokens stored in localStorage');
          // Clear form
          setFormData({ username: '', email: '', password: '' });
        } else {
          // Check if user not found
          if (result.error && result.error.includes('not found')) {
            setError(`${result.error} Click "Sign Up" below to create an account.`);
          } else {
            setError(result.error || 'Login failed. Please try again.');
          }
        }
      } else {
        // Sign Up
        if (!formData.email) {
          setError('Email is required for sign up.');
          setLoading(false);
          return;
        }
        
        result = await registerUser(formData.username, formData.email, formData.password);
        
        if (result.success) {
          setSuccess(`✓ Account created! Welcome ${result.user.username}!`);
          console.log('Registration successful! User:', result.user);
          console.log('Tokens stored in localStorage');
          // Clear form
          setFormData({ username: '', email: '', password: '' });
          // Switch back to login mode after successful signup
          setTimeout(() => setMode('login'), 2000);
        } else {
          setError(result.error || 'Registration failed. Please try again.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setSuccess('');
    setFormData({ username: '', email: '', password: '' });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">{mode === 'login' ? 'Login' : 'Sign Up'}</h2>
        
        <div className="auth-content">
          {/* Left Side - Login Icon */}
          <div className="auth-icon-section">
            <svg 
              className="login-icon" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Right Side - Input Fields */}
          <div className="auth-form-section">
            <form onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="success-message">
                  {success}
                </div>
              )}

              {/* Username Field */}
              <div className="input-group">
                <div className="input-wrapper">
                  <svg 
                    className="input-icon" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <path 
                      d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    className="auth-input"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email Field (only for signup) */}
              {mode === 'signup' && (
                <div className="input-group">
                  <div className="input-wrapper">
                    <svg 
                      className="input-icon" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                      <path 
                        d="M22 6L12 13L2 6" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      className="auth-input"
                      disabled={loading}
                      required={mode === 'signup'}
                    />
                  </div>
                </div>
              )}

              {/* Password Field */}
              <div className="input-group">
                <div className="input-wrapper">
                  <svg 
                    className="input-icon" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect 
                      x="3" 
                      y="11" 
                      width="18" 
                      height="11" 
                      rx="2" 
                      ry="2" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    <path 
                      d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="auth-input"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" className="auth-button" disabled={loading}>
                {loading 
                  ? (mode === 'login' ? 'Signing In...' : 'Creating Account...') 
                  : (mode === 'login' ? 'Sign In' : 'Sign Up')
                }
              </button>

              {/* Toggle Mode Link */}
              <div className="auth-footer">
                <p>
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button 
                    type="button"
                    onClick={toggleMode} 
                    className="auth-link"
                    disabled={loading}
                  >
                    {mode === 'login' ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
