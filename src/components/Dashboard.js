import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

// API configuration - Updated to work with real backend
const API_BASE = 'http://localhost:8000/api/ai-pipeline';

const api = {
  getRawContents: async () => {
    try {
      const response = await fetch(`${API_BASE}/raw-contents/`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.error('Error fetching raw contents:', error);
      toast.error('Failed to load content. Please check if Django server is running.');
      return [];
    }
  },
  
  getDashboardStats: async () => {
    try {
      const response = await fetch(`${API_BASE}/pipeline-control/dashboard_stats/`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard stats.');
      return {
        contents: { total: 0, completed: 0, processing: 0, pending: 0 },
        jobs: { total: 0, active: 0, completed: 0, failed: 0 },
        sources: { total: 0, active: 0, paused: 0 }
      };
    }
  },
  
  triggerPipeline: async () => {
    try {
      const response = await fetch(`${API_BASE}/pipeline-control/run_pipeline/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        return data;
      } else {
        throw new Error(data.error || 'Pipeline trigger failed');
      }
    } catch (error) {
      console.error('Error triggering pipeline:', error);
      throw error;
    }
  },
  
  testReddit: async () => {
    try {
      const response = await fetch(`${API_BASE}/test-reddit/`);
      return await response.json();
    } catch (error) {
      console.error('Error testing Reddit:', error);
      return { success: false, error: error.message };
    }
  },
  
  getContentSources: async () => {
    try {
      const response = await fetch(`${API_BASE}/content-sources/`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.error('Error fetching content sources:', error);
      return [];
    }
  },
  
  getProcessingJobs: async () => {
    try {
      const response = await fetch(`${API_BASE}/processing-jobs/`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.error('Error fetching processing jobs:', error);
      return [];
    }
  }
};

const AudioPlayer = ({ content }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            clearInterval(interval);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  useEffect(() => {
    const estimatedDuration = Math.max(60, Math.floor(content.content.length / 10));
    setDuration(estimatedDuration);
  }, [content]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="audio-player">
      <button 
        className="play-button"
        onClick={togglePlay}
      >
        {isPlaying ? '⏸️' : '▶️'}
      </button>
      <div className="audio-info">
        <div className="audio-title">{content.title}</div>
        <div className="audio-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <span className="audio-time">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
};

const ContentPost = ({ content, index }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return '#22c55e';
      case 'processed': return '#f59e0b';
      case 'processing': return '#3b82f6';
      case 'pending': return '#6b7280';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'published': return 'AI Generated ✓';
      case 'processed': return 'Processed ✓';
      case 'processing': return 'Processing...';
      case 'pending': return 'Pending';
      case 'failed': return 'Failed ❌';
      default: return 'Unknown';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getDisplayContent = () => {
    return content.processed_content || content.content;
  };

  return (
    <div className="content-post">
      <div className="post-header">
        <img
          src={`https://ui-avatars.com/api/?name=${content.author}&background=${getStatusColor(content.processing_status).slice(1)}&color=fff&size=40`}
          alt="User"
          className="post-avatar"
        />
        <div className="post-info">
          <h4 className="post-author">u/{content.author}</h4>
          <p className="post-time">
            {formatTimeAgo(content.created_at)} • {getStatusText(content.processing_status)}
            {content.subreddit && ` • r/${content.subreddit}`}
          </p>
        </div>
        <div className="post-metrics">
          <span className="metric-item">⬆️ {content.score || 0}</span>
          <span className="metric-item">💬 {content.num_comments || 0}</span>
          {content.word_count && (
            <span className="metric-item">📝 {content.word_count} words</span>
          )}
        </div>
      </div>
      
      <h3 className="post-title">{content.title}</h3>
      <p className="post-description">
        {getDisplayContent()}
      </p>
      
      {(content.quality_score > 0 || content.engagement_score > 0) && (
        <div className="ai-scores">
          {content.quality_score > 0 && (
            <div className="score-badge">
              🎯 Quality: {Math.round(content.quality_score * 100)}%
            </div>
          )}
          {content.engagement_score > 0 && (
            <div className="score-badge">
              📈 Engagement: {Math.round(content.engagement_score * 100)}%
            </div>
          )}
        </div>
      )}
      
      {content.processing_status === 'published' && content.audio_file && (
        <AudioPlayer content={content} />
      )}
      
      {content.processing_status === 'processing' && (
        <div className="processing-indicator">
          <div className="processing-spinner"></div>
          <span>AI is processing this content...</span>
        </div>
      )}
      
      {content.processing_status === 'failed' && (
        <div className="failed-indicator">
          <span>❌ Processing failed - will retry automatically</span>
        </div>
      )}
      
      <div className="post-actions-bar">
        <button className="action-btn-small like">❤️ {Math.floor((content.score || 0) * 0.1)}</button>
        <button className="action-btn-small comment">💬 {Math.floor((content.num_comments || 0) * 0.3)}</button>
        <button className="action-btn-small share">📤 Share</button>
        <button className="action-btn-small save">🔖</button>
        {content.source_url && (
          <a 
            href={content.source_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="action-btn-small source"
          >
            🔗 Reddit
          </a>
        )}
      </div>
    </div>
  );
};

const AIGenerationCard = ({ onGenerateContent, isGenerating, stats }) => {
  return (
    <div className="ai-card">
      <div className="ai-header">
        <div className="ai-icon">🤖</div>
        <div className="ai-info">
          <h3 className="ai-title">AI Content Generator</h3>
          <p className="ai-subtitle">Create amazing audio content from Reddit posts</p>
        </div>
      </div>
      
      <div className="ai-stats">
        <div className="ai-stat">
          <div className="stat-number">{stats?.contents?.total || 0}</div>
          <div className="stat-label">Total Contents</div>
        </div>
        <div className="ai-stat">
          <div className="stat-number">{stats?.contents?.completed || 0}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="ai-stat">
          <div className="stat-number">{stats?.jobs?.active || 0}</div>
          <div className="stat-label">Processing</div>
        </div>
      </div>
      
      <div className="ai-features">
        <div className="feature-item">
          <div className="feature-title">Reddit Stories</div>
          <div className="feature-desc">Auto-fetch from r/AskReddit</div>
        </div>
        <div className="feature-item">
          <div className="feature-title">AI Rewriting</div>
          <div className="feature-desc">Enhanced with Mixtral AI</div>
        </div>
        <div className="feature-item">
          <div className="feature-title">Voice Synthesis</div>
          <div className="feature-desc">Natural speech with ElevenLabs</div>
        </div>
      </div>
      
      <button 
        className={`ai-generate-btn ${isGenerating ? 'generating' : ''}`}
        onClick={onGenerateContent}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <span className="btn-spinner"></span>
            Generating Content...
          </>
        ) : (
          'Start AI Generation'
        )}
      </button>
    </div>
  );
};

const Dashboard = ({ setIsAuthenticated }) => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [rawContents, setRawContents] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    loadDashboardData();
    
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [contents, stats] = await Promise.all([
        api.getRawContents(),
        api.getDashboardStats()
      ]);
      
      const sortedContents = contents.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      
      setRawContents(sortedContents);
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContent = async () => {
    try {
      setIsGenerating(true);
      toast.loading('Starting Reddit content fetch...');
      
      const result = await api.triggerPipeline();
      toast.dismiss();
      
      if (result.success) {
        toast.success(result.message || 'Content generation started successfully!');
        console.log('Pipeline results:', result);
        
        if (result.results && result.results.length > 0) {
          const successfulSources = result.results.filter(r => r.success);
          const failedSources = result.results.filter(r => !r.success);
          
          if (successfulSources.length > 0) {
            setTimeout(() => {
              toast.success(`✅ Fetched content from ${successfulSources.length} sources`);
            }, 1000);
          }
          
          if (failedSources.length > 0) {
            setTimeout(() => {
              toast.error(`❌ ${failedSources.length} sources failed`);
            }, 1500);
          }
        }
        
        setTimeout(loadDashboardData, 3000);
      } else {
        throw new Error(result.error || 'Pipeline execution failed');
      }
      
    } catch (error) {
      console.error('Error triggering pipeline:', error);
      toast.dismiss();
      
      if (error.message.includes('No active Reddit sources')) {
        toast.error('No Reddit sources configured! Please set up a Reddit source first.');
      } else {
        toast.error(`Failed to start content generation: ${error.message}`);
      }
    } finally {
      setIsGenerating(false);
    }
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
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="modern-dashboard">
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
                  placeholder="Search AI-generated content..."
                  className="search-input"
                />
                <div className="search-icon">🔍</div>
              </div>
            </div>
            <div className="user-menu">
              <button className="notification-btn">🔔</button>
              <div className="user-profile">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=6366f1&color=fff&size=40`}
                  alt="Profile"
                  className="profile-image"
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
          
          <div className="left-sidebar">
            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-info">
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=fff&color=6366f1&size=60`}
                    alt="Profile"
                    className="profile-avatar"
                  />
                  <div className="profile-details">
                    <h3 className="profile-name">{user.first_name} {user.last_name}</h3>
                    <p className="profile-role">{user.role}</p>
                  </div>
                </div>
                
                <div className="profile-stats">
                  <div className="stat-item">
                    <div className="stat-number">{dashboardStats?.contents?.total || 0}</div>
                    <div className="stat-label">AI Contents</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{dashboardStats?.contents?.completed || 0}</div>
                    <div className="stat-label">Completed</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{dashboardStats?.jobs?.active || 0}</div>
                    <div className="stat-label">Processing</div>
                  </div>
                </div>
              </div>

              <div className="nav-menu">
                {[
                  { id: 'home', icon: '🏠', label: 'Home' },
                  { id: 'ai-content', icon: '🤖', label: 'AI Content' },
                  { id: 'library', icon: '📚', label: 'My Library' },
                  { id: 'uploads', icon: '📤', label: 'My Uploads' },
                  { id: 'analytics', icon: '📊', label: 'Analytics' },
                  { id: 'settings', icon: '⚙️', label: 'Settings' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="stats-card">
              <h4 className="stats-title">AI Pipeline Stats</h4>
              <div className="stats-list">
                <div className="stats-row">
                  <span className="stats-label">Total Jobs</span>
                  <span className="stats-value">{dashboardStats?.jobs?.total || 0}</span>
                </div>
                <div className="stats-row">
                  <span className="stats-label">Success Rate</span>
                  <span className="stats-value positive">
                    {dashboardStats?.jobs?.total > 0 
                      ? Math.round((dashboardStats.jobs.completed / dashboardStats.jobs.total) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="stats-row">
                  <span className="stats-label">Active Sources</span>
                  <span className="stats-value">{dashboardStats?.sources?.active || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="main-content">
            
            <AIGenerationCard 
              onGenerateContent={handleGenerateContent}
              isGenerating={isGenerating}
              stats={dashboardStats}
            />

            <div className="content-feed">
              {loading ? (
                <div className="loading-content">
                  <div className="loading-spinner"></div>
                  <span>Loading AI-generated content...</span>
                </div>
              ) : rawContents.length === 0 ? (
                <div className="empty-content">
                  <div className="empty-icon">🤖</div>
                  <h3>No AI content yet</h3>
                  <p>Click "Start AI Generation" to create your first AI-generated audio content from Reddit posts!</p>
                </div>
              ) : (
                rawContents.map((content, index) => (
                  <ContentPost 
                    key={content.id} 
                    content={content} 
                    index={index} 
                  />
                ))
              )}
            </div>
          </div>

          <div className="right-sidebar">
            <div className="trending-card">
              <h4 className="trending-title">🔥 Recent AI Activity</h4>
              <div className="trending-list">
                {rawContents.slice(0, 5).map((content, index) => (
                  <div key={content.id} className="trending-item">
                    <span className="trending-topic">{content.title.substring(0, 30)}...</span>
                    <span className="trending-count">
                      {content.processing_status === 'completed' ? '✓' : '⏳'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="creators-card">
              <h4 className="creators-title">📊 Content Sources</h4>
              <div className="creators-list">
                <div className="creator-item">
                  <div className="creator-avatar" style={{background: '#ff4500'}}>
                    📰
                  </div>
                  <div className="creator-info">
                    <div className="creator-name">r/AskReddit</div>
                    <div className="creator-meta">Reddit Stories • {rawContents.length} posts</div>
                  </div>
                  <div className="status-indicator active">Active</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;