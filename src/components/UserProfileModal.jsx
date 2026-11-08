import React from 'react';
import { 
  X, 
  Award, 
  Shield, 
  CheckCircle2, 
  LogOut, 
  Lock, 
  Sparkles,
  UserCheck,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BADGES } from '../utils/constants';
import { useNavigate } from 'react-router-dom';

export const UserProfileModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const { currentUser, rankInfo, logout, autoFillLogin } = useAuth();
  const navigate = useNavigate();
  const userBadges = currentUser?.badges || [];

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="flex-row items-center gap-2">
            <Award className="text-primary" size={22} />
            <h3 className="modal-title">
              {currentUser?.role === 'admin' ? 'Campus Admin Account' : currentUser?.role === 'moderator' ? 'Campus Moderator Account' : 'Campus Hero Profile'}
            </h3>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Identity Card */}
        <div className="profile-identity-card">
          <img 
            src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
            alt="Avatar" 
            className="profile-modal-avatar"
          />
          <div className="profile-info-block">
            <h4 className="user-name">{currentUser?.name}</h4>
            <p className="user-email">{currentUser?.email}</p>
            <div className="flex-row gap-1 mt-1">
              <span className="badge-tag">
                <span>{currentUser?.role === 'admin' ? '👑 Admin' : currentUser?.role === 'moderator' ? '🛡️ Moderator' : `${rankInfo.icon} ${rankInfo.title}`}</span>
              </span>
              {currentUser?.gender === 'female' && (
                <span className="badge-pill-success text-xs">
                  👧 Girl Privacy Shield Active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Role Quick Jump Links */}
        <div className="role-quick-nav-box my-3">
          {currentUser?.role === 'admin' && (
            <button 
              className="primary-btn w-full mb-2 flex-row items-center justify-center gap-2"
              onClick={() => {
                navigate('/admin');
                onClose();
              }}
            >
              <ShieldCheck size={16} />
              <span>Go to Admin Command Center</span>
            </button>
          )}

          {currentUser?.role === 'moderator' && (
            <button 
              className="primary-btn w-full mb-2 flex-row items-center justify-center gap-2"
              onClick={() => {
                navigate('/moderator');
                onClose();
              }}
            >
              <ShieldAlert size={16} />
              <span>Go to Moderator Disputes Center</span>
            </button>
          )}
        </div>

        {/* Rank Progression (For Students) */}
        {currentUser?.role === 'student' && (
          <div className="rank-progress-container mb-3">
            <div className="progress-header">
              <span className="text-sm font-semibold">Hero Rank Progression</span>
              <span className="text-sm text-primary font-bold">{currentUser?.heroPoints || 0} pts</span>
            </div>
            <div className="progress-track">
              <div 
                className="progress-fill" 
                style={{ width: `${rankInfo.progress}%` }}
              />
            </div>
            <div className="progress-footer">
              <span className="text-xs text-muted">Current: {rankInfo.title}</span>
              <span className="text-xs text-muted">Next: {rankInfo.nextRank}</span>
            </div>
          </div>
        )}

        {/* Quick Switch Role Shortcuts */}
        <div className="switch-accounts-box mb-3">
          <span className="text-xs font-bold text-muted uppercase block mb-1">
            ⚡ Quick Switch Test Account:
          </span>
          <div className="flex-row gap-2 flex-wrap">
            <button 
              className="role-tab-btn"
              onClick={() => autoFillLogin('student', 'male')}
            >
              👦 Student (Male)
            </button>
            <button 
              className="role-tab-btn"
              onClick={() => autoFillLogin('student', 'female')}
            >
              👧 Student (Female)
            </button>
            <button 
              className="role-tab-btn"
              onClick={() => autoFillLogin('moderator', 'male')}
            >
              🛡️ Moderator
            </button>
            <button 
              className="role-tab-btn"
              onClick={() => autoFillLogin('admin', 'male')}
            >
              👑 Admin
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-footer justify-end">
          <button 
            className="danger-btn w-full flex-row items-center justify-center gap-2" 
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Sign Out & Return to Landing Page</span>
          </button>
        </div>
      </div>
    </div>
  );
};
