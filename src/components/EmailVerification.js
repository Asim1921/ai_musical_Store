import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const EmailVerification = ({ setIsAuthenticated }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  
  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/auth/verify-email/', {
        email,
        otp
      });

      localStorage.setItem('access_token', response.data.tokens.access);
      localStorage.setItem('refresh_token', response.data.tokens.refresh);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
      
      setIsAuthenticated(true);
      toast.success('Email verified successfully!');
      navigate('/dashboard');

    } catch (error) {
      console.error('Verification error:', error);
      toast.error(error.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/auth/resend-otp/', { email });
      toast.success('New OTP sent to your email!');
      setCountdown(60); // 60 second countdown
    } catch (error) {
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card slide-up">
        <div className="auth-header">
          <h1 className="auth-title">Verify Your Email</h1>
          <p className="auth-subtitle">
            We've sent a 6-digit verification code to<br />
            <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleVerify}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="form-input"
              style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.5rem' }}
              maxLength="6"
              required
            />
          </div>

          <button 
            type="submit" 
            className={`submit-btn ${loading ? 'loading' : ''}`}
            disabled={loading || otp.length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ color: '#64748b', marginBottom: '12px' }}>
            Didn't receive the code?
          </p>
          
          {countdown > 0 ? (
            <p style={{ color: '#64748b' }}>
              Resend OTP in {countdown} seconds
            </p>
          ) : (
            <button
              onClick={handleResendOTP}
              disabled={resendLoading}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {resendLoading ? 'Sending...' : 'Resend OTP'}
            </button>
          )}
        </div>

        <div className="auth-switch">
          Want to use a different email? 
          <button
            onClick={() => navigate('/register')}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              fontWeight: '600',
              cursor: 'pointer',
              marginLeft: '4px'
            }}
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;