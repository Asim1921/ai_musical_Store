// API Configuration
const API_CONFIG = {
  // Development API (local Django server)
  development: {
    baseURL: 'http://localhost:8000',
    timeout: 10000,
  },
  // Production API (Vercel deployed)
  production: {
    baseURL: process.env.REACT_APP_API_URL || 'https://ai-musical-store-backend-ndig.vercel.app',
    timeout: 30000, // Longer timeout for serverless functions
  }
};

// Get current environment
const isDevelopment = process.env.NODE_ENV === 'development';
const currentConfig = isDevelopment ? API_CONFIG.development : API_CONFIG.production;

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${currentConfig.baseURL}/api/auth/login/`,
  REGISTER: `${currentConfig.baseURL}/api/auth/register/`,
  LOGOUT: `${currentConfig.baseURL}/api/auth/logout/`,
  REFRESH_TOKEN: `${currentConfig.baseURL}/api/auth/token/refresh/`,
  VERIFY_EMAIL: `${currentConfig.baseURL}/api/auth/verify-email/`,
  FORGOT_PASSWORD: `${currentConfig.baseURL}/api/auth/forgot-password/`,
  RESET_PASSWORD: `${currentConfig.baseURL}/api/auth/reset-password/`,
  GOOGLE_AUTH: `${currentConfig.baseURL}/api/auth/google/`,
  
  // Social endpoints
  PROFILE: `${currentConfig.baseURL}/api/social/profile/`,
  UPDATE_PROFILE: `${currentConfig.baseURL}/api/social/profile/update/`,
  FOLLOW_USER: `${currentConfig.baseURL}/api/social/follow/`,
  UNFOLLOW_USER: `${currentConfig.baseURL}/api/social/unfollow/`,
  FOLLOWERS: `${currentConfig.baseURL}/api/social/followers/`,
  FOLLOWING: `${currentConfig.baseURL}/api/social/following/`,
  POSTS: `${currentConfig.baseURL}/api/social/posts/`,
  CREATE_POST: `${currentConfig.baseURL}/api/social/posts/create/`,
  LIKE_POST: `${currentConfig.baseURL}/api/social/posts/like/`,
  UNLIKE_POST: `${currentConfig.baseURL}/api/social/posts/unlike/`,
  COMMENT_POST: `${currentConfig.baseURL}/api/social/posts/comment/`,
  SEARCH: `${currentConfig.baseURL}/api/social/search/`,
  
  // Content endpoints
  CONTENT: `${currentConfig.baseURL}/api/content/`,
  AI_PROCESSING: `${currentConfig.baseURL}/api/content/ai/`,
  UPLOAD_CONTENT: `${currentConfig.baseURL}/api/content/upload/`,
  
  // Admin endpoints
  ADMIN: `${currentConfig.baseURL}/admin/`,
};

// API utility functions
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('access_token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const config = {
    method: 'GET',
    headers: defaultHeaders,
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(endpoint, config);
    
    // Handle token refresh if needed
    if (response.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(API_ENDPOINTS.REFRESH_TOKEN, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('access_token', refreshData.access);
            
            // Retry the original request with new token
            config.headers['Authorization'] = `Bearer ${refreshData.access}`;
            const retryResponse = await fetch(endpoint, config);
            return retryResponse;
          } else {
            // Refresh failed, redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_data');
            window.location.href = '/login';
            return response;
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
          window.location.href = '/login';
          return response;
        }
      }
    }

    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Environment info
export const getEnvironmentInfo = () => ({
  isDevelopment,
  baseURL: currentConfig.baseURL,
  timeout: currentConfig.timeout,
});

export default API_ENDPOINTS;
