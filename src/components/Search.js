// src/components/Search.js
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:8000/api/social';

const searchApi = {
  searchUsers: async (query) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/search/users/?q=${encodeURIComponent(query)}`, {
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
      console.error('Error searching users:', error);
      return [];
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

const UserSearchResult = ({ user, onFollow, onUserClick }) => {
  const [isFollowing, setIsFollowing] = useState(user.is_following);
  const [followersCount, setFollowersCount] = useState(user.followers_count);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async (e) => {
    e.stopPropagation(); // Prevent user click when clicking follow button
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      const result = await onFollow(user.id);
      setIsFollowing(result.action === 'followed');
      setFollowersCount(result.followers_count);
      toast.success(`User ${result.action} successfully!`);
    } catch (error) {
      toast.error('Failed to follow/unfollow user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = () => {
    onUserClick(user.username);
  };

  return (
    <div 
      onClick={handleUserClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        marginBottom: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#f8fafc';
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'white';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <img
        src={user.avatar_url}
        alt={user.username}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          objectFit: 'cover'
        }}
      />
      <div style={{ flex: 1 }}>
        <h4 style={{ 
          margin: '0 0 4px 0', 
          fontSize: '16px', 
          fontWeight: '600',
          color: '#1e293b'
        }}>
          {user.first_name} {user.last_name}
        </h4>
        <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#64748b' }}>
          @{user.username}
        </p>
        {user.bio && (
          <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
            {user.bio.substring(0, 80)}...
          </p>
        )}
        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
          {followersCount} followers • {user.posts_count} posts
        </div>
      </div>
      <button
        onClick={handleFollow}
        disabled={isLoading}
        style={{
          padding: '8px 16px',
          border: 'none',
          borderRadius: '6px',
          background: isFollowing ? '#e2e8f0' : '#3b82f6',
          color: isFollowing ? '#374151' : 'white',
          fontSize: '14px',
          fontWeight: '500',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.7 : 1,
          transition: 'all 0.2s ease'
        }}
      >
        {isLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  );
};

const SearchModal = ({ isOpen, onClose, onFollowUpdate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (query.length >= 2) {
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 300); // Debounce search
      
      return () => clearTimeout(timeoutId);
    } else {
      setResults([]);
      setHasSearched(false);
    }
  }, [query]);

  const handleSearch = async () => {
    if (query.length < 2) return;
    
    setLoading(true);
    setHasSearched(true);
    
    try {
      const searchResults = await searchApi.searchUsers(query);
      setResults(searchResults);
    } catch (error) {
      toast.error('Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      const result = await searchApi.toggleFollow(userId);
      
      // Update the specific user in results
      setResults(prevResults =>
        prevResults.map(user =>
          user.id === userId
            ? {
                ...user,
                is_following: result.action === 'followed',
                followers_count: result.followers_count
              }
            : user
        )
      );

      // Notify parent component about follow update
      if (onFollowUpdate) {
        onFollowUpdate(userId, result);
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleUserClick = (username) => {
    // Close search modal and navigate to user profile
    onClose();
    window.location.href = `/profile/${username}`;
  };

  const handleClose = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    onClose();
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
      alignItems: 'flex-start',
      justifyContent: 'center',
      zIndex: 1000,
      paddingTop: '10vh'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '70vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: '#1e293b'
          }}>
            Search Users
          </h3>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#64748b',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        </div>

        {/* Search Input */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for users..."
              style={{
                width: '100%',
                padding: '12px 16px 12px 40px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              autoFocus
            />
            <div style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '16px',
              color: '#64748b'
            }}>
              🔍
            </div>
          </div>
        </div>

        {/* Results */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px 24px'
        }}>
          {loading ? (
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
          ) : query.length < 2 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#64748b'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>Search for Users</h4>
              <p style={{ margin: 0 }}>Type at least 2 characters to start searching</p>
            </div>
          ) : hasSearched && results.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#64748b'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
              <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>No users found</h4>
              <p style={{ margin: 0 }}>Try searching with different keywords</p>
            </div>
          ) : (
            <div>
              {results.map((user) => (
                <UserSearchResult
                  key={user.id}
                  user={user}
                  onFollow={handleFollow}
                  onUserClick={handleUserClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;