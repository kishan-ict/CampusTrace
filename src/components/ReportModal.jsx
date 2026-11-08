import React, { useState, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  MapPin, 
  Calendar, 
  ShieldAlert, 
  Loader2, 
  Check, 
  Camera, 
  Upload, 
  Image as ImageIcon,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { CATEGORIES, LOCATIONS } from '../utils/constants';
import { analyzeItemWithGemini } from '../services/geminiService';
import { useItems } from '../contexts/ItemsContext';
import { useAuth } from '../contexts/AuthContext';

export const ReportModal = ({ isOpen, onClose, initialType = 'lost' }) => {
  if (!isOpen) return null;

  const { reportItem } = useItems();
  const { customApiKey, guardMode } = useAuth();

  const [type, setType] = useState(initialType); // 'lost' | 'found'
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [dateOccurred, setDateOccurred] = useState('Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [description, setDescription] = useState('');
  
  // Image handling
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [isCapturingWebcam, setIsCapturingWebcam] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Feature 6: Anti-Fraud Secret Question (Hidden from Public)
  const [secretQuestion, setSecretQuestion] = useState('What distinct sticker, marking or roll number is on this item?');
  const [secretAnswer, setSecretAnswer] = useState('');

  // AI Analysis state
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuccess, setAiSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // File Upload Reader (used for Lost items and Guard Mode Found items)
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageDataUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Live Camera Capture (Compulsory for students reporting Found items)
  const startCamera = async () => {
    // If not in a secure context or getUserMedia isn't available (e.g. mobile IP without HTTPS)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
      return;
    }

    setIsCapturingWebcam(true);
    try {
      let stream;
      try {
        // Try back camera first on mobile devices
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
      } catch (backErr) {
        // Fallback to any available camera (e.g. laptop webcam)
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: false
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.muted = true;
        await videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable, opening native camera capture:', err);
      setIsCapturingWebcam(false);
      // Fallback: trigger native device camera via input capture
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    // Ensure video is playing and has valid dimensions
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);

    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      if (dataUrl && dataUrl.length > 100) {
        setImageDataUrl(dataUrl);
        stopCamera();
      } else {
        alert('Could not capture frame. Please try again or tap Open Camera.');
      }
    } catch (e) {
      console.error('Canvas capture error:', e);
      alert('Error capturing photo from stream.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturingWebcam(false);
  };

  const handleRetake = () => {
    setImageDataUrl('');
    if (type === 'found' && !guardMode) {
      startCamera();
    }
  };

  // Gemini 3.8 Flash Auto-Fill
  const handleAiAutoFill = async () => {
    if (!description && !title) {
      alert('Please enter a brief description or title for Gemini AI to analyze!');
      return;
    }

    setIsAiLoading(true);
    setAiSuccess(false);

    try {
      const res = await analyzeItemWithGemini({
        title,
        description,
        customKey: customApiKey
      });

      if (res.suggestedTitle && !title) setTitle(res.suggestedTitle);
      if (res.category) setCategory(res.category);
      if (res.tags && res.tags.length > 0) {
        setTags(Array.from(new Set([...tags, ...res.tags])));
      }
      setAiSuccess(true);
    } catch (e) {
      console.error(e);
      alert('AI auto-fill encountered an error, you can still fill fields manually.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().toLowerCase().replace(/^#/, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
      }
      setTagInput('');
    }
  };

  const removeTag = (t) => {
    setTags(tags.filter(item => item !== t));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Mandatory image validation
    if (!imageDataUrl) {
      if (type === 'found' && !guardMode) {
        alert('Compulsory: Please snap a live photo of the found item using your camera before submitting!');
      } else {
        alert('Compulsory: Please upload a photo of the item before submitting!');
      }
      return;
    }

    if (!title) {
      alert('Please enter an item title');
      return;
    }

    if (type === 'found' && !secretAnswer) {
      alert('Please provide the secret verification answer to prevent fraudulent claims.');
      return;
    }

    setSubmitting(true);
    try {
      reportItem({
        title,
        type,
        category,
        location,
        dateOccurred,
        description,
        imageUrl: imageDataUrl,
        tags,
        secretQuestion: type === 'found' ? secretQuestion : '',
        secretAnswer: type === 'found' ? secretAnswer : '',
        aiTagged: aiSuccess,
        reportedByGuard: guardMode
      });
      stopCamera();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to report item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleModalClose}>
      <div className="modal-card modal-lg animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Report Campus Item</h3>
            <p className="text-xs text-muted">Publish a report with verified photo to notify campus students</p>
          </div>
          <button className="close-btn" onClick={handleModalClose}><X size={20} /></button>
        </div>

        {/* Dual Mode Switch */}
        <div className="dual-mode-switch">
          <button 
            type="button"
            className={`mode-tab ${type === 'lost' ? 'active lost' : ''}`}
            onClick={() => {
              setType('lost');
              stopCamera();
            }}
          >
            🔍 I Lost Something
          </button>
          <button 
            type="button"
            className={`mode-tab ${type === 'found' ? 'active found' : ''}`}
            onClick={() => {
              setType('found');
              stopCamera();
            }}
          >
            🎁 I Found Something
          </button>
        </div>

        <form onSubmit={handleSubmit} className="report-form">
          {/* Gemini AI Auto-Tagging Banner */}
          <div className="ai-banner">
            <div className="flex-row items-center gap-2">
              <Sparkles className="text-primary animate-spin-slow" size={18} />
              <div className="ai-banner-text">
                <strong>Google Gemini 3.8 Flash AI Assistant</strong>
                <p className="text-xs">Type your details, then click "Auto-Fill with AI" to classify and tag automatically.</p>
              </div>
            </div>
            <button 
              type="button" 
              className="ai-action-btn"
              onClick={handleAiAutoFill}
              disabled={isAiLoading}
            >
              {isAiLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : aiSuccess ? (
                <>
                  <Check size={14} />
                  <span>AI Applied</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Auto-Fill with AI</span>
                </>
              )}
            </button>
          </div>

          {/* COMPULSORY PHOTO SECTION */}
          <div className="form-group photo-upload-section">
            <div className="flex-row items-center justify-between mb-1">
              <label className="form-label font-bold text-xs flex-row items-center gap-1">
                <ImageIcon size={15} className="text-primary" />
                <span>
                  {type === 'found' && !guardMode 
                    ? 'Real-Time Camera Photo * (Compulsory for Found Items)' 
                    : 'Item Photo Upload * (Compulsory)'}
                </span>
              </label>
              {imageDataUrl && (
                <button 
                  type="button" 
                  className="text-xs text-primary font-semibold flex-row items-center gap-1"
                  onClick={handleRetake}
                >
                  <RotateCcw size={12} /> Retake / Change
                </button>
              )}
            </div>

            {/* Hidden native file input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              capture={type === 'found' && !guardMode ? "environment" : undefined}
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />

            {/* Camera Viewfinder */}
            {isCapturingWebcam && (
              <div className="webcam-live-card">
                <video ref={videoRef} className="webcam-stream-video" playsInline />
                <div className="webcam-controls-overlay">
                  <button type="button" className="camera-snap-btn" onClick={capturePhoto}>
                    <Camera size={22} />
                    <span>Snap Photo</span>
                  </button>
                  <button type="button" className="secondary-btn btn-sm" onClick={stopCamera}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Photo Preview when available */}
            {imageDataUrl && !isCapturingWebcam && (
              <div className="photo-preview-box">
                <img src={imageDataUrl} alt="Captured Item" className="preview-captured-img" />
                <div className="photo-verified-tag">
                  <Check size={13} /> Photo Attached
                </div>
              </div>
            )}

            {/* Trigger buttons when no photo is attached */}
            {!imageDataUrl && !isCapturingWebcam && (
              <div className="photo-picker-container">
                {type === 'found' && !guardMode ? (
                  /* Student reporting FOUND item: Compulsory Real-Time Photo */
                  <div className="camera-prompt-card">
                    <div className="camera-prompt-icon" onClick={startCamera}>
                      <Camera size={32} />
                    </div>
                    <div className="camera-prompt-title">Take Real-Time Photo of Item</div>
                    <div className="camera-prompt-sub">
                      For integrity, students must take a real-time photo of the physical found item.
                    </div>
                    <div className="flex-row gap-2 mt-2">
                      <button type="button" className="primary-btn" onClick={startCamera}>
                        <Camera size={16} /> Open Camera
                      </button>
                      <button 
                        type="button" 
                        className="secondary-btn" 
                        onClick={() => fileInputRef.current?.click()}
                        title="If camera permissions are blocked by browser, open device camera directly"
                      >
                        <Camera size={16} /> Device Camera
                      </button>
                    </div>
                  </div>
                ) : (
                  /* LOST item OR Guard Mode: File Upload or Camera */
                  <div className="upload-prompt-card" onClick={() => fileInputRef.current?.click()}>
                    <div className="upload-prompt-icon">
                      <Upload size={30} />
                    </div>
                    <div className="camera-prompt-title">
                      {guardMode ? 'Guard Desk: Upload or Take Photo' : 'Upload Lost Item Photo'}
                    </div>
                    <div className="camera-prompt-sub">
                      Tap to select from gallery, files, or take photo (PNG, JPG, WEBP)
                    </div>
                    <div className="flex-row gap-2 mt-2">
                      <button type="button" className="secondary-btn btn-sm">
                        <Upload size={14} /> Browse Files
                      </button>
                      <button 
                        type="button" 
                        className="secondary-btn btn-sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          startCamera();
                        }}
                      >
                        <Camera size={14} /> Use Camera
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Item Title *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Marwadi University Student ID Card or Boat Airdopes 141" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description & Clues</label>
            <textarea 
              className="form-textarea" 
              rows={3}
              placeholder="Describe colors, engravings, lanyard, room number, or condition..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">Category</label>
              <select 
                className="form-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group flex-1">
              <label className="form-label">Campus Location</label>
              <select 
                className="form-select"
                value={location}
                onChange={e => setLocation(e.target.value)}
              >
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">When / Date</label>
            <input 
              type="text" 
              className="form-input" 
              value={dateOccurred}
              onChange={e => setDateOccurred(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">Search Tags (Press Enter to add)</label>
            <div className="tags-input-box">
              {tags.map(t => (
                <span key={t} className="tag-pill">
                  #{t}
                  <button type="button" onClick={() => removeTag(t)}>×</button>
                </span>
              ))}
              <input 
                type="text" 
                placeholder="Add tags (e.g. blue, btech, lanyard)..."
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="tag-field"
              />
            </div>
          </div>

          {/* Anti-Fraud Secret Question (Feature 6) */}
          {type === 'found' && (
            <div className="anti-fraud-box">
              <div className="flex-row items-center gap-2 mb-2">
                <ShieldAlert className="text-warning" size={18} />
                <h4 className="anti-fraud-title">Anti-Fraud Security Prompt (Hidden from Public)</h4>
              </div>
              <p className="text-xs text-muted mb-3">
                Claimants must correctly answer this question before you approve handover of this found item.
              </p>

              <div className="form-group mb-2">
                <label className="form-label text-xs">Secret Verification Question *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={secretQuestion}
                  onChange={e => setSecretQuestion(e.target.value)}
                  placeholder="e.g. What sticker is on the back? Or roll number ending digits?"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label text-xs">Hidden Secret Answer * (Only you see this)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={secretAnswer}
                  onChange={e => setSecretAnswer(e.target.value)}
                  placeholder="e.g. Naruto sticker / Roll ending 492"
                  required
                />
              </div>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="secondary-btn" onClick={handleModalClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? 'Submitting...' : (type === 'lost' ? 'Publish Lost Item (+25 pts)' : 'Publish Found Item (+25 pts)')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
