import React, { useState } from 'react';
import { 
  X, 
  Key, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const ApiKeyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { customApiKey, updateApiKey } = useAuth();
  const [keyInput, setKeyInput] = useState(customApiKey);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    updateApiKey(keyInput.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex-row items-center gap-2">
            <Sparkles className="text-primary" size={22} />
            <h3 className="modal-title">Gemini AI Auto-Tagging Engine</h3>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <p className="text-xs text-muted mb-3">
          CampusTrace connects directly to Google Gemini 3.8 Flash / 1.5 Flash to automatically extract titles, classifications, colors, and 5+ tags when reporting lost/found items.
        </p>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label text-xs">Google Gemini API Key</label>
            <input 
              type="password"
              className="form-input font-mono text-xs"
              placeholder="AIzaSy... or AQ.YourGeminiKeyHere"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
            />
          </div>

          <div className="flex-row items-center justify-between text-xs text-muted mb-3">
            <span>Keys are saved locally in your browser environment.</span>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noreferrer"
              className="text-primary font-semibold flex-row items-center gap-1"
            >
              Get Gemini Key <ExternalLink size={12} />
            </a>
          </div>

          <div className="modal-footer">
            <button type="button" className="secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              {saved ? (
                <>
                  <CheckCircle2 size={16} /> Saved!
                </>
              ) : 'Save Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

