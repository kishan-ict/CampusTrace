import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  Key, 
  Users, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const AdminDashboard = () => {
  const { moderators, addModerator, removeModerator, currentUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert('Please fill out all moderator credential fields.');
      return;
    }

    setLoading(true);
    setSuccessMsg('');
    try {
      await addModerator({ name, email, password });
      setName('');
      setEmail('');
      setPassword('');
      setSuccessMsg('Moderator credentials created successfully! They can now log in.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert('Failed to add moderator.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (modId, modName) => {
    if (window.confirm(`Are you sure you want to revoke moderator privileges for "${modName}"?`)) {
      await removeModerator(modId);
    }
  };

  return (
    <div className="admin-page-container animate-fade-in">
      <div className="admin-header-banner">
        <div className="flex-row items-center gap-3">
          <div className="admin-crown-icon">
            <ShieldCheck size={30} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Campus Administrator Command Center</h1>
            <p className="text-xs text-muted">
              Create moderator credentials, assign safety officers, and manage permissions across the campus network.
            </p>
          </div>
        </div>
      </div>

      <div className="admin-grid-layout">
        {/* Create Moderator Card */}
        <div className="admin-card">
          <div className="flex-row items-center gap-2 mb-3">
            <UserPlus size={20} className="text-primary" />
            <h3 className="text-sm font-bold">Create Moderator Credentials</h3>
          </div>
          <p className="text-xs text-muted mb-3">
            Provide official credentials to campus safety guards, student council heads, or hostel wardens to grant them moderator powers.
          </p>

          <form onSubmit={handleCreate} className="admin-form">
            <div className="form-group">
              <label className="form-label text-xs">Moderator Full Name *</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Officer R. Sharma / Student Welfare Head"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label text-xs">Official Email *</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="e.g. mod.welfare@campus.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label text-xs">Access Password *</label>
              <input 
                type="text" 
                className="form-input font-mono" 
                placeholder="Generate or enter secure password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="primary-btn w-full mt-2" disabled={loading}>
              {loading ? 'Creating...' : '+ Create & Issue Moderator Credentials'}
            </button>

            {successMsg && (
              <div className="verify-alert success mt-2">
                <CheckCircle size={15} />
                <span>{successMsg}</span>
              </div>
            )}
          </form>
        </div>

        {/* Existing Active Moderators List */}
        <div className="admin-card">
          <div className="flex-row items-center justify-between mb-3">
            <div className="flex-row items-center gap-2">
              <Users size={20} className="text-primary" />
              <h3 className="text-sm font-bold">Active Campus Moderators ({moderators.length})</h3>
            </div>
            <span className="badge-pill-success text-xs">Authorized Staff</span>
          </div>

          <div className="moderators-list">
            {moderators.length === 0 ? (
              <p className="text-xs text-muted">No moderators added yet.</p>
            ) : (
              moderators.map(m => (
                <div key={m.id} className="moderator-row-item">
                  <div className="flex-row items-center gap-3">
                    <div className="mod-avatar-badge">
                      <ShieldCheck size={16} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{m.name}</h4>
                      <p className="text-xs text-muted">{m.email}</p>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        Pass: <span className="bg-slate-100 px-1 py-0.5 rounded">{m.password}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    className="danger-icon-btn"
                    onClick={() => handleRemove(m.id, m.name)}
                    title="Revoke Moderator Position"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
