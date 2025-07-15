// src/components/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PostCard from './PostCard';

const API_BASE = 'http://localhost:8000/api/social';

const profileApi = {
  getUserProfile: async (username = null) => {
    try {
      const token = localStorage.getItem('access_token');
      const url = username ? `${API_BASE}/profile/${username}/` : `${API_BASE}/profile/`;
      
      const response = await fetch(url, {
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

  getUserPosts: async (username) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/profile/${username}/posts/`, {
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
      console.error('Error fetching user posts:', error);
      return [];
    }
  },

  updateProfile: async (profileData) => {
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== null && profileData[key] !== undefined) {
          formData.append(key, profileData[key]);
        }
      });

      const response = await fetch(`${API_BASE}/profile/update/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.error('Error updating profile:', error);
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
  }
};

const EditProfileModal = ({ isOpen, onClose, profile, onProfileUpdated }) => {
  const [editData, setEditData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        bio: profile.bio || '',
        website: profile.website || ''
      });
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updatedProfile = await profileApi.updateProfile(editData);
      toast.success('Profile updated successfully!');
      onProfileUpdated(updatedProfile);
      onClose();
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
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
        padding: '24px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Edit Profile</h3>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Avatar</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setEditData({ ...editData, avatar: e.target.files[0] })}
              style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>First Name</label>
              <input
                type="text"
                value={editData.first_name}
                onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Last Name</label>
              <input
                type="text"
                value={editData.last_name}
                onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Bio</label>
            <textarea
              value={editData.bio}
              onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={3}
              style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', resize: 'vertical' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Website</label>
            <input
              type="url"
              value={editData.website}
              onChange={(e) => setEditData({ ...editData, website: e.target.value })}
              placeholder="https://yourwebsite.com"
              style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '10px 20px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { username } = useParams(); // Get username from URL
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  const currentUser = JSON.parse(localStorage.getItem('user_data'));
  const isOwnProfile = !username || username === currentUser.username;

  useEffect(() => {
    loadProfile();
    loadPosts();
  }, [username]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const profileData = await profileApi.getUserProfile(username);
      setProfile(profileData);
    } catch (error) {
      toast.error('Failed to load profile');
      navigate('/dashboard'); // Redirect to dashboard if profile not found
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    setPostsLoading(true);
    try {
      const targetUsername = username || currentUser.username;
      const postsData = await profileApi.getUserPosts(targetUsername);
      setPosts(postsData);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setPostsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!profile) return;
    
    try {
      const result = await profileApi.toggleFollow(profile.id);
      setProfile(prevProfile => ({
        ...prevProfile,
        is_following: result.action === 'followed',
        followers_count: result.followers_count
      }));

      // Update localStorage if viewing own profile after someone follows/unfollows
      const currentUser = JSON.parse(localStorage.getItem('user_data'));
      if (result.action === 'followed') {
        // Someone followed this user, update their following count if it's the current user
        const updatedUser = { ...currentUser, following_count: currentUser.following_count + 1 };
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
      } else {
        // Someone unfollowed this user
        const updatedUser = { ...currentUser, following_count: currentUser.following_count - 1 };
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
      }

      toast.success(`User ${result.action} successfully!`);
    } catch (error) {
      console.error('Follow error:', error);
      toast.error('Failed to follow/unfollow user');
    }
  };

  const handleLike = async (postId) => {
    try {
      const result = await profileApi.toggleLike(postId);
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

  const handleProfileUpdated = (updatedProfile) => {
    setProfile(updatedProfile);
    if (isOwnProfile) {
      localStorage.setItem('user_data', JSON.stringify(updatedProfile));
    }
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

  if (loading) {
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

  if (!profile) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Profile not found</h2>
          <button onClick={() => navigate('/dashboard')}>
            Go back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ←
          </button>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
            {isOwnProfile ? 'My Profile' : `@${profile.username}`}
          </h1>
        </div>
      </div>

      {/* Profile Content */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '24px'
      }}>
        {/* Profile Header */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '24px',
            marginBottom: '24px'
          }}>
            <img
              src={profile.avatar_url}
              alt={profile.username}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid #3b82f6'
              }}
            />
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700' }}>
                {profile.first_name} {profile.last_name}
              </h2>
              <p style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#64748b' }}>
                @{profile.username}
              </p>
              
              {profile.bio && (
                <p style={{ margin: '0 0 16px 0', fontSize: '16px', lineHeight: '1.5' }}>
                  {profile.bio}
                </p>
              )}
              
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#3b82f6',
                    textDecoration: 'none',
                    fontSize: '16px'
                  }}
                >
                  🔗 {profile.website}
                </a>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              {isOwnProfile ? (
                <button
                  onClick={() => setShowEditModal(true)}
                  style={{
                    padding: '12px 24px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  style={{
                    padding: '12px 24px',
                    background: profile.is_following ? '#e2e8f0' : '#3b82f6',
                    color: profile.is_following ? '#374151' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {profile.is_following ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex',
            gap: '32px',
            padding: '20px 0',
            borderTop: '1px solid #e2e8f0'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                {profile.posts_count}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Posts</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                {profile.followers_count}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Followers</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                {profile.following_count}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Following</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#64748b' }}>Joined</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>
                {new Date(profile.created_at).toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0'
          }}>
            {['posts', 'likes', 'media'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
                  color: activeTab === tab ? '#3b82f6' : '#64748b',
                  fontWeight: activeTab === tab ? '600' : '400',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab} ({tab === 'posts' ? posts.length : 0})
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: '24px' }}>
            {activeTab === 'posts' && (
              <div>
                {postsLoading ? (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '40px'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      border: '2px solid #e2e8f0',
                      borderTop: '2px solid #3b82f6',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                  </div>
                ) : posts.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#64748b'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                    <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>
                      {isOwnProfile ? 'No posts yet' : `${profile.first_name} hasn't posted yet`}
                    </h4>
                    <p style={{ margin: 0 }}>
                      {isOwnProfile ? 'Share your first post with the world!' : 'Check back later for new content'}
                    </p>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px'
                  }}>
                    {posts.map((post) => (
                      <PostCard 
                        key={post.id} 
                        post={post} 
                        onLike={handleLike}
                        onFollow={() => {}} // No follow button on own posts
                        onCommentAdded={handleCommentAdded}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'likes' && (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#64748b'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>❤️</div>
                <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>Liked Posts</h4>
                <p style={{ margin: 0 }}>Feature coming soon!</p>
              </div>
            )}

            {activeTab === 'media' && (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#64748b'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
                <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>Media Posts</h4>
                <p style={{ margin: 0 }}>Feature coming soon!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        onProfileUpdated={handleProfileUpdated}
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

export default ProfilePage;