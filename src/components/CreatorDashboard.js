import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:8000/api/content';

const CreatorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bulkUploads, setBulkUploads] = useState([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: '',
    pdf_file: null
  });
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAudioOnly, setShowAudioOnly] = useState(false);
  const [processingAudio, setProcessingAudio] = useState({});
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [audioLoading, setAudioLoading] = useState({});
  const [likedContent, setLikedContent] = useState(new Set());
  const [commentTexts, setCommentTexts] = useState({});
  const [showComments, setShowComments] = useState({});

  useEffect(() => {
    fetchDashboardData();
    fetchBulkUploads();
    fetchCategories();
  }, []);

  // Cleanup audio player on unmount
  useEffect(() => {
    return () => {
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
      }
    };
  }, [audioPlayer]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/creator/dashboard/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        toast.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchBulkUploads = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/creator/bulk-uploads/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBulkUploads(data);
      }
    } catch (error) {
      console.error('Error fetching bulk uploads:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/categories/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch categories:', response.status);
        setCategories([]);
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

      const response = await fetch(`${API_BASE}/creator/bulk-upload/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (response.ok) {
        toast.success('Bulk upload started successfully!');
        setUploadDialogOpen(false);
        setUploadForm({ title: '', description: '', category: '', pdf_file: null });
        fetchBulkUploads();
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

  const generateAudioForContent = async (contentId, contentTitle) => {
    setProcessingAudio(prev => ({ ...prev, [contentId]: true }));
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/creator/generate-audio/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content_id: contentId,
          generate_audio: true
        })
      });

      if (response.ok) {
        toast.success(`Audio generation started for "${contentTitle}"`);
        setTimeout(() => {
          fetchDashboardData();
        }, 3000);
      } else {
        toast.error('Failed to start audio generation');
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error('Error generating audio');
    } finally {
      setProcessingAudio(prev => ({ ...prev, [contentId]: false }));
    }
  };

  const playAudio = async (contentId, audioFile) => {
    try {
      setAudioLoading(prev => ({ ...prev, [contentId]: true }));
      
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
        setAudioLoading(prev => ({ ...prev, [contentId]: false }));
      });
      
      audio.addEventListener('play', () => {
        setCurrentlyPlaying(contentId);
      });
      
      audio.addEventListener('pause', () => {
        setCurrentlyPlaying(null);
      });
      
      audio.addEventListener('ended', () => {
        setCurrentlyPlaying(null);
      });
      
      audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        toast.error('Error playing audio');
        setAudioLoading(prev => ({ ...prev, [contentId]: false }));
      });
      
      await audio.play();
      setAudioPlayer(audio);
      
    } catch (error) {
      console.error('Error playing audio:', error);
      toast.error('Error playing audio');
      setAudioLoading(prev => ({ ...prev, [contentId]: false }));
    }
  };

  const pauseAudio = () => {
    if (audioPlayer) {
      audioPlayer.pause();
      setCurrentlyPlaying(null);
    }
  };

  const stopAudio = () => {
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
      setCurrentlyPlaying(null);
    }
  };

  const likeContent = async (contentId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/content/${contentId}/like/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLikedContent(prev => {
          const newSet = new Set(prev);
          if (data.liked) {
            newSet.add(contentId);
          } else {
            newSet.delete(contentId);
          }
          return newSet;
        });
        
        // Update dashboard data
        fetchDashboardData();
        toast.success(data.liked ? 'Content liked!' : 'Content unliked');
      } else {
        toast.error('Failed to like content');
      }
    } catch (error) {
      console.error('Error liking content:', error);
      toast.error('Error liking content');
    }
  };

  const commentContent = async (contentId) => {
    const commentText = commentTexts[contentId]?.trim();
    if (!commentText) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/content/${contentId}/comment/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: commentText })
      });
      
      if (response.ok) {
        const data = await response.json();
        setCommentTexts(prev => ({ ...prev, [contentId]: '' }));
        toast.success('Comment added successfully!');
        
        // Update dashboard data
        fetchDashboardData();
      } else {
        toast.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error commenting on content:', error);
      toast.error('Error adding comment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'processing': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'processing': return '⏳';
      case 'failed': return '❌';
      default: return '⏳';
    }
  };

  const filteredContent = dashboardData?.recent_content?.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || content.category === filterCategory;
    const matchesAudioFilter = !showAudioOnly || content.audio_file;
    return matchesSearch && matchesCategory && matchesAudioFilter;
  }) || [];

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

  if (!dashboardData) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Failed to load dashboard data</h2>
          <button onClick={fetchDashboardData} style={{
            padding: '12px 24px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            Refresh
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
            Creator Dashboard
          </h1>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
            <button
              onClick={fetchDashboardData}
              style={{
                padding: '10px 20px',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => setUploadDialogOpen(true)}
              style={{
                padding: '10px 20px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              📤 Upload Content
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px'
      }}>
        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px' }}>Total Followers</p>
                <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>
                  {dashboardData.followers_count || 0}
                </h3>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#10b981' }}>
                  +{dashboardData.follower_growth?.this_month || 0} this month
                </p>
              </div>
              <div style={{ fontSize: '48px', opacity: 0.6 }}>👥</div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px' }}>Total Views</p>
                <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>
                  {dashboardData.content_performance?.total_views || 0}
                </h3>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#10b981' }}>
                  +{dashboardData.content_performance?.week_growth_percentage || 0}% this week
                </p>
              </div>
              <div style={{ fontSize: '48px', opacity: 0.6 }}>👁️</div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px' }}>Total Likes</p>
                <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>
                  {dashboardData.content_performance?.total_likes || 0}
                </h3>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#10b981' }}>
                  +{dashboardData.content_performance?.month_growth_percentage || 0}% this month
                </p>
              </div>
              <div style={{ fontSize: '48px', opacity: 0.6 }}>❤️</div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px' }}>Engagement Rate</p>
                <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>
                  {dashboardData.content_performance?.average_engagement_rate || 0}%
                </h3>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#10b981' }}>
                  +{dashboardData.content_performance?.week_growth_percentage || 0}% this week
                </p>
              </div>
              <div style={{ fontSize: '48px', opacity: 0.6 }}>📈</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0'
          }}>
            {[
              { id: 0, label: 'Overview', icon: '📊' },
              { id: 1, label: 'Content', icon: '📝' },
              { id: 2, label: 'Bulk Upload', icon: '📤' },
              { id: 3, label: 'Analytics', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  background: activeTab === tab.id ? '#f8fafc' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                  color: activeTab === tab.id ? '#3b82f6' : '#64748b',
                  fontWeight: activeTab === tab.id ? '600' : '400',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '16px'
                }}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: '32px' }}>
            {/* Overview Tab */}
            {activeTab === 0 && (
              <div>
                <h3 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '600' }}>
                  Content Performance Overview
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '24px',
                  marginBottom: '32px'
                }}>
                  <div style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
                      Top Performing Content
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {dashboardData.top_performing_content?.slice(0, 5).map((content, index) => (
                        <div key={content.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          background: 'white',
                          borderRadius: '8px'
                        }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: index === 0 ? '#ffd700' : 
                                       index === 1 ? '#c0c0c0' : 
                                       index === 2 ? '#cd7f32' : '#3b82f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '14px'
                          }}>
                            {index + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h5 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600' }}>
                              {content.title}
                            </h5>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                              {content.views_count} views • {content.likes_count} likes
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Content with Like/Comment */}
                <div style={{ marginTop: '32px' }}>
                  <h4 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
                    Recent Content
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '24px'
                  }}>
                    {dashboardData.recent_content?.map((content) => (
                      <div key={content.id} style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '20px',
                        border: '1px solid #e2e8f0',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600', flex: 1 }}>
                            {content.title}
                          </h4>
                        </div>
                        
                        <p style={{
                          margin: '0 0 16px 0',
                          fontSize: '14px',
                          color: '#64748b',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {content.description}
                        </p>

                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                          <span style={{
                            padding: '4px 8px',
                            background: '#f1f5f9',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: '#475569'
                          }}>
                            👁️ {content.views_count} views
                          </span>
                          <span style={{
                            padding: '4px 8px',
                            background: '#f1f5f9',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: '#475569'
                          }}>
                            ❤️ {content.likes_count} likes
                          </span>
                          {content.audio_file && (
                            <span style={{
                              padding: '4px 8px',
                              background: '#dcfce7',
                              borderRadius: '6px',
                              fontSize: '12px',
                              color: '#166534'
                            }}>
                              🔊 Audio
                            </span>
                          )}
                        </div>

                        {/* Audio Player */}
                        {content.audio_file && (
                          <div style={{
                            background: '#f8fafc',
                            borderRadius: '12px',
                            padding: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '16px'
                          }}>
                            <button
                              onClick={() => {
                                if (currentlyPlaying === content.id) {
                                  pauseAudio();
                                } else {
                                  playAudio(content.id, content.audio_file);
                                }
                              }}
                              style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: currentlyPlaying === content.id ? '#ef4444' : '#3b82f6',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px'
                              }}
                            >
                              {audioLoading[content.id] ? '⏳' : currentlyPlaying === content.id ? '⏸️' : '▶️'}
                            </button>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                                {content.title}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>
                                {audioLoading[content.id] ? 'Loading...' : currentlyPlaying === content.id ? 'Now Playing' : 'Click to play'}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Like and Comment Actions */}
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => likeContent(content.id)}
                              style={{
                                padding: '8px 16px',
                                background: likedContent.has(content.id) ? '#ef4444' : '#f1f5f9',
                                color: likedContent.has(content.id) ? 'white' : '#475569',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              {likedContent.has(content.id) ? '❤️' : '🤍'} 
                              {likedContent.has(content.id) ? 'Liked' : 'Like'}
                            </button>
                            <button
                              onClick={() => setShowComments(prev => ({ ...prev, [content.id]: !prev[content.id] }))}
                              style={{
                                padding: '8px 16px',
                                background: '#f1f5f9',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              💬 Comment
                            </button>
                          </div>
                        </div>

                        {/* Comment Section */}
                        {showComments[content.id] && (
                          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                              <input
                                type="text"
                                placeholder="Write a comment..."
                                value={commentTexts[content.id] || ''}
                                onChange={(e) => setCommentTexts(prev => ({ ...prev, [content.id]: e.target.value }))}
                                style={{
                                  flex: 1,
                                  padding: '8px 12px',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '6px',
                                  fontSize: '14px'
                                }}
                              />
                              <button
                                onClick={() => commentContent(content.id)}
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
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === 1 && (
              <div>
                {/* Search and Filter */}
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '24px',
                  flexWrap: 'wrap',
                  alignItems: 'center'
                }}>
                  <input
                    type="text"
                    placeholder="Search content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: '300px',
                      padding: '12px 16px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    style={{
                      padding: '12px 16px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '16px',
                      minWidth: '150px'
                    }}
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={showAudioOnly}
                      onChange={(e) => setShowAudioOnly(e.target.checked)}
                    />
                    Audio Only
                  </label>
                </div>

                {/* Content Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '24px'
                }}>
                  {filteredContent.map((content) => (
                    <div key={content.id} style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '1px solid #e2e8f0',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600', flex: 1 }}>
                          {content.title}
                        </h4>
                        <button style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}>
                          ⋮
                        </button>
                      </div>
                      
                      <p style={{
                        margin: '0 0 16px 0',
                        fontSize: '14px',
                        color: '#64748b',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {content.description}
                      </p>

                      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '4px 8px',
                          background: '#f1f5f9',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: '#475569'
                        }}>
                          👁️ {content.views_count} views
                        </span>
                        <span style={{
                          padding: '4px 8px',
                          background: '#f1f5f9',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: '#475569'
                        }}>
                          ❤️ {content.likes_count} likes
                        </span>
                        <span style={{
                          padding: '4px 8px',
                          background: '#f1f5f9',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: '#475569'
                        }}>
                          ⭐ {content.average_rating || 0} stars
                        </span>
                        {content.audio_file && (
                          <span style={{
                            padding: '4px 8px',
                            background: '#dcfce7',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: '#166534'
                          }}>
                            🔊 Audio
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                        <button style={{
                          padding: '8px 16px',
                          background: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}>
                          ✏️ Edit
                        </button>
                        {!content.audio_file && (
                          <button
                            onClick={() => generateAudioForContent(content.id, content.title)}
                            disabled={processingAudio[content.id]}
                            style={{
                              padding: '8px 16px',
                              background: processingAudio[content.id] ? '#94a3b8' : '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: processingAudio[content.id] ? 'not-allowed' : 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            {processingAudio[content.id] ? '⏳ Generating...' : '🎤 Generate Audio'}
                          </button>
                        )}
                        {content.audio_file && (
                          <button
                            onClick={() => {
                              if (currentlyPlaying === content.id) {
                                pauseAudio();
                              } else {
                                playAudio(content.id, content.audio_file);
                              }
                            }}
                            style={{
                              padding: '8px 16px',
                              background: currentlyPlaying === content.id ? '#ef4444' : '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            {audioLoading[content.id] ? '⏳ Loading...' : 
                             currentlyPlaying === content.id ? '⏸️ Pause' : '▶️ Play Audio'}
                          </button>
                        )}
                      </div>

                      {/* Like and Comment Actions */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => likeContent(content.id)}
                            style={{
                              padding: '6px 12px',
                              background: likedContent.has(content.id) ? '#ef4444' : '#f1f5f9',
                              color: likedContent.has(content.id) ? 'white' : '#475569',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {likedContent.has(content.id) ? '❤️' : '🤍'} 
                            {likedContent.has(content.id) ? 'Liked' : 'Like'}
                          </button>
                          <button
                            onClick={() => setShowComments(prev => ({ ...prev, [content.id]: !prev[content.id] }))}
                            style={{
                              padding: '6px 12px',
                              background: '#f1f5f9',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            💬 Comment
                          </button>
                        </div>
                      </div>

                      {/* Comment Section */}
                      {showComments[content.id] && (
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            <input
                              type="text"
                              placeholder="Write a comment..."
                              value={commentTexts[content.id] || ''}
                              onChange={(e) => setCommentTexts(prev => ({ ...prev, [content.id]: e.target.value }))}
                              style={{
                                flex: 1,
                                padding: '6px 10px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '12px'
                              }}
                            />
                            <button
                              onClick={() => commentContent(content.id)}
                              style={{
                                padding: '6px 12px',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Post
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {filteredContent.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: '#64748b'
                  }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>📝</div>
                    <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>No content found</h3>
                    <p style={{ margin: 0 }}>Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </div>
            )}

            {/* Bulk Upload Tab */}
            {activeTab === 2 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                    Bulk PDF Uploads
                  </h3>
                  <button
                    onClick={() => setUploadDialogOpen(true)}
                    style={{
                      padding: '12px 24px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    📤 Upload PDF
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {bulkUploads.map((upload) => (
                    <div key={upload.id} style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '24px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
                            {upload.title}
                          </h4>
                          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#64748b' }}>
                            {upload.description}
                          </p>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
                            <span style={{
                              padding: '6px 12px',
                              background: getStatusColor(upload.status),
                              color: 'white',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              {getStatusIcon(upload.status)} {upload.status}
                            </span>
                            <span style={{ fontSize: '14px', color: '#64748b' }}>
                              {upload.file_size_mb} MB • {upload.page_count || 0} pages
                            </span>
                          </div>
                          {upload.status === 'processing' && (
                            <div style={{ marginBottom: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '14px', color: '#64748b' }}>Processing Progress</span>
                                <span style={{ fontSize: '14px', fontWeight: '600' }}>{upload.progress}%</span>
                              </div>
                              <div style={{
                                width: '100%',
                                height: '8px',
                                background: '#e2e8f0',
                                borderRadius: '4px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${upload.progress}%`,
                                  height: '100%',
                                  background: '#3b82f6',
                                  transition: 'width 0.3s ease'
                                }}></div>
                              </div>
                            </div>
                          )}
                          {upload.status === 'completed' && (
                            <p style={{ margin: 0, fontSize: '14px', color: '#10b981', fontWeight: '600' }}>
                              ✅ Processed {upload.processed_content_count} content pieces
                            </p>
                          )}
                          {upload.status === 'failed' && (
                            <p style={{ margin: 0, fontSize: '14px', color: '#ef4444' }}>
                              ❌ {upload.error_message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {bulkUploads.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: '#64748b'
                  }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>📤</div>
                    <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>No bulk uploads yet</h3>
                    <p style={{ margin: '0 0 24px 0' }}>Upload your first PDF to start bulk processing</p>
                    <button
                      onClick={() => setUploadDialogOpen(true)}
                      style={{
                        padding: '12px 24px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      📤 Upload Your First PDF
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 3 && (
              <div>
                <h3 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '600' }}>
                  Analytics Overview
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '24px'
                }}>
                  <div style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
                      Content Analytics
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: '#3b82f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px'
                        }}>
                          📝
                        </div>
                        <div>
                          <h5 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>Total Content</h5>
                          <p style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                            {dashboardData.content_performance?.total_content || 0}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px'
                        }}>
                          ⭐
                        </div>
                        <div>
                          <h5 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>Average Rating</h5>
                          <p style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>
                            {dashboardData.analytics?.average_rating || 0} stars
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {uploadDialogOpen && (
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
                onClick={() => setUploadDialogOpen(false)}
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
                onClick={() => setUploadDialogOpen(false)}
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

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CreatorDashboard;