// Configuration file for API endpoints
const baseUrl = 'http://localhost:8000';

// API endpoints
export const API_ENDPOINTS = {
  SOCIAL: `${baseUrl}/api/social`,
  CONTENT: `${baseUrl}/api/content`,
  AUTH: `${baseUrl}/api/auth`,
};

// Media URLs
export const getMediaUrl = (path) => {
  if (path.startsWith('/media/')) {
    return `${baseUrl}${path}`;
  } else if (path.startsWith('media/')) {
    return `${baseUrl}/${path}`;
  } else {
    return `${baseUrl}/media/${path}`;
  }
};

export default baseUrl;
