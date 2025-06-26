import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import GoogleAuthButton from './GoogleAuthButton';

const Register = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    role: 'listener',
    first_name: '',
    last_name: ''
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

    if (formData.password !== formData.password_confirm) {
      toast.error("Passwords don't match!");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/auth/register/', formData);
      
      toast.success('Registration successful! Please check your email to verify your account.');
      
      // Redirect to email verification page
      navigate('/verify-email', { 
        state: { email: formData.email }
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data) {
        Object.keys(error.response.data).forEach(key => {
          const messages = error.response.data[key];
          if (Array.isArray(messages)) {
            messages.forEach(message => toast.error(`${key}: ${message}`));
          } else {
            toast.error(`${key}: ${messages}`);
          }
        });
      } else {
        toast.error('Registration failed. Please try again.');
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
          <h1 className="auth-title">Join Us</h1>
          <p className="auth-subtitle">Create your AI Audio Marketplace account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <input
                type="text"
                name="first_name"
                placeholder="First Name"
                value={formData.first_name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <input
                type="text"
                name="last_name"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="select-input"
              required
            >
              <option value="listener">Listener</option>
              <option value="creator">Creator</option>
            </select>
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

          <div className="form-group">
            <input
              type="password"
              name="password_confirm"
              placeholder="Confirm Password"
              value={formData.password_confirm}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <button 
            type="submit" 
            className={`submit-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <GoogleAuthButton 
          setIsAuthenticated={setIsAuthenticated} 
          onSuccess={handleGoogleSuccess}
        />

        <div className="auth-switch">
          Already have an account? <Link to="/login" className="auth-link">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;