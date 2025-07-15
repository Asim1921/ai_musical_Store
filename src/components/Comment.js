// src/components/Comment.js
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:8000/api/social';

const commentApi = {
  getComments: async (postId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/posts/${postId}/comments/`, {
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
      console.error('Error fetching comments:', error);
      return [];
    }
  },

  createComment: async (postId, content) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/posts/${postId}/comments/create/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content })
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }
};

const CommentItem = ({ comment }) => {
  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      padding: '12px 0',
      borderBottom: '1px solid #f1f5f9'
    }}>
      <img
        src={comment.author.avatar_url}
        alt={comment.author.username}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          objectFit: 'cover'
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '4px'
        }}>
          <span style={{
            fontWeight: '600',
            fontSize: '14px',
            color: '#1e293b'
          }}>
            @{comment.author.username}
          </span>
          <span style={{
            fontSize: '12px',
            color: '#64748b'
          }}>
            {comment.time_ago}
          </span>
        </div>
        <p style={{
          margin: 0,
          fontSize: '14px',
          color: '#374151',
          lineHeight: '1.4'
        }}>
          {comment.content}
        </p>
        
        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div style={{
            marginTop: '8px',
            paddingLeft: '16px',
            borderLeft: '2px solid #f1f5f9'
          }}>
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CommentModal = ({ isOpen, onClose, postId, initialCommentsCount, onCommentAdded }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && postId) {
      loadComments();
    }
  }, [isOpen, postId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const commentsData = await commentApi.getComments(postId);
      setComments(commentsData);
    } catch (error) {
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setSubmitting(true);
    try {
      const comment = await commentApi.createComment(postId, newComment.trim());
      setComments(prevComments => [comment, ...prevComments]);
      setNewComment('');
      toast.success('Comment added!');
      
      // Notify parent component that a comment was added
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
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
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
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
            Comments ({comments.length})
          </h3>
          <button
            onClick={onClose}
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

        {/* Comment Form */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0' }}>
          <form onSubmit={handleSubmitComment}>
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}>
              <img
                src={JSON.parse(localStorage.getItem('user_data')).avatar || 
                     `https://ui-avatars.com/api/?name=${JSON.parse(localStorage.getItem('user_data')).first_name}&background=6366f1&color=fff&size=40`}
                alt="Your avatar"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
              <div style={{ flex: 1 }}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: '8px'
                }}>
                  <button
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    style={{
                      padding: '8px 16px',
                      background: submitting || !newComment.trim() ? '#94a3b8' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: submitting || !newComment.trim() ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    {submitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Comments List */}
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
          ) : comments.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#64748b'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>No comments yet</h4>
              <p style={{ margin: 0 }}>Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div>
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentModal;