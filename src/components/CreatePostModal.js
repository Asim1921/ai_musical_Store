// src/components/CreatePostModal.js
import React, { useState } from 'react';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:8000/api/social';

const postApi = {
  createPost: async (postData) => {
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      
      Object.keys(postData).forEach(key => {
        if (postData[key] !== null && postData[key] !== undefined) {
          formData.append(key, postData[key]);
        }
      });

      const response = await fetch(`${API_BASE}/posts/create/`, {
        method: 'POST',
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
      console.error('Error creating post:', error);
      throw error;
    }
  }
};

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    post_type: 'text',
    image: null,
    link_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleInputChange = (field, value) => {
    setPostData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostData(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!postData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (postData.post_type === 'image' && !postData.image) {
      toast.error('Please select an image for image posts');
      return;
    }

    if (postData.post_type === 'link' && !postData.link_url.trim()) {
      toast.error('Please enter a link URL for link posts');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const newPost = await postApi.createPost(postData);
      toast.success('Post created successfully!');
      onPostCreated(newPost);
      handleClose();
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPostData({
      title: '',
      content: '',
      post_type: 'text',
      image: null,
      link_url: ''
    });
    setImagePreview(null);
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
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px' 
        }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
            Create New Post
          </h3>
          <button 
            onClick={handleClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '24px', 
              cursor: 'pointer',
              color: '#64748b',
              padding: '4px',
              borderRadius: '4px'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Post Type Selection */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500',
              color: '#374151'
            }}>
              Post Type
            </label>
            <div style={{ 
              display: 'flex', 
              gap: '8px',
              padding: '4px',
              backgroundColor: '#f1f5f9',
              borderRadius: '8px'
            }}>
              {[
                { value: 'text', label: '📝 Text', icon: '📝' },
                { value: 'image', label: '📷 Image', icon: '📷' },
                { value: 'link', label: '🔗 Link', icon: '🔗' }
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleInputChange('post_type', type.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: '6px',
                    background: postData.post_type === type.value ? '#3b82f6' : 'transparent',
                    color: postData.post_type === type.value ? 'white' : '#64748b',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500',
              color: '#374151'
            }}>
              Title *
            </label>
            <input
              type="text"
              value={postData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="What's your post about?"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              required
            />
          </div>

          {/* Content */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500',
              color: '#374151'
            }}>
              Content
            </label>
            <textarea
              value={postData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          {/* Image Upload (for image posts) */}
          {postData.post_type === 'image' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                color: '#374151'
              }}>
                Image *
              </label>
              <div style={{
                border: '2px dashed #e2e8f0',
                borderRadius: '8px',
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = '#e2e8f0';
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) {
                  handleImageChange({ target: { files: [file] } });
                }
              }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                  id="image-upload"
                />
                <label htmlFor="image-upload" style={{ cursor: 'pointer' }}>
                  {imagePreview ? (
                    <div>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          borderRadius: '8px',
                          marginBottom: '12px'
                        }}
                      />
                      <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        Click to change image
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '48px', marginBottom: '12px' }}>📷</div>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '16px' }}>
                        Click to upload or drag and drop
                      </p>
                      <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Link URL (for link posts) */}
          {postData.post_type === 'link' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                color: '#374151'
              }}>
                Link URL *
              </label>
              <input
                type="url"
                value={postData.link_url}
                onChange={(e) => handleInputChange('link_url', e.target.value)}
                placeholder="https://example.com"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                required
              />
            </div>
          )}

          {/* Actions */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'flex-end',
            paddingTop: '16px',
            borderTop: '1px solid #e2e8f0'
          }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              style={{
                padding: '12px 20px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                background: 'white',
                color: '#64748b',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !postData.title.trim()}
              style={{
                padding: '12px 20px',
                background: (isSubmitting || !postData.title.trim()) ? '#94a3b8' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: (isSubmitting || !postData.title.trim()) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isSubmitting && (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #ffffff40',
                  borderTop: '2px solid #ffffff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              )}
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;