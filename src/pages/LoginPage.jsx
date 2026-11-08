import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Shield, 
  Lock, 
  ArrowRight, 
  Zap,
  Users,
  Compass,
  QrCode,
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  const { login, autoFillLogin } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('student');
  const [selectedGender, setSelectedGender] = useState('male');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('Please enter your name.');
    if (!email.trim()) return alert('Please enter your email.');

    login({
      name,
      email,
      role: selectedRole,
      gender: selectedGender,
      password
    });

    if (selectedRole === 'moderator') {
      navigate('/moderator');
    } else if (selectedRole === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const handleQuickAutoFill = (roleType, gender = 'male') => {
    autoFillLogin(roleType, gender);
    if (roleType === 'moderator') {
      navigate('/moderator');
    } else if (roleType === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="modern-login-viewport animate-fade-in">
      <div className="modern-login-grid">
        {/* Left Visual Hero Showcase */}
        <div className="login-visual-showcase">
          <div className="showcase-glow-circle circle-1"></div>
          <div className="showcase-glow-circle circle-2"></div>
          
          <div className="showcase-header">
            <div className="showcase-logo-badge">
              <img src="/logo.jpg" alt="CampusTrace" className="showcase-logo-img" />
              <span className="showcase-brand-name">Campus<span>Trace</span></span>
            </div>
            <span className="showcase-tag">Smart AI Network</span>
          </div>

          <div className="showcase-main-content">
            <h1 className="showcase-title">
              Reconnecting lost campus belongings with <span className="gradient-text">intelligent trust</span>.
            </h1>
            <p className="showcase-subtitle">
              The zero-cost campus lost & found network with AI auto-tagging, secret anti-fraud ownership verification, and safe QR handovers.
            </p>

            <div className="feature-highlights-list">
              <div className="feature-highlight-card">
                <div className="feature-icon-box indigo">
                  <QrCode size={20} />
                </div>
                <div>
                  <h4 className="feature-title">2-Day Single-Use QR Passes</h4>
                  <p className="feature-desc">Anti-fraud verification question with secure QR code generated upon finder approval.</p>
                </div>
              </div>

              <div className="feature-highlight-card">
                <div className="feature-icon-box emerald">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="feature-title">Girl Student Privacy Shield</h4>
                  <p className="feature-desc">In-app direct chat without phone number disclosure, plus 1-click Moderator dispute escalation.</p>
                </div>
              </div>

              <div className="feature-highlight-card">
                <div className="feature-icon-box amber">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="feature-title">100% Free Zero-Cost Cloud</h4>
                  <p className="feature-desc">Smart image compression stored in Firestore without expensive storage billing.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="showcase-footer">
            <div className="live-stat-badge">
              <span className="live-dot"></span>
              <span>Campus Network Active • Room MB011, Library, Canteen</span>
            </div>
          </div>
        </div>

        {/* Right Interactive Login & Role Box */}
        <div className="login-form-side">
          <div className="form-inner-wrapper">
            {/* Header */}
            <div className="form-header-block">
              <h2 className="form-main-title">Welcome to CampusTrace</h2>
              <p className="form-sub-title">Select your role or sign in to continue</p>
            </div>

            {/* 1-Click Fast Access Section */}
            <div className="instant-access-box">
              <div className="instant-title-row">
                <span className="flex-row items-center gap-1.5 text-xs font-bold text-indigo-600">
                  <Zap size={14} className="text-amber-500 fill-amber-500" /> 1-Click Instant Demo Login:
                </span>
                <span className="text-[11px] text-slate-400 font-medium">No typing required</span>
              </div>

              <div className="instant-chips-grid">
                <button 
                  type="button" 
                  className="role-chip-btn student-male-chip"
                  onClick={() => handleQuickAutoFill('student', 'male')}
                >
                  <span className="chip-avatar">👦</span>
                  <div className="chip-info">
                    <span className="chip-role">Student (Male)</span>
                    <span className="chip-desc">Report & Claim</span>
                  </div>
                </button>

                <button 
                  type="button" 
                  className="role-chip-btn student-female-chip"
                  onClick={() => handleQuickAutoFill('student', 'female')}
                >
                  <span className="chip-avatar">👧</span>
                  <div className="chip-info">
                    <span className="chip-role">Student (Female)</span>
                    <span className="chip-desc">Private Safe Chat</span>
                  </div>
                </button>

                <button 
                  type="button" 
                  className="role-chip-btn moderator-chip"
                  onClick={() => handleQuickAutoFill('moderator', 'male')}
                >
                  <span className="chip-avatar">🛡️</span>
                  <div className="chip-info">
                    <span className="chip-role">Campus Moderator</span>
                    <span className="chip-desc">Review Disputes</span>
                  </div>
                </button>

                <button 
                  type="button" 
                  className="role-chip-btn admin-chip"
                  onClick={() => handleQuickAutoFill('admin', 'male')}
                >
                  <span className="chip-avatar">👑</span>
                  <div className="chip-info">
                    <span className="chip-role">Campus Admin</span>
                    <span className="chip-desc">Manage Staff</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="modern-divider">
              <span>OR ENTER DETAILS MANUALLY</span>
            </div>

            {/* Custom Segmented Tabs */}
            <div className="modern-role-selector">
              <button 
                type="button" 
                className={`segmented-tab ${selectedRole === 'student' ? 'active' : ''}`}
                onClick={() => setSelectedRole('student')}
              >
                <Users size={15} />
                <span>Student</span>
              </button>
              <button 
                type="button" 
                className={`segmented-tab ${selectedRole === 'moderator' ? 'active' : ''}`}
                onClick={() => setSelectedRole('moderator')}
              >
                <Shield size={15} />
                <span>Moderator</span>
              </button>
              <button 
                type="button" 
                className={`segmented-tab ${selectedRole === 'admin' ? 'active' : ''}`}
                onClick={() => setSelectedRole('admin')}
              >
                <ShieldCheck size={15} />
                <span>Admin</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="modern-form-content">
              {selectedRole === 'student' && (
                <div className="gender-segmented-box">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                    Student Gender (For Privacy Shield)
                  </label>
                  <div className="gender-choices-row">
                    <button 
                      type="button" 
                      className={`gender-choice-pill ${selectedGender === 'male' ? 'active' : ''}`}
                      onClick={() => setSelectedGender('male')}
                    >
                      👦 Male Student
                    </button>
                    <button 
                      type="button" 
                      className={`gender-choice-pill female ${selectedGender === 'female' ? 'active' : ''}`}
                      onClick={() => setSelectedGender('female')}
                    >
                      👧 Female Student (Private Shield)
                    </button>
                  </div>
                </div>
              )}

              <div className="modern-field-group">
                <label className="field-label">Full Name</label>
                <input 
                  type="text" 
                  className="modern-input" 
                  placeholder={selectedRole === 'admin' ? 'Chief Administrator' : selectedRole === 'moderator' ? 'Campus Safety Officer' : 'Enter your name...'}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="modern-field-group">
                <label className="field-label">Campus Email</label>
                <input 
                  type="email" 
                  className="modern-input" 
                  placeholder="e.g. name@campus.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              {selectedRole !== 'student' && (
                <div className="modern-field-group">
                  <label className="field-label">Access Passcode</label>
                  <input 
                    type="password" 
                    className="modern-input" 
                    placeholder="Enter access passcode..."
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              )}

              <button type="submit" className="modern-submit-btn">
                <span>Enter CampusTrace as {selectedRole.toUpperCase()}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
