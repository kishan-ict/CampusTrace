import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  Sparkles, 
  CheckCircle,
  Target,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { useItems } from '../contexts/ItemsContext';
import { useAuth } from '../contexts/AuthContext';
import { findRadarMatches } from '../utils/matchRadar';
import { ClaimModal } from '../components/ClaimModal';
import { HandoverQrModal } from '../components/HandoverQrModal';
import { DisputeModal } from '../components/DisputeModal';

export const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, claims } = useItems();
  const { currentUser } = useAuth();

  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);

  const item = items.find(i => i.id === id || i.customId === id);

  if (!item) {
    return (
      <div className="container py-8 text-center" style={{ padding: '4rem 1rem' }}>
        <h2>Item not found</h2>
        <button className="primary-btn mt-4" onClick={() => navigate('/')}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Feature 7: Smart Similarity Matcher ("AI Match Radar")
  const radarMatches = findRadarMatches(item, items);

  const itemClaims = claims.filter(c => c.itemId === item.id || c.itemCustomId === item.id || (item.customId && c.itemId === item.customId));
  const activeClaim = itemClaims.length > 0 ? itemClaims[0] : null;

  const isFinder = item.reporterId === currentUser?.uid || 
                   item.reporterId === 'demo_guard' || 
                   currentUser?.name === item.reporterName;
  const isFound = item.type === 'found';
  const isReturned = item.status === 'returned';
  const isClaimed = activeClaim?.status === 'approved' || activeClaim?.status === 'completed' || isReturned;

  return (
    <div className="item-detail-page animate-fade-in">
      <button className="back-btn" onClick={() => navigate('/')}>
        <ArrowLeft size={18} />
        <span>Back to Campus Feed</span>
      </button>

      <div className="detail-layout">
        <div className="detail-main">
          <div className="detail-image-card">
            <img src={item.imageUrl} alt={item.title} className="detail-img" />
            <div className="detail-type-badge">
              <span className={`type-pill ${item.type}`}>
                {item.type === 'lost' ? 'Lost Item' : 'Found Item'}
              </span>
              {isReturned && <span className="type-pill returned">Returned</span>}
              {activeClaim?.status === 'approved' && !isReturned && (
                <span className="type-pill approved">Claim Approved</span>
              )}
            </div>
          </div>

          <div className="detail-info-card">
            <div className="flex-row items-center justify-between mb-2">
              <span className="detail-category">{item.category}</span>
              <span className="detail-date">{item.dateOccurred}</span>
            </div>

            <h1 className="detail-title">{item.title}</h1>

            <div className="detail-meta-row">
              <div className="meta-item">
                <MapPin size={16} className="text-primary" />
                <span>{item.location}</span>
              </div>
              <div className="meta-item">
                <User size={16} className="text-primary" />
                <span>Reported by: <strong>{item.reporterName}</strong></span>
              </div>
            </div>

            <div className="detail-section">
              <h4 className="section-heading">Description & Clues</h4>
              <p className="detail-desc-text">{item.description}</p>
            </div>

            {item.tags && item.tags.length > 0 && (
              <div className="detail-section">
                <h4 className="section-heading">Tags & Keywords</h4>
                <div className="tags-flex">
                  {item.tags.map(t => (
                    <span key={t} className="tag-chip">#{t}</span>
                  ))}
                  {item.aiTagged && (
                    <span className="ai-tag-badge">
                      <Sparkles size={12} /> Gemini AI Auto-Tagged
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Claim button for Found items */}
            {isFound && !isReturned && !isFinder && !activeClaim && (
              <div className="claim-cta-banner">
                <div>
                  <h4 className="font-bold text-sm">Is this item yours?</h4>
                  <p className="text-xs text-muted">
                    Submit verification proof to answer finder's anti-fraud question.
                  </p>
                </div>
                <button 
                  className="primary-btn" 
                  onClick={() => setShowClaimDialog(true)}
                >
                  Claim This Item
                </button>
              </div>
            )}

            {/* "It is my item but someone else claimed it" Dispute CTA Button */}
            {isClaimed && !isFinder && (
              <div className="dispute-detail-banner mt-3">
                <div className="flex-row items-center gap-2">
                  <AlertTriangle size={20} className="text-danger flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">Did someone else claim your item?</h4>
                    <p className="text-xs text-muted">
                      If this is your belonging but was claimed by another person, you can open a dispute. A message and full item audit will be sent directly to Campus Moderators.
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="danger-btn mt-2 w-full"
                  onClick={() => setShowDisputeDialog(true)}
                >
                  ⚠️ It is my item but someone else has claimed it
                </button>
              </div>
            )}
          </div>

          {/* Handover & Single-Use QR Pass (Includes Safe In-App Chat for Girls) */}
          {(activeClaim || isReturned) && (
            <div className="mt-4">
              <HandoverQrModal item={item} claim={activeClaim} />
            </div>
          )}
        </div>

        {/* Right column: AI Match Radar */}
        <div className="detail-sidebar">
          <div className="radar-card">
            <div className="radar-header">
              <Target size={20} className="text-primary animate-pulse" />
              <div>
                <h3 className="radar-title">AI Match Radar</h3>
                <p className="radar-sub">Real-time similarity analysis against opposite reports</p>
              </div>
            </div>

            <div className="radar-matches-list">
              {radarMatches.length === 0 ? (
                <div className="empty-radar">
                  <p className="text-xs text-muted">
                    No high-confidence matches detected yet. We'll automatically notify you when a matching {item.type === 'lost' ? 'found' : 'lost'} item is logged!
                  </p>
                </div>
              ) : (
                radarMatches.map(({ matchedItem, score, reasons }) => (
                  <div 
                    key={matchedItem.id} 
                    className="radar-item-card" 
                    onClick={() => navigate(`/item/${matchedItem.id}`)}
                  >
                    <img src={matchedItem.imageUrl} alt="" className="radar-thumb" />
                    <div className="radar-info">
                      <div className="radar-top">
                        <span className="radar-badge">{score}% match</span>
                        <span className="radar-type">{matchedItem.type}</span>
                      </div>
                      <h4 className="radar-item-title">{matchedItem.title}</h4>
                      <p className="radar-item-loc">📍 {matchedItem.location}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      <ClaimModal 
        isOpen={showClaimDialog} 
        onClose={() => setShowClaimDialog(false)} 
        item={item} 
      />

      {/* Dispute Modal */}
      <DisputeModal 
        isOpen={showDisputeDialog} 
        onClose={() => setShowDisputeDialog(false)} 
        item={item} 
      />
    </div>
  );
};
