// src/components/Dashboard.js - Clean and organized
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PostCard from './PostCard';
import SearchModal from './Search';
import CreatePostModal from './CreatePostModal';
import ChatInterface from './Chat';
import { Link } from 'react-router-dom';

// API configuration
const API_BASE = 'http://localhost:8000/api/social';

// Content Card Component
const ContentCard = ({ content, onLike, onComment }) => {
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);

  const playAudio = async (audioFile) => {
    try {
      setAudioLoading(true);
      
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
      }
      
      let audioUrl;
      if (audioFile.startsWith('/media/')) {
        audioUrl = `http://localhost:8000${audioFile}`;
      } else if (audioFile.startsWith('media/')) {
        audioUrl = `http://localhost:8000/${audioFile}`;
      } else {
        audioUrl = `http://localhost:8000/media/${audioFile}`;
      }
      
      const audio = new Audio(audioUrl);
      
      audio.addEventListener('canplay', () => {
        setAudioLoading(false);
      });
      
      audio.addEventListener('play', () => {
        setIsPlaying(true);
      });
      
      audio.addEventListener('pause', () => {
        setIsPlaying(false);
      });
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
      });
      
      audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        toast.error('Error playing audio');
        setAudioLoading(false);
      });
      
      await audio.play();
      setAudioPlayer(audio);
      
    } catch (error) {
      console.error('Error playing audio:', error);
      toast.error('Error playing audio');
      setAudioLoading(false);
    }
  };

  const pauseAudio = () => {
    if (audioPlayer) {
      audioPlayer.pause();
      setIsPlaying(false);
    }
  };

  const handleLike = () => {
    if (onLike) {
      onLike(content.id);
    }
  };

  const handleComment = () => {
    if (commentText.trim()) {
      if (onComment) {
        onComment(content.id, commentText);
        setCommentText('');
        setShowCommentInput(false);
      }
    } else {
      toast.error('Please enter a comment');
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <img
          src={content.creator?.avatar_url || `https://ui-avatars.com/api/?name=${content.creator?.first_name}+${content.creator?.last_name}&background=6366f1&color=fff&size=40`}
          alt="Creator"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600' }}>
            {content.creator?.first_name} {content.creator?.last_name}
          </h4>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
            @{content.creator?.username} • {new Date(content.created_at).toLocaleDateString()}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={handleLike}
            style={{
              padding: '6px 12px',
              background: content.is_liked ? '#ef4444' : 'transparent',
              color: content.is_liked ? 'white' : '#475569',
              border: '1px solid #e2e8f0',
            borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {content.is_liked ? '❤️' : '🤍'} {content.is_liked ? 'Liked' : 'Like'}
          </button>
          <button 
            onClick={() => setShowCommentInput(!showCommentInput)}
            style={{
              padding: '6px 12px',
              background: 'transparent',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            💬 Comment
          </button>
          <button style={{
            padding: '6px 12px',
            background: 'transparent',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}>
            📤 Share
          </button>
        </div>
      </div>

      {/* Comment Input */}
      {showCommentInput && (
        <div style={{
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleComment()}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            <button
              onClick={handleComment}
              style={{
                padding: '8px 16px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Post
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
          {content.title}
        </h3>
        <p style={{
          margin: '0 0 12px 0',
          fontSize: '14px',
          color: '#64748b',
          lineHeight: '1.5'
        }}>
          {content.description}
        </p>
        
        {/* Audio Player */}
        {content.audio_file && (
          <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <button
              onClick={() => {
                if (isPlaying) {
                  pauseAudio();
                } else {
                  playAudio(content.audio_file);
                }
              }}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: isPlaying ? '#ef4444' : '#3b82f6',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}
            >
              {audioLoading ? '⏳' : isPlaying ? '⏸️' : '▶️'}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                {content.title}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {audioLoading ? 'Loading...' : isPlaying ? 'Now Playing' : 'Click to play'}
              </div>
            </div>
            <div style={{ fontSize: '24px' }}>🎧</div>
          </div>
        )}
      </div>

      {/* Stats and Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '16px',
        borderTop: '1px solid #f1f5f9'
      }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: '#64748b' }}>
            👁️ {content.views_count || 0} views
          </span>
          <span style={{ fontSize: '14px', color: '#64748b' }}>
            ❤️ {content.likes_count || 0} likes
          </span>
          {content.average_rating && (
            <span style={{ fontSize: '14px', color: '#64748b' }}>
              ⭐ {content.average_rating} stars
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={handleLike}
            style={{
              padding: '6px 12px',
              background: content.is_liked ? '#ef4444' : 'transparent',
              color: content.is_liked ? 'white' : '#475569',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {content.is_liked ? '❤️' : '🤍'} {content.is_liked ? 'Liked' : 'Like'}
          </button>
          <button 
            onClick={() => setShowCommentInput(!showCommentInput)}
            style={{
              padding: '6px 12px',
              background: 'transparent',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            💬 Comment
          </button>
          <button style={{
            padding: '6px 12px',
            background: 'transparent',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}>
            📤 Share
          </button>
        </div>
      </div>
    </div>
  );
};

const api = {
  getFeed: async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/feed/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.error('Error fetching feed:', error);
      return [];
    }
  },

  getContent: async () => {
    try {
      const token = localStorage.getItem('access_token');
      console.log('Fetching content with token:', token ? 'Token exists' : 'No token');
      
      // First, test the content endpoint
      const testResponse = await fetch(`http://localhost:8000/api/content/test/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log('Test endpoint response:', testData);
      }
      
      const response = await fetch(`http://localhost:8000/api/content/content/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Content API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Content API response data:', data);
        console.log('Content count:', data.length);
        return data;
      }
      
      const errorText = await response.text();
      console.error('Content API error response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    } catch (error) {
      console.error('Error fetching content:', error);
      return [];
    }
  },

  getUserProfile: async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/profile/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  toggleLike: async (postId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/posts/${postId}/like/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  },

  toggleFollow: async (userId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/users/${userId}/follow/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.error('Error toggling follow:', error);
      throw error;
    }
  }
};

const Dashboard = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showContent, setShowContent] = useState(false); // Toggle between posts and content
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: '',
    pdf_file: null
  });
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    initializeDashboard();
    fetchCategories();
  }, []);

  const initializeDashboard = async () => {
    try {
      // Load current user profile to get updated stats
      const updatedProfile = await api.getUserProfile();
      setUser(updatedProfile);
      localStorage.setItem('user_data', JSON.stringify(updatedProfile));
      
      // Load feed and content
      const [feedData, contentData] = await Promise.all([
        api.getFeed(),
        api.getContent()
      ]);
      console.log('Setting posts:', feedData);
      console.log('Setting content:', contentData);
      setPosts(feedData);
      setContent(contentData);
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const result = await api.toggleLike(postId);
      
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                is_liked: result.action === 'liked',
                likes_count: result.likes_count 
              }
            : post
        )
      );
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleFollow = async (userId) => {
    try {
      const result = await api.toggleFollow(userId);
      
      // Update posts feed
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.author.id === userId
            ? { 
                ...post, 
                author: {
                  ...post.author,
                  is_following: result.action === 'followed',
                  followers_count: result.followers_count
                }
              }
            : post
        )
      );

      // Update current user's following count
      setUser(prevUser => ({
        ...prevUser,
        following_count: result.action === 'followed' 
          ? prevUser.following_count + 1 
          : prevUser.following_count - 1
      }));
      
      toast.success(`User ${result.action} successfully!`);
    } catch (error) {
      toast.error('Failed to follow/unfollow user');
    }
  };

  const handleFollowUpdate = (userId, result) => {
    // Update user's following count when following from search
    setUser(prevUser => ({
      ...prevUser,
      following_count: result.action === 'followed' 
        ? prevUser.following_count + 1 
        : prevUser.following_count - 1
    }));

    // Also update in posts if the user appears in feed
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.author.id === userId
          ? { 
              ...post, 
              author: {
                ...post.author,
                is_following: result.action === 'followed',
                followers_count: result.followers_count
              }
            }
          : post
      )
    );
  };

  const handlePostCreated = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
    // Update user's post count
    setUser(prevUser => ({
      ...prevUser,
      posts_count: prevUser.posts_count + 1
    }));
  };

  const handleCommentAdded = (postId) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, comments_count: post.comments_count + 1 }
          : post
      )
    );
  };

  const handleContentLike = async (contentId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/content/content/${contentId}/like/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setContent(prevContent => 
          prevContent.map(item => 
            item.id === contentId 
              ? { 
                  ...item, 
                  is_liked: data.liked,
                  likes_count: data.likes_count 
                }
              : item
          )
        );
        toast.success(data.liked ? 'Content liked!' : 'Content unliked');
      } else {
        toast.error('Failed to like content');
      }
    } catch (error) {
      console.error('Error liking content:', error);
      toast.error('Error liking content');
    }
  };

  const handleContentComment = async (contentId, commentText) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/content/content/${contentId}/comment/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: commentText })
      });
      
      if (response.ok) {
        toast.success('Comment added successfully!');
      } else {
        toast.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error commenting on content:', error);
      toast.error('Error adding comment');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setIsAuthenticated(false);
    toast.success('Logged out successfully!');
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/content/categories/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadForm.title || !uploadForm.pdf_file) {
      toast.error('Please fill in all required fields');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('category', uploadForm.category);
      formData.append('pdf_file', uploadForm.pdf_file);

      const response = await fetch(`http://localhost:8000/api/content/creator/bulk-upload/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (response.ok) {
        toast.success('Bulk upload started successfully!');
        setShowBulkUpload(false);
        setUploadForm({ title: '', description: '', category: '', pdf_file: null });
        // Refresh content after upload
        setTimeout(() => {
          initializeDashboard();
        }, 2000);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to start bulk upload');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
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
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div className="modern-dashboard">
      {/* Top Navigation */}
      <nav className="top-nav">
        <div className="nav-container">
          <div className="nav-content">
            <div className="logo">
              <span className="logo-text">🎵 Nymia</span>
            </div>
            <div className="search-container">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Search posts, people..."
                  className="search-input"
                  onClick={() => setShowSearch(true)}
                  readOnly
                />
                <div className="search-icon">🔍</div>
              </div>
            </div>
            <div className="user-menu">
              {/* <button className="notification-btn">🔔</button> */}
              <div className="user-profile">
                <img
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=6366f1&color=fff&size=40`}
                  alt="Profile"
                  className="profile-image"
                  onClick={() => navigate('/profile')}
                  style={{ cursor: 'pointer' }}
                />
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="main-container">
        <div className="dashboard-grid">
          
          {/* Left Sidebar */}
          <div className="left-sidebar">
            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-info">
                  <img
                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=fff&color=6366f1&size=60`}
                    alt="Profile"
                    className="profile-avatar"
                    onClick={() => navigate('/profile')}
                    style={{ cursor: 'pointer' }}
                  />
                  <div className="profile-details">
                    <h3 className="profile-name">{user.first_name} {user.last_name}</h3>
                    <p className="profile-role">@{user.username}</p>
                  </div>
                </div>
                
                <div className="profile-stats">
                  <div className="stat-item">
                    <div className="stat-number">{user.posts_count || 0}</div>
                    <div className="stat-label">Posts</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{user.followers_count || 0}</div>
                    <div className="stat-label">Followers</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{user.following_count || 0}</div>
                    <div className="stat-label">Following</div>
                  </div>
                </div>
              </div>

              <div className="nav-menu">
                {[
  { id: 'feed', icon: '🏠', label: 'Feed' },
  { id: 'profile', icon: '👤', label: 'My Profile' },
  { id: 'creator-dashboard', icon: '📊', label: 'Creator Dashboard' },
  { id: 'messages', icon: '💬', label: 'Messages' },
  // { id: 'notifications', icon: '🔔', label: 'Notifications' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
].map((item) => (
  <button
    key={item.id}
    onClick={() => {
      if (item.id === 'profile') {
        navigate('/profile');
      } else if (item.id === 'creator-dashboard') {
        navigate('/creator-dashboard');
      } else if (item.id === 'messages') {
        setShowChat(true);
      } else {
        // Handle other navigation here
      }
    }}
    className="nav-item"
  >
    <span className="nav-icon">{item.icon}</span>
    <span className="nav-label">{item.label}</span>
  </button>
))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="main-content">
            
            <div className="create-post-card">
              <div className="post-input-area">
                <img
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=6366f1&color=fff&size=40`}
                  alt="User"
                  className="post-avatar"
                />
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="post-input"
                  style={{ cursor: 'pointer' }}
                >
                  What's on your mind?
                </button>
              </div>
              
              <div className="post-actions">
                <div className="action-buttons">
                  <button 
                    className="action-btn"
                    onClick={() => setShowCreatePost(true)}
                  >
                    <span className="action-icon">📝</span>
                    <span className="action-label">Text</span>
                  </button>
                  <button 
                    className="action-btn upload"
                    onClick={() => setShowCreatePost(true)}
                  >
                    <span className="action-icon">📷</span>
                    <span className="action-label">Photo</span>
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => setShowBulkUpload(true)}
                  >
                    <span className="action-icon">📤</span>
                    <span className="action-label">Upload PDF</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Toggle between Posts and Content */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '20px',
              background: 'white',
              padding: '16px',
              borderRadius: '12px'
            }}>
              <button
                onClick={() => setShowContent(false)}
                style={{
                  padding: '10px 20px',
                  background: !showContent ? '#3b82f6' : 'transparent',
                  color: !showContent ? 'white' : '#64748b',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                📝 Social Posts
              </button>
              <button
                onClick={() => setShowContent(true)}
                style={{
                  padding: '10px 20px',
                  background: showContent ? '#3b82f6' : 'transparent',
                  color: showContent ? 'white' : '#64748b',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                🎵 Audio Content
              </button>
            </div>

            <div className="content-feed">
              {loading ? (
                <div className="loading-content">
                  <div className="loading-spinner"></div>
                  <span>Loading your feed...</span>
                </div>
              ) : !showContent ? (
                // Social Posts
                posts.length === 0 ? (
                  <div className="empty-content">
                    <div className="empty-icon">📝</div>
                    <h3>Your feed is empty</h3>
                    <p>Follow some people or create your first post to get started!</p>
                    <button
                      onClick={() => setShowCreatePost(true)}
                      style={{
                        padding: '12px 24px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        marginTop: '16px'
                      }}
                    >
                      Create Your First Post
                    </button>
                  </div>
                ) : (
                  posts.map((post) => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      onLike={handleLike}
                      onFollow={handleFollow}
                      onCommentAdded={handleCommentAdded}
                    />
                  ))
                )
              ) : (
                // Audio Content
                console.log('Rendering content section, content length:', content.length),
                content.length === 0 ? (
                  <div className="empty-content">
                    <div className="empty-icon">🎵</div>
                    <h3>No audio content yet</h3>
                    <p>Check out the Creator Dashboard to upload some content!</p>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                      <button
                        onClick={() => navigate('/creator-dashboard')}
                        style={{
                          padding: '12px 24px',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        Go to Creator Dashboard
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const newContent = await api.getContent();
                            setContent(newContent);
                            toast.success('Content refreshed!');
                          } catch (error) {
                            toast.error('Failed to refresh content');
                          }
                        }}
                        style={{
                          padding: '12px 24px',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        🔄 Refresh Content
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      marginBottom: '16px',
                      padding: '0 8px'
                    }}>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                        Audio Content ({content.length} items)
                      </h3>
                      <button
                        onClick={async () => {
                          try {
                            const newContent = await api.getContent();
                            setContent(newContent);
                            toast.success('Content refreshed!');
                          } catch (error) {
                            toast.error('Failed to refresh content');
                          }
                        }}
                        style={{
                          padding: '8px 16px',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        🔄 Refresh
                      </button>
                    </div>
                    {content.map((item) => (
                      <ContentCard 
                        key={item.id} 
                        content={item}
                        onLike={handleContentLike}
                        onComment={handleContentComment}
                      />
                    ))}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="right-sidebar">
            <div className="trending-card">
              <h4 className="trending-title">🔥 Trending</h4>
              <div className="trending-list">
                <div className="trending-item">
                  <span className="trending-topic">#Technology</span>
                  <span className="trending-count">1.2k posts</span>
                </div>
                <div className="trending-item">
                  <span className="trending-topic">#Photography</span>
                  <span className="trending-count">856 posts</span>
                </div>
                <div className="trending-item">
                  <span className="trending-topic">#Music</span>
                  <span className="trending-count">642 posts</span>
                </div>
                <div className="trending-item">
                  <span className="trending-topic">#Travel</span>
                  <span className="trending-count">523 posts</span>
                </div>
                <div className="trending-item">
                  <span className="trending-topic">#Food</span>
                  <span className="trending-count">417 posts</span>
                </div>
              </div>
            </div>

            <div className="creators-card">
              <h4 className="creators-title">💡 Suggested for You</h4>
              <div className="creators-list">
                <div className="creator-item">
                  <div className="creator-avatar" style={{background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'}}>
                    👨‍💻
                  </div>
                  <div className="creator-info">
                    <div className="creator-name">Tech Enthusiast</div>
                    <div className="creator-meta">128 followers • 45 posts</div>
                  </div>
                  <button className="follow-btn">Follow</button>
                </div>
                
                <div className="creator-item">
                  <div className="creator-avatar" style={{background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'}}>
                    📸
                  </div>
                  <div className="creator-info">
                    <div className="creator-name">Photo Stories</div>
                    <div className="creator-meta">89 followers • 32 posts</div>
                  </div>
                  <button className="follow-btn">Follow</button>
                </div>
                
                <div className="creator-item">
                  <div className="creator-avatar" style={{background: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'}}>
                    🎵
                  </div>
                  <div className="creator-info">
                    <div className="creator-name">Music Lover</div>
                    <div className="creator-meta">156 followers • 67 posts</div>
                  </div>
                  <button className="follow-btn">Follow</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
<ChatInterface 
  isOpen={showChat}
  onClose={() => setShowChat(false)}
/>
      {/* Modals */}
      <CreatePostModal 
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onPostCreated={handlePostCreated}
      />
      
      <SearchModal 
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onFollowUpdate={handleFollowUpdate}
      />

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Upload PDF for Bulk Processing</h3>
              <button 
                onClick={() => setShowBulkUpload(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Title *</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Category</label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <option value="">Select Category</option>
                  {Array.isArray(categories) && categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>PDF File *</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setUploadForm({ ...uploadForm, pdf_file: e.target.files[0] })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px dashed #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
                {uploadForm.pdf_file && (
                  <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#10b981', fontWeight: '600' }}>
                    ✅ Selected: {uploadForm.pdf_file.name}
                  </p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                onClick={() => setShowBulkUpload(false)}
                style={{
                  padding: '12px 24px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleFileUpload}
                disabled={uploading || !uploadForm.title || !uploadForm.pdf_file}
                style={{
                  padding: '12px 24px',
                  background: (uploading || !uploadForm.title || !uploadForm.pdf_file) ? '#94a3b8' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: (uploading || !uploadForm.title || !uploadForm.pdf_file) ? 'not-allowed' : 'pointer'
                }}
              >
                {uploading ? '⏳ Uploading...' : '📤 Upload & Process'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;