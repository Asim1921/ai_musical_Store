import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import GoogleAuthButton from './GoogleAuthButton';

const Login = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  // Debug: Log what we're sending
  console.log('🔍 Frontend Login Debug:');
  console.log('Form data:', formData);

  try {
    const response = await axios.post('http://127.0.0.1:8000/api/auth/login/', formData);
    
    // Store tokens
    localStorage.setItem('access_token', response.data.tokens.access);
    localStorage.setItem('refresh_token', response.data.tokens.refresh);
    localStorage.setItem('user_data', JSON.stringify(response.data.user));
    
    setIsAuthenticated(true);
    toast.success(`Welcome back, ${response.data.user.first_name}!`);
    
  } catch (error) {
    console.error('Login error:', error);
    console.log('Error response:', error.response?.data);
    
    if (error.response?.data?.email_verification_required) {
      toast.error('Please verify your email first');
      navigate('/verify-email', { 
        state: { email: formData.username.includes('@') ? formData.username : '' }
      });
    } else {
      toast.error(error.response?.data?.error || 'Login failed. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};

  const handleGoogleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="auth-container">
      <div className="auth-card slide-up">
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your AI Audio Marketplace account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="username"
              placeholder="Username or Email"
              value={formData.username}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div style={{ textAlign: 'right', marginBottom: '16px' }}>
            <Link to="/forgot-password" className="auth-link" style={{ fontSize: '0.9rem' }}>
              Forgot your password?
            </Link>
          </div>

          <button 
            type="submit" 
            className={`submit-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <GoogleAuthButton 
          setIsAuthenticated={setIsAuthenticated} 
          onSuccess={handleGoogleSuccess}
        />

        <div className="auth-switch">
          Don't have an account? <Link to="/register" className="auth-link">Sign up here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;