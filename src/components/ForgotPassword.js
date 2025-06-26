import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    new_password: '',
    new_password_confirm: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('http://127.0.0.1:8000/api/auth/password-reset/', {
        email: formData.email
      });
      
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Email not found');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (formData.new_password !== formData.new_password_confirm) {
      toast.error("Passwords don't match!");
      return;
    }

    setLoading(true);

    try {
      await axios.post('http://127.0.0.1:8000/api/auth/password-reset-confirm/', {
        email: formData.email,
        otp: formData.otp,
        new_password: formData.new_password,
        new_password_confirm: formData.new_password_confirm
      });
      
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid OTP or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card slide-up">
        <div className="auth-header">
          <h1 className="auth-title">
            {step === 1 ? 'Reset Password' : 'Enter New Password'}
          </h1>
          <p className="auth-subtitle">
            {step === 1 
              ? 'Enter your email address and we\'ll send you an OTP'
              : `Enter the OTP sent to ${formData.email}`
            }
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleEmailSubmit}>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
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
              {loading ? 'Sending OTP...' : 'Send Reset OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordReset}>
            <div className="form-group">
              <input
                type="text"
                name="otp"
                placeholder="Enter 6-digit OTP"
                value={formData.otp}
                onChange={(e) => setFormData({
                  ...formData,
                  otp: e.target.value.replace(/\D/g, '').slice(0, 6)
                })}
                className="form-input"
                style={{ textAlign: 'center', fontSize: '1.1rem', letterSpacing: '0.3rem' }}
                maxLength="6"
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                name="new_password"
                placeholder="Enter new password"
                value={formData.new_password}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                name="new_password_confirm"
                placeholder="Confirm new password"
                value={formData.new_password_confirm}
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
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="auth-switch">
          Remember your password? <Link to="/login" className="auth-link">Sign in here</Link>
        </div>

        {step === 2 && (
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              onClick={() => setStep(1)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              ← Use different email
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;