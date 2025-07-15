// src/components/Dashboard.js - Clean and organized
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PostCard from './PostCard';
import SearchModal from './Search';
import CreatePostModal from './CreatePostModal';

// API configuration
const API_BASE = 'http://localhost:8000/api/social';

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
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      // Load current user profile to get updated stats
      const updatedProfile = await api.getUserProfile();
      setUser(updatedProfile);
      localStorage.setItem('user_data', JSON.stringify(updatedProfile));
      
      // Load feed
      const feedData = await api.getFeed();
      setPosts(feedData);
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

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setIsAuthenticated(false);
    toast.success('Logged out successfully!');
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
              <button className="notification-btn">🔔</button>
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
                  { id: 'messages', icon: '💬', label: 'Messages' },
                  { id: 'notifications', icon: '🔔', label: 'Notifications' },
                  { id: 'settings', icon: '⚙️', label: 'Settings' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'profile') {
                        navigate('/profile');
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
                    className="action-btn ai"
                    onClick={() => setShowCreatePost(true)}
                  >
                    <span className="action-icon">🔗</span>
                    <span className="action-label">Link</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="content-feed">
              {loading ? (
                <div className="loading-content">
                  <div className="loading-spinner"></div>
                  <span>Loading your feed...</span>
                </div>
              ) : posts.length === 0 ? (
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