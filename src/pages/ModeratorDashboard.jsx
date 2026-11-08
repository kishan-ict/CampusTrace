import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  HelpCircle,
  User,
  Phone,
  FileText,
  ChevronRight
} from 'lucide-react';
import { useItems } from '../contexts/ItemsContext';
import { useAuth } from '../contexts/AuthContext';
import { DirectChatBox } from '../components/DirectChatBox';

export const ModeratorDashboard = () => {
  const { items, claims, disputes } = useItems();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('disputes'); // 'disputes' | 'items' | 'claims'
  const [selectedDispute, setSelectedDispute] = useState(null);

  return (
    <div className="moderator-page-container animate-fade-in">
      <div className="moderator-header-banner">
        <div className="flex-row items-center gap-3">
          <div className="moderator-shield-icon">
            <ShieldAlert size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Campus Safety & Affairs Moderation Center</h1>
            <p className="text-xs text-muted">
              Official review dashboard for campus item disputes, claim audits, and investigative student chat.
            </p>
          </div>
        </div>

        <div className="mod-stats-pills">
          <span className="mod-stat-pill red">
            🚨 {disputes.length} Escalated Disputes
          </span>
          <span className="mod-stat-pill blue">
            📦 {items.length} Campus Items
          </span>
          <span className="mod-stat-pill green">
            🔑 {claims.length} Total Claims
          </span>
        </div>
      </div>

      {/* Moderator Tabs */}
      <div className="tabs-row mb-4">
        <button 
          className={`tab-btn ${activeTab === 'disputes' ? 'active lost' : ''}`}
          onClick={() => setActiveTab('disputes')}
        >
          🚨 Escalated Disputes ({disputes.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'claims' ? 'active' : ''}`}
          onClick={() => setActiveTab('claims')}
        >
          📋 All Claims & Secret Proofs ({claims.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'items' ? 'active' : ''}`}
          onClick={() => setActiveTab('items')}
        >
          📦 All Campus Items Database ({items.length})
        </button>
      </div>

      {/* 1. DISPUTES SECTION (Where users reported "It is my item but someone else claimed it") */}
      {activeTab === 'disputes' && (
        <div className="disputes-layout-grid">
          <div className="disputes-list-card">
            <h3 className="text-sm font-bold mb-3 flex-row items-center gap-2">
              <AlertTriangle size={18} className="text-danger" />
              Incoming Student Claim Disputes
            </h3>

            {disputes.length === 0 ? (
              <div className="empty-feed-card py-6">
                <CheckCircle size={36} className="text-success mb-2" />
                <h4 className="font-bold text-sm">No Pending Disputes</h4>
                <p className="text-xs text-muted">
                  All claimed items are currently peaceful and uncontested.
                </p>
              </div>
            ) : (
              <div className="disputes-scroll-list">
                {disputes.map(d => (
                  <div 
                    key={d.id} 
                    className={`dispute-list-item ${selectedDispute?.id === d.id ? 'active' : ''}`}
                    onClick={() => setSelectedDispute(d)}
                  >
                    <div className="dispute-item-header">
                      <span className="badge-pill-danger text-xs">Contested</span>
                      <span className="text-xs text-muted">
                        {new Date(d.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold mt-1 mb-1">{d.itemTitle}</h4>
                    <p className="text-xs text-muted">
                      <strong>Reported by:</strong> {d.disputerName} ({d.disputerGender === 'female' ? '👧 Female' : '👦 Male'})
                    </p>
                    <div className="dispute-snippet mt-2">
                      "{d.disputerProof?.slice(0, 75)}..."
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dispute Deep-Dive Details & Direct Moderator Chat */}
          <div className="dispute-detail-pane">
            {selectedDispute ? (
              <div className="dispute-full-case animate-scale-in">
                <div className="case-title-row">
                  <div>
                    <span className="text-xs font-bold uppercase text-danger">Case File #{selectedDispute.id}</span>
                    <h2 className="text-base font-bold">{selectedDispute.itemTitle}</h2>
                  </div>
                  <span className="badge-pill-danger">Requires Action</span>
                </div>

                {/* 360 Degree Comparison Grid for Moderator */}
                <div className="comparison-grid mt-3">
                  {/* Left: Original Item & Finder */}
                  <div className="case-column">
                    <h4 className="column-title">1. Original Item & Expected Answer</h4>
                    {selectedDispute.itemImageUrl && (
                      <img src={selectedDispute.itemImageUrl} alt="" className="case-item-img mb-2" />
                    )}
                    <div className="case-field">
                      <strong>Reporter / Finder:</strong> {selectedDispute.reporterName}
                    </div>
                    <div className="case-field">
                      <strong>Finder's Anti-Fraud Question:</strong>
                      <div className="highlight-pill text-xs mt-1">"{selectedDispute.itemSecretQuestion || 'N/A'}"</div>
                    </div>
                    <div className="case-field">
                      <strong>Expected Secret Answer (Original):</strong>
                      <div className="secret-badge-highlight text-xs mt-1">
                        🔒 "{selectedDispute.itemSecretAnswer || 'N/A'}"
                      </div>
                    </div>
                  </div>

                  {/* Center: Previous Claimant */}
                  <div className="case-column">
                    <h4 className="column-title">2. Previous Claimant (Who Claimed It)</h4>
                    <div className="case-field">
                      <strong>Claimed By:</strong> {selectedDispute.claimedBy}
                    </div>
                    <div className="case-field">
                      <strong>Answer They Provided:</strong>
                      <div className="highlight-pill text-xs mt-1">"{selectedDispute.claimantAnswer}"</div>
                    </div>
                    <div className="case-field">
                      <strong>Proof / Roll Number:</strong> {selectedDispute.claimantProof}
                    </div>
                    <div className="case-field">
                      <strong>Contact Info:</strong> {selectedDispute.claimantContact}
                    </div>
                  </div>

                  {/* Right: Disputing Student */}
                  <div className="case-column dispute-highlight">
                    <h4 className="column-title text-danger">3. Disputing Student ("Item is Mine!")</h4>
                    <div className="case-field">
                      <strong>Student Name:</strong> {selectedDispute.disputerName}
                    </div>
                    <div className="case-field">
                      <strong>Email:</strong> {selectedDispute.disputerEmail}
                    </div>
                    <div className="case-field">
                      <strong>Contact:</strong> {selectedDispute.disputerContact}
                    </div>
                    <div className="case-field">
                      <strong>Their Proof Statement:</strong>
                      <div className="dispute-statement-box text-xs mt-1">
                        "{selectedDispute.disputerProof}"
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Moderator Chat with Disputer */}
                <div className="mt-4">
                  <h4 className="text-sm font-bold mb-2 flex-row items-center gap-2">
                    <MessageSquare size={16} className="text-primary" />
                    Moderator Investigation Chat (Ask for More Details via Chat)
                  </h4>
                  <p className="text-xs text-muted mb-2">
                    As moderator, you can directly message the student right here to request photos, purchase slips, or student ID confirmation:
                  </p>
                  <DirectChatBox 
                    chatRoomId={`dispute_${selectedDispute.id}`}
                    title={`Moderator Case Chat: ${selectedDispute.itemTitle}`}
                  />
                </div>
              </div>
            ) : (
              <div className="select-dispute-placeholder">
                <AlertTriangle size={36} className="text-muted mb-2" />
                <h4 className="text-sm font-bold">Select a dispute from the left</h4>
                <p className="text-xs text-muted">
                  Click any reported item to inspect the expected secret answer, who claimed it, and investigate via direct chat.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. CLAIMS AUDIT TAB */}
      {activeTab === 'claims' && (
        <div className="claims-table-card animate-scale-in">
          <h3 className="text-sm font-bold mb-3">All Campus Claims & Anti-Fraud Proofs</h3>
          <div className="table-responsive">
            <table className="mod-data-table">
              <thead>
                <tr>
                  <th>Item Title</th>
                  <th>Claimant</th>
                  <th>Gender</th>
                  <th>Submitted Answer</th>
                  <th>Student Proof</th>
                  <th>Contact Info</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {claims.map(c => (
                  <tr key={c.id}>
                    <td className="font-semibold">{c.itemTitle}</td>
                    <td>{c.claimantName}</td>
                    <td>
                      <span className={`gender-tag ${c.claimantGender}`}>
                        {c.claimantGender === 'female' ? '👧 Female' : '👦 Male'}
                      </span>
                    </td>
                    <td><span className="code-font">{c.answer}</span></td>
                    <td className="text-xs">{c.studentProof || 'None'}</td>
                    <td className="text-xs">{c.contactInfo}</td>
                    <td>
                      <span className={`status-pill ${c.status}`}>{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ITEMS DATABASE TAB */}
      {activeTab === 'items' && (
        <div className="claims-table-card animate-scale-in">
          <h3 className="text-sm font-bold mb-3">All Logged Campus Items</h3>
          <div className="table-responsive">
            <table className="mod-data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Reporter</th>
                  <th>Secret Question</th>
                  <th>Secret Answer</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map(i => (
                  <tr key={i.id}>
                    <td className="font-semibold">{i.title}</td>
                    <td>
                      <span className={`type-tag ${i.type}`}>{i.type}</span>
                    </td>
                    <td>{i.category}</td>
                    <td>{i.location}</td>
                    <td>{i.reporterName}</td>
                    <td className="text-xs">{i.secretQuestion || 'N/A'}</td>
                    <td className="text-xs font-bold text-primary">{i.secretAnswer || 'N/A'}</td>
                    <td>
                      <span className={`status-pill ${i.status}`}>{i.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
