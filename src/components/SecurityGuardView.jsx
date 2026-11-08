import React, { useState, useRef } from 'react';
import { 
  Shield, 
  PlusCircle, 
  Copy, 
  Check, 
  PackageCheck,
  Camera,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { useItems } from '../contexts/ItemsContext';
import { useAuth } from '../contexts/AuthContext';
import { LOCATIONS, CATEGORIES } from '../utils/constants';

export const SecurityGuardView = () => {
  const { items, reportItem } = useItems();
  const { awardPoints } = useAuth();

  const [copied, setCopied] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState(CATEGORIES[0]);
  const [quickLocation, setQuickLocation] = useState('Room MB011');
  const [depositorName, setDepositorName] = useState('');
  const [deskNote, setDeskNote] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const guardFileInputRef = useRef(null);

  const unclaimed = items.filter(i => i.status !== 'returned');

  const handleGuardPhoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoDataUrl(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Export CSV summary to clipboard
  const handleExportCSV = () => {
    const headers = ['ID', 'Type', 'Title', 'Category', 'Location', 'Date', 'Status', 'Reporter'];
    const rows = unclaimed.map(item => [
      item.id,
      item.type.toUpperCase(),
      `"${item.title.replace(/"/g, '""')}"`,
      item.category,
      item.location,
      item.dateOccurred,
      item.status,
      `"${item.reporterName}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    navigator.clipboard.writeText(csvContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const handleQuickLog = (e) => {
    e.preventDefault();
    if (!quickTitle) return;

    if (!photoDataUrl) {
      alert('Compulsory: Please attach a custody photo of the deposited item.');
      return;
    }

    setSubmitting(true);
    try {
      reportItem({
        title: quickTitle,
        type: 'found',
        category: quickCategory,
        location: quickLocation,
        dateOccurred: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        description: `Logged at Campus Security Desk. Depositor: ${depositorName || 'Anonymous Student'}. Custody note: ${deskNote || 'Safe at main gate reception.'}`,
        imageUrl: photoDataUrl,
        tags: ['security-desk', 'custody', quickCategory.toLowerCase()],
        secretQuestion: 'What specific mark, serial number or sticker is verified by security?',
        secretAnswer: 'CampusSecurity',
        reportedByGuard: true,
        aiTagged: false
      });

      setQuickTitle('');
      setDepositorName('');
      setDeskNote('');
      setPhotoDataUrl('');
      awardPoints(50, 'Security Custody Registered');
      alert('Item logged at Security Desk with custody photo!');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="security-desk-container animate-fade-in">
      <div className="security-banner">
        <div className="flex-row items-center gap-3">
          <div className="security-icon-circle">
            <Shield size={26} className="text-warning" />
          </div>
          <div>
            <h3 className="security-title">Campus Security Officer Desk Mode</h3>
            <p className="security-subtitle">
              Active terminal for main gate, reception, and physical custody item logging.
            </p>
          </div>
        </div>

        <div className="security-actions">
          <button 
            className="secondary-btn flex-row items-center gap-2"
            onClick={handleExportCSV}
          >
            {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
            <span>{copied ? 'CSV Copied to Clipboard!' : 'Export CSV Summary'}</span>
          </button>
        </div>
      </div>

      <div className="security-grid">
        <div className="security-card">
          <h4 className="card-subheading">
            <PlusCircle size={18} className="text-primary" />
            One-Tap Quick Item Custody Deposit
          </h4>
          <form onSubmit={handleQuickLog} className="quick-log-form">
            <div className="form-group">
              <label className="form-label text-xs">Item Name / Model *</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Realme Watch 2 or Scientific Calculator"
                value={quickTitle}
                onChange={e => setQuickTitle(e.target.value)}
                required
              />
            </div>

            {/* Guard Photo Upload */}
            <div className="form-group">
              <label className="form-label text-xs">Custody Photo * (Compulsory)</label>
              <input 
                type="file" 
                ref={guardFileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleGuardPhoto}
              />
              {photoDataUrl ? (
                <div className="flex-row items-center gap-2">
                  <img src={photoDataUrl} alt="Custody Photo" style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }} />
                  <span className="text-xs text-success font-semibold flex-row items-center gap-1">
                    <Check size={13} /> Photo Attached
                  </span>
                  <button 
                    type="button" 
                    className="text-xs text-muted" 
                    onClick={() => setPhotoDataUrl('')}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button 
                  type="button" 
                  className="secondary-btn w-full btn-sm"
                  onClick={() => guardFileInputRef.current?.click()}
                >
                  <Upload size={14} /> Upload / Snap Custody Photo
                </button>
              )}
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label className="form-label text-xs">Category</label>
                <select 
                  className="form-select"
                  value={quickCategory}
                  onChange={e => setQuickCategory(e.target.value)}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group flex-1">
                <label className="form-label text-xs">Found Location</label>
                <select 
                  className="form-select"
                  value={quickLocation}
                  onChange={e => setQuickLocation(e.target.value)}
                >
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label className="form-label text-xs">Deposited By (Student Name / ID)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Rahul (Hostel 3)"
                  value={depositorName}
                  onChange={e => setDepositorName(e.target.value)}
                />
              </div>

              <div className="form-group flex-1">
                <label className="form-label text-xs">Storage Locker / Shelf #</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Locker B-14"
                  value={deskNote}
                  onChange={e => setDeskNote(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="primary-btn w-full mt-2" disabled={submitting}>
              {submitting ? 'Depositing...' : 'Deposit to Security Custody (+50 pts)'}
            </button>
          </form>
        </div>

        <div className="security-card">
          <div className="flex-row items-center justify-between mb-3">
            <h4 className="card-subheading">
              <PackageCheck size={18} className="text-success" />
              Active Unclaimed Custody ({unclaimed.length})
            </h4>
            <span className="text-xs text-muted">Real-time status</span>
          </div>

          <div className="unclaimed-list">
            {unclaimed.slice(0, 5).map(item => (
              <div key={item.id} className="unclaimed-row">
                <img src={item.imageUrl} alt="" className="unclaimed-thumb" />
                <div className="unclaimed-info">
                  <div className="font-semibold text-sm">{item.title}</div>
                  <div className="text-xs text-muted flex-row gap-2">
                    <span>{item.category}</span>
                    <span>•</span>
                    <span>{item.location}</span>
                  </div>
                </div>
                <div className="unclaimed-status">
                  <span className={`status-pill ${item.type}`}>
                    {item.type.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
