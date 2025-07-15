// src/components/PostCard.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CommentModal from './Comment';

const PostCard = ({ post, onLike, onFollow, onCommentAdded }) => {
  const navigate = useNavigate();
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);

  const currentUser = JSON.parse(localStorage.getItem('user_data'));

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await onLike(post.id);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentAdded = () => {
    setCommentsCount(prev => prev + 1);
    if (onCommentAdded) {
      onCommentAdded(post.id);
    }
  };

  const handleUserClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to user's profile
    navigate(`/profile/${post.author.username}`);
  };

  return (
    <>
      <div className="content-post">
        <div className="post-header">
          <img
            src={post.author.avatar_url}
            alt={post.author.username}
            className="post-avatar"
            onClick={handleUserClick}
            style={{ cursor: 'pointer' }}
          />
          <div className="post-info" style={{ flex: 1 }}>
            <h4 
              className="post-author" 
              onClick={handleUserClick}
              style={{ cursor: 'pointer', transition: 'color 0.2s ease' }}
              onMouseEnter={(e) => e.target.style.color = '#3b82f6'}
              onMouseLeave={(e) => e.target.style.color = '#1e293b'}
            >
              @{post.author.username}
            </h4>
            <p className="post-time">{post.time_ago}</p>
          </div>
          {post.author.id !== currentUser.id && (
            <button
              onClick={() => onFollow(post.author.id)}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '6px',
                background: post.author.is_following ? '#e2e8f0' : '#3b82f6',
                color: post.author.is_following ? '#374151' : 'white',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {post.author.is_following ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
        
        <h3 className="post-title">{post.title}</h3>
        
        {post.content && (
          <p className="post-description">{post.content}</p>
        )}
        
        {post.image_url && (
          <div style={{ marginBottom: '16px' }}>
            <img
              src={post.image_url}
              alt="Post image"
              style={{
                width: '100%',
                borderRadius: '12px',
                maxHeight: '400px',
                objectFit: 'cover'
              }}
            />
          </div>
        )}
        
        {post.link_url && (
          <div style={{ marginBottom: '16px' }}>
            <a
              href={post.link_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#3b82f6',
                backgroundColor: '#f8fafc',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f8fafc'}
            >
              🔗 {post.link_url}
            </a>
          </div>
        )}
        
        <div className="post-actions-bar">
          <button 
            className={`action-btn-small like ${post.is_liked ? 'liked' : ''}`}
            onClick={handleLike}
            disabled={isLiking}
            style={{
              color: post.is_liked ? '#ef4444' : '#64748b',
              cursor: isLiking ? 'not-allowed' : 'pointer',
              opacity: isLiking ? 0.7 : 1
            }}
          >
            {post.is_liked ? '❤️' : '🤍'} {post.likes_count}
          </button>
          
          <button 
            className="action-btn-small comment"
            onClick={() => setShowComments(true)}
            style={{
              color: '#64748b',
              cursor: 'pointer'
            }}
          >
            💬 {commentsCount}
          </button>
          
          <button className="action-btn-small share">
            📤 Share
          </button>
          
          <button className="action-btn-small save">
            🔖 Save
          </button>
        </div>
      </div>

      {/* Comments Modal */}
      <CommentModal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        postId={post.id}
        initialCommentsCount={commentsCount}
        onCommentAdded={handleCommentAdded}
      />
    </>
  );
};

export default PostCard;