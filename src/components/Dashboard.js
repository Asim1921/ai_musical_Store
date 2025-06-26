import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const Dashboard = ({ setIsAuthenticated }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setIsAuthenticated(false);
    toast.success('Logged out successfully!');
  };

  if (!user) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div style={{ textAlign: 'center' }}>Loading...</div>
        </div>
      </div>
    );
  }

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return '#dc2626';
      case 'creator': return '#3b82f6';
      case 'listener': return '#059669';
      default: return '#64748b';
    }
  };

  const getStatusBadge = (isVerified, isApproved, role) => {
    if (role === 'creator' && !isApproved) {
      return <span className="status-badge warning">Pending Approval</span>;
    }
    if (isVerified) {
      return <span className="status-badge success">Verified</span>;
    }
    return <span className="status-badge error">Unverified</span>;
  };

  return (
    <div className="dashboard-container fade-in">
      {/* Header */}
      <div className="dashboard-header slide-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="welcome-text">
              Welcome back, {user.first_name} {user.last_name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              <span 
                className="user-role"
                style={{ 
                  background: getRoleColor(user.role),
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}
              >
                {user.role}
              </span>
              {getStatusBadge(user.is_verified, user.creator_approved, user.role)}
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Sign Out
          </button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Account Information */}
        <div className="dashboard-card">
          <h3 className="card-title">Account Information</h3>
          <div className="card-content">
            <div className="info-item">
              <span className="info-label">Username</span>
              <span className="info-value">@{user.username}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Member Since</span>
              <span className="info-value">
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Account Status</span>
              <span className="info-value">
                {user.is_verified ? '✅ Verified' : '⏳ Pending Verification'}
              </span>
            </div>
          </div>
        </div>

        {/* Creator Statistics (if creator) */}
        {user.role === 'creator' && (
          <div className="dashboard-card">
            <h3 className="card-title">Creator Dashboard</h3>
            <div className="card-content">
              <div className="info-item">
                <span className="info-label">Creator Status</span>
                <span className="info-value">
                  {user.creator_approved ? '✅ Approved' : '⏳ Under Review'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Earnings</span>
                <span className="info-value" style={{ color: '#059669', fontWeight: '700' }}>
                  ${parseFloat(user.creator_earnings).toFixed(2)}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Published Content</span>
                <span className="info-value">0 items</span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Views</span>
                <span className="info-value">0 views</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="dashboard-card">
          <h3 className="card-title">Quick Actions</h3>
          <div className="card-content">
            {user.role === 'creator' ? (
              <>
                <button className="action-btn primary">
                  📤 Upload New Content
                </button>
                <button className="action-btn">
                  📊 View Analytics
                </button>
                <button className="action-btn">
                  💰 Earnings Report
                </button>
                <button className="action-btn secondary">
                  ⚙️ Creator Settings
                </button>
              </>
            ) : (
              <>
                <button className="action-btn primary">
                  🎵 Browse Content
                </button>
                <button className="action-btn">
                  ❤️ My Favorites
                </button>
                <button className="action-btn">
                  📚 My Library
                </button>
                <button className="action-btn secondary">
                  ⚙️ Account Settings
                </button>
              </>
            )}
          </div>
        </div>

        {/* Platform Statistics */}
        <div className="dashboard-card">
          <h3 className="card-title">Platform Overview</h3>
          <div className="card-content">
            <div className="info-item">
              <span className="info-label">Total Users</span>
              <span className="info-value">2,485</span>
            </div>
            <div className="info-item">
              <span className="info-label">Active Creators</span>
              <span className="info-value">156</span>
            </div>
            <div className="info-item">
              <span className="info-label">Available Content</span>
              <span className="info-value">1,234 items</span>
            </div>
            <div className="info-item">
              <span className="info-label">Platform Status</span>
              <span className="info-value" style={{ color: '#059669' }}>🟢 All Systems Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default Dashboard;