// src/App.js - Fixed authentication logic
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

import Login from './components/Login';
import Register from './components/Register';
import EmailVerification from './components/EmailVerification';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';
import ProfilePage from './components/ProfilePage';
import './App.css';

// Google OAuth Client ID
const GOOGLE_CLIENT_ID = "28222189286-ru4almtujkm68ligt44nu45b2r7u8cqi.apps.googleusercontent.com";

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3b82f6',
    },
    secondary: {
      main: '#f59e0b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      console.log('🔍 Checking authentication status...');
      
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user_data');
      
      console.log('Token exists:', !!token);
      console.log('User data exists:', !!userData);
      
      if (!token || !userData) {
        console.log('❌ No token or user data found');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const user = JSON.parse(userData);
        console.log('User data:', user);
        
        if (!user || !user.username) {
          console.log('❌ Invalid user data');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Test if the token is still valid by making a request
        console.log('🔐 Testing token validity...');
        const response = await fetch('http://localhost:8000/api/social/profile/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          console.log('✅ Token is valid, user authenticated');
          setIsAuthenticated(true);
        } else {
          console.log('❌ Token is invalid, clearing auth data');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('❌ Error checking auth status:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}></div>
        <p style={{ color: '#64748b' }}>Checking authentication...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  console.log('🎯 App rendering with isAuthenticated:', isAuthenticated);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div className="App">
            <Routes>
              <Route 
                path="/login" 
                element={
                  !isAuthenticated ? 
                  <Login setIsAuthenticated={setIsAuthenticated} /> : 
                  <Navigate to="/dashboard" replace />
                } 
              />
              <Route 
                path="/register" 
                element={
                  !isAuthenticated ? 
                  <Register setIsAuthenticated={setIsAuthenticated} /> : 
                  <Navigate to="/dashboard" replace />
                } 
              />
              <Route 
                path="/verify-email" 
                element={
                  !isAuthenticated ? 
                  <EmailVerification setIsAuthenticated={setIsAuthenticated} /> : 
                  <Navigate to="/dashboard" replace />
                } 
              />
              <Route 
                path="/forgot-password" 
                element={
                  !isAuthenticated ? 
                  <ForgotPassword /> : 
                  <Navigate to="/dashboard" replace />
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  isAuthenticated ? 
                  <Dashboard setIsAuthenticated={setIsAuthenticated} /> : 
                  <Navigate to="/login" replace />
                } 
              />
              <Route 
                path="/profile/:username?" 
                element={
                  isAuthenticated ? 
                  <ProfilePage /> : 
                  <Navigate to="/login" replace />
                } 
              />
              <Route 
                path="/" 
                element={
                  <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
                } 
              />
            </Routes>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  style: {
                    background: '#10b981',
                  },
                },
                error: {
                  duration: 5000,
                  style: {
                    background: '#ef4444',
                  },
                },
              }}
            />
          </div>
        </Router>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;