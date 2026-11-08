import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  ShieldAlert, 
  Send, 
  Lock, 
  CheckCircle,
  MessageSquare
} from 'lucide-react';
import { useItems } from '../contexts/ItemsContext';
import { useAuth } from '../contexts/AuthContext';

export const DisputeModal = ({ isOpen, onClose, item }) => {
  if (!isOpen || !item) return null;

  const { submitDispute } = useItems();
  const { currentUser } = useAuth();

  const [proof, setProof] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isFemale = currentUser?.gender === 'female';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proof.trim()) {
      alert('Please explain your proof of ownership.');
      return;
    }

    setSubmitting(true);
    try {
      await submitDispute({
        itemId: item.id,
        proof,
        contactInfo: isFemale ? '[Private - In-App Chat]' : contactInfo
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Error submitting dispute.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex-row items-center gap-2">
            <ShieldAlert size={22} className="text-danger" />
            <h3 className="modal-title">Dispute Claim with Campus Moderator</h3>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {submitted ? (
          <div className="text-center py-4 animate-scale-in">
            <CheckCircle size={46} className="text-success mx-auto mb-2" />
            <h4 className="font-bold text-base mb-1">Dispute Sent to Moderator!</h4>
            <p className="text-xs text-muted mb-3">
              Campus Safety & Affairs moderators have been alerted with full item details, original answers, and your statement. The moderator can contact you or chat directly through this application to investigate.
            </p>
            <button className="primary-btn w-full" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="dispute-form">
            <div className="dispute-item-banner mb-3">
              <img src={item.imageUrl} alt="" className="dispute-thumb" />
              <div>
                <span className="badge-pill-danger text-xs mb-1 inline-block">Item Already Claimed</span>
                <h4 className="text-sm font-bold">{item.title}</h4>
                <p className="text-xs text-muted">Found at: {item.location} ({item.dateOccurred})</p>
              </div>
            </div>

            <div className="warning-callout-box mb-3">
              <AlertTriangle size={18} className="text-danger flex-shrink-0" />
              <p className="text-xs">
                You are reporting that <strong>this item belongs to you, but someone else has claimed it</strong>. This will trigger an official review by Campus Moderators.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label text-xs">
                What is the proof that this item is yours? *
              </label>
              <textarea 
                className="form-textarea" 
                rows={3}
                placeholder="Explain specific marks, scratches, exact serial numbers, stickers, or receipts only the true owner possesses..."
                value={proof}
                onChange={e => setProof(e.target.value)}
                required
              />
            </div>

            {/* If female student: No contact details asked! */}
            {isFemale ? (
              <div className="privacy-active-box mb-3">
                <Lock size={16} className="text-primary flex-shrink-0" />
                <div className="text-xs">
                  <strong>Girl Student Privacy Shield Active:</strong> Your contact number is NOT required. Campus moderators will communicate with you directly via in-app chat!
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label text-xs">
                  Your Contact Phone / WhatsApp Number *
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

            <div className="modal-footer">
              <button type="button" className="secondary-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="danger-btn flex-row items-center gap-2" disabled={submitting}>
                <Send size={15} />
                <span>{submitting ? 'Escalating...' : 'Send to Moderator'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
