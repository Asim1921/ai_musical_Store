# React Frontend Deployment to Vercel

This guide will help you deploy your React frontend to Vercel and connect it to your Django backend.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install with `npm i -g vercel`
3. **Git Repository**: Your code should be in a Git repository

## Project Structure

The frontend has been configured for Vercel deployment with the following key files:

- `src/config/api.js`: API configuration with environment-based endpoints
- `env.development`: Development environment variables
- `env.production`: Production environment variables
- Updated components to use the new API configuration

## Configuration Changes Made

### 1. API Configuration (`src/config/api.js`)

- Environment-based API endpoints
- Automatic token refresh handling
- Centralized API request utility
- Support for both development and production environments

### 2. Updated Components

- **App.js**: Uses new API configuration for authentication checks
- **Login.js**: Updated to use `apiRequest` utility
- **Register.js**: Updated to use `apiRequest` utility
- **Dashboard.js**: Updated to use new API endpoints

### 3. Environment Variables

- `REACT_APP_API_URL`: Your Django backend URL
- `REACT_APP_ENVIRONMENT`: Current environment
- `REACT_APP_GOOGLE_CLIENT_ID`: Google OAuth client ID

## Deployment Steps

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy to Vercel

Navigate to your React project directory:

```bash
cd ai_musical_Store
vercel
```

Follow the prompts:
- Set up and deploy? `Y`
- Which scope? Select your account
- Link to existing project? `N`
- What's your project's name? `ai-musical-store-frontend`
- In which directory is your code located? `./` (current directory)

### 4. Set Environment Variables

After deployment, set your environment variables in the Vercel dashboard:

1. Go to your project in the Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables:

```
REACT_APP_API_URL=https://your-django-backend.vercel.app
REACT_APP_ENVIRONMENT=production
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

### 5. Redeploy with Environment Variables

```bash
vercel --prod
```

## Development vs Production

### Development
- Uses `http://localhost:8000` for API calls
- Environment: `development`
- Debug mode enabled

### Production
- Uses your Vercel backend URL
- Environment: `production`
- Optimized for performance

## API Endpoints

The frontend will automatically use the correct API endpoints based on the environment:

### Development
- API Base: `http://localhost:8000`
- Auth: `http://localhost:8000/api/auth/`
- Social: `http://localhost:8000/api/social/`
- Content: `http://localhost:8000/api/content/`

### Production
- API Base: `https://your-backend.vercel.app`
- Auth: `https://your-backend.vercel.app/api/auth/`
- Social: `https://your-backend.vercel.app/api/social/`
- Content: `https://your-backend.vercel.app/api/content/`

## Features

### 1. Automatic Token Refresh
- Handles JWT token expiration
- Automatically refreshes tokens
- Redirects to login if refresh fails

### 2. Environment Detection
- Automatically detects development vs production
- Uses appropriate API endpoints
- Configurable via environment variables

### 3. Error Handling
- Centralized error handling
- User-friendly error messages
- Automatic logout on authentication failures

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your Django backend has the correct CORS settings
2. **API Connection**: Verify the `REACT_APP_API_URL` is correct
3. **Google OAuth**: Ensure the Google Client ID is valid for your domain

### Debugging

Check Vercel function logs:
```bash
vercel logs
```

### Environment Variables

To check if environment variables are loaded:
```javascript
console.log('API URL:', process.env.REACT_APP_API_URL);
console.log('Environment:', process.env.REACT_APP_ENVIRONMENT);
```

## Next Steps

1. **Custom Domain**: Set up a custom domain in Vercel
2. **SSL Certificate**: Vercel provides automatic SSL
3. **CDN**: Vercel provides global CDN
4. **Analytics**: Enable Vercel Analytics
5. **Monitoring**: Set up error monitoring

## Testing

### Local Development
```bash
npm start
```

### Production Build
```bash
npm run build
```

### Deploy to Production
```bash
vercel --prod
```

## Support

For issues specific to Vercel deployment, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel React Guide](https://vercel.com/guides/deploying-react-with-vercel)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
