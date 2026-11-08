import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  QrCode, 
  CheckCircle, 
  ShieldCheck, 
  KeyRound, 
  Copy, 
  Check, 
  Sparkles, 
  AlertCircle, 
  Clock, 
  Camera, 
  X, 
  Smartphone,
  User,
  Phone,
  FileText,
  Lock,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useItems } from '../contexts/ItemsContext';
import { DirectChatBox } from './DirectChatBox';

export const HandoverQrModal = ({ item, claim }) => {
  const { currentUser } = useAuth();
  const { verifyHandover, reviewClaim } = useItems();

  const canvasRef = useRef(null);
  const scannerRef = useRef(null);
  const [pinInput, setPinInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Scanner state for receiver
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState(null);
  const [scannerError, setScannerError] = useState(null);

  const isApproved = claim?.status === 'approved';
  const isReturned = item.status === 'returned';

  // Strict Role Determination based on logged-in user:
  const isFinder = currentUser?.uid === item.reporterId || 
                   (item.reportedByGuard && currentUser?.uid === 'demo_guard') ||
                   currentUser?.name === item.reporterName;

  const isReceiver = claim && (currentUser?.uid === claim.claimantId || currentUser?.name === claim.claimantName);

  // Girl Privacy Detection:
  const isClaimantFemale = claim?.claimantGender === 'female';
  const isCurrentUserFemale = currentUser?.gender === 'female';

  // Generate QR Canvas on FINDER's screen once claim is approved
  useEffect(() => {
    if (canvasRef.current && claim?.handoverCode && isApproved && isFinder) {
      QRCode.toCanvas(
        canvasRef.current,
        JSON.stringify({
          app: 'CampusTrace',
          itemId: item.id,
          claimId: claim.id,
          pin: claim.handoverCode
        }),
        { width: 220, margin: 1, color: { dark: '#0f172a', light: '#ffffff' } },
        (err) => {
          if (err) console.error(err);
        }
      );
    }
  }, [claim, isApproved, isFinder]);

  // Handle Camera QR Scanner (Receiver Side)
  const startScanner = async () => {
    setIsScanning(true);
    setScannerError(null);

    setTimeout(async () => {
      try {
        const scannerElement = document.getElementById('qr-camera-reader');
        if (!scannerElement) return;

        const html5QrCode = new Html5Qrcode('qr-camera-reader');
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            let extractedPin = decodedText;
            try {
              if (decodedText.startsWith('{') && decodedText.includes('pin')) {
                const parsed = JSON.parse(decodedText);
                extractedPin = parsed.pin || decodedText;
              }
            } catch (err) {}
            setScannedCode(extractedPin);
            stopScanner();
          },
          () => {}
        );
      } catch (err) {
        console.error('Camera QR scan error:', err);
        try {
          if (scannerRef.current) {
            await scannerRef.current.start(
              true,
              { fps: 10, qrbox: { width: 220, height: 220 } },
              (decodedText) => {
                let extractedPin = decodedText;
                try {
                  const parsed = JSON.parse(decodedText);
                  if (parsed.pin) extractedPin = parsed.pin;
                } catch(e) {}
                setScannedCode(extractedPin);
                stopScanner();
              },
              () => {}
            );
            return;
          }
        } catch (fallbackErr) {
          console.error('Fallback camera error:', fallbackErr);
        }
        setScannerError('Could not open camera stream. Please allow permissions or view your code below.');
      }
    }, 150);
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Stop scanner error:', err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const copyPin = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await reviewClaim(claim.id, 'approve');
    } catch (e) {
      console.error(e);
      alert('Error approving claim.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await reviewClaim(claim.id, 'reject');
    } catch (e) {
      console.error(e);
      alert('Error rejecting claim.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleValidate = async (e) => {
    e.preventDefault();
    if (!pinInput) return;

    setVerifying(true);
    setResult(null);

    const res = await verifyHandover(item.id, pinInput);
    setVerifying(false);

    if (res.success) {
      setResult({ success: true, message: res.message });
      try {
        confetti({
          particleCount: 120,
          spread: 75,
          origin: { y: 0.6 }
        });
      } catch (err) {}
    } else {
      setResult({ success: false, message: res.message });
    }
  };

  if (isReturned) {
    return (
      <div className="handover-success-card animate-scale-in">
        <CheckCircle size={46} className="text-success mb-2" />
        <h3 className="text-lg font-bold">Item Successfully Returned!</h3>
        <p className="text-xs text-muted mb-3">
          Verified physical handover complete. The finder has been awarded +100 Campus Hero Points!
        </p>
        <div className="badge-pill-success">
          <Sparkles size={14} /> +100 Hero Points Awarded
        </div>
      </div>
    );
  }

  // Shared Chat Room ID for Finder & Receiver:
  const directChatRoomId = `claim_direct_${claim?.id || item.id}`;

  // ========================================================
  // 1. FINDER SCREEN (Strictly shown only if you are the finder)
  // ========================================================
  if (isFinder) {
    return (
      <div className="handover-container animate-fade-in">
        {/* While pending: Finder reviews the claimant's answer */}
        {claim && claim.status === 'pending' && (
          <div className="claim-review-box">
            <div className="flex-row items-center gap-2 mb-2">
              <ShieldCheck size={20} className="text-primary" />
              <h4 className="font-bold text-sm">Review Receiver's Claim & Details</h4>
            </div>
            
            <div className="claim-review-details">
              <div className="receiver-detail-card mb-2">
                <div className="flex-row items-center gap-2 mb-1">
                  <User size={15} className="text-primary" />
                  <strong>Receiver:</strong> {claim.claimantName} ({claim.claimantEmail})
                </div>

                {/* If female student: No contact number is revealed */}
                {isClaimantFemale ? (
                  <div className="privacy-pill-note mb-1">
                    <Lock size={12} className="inline mr-1" />
                    <strong>Female Student Privacy Protection:</strong> Phone number is private. Use the safe in-app chat below to coordinate handover!
                  </div>
                ) : (
                  claim.contactInfo && (
                    <div className="flex-row items-center gap-2 text-xs text-muted mb-1">
                      <Phone size={13} className="text-primary" />
                      <strong>Phone / WhatsApp:</strong> {claim.contactInfo}
                    </div>
                  )
                )}

                {claim.studentProof && (
                  <div className="flex-row items-center gap-2 text-xs text-muted">
                    <FileText size={13} className="text-primary" />
                    <strong>Roll / Proof:</strong> {claim.studentProof}
                  </div>
                )}
              </div>

              <div className="answer-box-highlight mb-2">
                <div className="text-xs text-muted font-bold uppercase mb-1">Receiver's Submitted Answer:</div>
                <div className="highlight-text-large">"{claim.answer}"</div>
              </div>
              
              {/* Secret Answer shown ONLY to the Finder */}
              {item.secretAnswer && (
                <p className="finder-secret-hint">
                  🔒 <em>Your Secret Answer (Private to you):</em> <strong>{item.secretAnswer}</strong>
                </p>
              )}
            </div>

            <div className="flex-row gap-2 mt-3">
              <button 
                className="primary-btn flex-1"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                {actionLoading ? 'Approving...' : '✓ Approve Answer & Generate QR'}
              </button>
              <button 
                className="danger-btn"
                onClick={handleReject}
                disabled={actionLoading}
              >
                Reject Claim
              </button>
            </div>
          </div>
        )}

        {/* Once approved: FINDER GENERATES AND SHOWS THE QR CODE (Valid for 2 Days) */}
        {isApproved && (
          <div className="qr-display-box animate-scale-in">
            <div className="qr-header">
              <QrCode size={22} className="text-primary" />
              <h4 className="font-bold text-base">Handover QR Code Generated!</h4>
            </div>

            <div className="expiry-notice-banner">
              <Clock size={16} className="text-warning flex-shrink-0" />
              <span>
                ⏰ <strong>Valid for 2 Days:</strong> Show this QR code to the receiver ({claim.claimantName}). They will scan it with their camera to get their 6-digit PIN.
              </span>
            </div>

            {/* Receiver Contact Details for Finder */}
            <div className="receiver-contact-summary-box mb-3">
              <div className="text-xs font-bold text-muted uppercase mb-1">Receiver Details:</div>
              <div className="text-sm font-semibold">{claim.claimantName}</div>
              {isClaimantFemale ? (
                <div className="text-xs text-primary font-bold mt-1">
                  🔒 Female Student Protected Mode (Chat Active Below)
                </div>
              ) : (
                claim.contactInfo && <div className="text-xs text-muted">📞 {claim.contactInfo}</div>
              )}
            </div>

            {/* QR Code Canvas shown on Finder's Screen */}
            <div className="qr-canvas-wrapper my-3">
              <canvas ref={canvasRef} />
            </div>

            {/* Finder PIN Validator: Finder enters 6-digit code after handing over */}
            <div className="finder-validator-box mt-3 mb-4">
              <h5 className="font-bold text-xs uppercase tracking-wide text-muted mb-1 flex-row items-center gap-1">
                <KeyRound size={14} className="text-primary" /> Step 2: Finalize Handover
              </h5>
              <p className="text-xs text-muted mb-2">
                Ask the receiver for their <strong>6-digit code</strong> (received after scanning your QR) and enter it below to complete handover:
              </p>

              <form onSubmit={handleValidate} className="validator-form">
                <input 
                  type="text" 
                  className="form-input text-center text-lg font-mono tracking-widest"
                  maxLength={6}
                  placeholder="0 0 0 0 0 0"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  required
                />
                <button 
                  type="submit" 
                  className="primary-btn w-full mt-2"
                  disabled={verifying}
                >
                  {verifying ? 'Verifying...' : 'Validate Handover (+100 Hero Points)'}
                </button>
              </form>

              {result && (
                <div className={`verify-alert ${result.success ? 'success' : 'error'}`}>
                  {result.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  <span>{result.message}</span>
                </div>
              )}
            </div>

            {/* If Female student, show In-App Direct Chat for safe coordination */}
            {isClaimantFemale && (
              <div className="mt-3">
                <DirectChatBox 
                  chatRoomId={directChatRoomId}
                  title={`Safe In-App Chat with ${claim.claimantName}`}
                  isPrivateGirlMode={true}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ========================================================
  // 2. RECEIVER SCREEN (Strictly shown only if you are the claimant)
  // ========================================================
  return (
    <div className="handover-container animate-fade-in">
      {/* While pending approval */}
      {claim && claim.status === 'pending' && (
        <div className="claim-review-box">
          <div className="flex-row items-center gap-2 mb-2">
            <Clock size={20} className="text-warning" />
            <h4 className="font-bold text-sm">Claim Verification in Progress</h4>
          </div>
          <p className="text-xs text-muted mb-2">
            You submitted proof for this item. The finder ({item.reporterName}) is reviewing your answer.
          </p>
          <div className="claim-review-details">
            <p><strong>Your Submitted Answer:</strong> <span className="highlight-text">{claim.answer}</span></p>
            <p className="text-xs text-muted mt-2">
              ⏳ Once the finder approves your answer, you can <strong>Scan the Finder's QR Code</strong> to receive your 6-digit code!
            </p>
          </div>
        </div>
      )}

      {/* Once approved: RECEIVER SCANS FINDER'S QR OR REVEALS 6-DIGIT CODE */}
      {isApproved && (
        <div className="receiver-action-box animate-scale-in">
          <div className="flex-row items-center justify-between mb-2">
            <div className="flex-row items-center gap-2">
              <CheckCircle size={22} className="text-success" />
              <h4 className="font-bold text-base">Claim Approved!</h4>
            </div>
            <span className="badge-pill-success">Approved</span>
          </div>

          <div className="expiry-notice-banner mb-3">
            <Clock size={16} className="text-warning flex-shrink-0" />
            <span>
              ⏰ <strong>2 Days Validity:</strong> Please meet the finder ({item.reporterName}) within 2 days to collect your item.
            </span>
          </div>

          {/* Scan Finder's QR Code Button & Interface */}
          <div className="scan-section-card mb-3">
            <h5 className="font-bold text-xs uppercase tracking-wide text-muted mb-1 flex-row items-center gap-1">
              <Smartphone size={14} className="text-primary" /> Step 1: Scan Finder's QR Code
            </h5>
            <p className="text-xs text-muted mb-3">
              Meet the finder in person and scan the QR code displayed on the finder's phone:
            </p>

            {!isScanning && (
              <button 
                type="button" 
                className="primary-btn w-full flex-row items-center justify-center gap-2"
                onClick={startScanner}
              >
                <Camera size={18} />
                <span>Scan Finder's QR Code</span>
              </button>
            )}

            {isScanning && (
              <div className="qr-scanner-live-container">
                <div className="flex-row items-center justify-between mb-2">
                  <span className="text-xs font-bold text-primary flex-row items-center gap-1">
                    <Camera size={14} className="animate-pulse" /> Point camera at Finder's QR:
                  </span>
                  <button 
                    type="button" 
                    className="icon-btn-sm" 
                    onClick={stopScanner}
                    title="Close Scanner"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div id="qr-camera-reader" className="camera-viewport-box"></div>

                {scannerError && (
                  <p className="text-xs text-danger mt-2">{scannerError}</p>
                )}
              </div>
            )}

            {scannedCode && (
              <div className="scanned-success-card animate-scale-in mt-3">
                <CheckCircle size={18} className="text-success flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-success">QR Code Scanned Successfully!</div>
                  <div className="text-xs text-muted">Your verified handover code is ready below.</div>
                </div>
              </div>
            )}
          </div>

          {/* 6-Digit Code Display for Receiver */}
          <div className="receiver-pin-card mb-3">
            <div className="text-xs text-muted font-semibold mb-1">
              YOUR 6-DIGIT HANDOVER CODE:
            </div>
            <div className="pin-badge-row">
              <span className="pin-code">{scannedCode || claim.handoverCode}</span>
              <button 
                className="copy-pin-btn" 
                onClick={() => copyPin(scannedCode || claim.handoverCode)} 
                title="Copy Code"
              >
                {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
              </button>
            </div>
            <p className="text-xs text-muted mt-2 text-center">
              👉 Provide this <strong>6-digit code</strong> to the finder when you receive your item to complete verification.
            </p>
          </div>

          {/* If female student: Direct In-App Chat Box */}
          {isCurrentUserFemale && (
            <div className="mt-3">
              <DirectChatBox 
                chatRoomId={directChatRoomId}
                title={`Safe In-App Direct Chat with Finder (${item.reporterName})`}
                isPrivateGirlMode={true}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
