import React from 'react';
import { 
  Home, 
  PlusCircle, 
  Shield, 
  User, 
  Bell,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const MobileBottomNav = ({ onOpenReport, onOpenProfile, onOpenNotif, unreadCount = 0 }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { guardMode, setGuardMode, currentUser } = useAuth();

  const isHome = location.pathname === '/';
  const isMod = currentUser?.role === 'moderator';
  const isAdmin = currentUser?.role === 'admin';

  return (
    <nav className="mobile-bottom-nav">
      <button 
        className={`bottom-nav-item ${isHome ? 'active' : ''}`}
        onClick={() => navigate('/')}
      >
        <Home size={20} />
        <span>Feed</span>
      </button>

      {/* Role-specific button on mobile */}
      {isAdmin ? (
        <button 
          className={`bottom-nav-item ${location.pathname === '/admin' ? 'active' : ''}`}
          onClick={() => navigate('/admin')}
        >
          <ShieldCheck size={20} />
          <span>Admin</span>
        </button>
      ) : isMod ? (
        <button 
          className={`bottom-nav-item ${location.pathname === '/moderator' ? 'active' : ''}`}
          onClick={() => navigate('/moderator')}
        >
          <ShieldAlert size={20} />
          <span>Disputes</span>
        </button>
      ) : (
        <button 
          className={`bottom-nav-item ${guardMode ? 'active guard' : ''}`}
          onClick={() => setGuardMode(!guardMode)}
        >
          <Shield size={20} />
          <span>{guardMode ? 'Guard On' : 'Guard'}</span>
        </button>
      )}

      {/* Center Report Plus Button */}
      <button 
        className="bottom-nav-center-action"
        onClick={onOpenReport}
        aria-label="Report Item"
      >
        <PlusCircle size={28} />
      </button>

      <button 
        className="bottom-nav-item"
        onClick={onOpenNotif}
      >
        <div className="bottom-nav-badge-box">
          <Bell size={20} />
          {unreadCount > 0 && <span className="bottom-nav-badge">{unreadCount}</span>}
        </div>
        <span>Alerts</span>
      </button>

      <button 
        className="bottom-nav-item"
        onClick={onOpenProfile}
      >
        <User size={20} />
        <span>Profile</span>
      </button>
    </nav>
  );
};
