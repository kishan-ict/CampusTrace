import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  HelpCircle, 
  AlertTriangle,
  Lock 
} from 'lucide-react';
import { useItems } from '../contexts/ItemsContext';
import { useAuth } from '../contexts/AuthContext';

export const ClaimModal = ({ isOpen, onClose, item }) => {
  if (!isOpen || !item) return null;

  const { submitClaim } = useItems();
  const { currentUser } = useAuth();
  const [answer, setAnswer] = useState('');
  const [studentProof, setStudentProof] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isFemale = currentUser?.gender === 'female';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer) {
      alert('Please provide your answer to the secret question.');
      return;
    }

    setSubmitting(true);
    try {
      submitClaim({
        itemId: item.id,
        answer,
        studentProof,
        contactInfo: isFemale ? '[Private In-App Direct Chat]' : contactInfo
      });
      alert('Claim submitted! The finder has been notified to review your response.');
      onClose();
    } catch (e) {
      console.error(e);
      alert('Error submitting claim.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex-row items-center gap-2">
            <ShieldCheck size={22} className="text-primary" />
            <h3 className="modal-title">Anti-Fraud Claim Verification</h3>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="claim-item-summary">
          <img src={item.imageUrl} alt="" className="claim-thumb" />
          <div>
            <div className="font-semibold text-sm">{item.title}</div>
            <div className="text-xs text-muted">Found at: {item.location} ({item.dateOccurred})</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="claim-form">
          <div className="secret-question-banner">
            <HelpCircle size={18} className="text-primary mt-1 flex-shrink-0" />
            <div>
              <span className="text-xs font-bold uppercase text-muted block mb-1">
                Finder's Secret Verification Question:
              </span>
              <p className="secret-question-text">
                "{item.secretQuestion || 'What distinct sticker, marking or roll number is on this item?'}"
              </p>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label text-xs">
              Your Answer (Proof of Ownership) *
            </label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Provide exact details only the true owner would know..." 
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label text-xs">
              Student ID / Bill / Additional Proof (Optional)
            </label>
            <textarea 
              className="form-textarea" 
              rows={2}
              placeholder="e.g. Student roll number, bill screenshot link, or identifying scratches..."
              value={studentProof}
              onChange={e => setStudentProof(e.target.value)}
            />
          </div>

          {/* If Female: Contact number is strictly hidden, direct in-app chat is used! */}
          {isFemale ? (
            <div className="privacy-active-box mb-3">
              <Lock size={16} className="text-primary flex-shrink-0" />
              <div className="text-xs">
                <strong>Girl Student Privacy Shield Active:</strong> Your contact number is protected and will NOT be requested or shared. You and the finder will coordinate pickup securely via In-App Direct Chat!
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label text-xs">
                Your Campus Phone or WhatsApp *
              </label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="+91 98765 43210" 
                value={contactInfo}
                onChange={e => setContactInfo(e.target.value)}
                required
              />
            </div>
          )}

          <div className="security-notice">
            <AlertTriangle size={14} className="text-warning flex-shrink-0" />
            <p className="text-xs text-muted">
              False claims violate Campus Honor Code. Answers are reviewed by the finder before single-use QR handover is granted.
            </p>
          </div>

          <div className="modal-footer">
            <button type="button" className="secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Claim Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
