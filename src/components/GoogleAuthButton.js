import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import toast from 'react-hot-toast';

const GoogleAuthButton = ({ setIsAuthenticated, onSuccess }) => {

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/auth/google-auth/', {
        access_token: credentialResponse.credential
      });

      localStorage.setItem('access_token', response.data.tokens.access);
      localStorage.setItem('refresh_token', response.data.tokens.refresh);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
      
      setIsAuthenticated(true);
      toast.success(`Welcome ${response.data.user.first_name}!`);
      
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error('Google auth error:', error);
      toast.error('Google authentication failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    toast.error('Google authentication was cancelled');
  };

  return (
    <div style={{ width: '100%', marginTop: '16px' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        margin: '20px 0',
        color: '#64748b',
        fontSize: '0.9rem'
      }}>
        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
        <span style={{ margin: '0 16px' }}>or</span>
        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
      </div>

      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap={false}
        size="large"
        width="100%"
        text="continue_with"
        shape="rectangular"
        theme="outline"
      />
    </div>
  );
};

export default GoogleAuthButton;