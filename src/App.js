import React, { useState } from 'react';
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
import './App.css';

// Google OAuth Client ID (you'll need to get this from Google Console)
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
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('access_token') !== null
  );

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
                  <Navigate to="/dashboard" />
                } 
              />
              <Route 
                path="/register" 
                element={
                  !isAuthenticated ? 
                  <Register setIsAuthenticated={setIsAuthenticated} /> : 
                  <Navigate to="/dashboard" />
                } 
              />
              <Route 
                path="/verify-email" 
                element={
                  !isAuthenticated ? 
                  <EmailVerification setIsAuthenticated={setIsAuthenticated} /> : 
                  <Navigate to="/dashboard" />
                } 
              />
              <Route 
                path="/forgot-password" 
                element={
                  !isAuthenticated ? 
                  <ForgotPassword /> : 
                  <Navigate to="/dashboard" />
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  isAuthenticated ? 
                  <Dashboard setIsAuthenticated={setIsAuthenticated} /> : 
                  <Navigate to="/login" />
                } 
              />
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
            <Toaster position="top-right" />
          </div>
        </Router>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;