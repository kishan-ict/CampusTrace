import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Shield, 
  Award, 
  User, 
  CheckCircle, 
  Sparkles,
  LogOut,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CampusNotificationManager } from '../utils/notifications';
import { useNavigate } from 'react-router-dom';

export const Header = ({ onOpenProfile, onOpenReport, onOpenKeyModal, showNotifDrawer, setShowNotifDrawer }) => {
  const { currentUser, rankInfo, guardMode, setGuardMode, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const refresh = () => setNotifications(CampusNotificationManager.getNotifications());
    refresh();
    window.addEventListener('campustrace_notifs_changed', refresh);
    return () => window.removeEventListener('campustrace_notifs_changed', refresh);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleToggleNotif = () => {
    setShowNotifDrawer(!showNotifDrawer);
    if (!showNotifDrawer) {
      CampusNotificationManager.markAllAsRead();
    }
  };

  const isModerator = currentUser?.role === 'moderator';
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="header-container">
      <div className="header-left" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <div className="logo-badge custom-brand-logo">
          <img src="/logo.jpg" alt="CampusTrace Logo" className="brand-logo-img" />
        </div>
        <div className="brand-text-group">
          <div className="brand-title">
            Campus<span className="brand-accent">Trace</span>
          </div>
          <div className="brand-tagline">Smart Campus Lost & Found</div>
        </div>
      </div>

      <div className="header-right">
        {/* Role Navigation Badge for Admin & Moderator */}
        {isAdmin && (
          <button 
            className="role-nav-pill admin" 
            onClick={() => navigate('/admin')}
            title="Open Admin Command Center"
          >
            <ShieldCheck size={15} />
            <span>Admin Center</span>
          </button>
        )}

        {isModerator && (
          <button 
            className="role-nav-pill moderator" 
            onClick={() => navigate('/moderator')}
            title="Open Moderator Disputes Dashboard"
          >
            <ShieldAlert size={15} />
            <span>Moderator Center</span>
          </button>
        )}

        {/* Gemini AI status button */}
        <button 
          className="api-key-btn"
          onClick={onOpenKeyModal}
          title="Google Gemini AI Auto-Tagging Status"
        >
          <Sparkles size={14} className="text-primary" />
          <span className="text-xs font-semibold desktop-only">Gemini AI Active</span>
        </button>

        {/* Security Guard Toggle - for students on desktop */}
        {!isModerator && !isAdmin && (
          <button 
            className={`guard-toggle-btn desktop-only ${guardMode ? 'active' : ''}`}
            onClick={() => setGuardMode(!guardMode)}
            title="Toggle Security Desk Officer Mode"
          >
            <Shield size={16} />
            <span>{guardMode ? 'Guard Active' : 'Guard Mode'}</span>
          </button>
        )}

        {/* User Hero Rank or Staff Role Badge */}
        <div className="hero-rank-pill" onClick={onOpenProfile} style={{ cursor: 'pointer' }}>
          <span className="rank-emoji">
            {isAdmin ? '👑' : isModerator ? '🛡️' : rankInfo.icon}
          </span>
          <div className="rank-details">
            <span className="rank-name">
              {isAdmin ? 'Admin' : isModerator ? 'Moderator' : rankInfo.title}
            </span>
            <span className="rank-pts">
              {currentUser?.name?.split(' ')[0]}
              {currentUser?.gender === 'female' && ' 👧'}
            </span>
          </div>
        </div>

        {/* Desktop Notifications Bell */}
        <div className="notif-wrapper desktop-only">
          <button className="icon-btn" onClick={handleToggleNotif} title="Alerts & Match Radar">
            <Bell size={20} />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>
        </div>

        {/* Desktop Profile Avatar */}
        <div className="profile-trigger desktop-only" onClick={onOpenProfile} title="Account Profile & Sign Out">
          {currentUser?.avatarUrl ? (
            <img src={currentUser.avatarUrl} alt="Avatar" className="user-avatar" />
          ) : (
            <div className="user-avatar placeholder">
              <User size={18} />
            </div>
          )}
        </div>
      </div>

      {/* Shared Dropdown / Drawer for Notifications */}
      {showNotifDrawer && (
        <div className="notif-drawer animate-scale-in">
          <div className="notif-header">
            <div className="flex-row items-center gap-2">
              <Bell size={16} className="text-primary" />
              <h4>Campus Alerts</h4>
            </div>
            <button 
              className="text-xs text-muted" 
              onClick={() => CampusNotificationManager.clearAll()}
            >
              Clear All
            </button>
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="empty-notif">
                <CheckCircle size={28} className="text-muted mb-2" />
                <p className="text-xs text-muted">You're all caught up!</p>
              </div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  className={`notif-item ${!n.read ? 'unread' : ''}`}
                  onClick={() => {
                    setShowNotifDrawer(false);
                    if (n.itemId) navigate(`/item/${n.itemId}`);
                  }}
                >
                  <div className="notif-title-row">
                    <span className="notif-title">{n.title}</span>
                    <span className="notif-time">
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="notif-msg">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </header>
  );
};
