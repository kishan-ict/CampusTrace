import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_ITEMS } from '../utils/constants';
import { useAuth } from './AuthContext';
import { CampusNotificationManager } from '../utils/notifications';
import { findRadarMatches } from '../utils/matchRadar';
import { 
  db, 
  isFirebaseLive, 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  processZeroCostPhoto 
} from '../services/firebase';

const ItemsContext = createContext();

export const useItems = () => {
  const ctx = useContext(ItemsContext);
  if (!ctx) throw new Error('useItems must be used inside ItemsProvider');
  return ctx;
};

export const ItemsProvider = ({ children }) => {
  const { currentUser, awardPoints } = useAuth();
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [messages, setMessages] = useState([]);

  // Subscribe to real-time Firestore if configured, else offline storage
  useEffect(() => {
    if (isFirebaseLive() && db) {
      // 1. Items listener
      const q = query(collection(db, 'campus_items'), orderBy('createdAt', 'desc'));
      const unsubItems = onSnapshot(q, (snapshot) => {
        const remote = snapshot.docs.map(d => {
          const data = d.data();
          return { ...data, id: d.id, customId: data.id || d.id };
        });
        if (remote.length > 0) {
          setItems(remote);
        } else {
          setItems(INITIAL_ITEMS);
        }
      }, (err) => console.warn("Firestore items sync error:", err));

      // 2. Claims listener
      const qClaims = query(collection(db, 'campus_claims'), orderBy('createdAt', 'desc'));
      const unsubClaims = onSnapshot(qClaims, (snapshot) => {
        const remoteClaims = snapshot.docs.map(d => {
          const data = d.data();
          return { ...data, id: d.id, customId: data.id || d.id };
        });
        setClaims(remoteClaims);
      }, (err) => console.warn("Firestore claims sync error:", err));

      // 3. Disputes listener ("It is my item but someone else claimed it")
      const qDisputes = query(collection(db, 'campus_disputes'), orderBy('createdAt', 'desc'));
      const unsubDisputes = onSnapshot(qDisputes, (snapshot) => {
        const remote = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
        setDisputes(remote);
      }, (err) => console.warn("Firestore disputes sync error:", err));

      // 4. In-App Direct Messages listener (For Female Student <-> Finder & Moderator <-> Claimant)
      const qMsgs = query(collection(db, 'campus_messages'), orderBy('timestamp', 'asc'));
      const unsubMsgs = onSnapshot(qMsgs, (snapshot) => {
        const remote = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
        setMessages(remote);
      }, (err) => console.warn("Firestore messages sync error:", err));

      return () => {
        unsubItems();
        unsubClaims();
        unsubDisputes();
        unsubMsgs();
      };
    } else {
      // Offline fallback
      const saved = localStorage.getItem('campustrace_items_web');
      setItems(saved ? JSON.parse(saved) : INITIAL_ITEMS);

      const savedClaims = localStorage.getItem('campustrace_claims_web');
      setClaims(savedClaims ? JSON.parse(savedClaims) : []);

      const savedDisputes = localStorage.getItem('campustrace_disputes_web');
      setDisputes(savedDisputes ? JSON.parse(savedDisputes) : []);

      const savedMsgs = localStorage.getItem('campustrace_messages_web');
      setMessages(savedMsgs ? JSON.parse(savedMsgs) : []);
    }
  }, []);

  const persistItems = (newItems) => {
    setItems(newItems);
    localStorage.setItem('campustrace_items_web', JSON.stringify(newItems));
  };

  const persistClaims = (newClaims) => {
    setClaims(newClaims);
    localStorage.setItem('campustrace_claims_web', JSON.stringify(newClaims));
  };

  const persistDisputes = (newDisputes) => {
    setDisputes(newDisputes);
    localStorage.setItem('campustrace_disputes_web', JSON.stringify(newDisputes));
  };

  const persistMessages = (newMsgs) => {
    setMessages(newMsgs);
    localStorage.setItem('campustrace_messages_web', JSON.stringify(newMsgs));
  };

  // Report Item
  const reportItem = async (itemData) => {
    let finalImageUrl = itemData.imageUrl;

    if (itemData.imageUrl) {
      finalImageUrl = await processZeroCostPhoto(itemData.imageUrl);
    }

    const newItem = {
      ...itemData,
      imageUrl: finalImageUrl,
      id: 'item_' + Date.now(),
      status: 'open',
      reporterId: currentUser?.uid || 'guest',
      reporterName: currentUser?.name || 'Anonymous',
      reporterGender: currentUser?.gender || 'male',
      createdAt: new Date().toISOString()
    };

    if (isFirebaseLive() && db) {
      const docRef = await addDoc(collection(db, 'campus_items'), newItem);
      newItem.id = docRef.id;
    } else {
      const updated = [newItem, ...items];
      persistItems(updated);
    }

    awardPoints(25, 'Reported Item');

    const matches = findRadarMatches(newItem, items);
    if (matches.length > 0 && matches[0].score >= 60) {
      CampusNotificationManager.addNotification({
        type: 'match_radar',
        title: `🎯 AI Match Radar (${matches[0].score}% match)`,
        message: `Your reported "${newItem.title}" closely matches "${matches[0].matchedItem.title}"!`,
        itemId: newItem.id
      });
    }

    return newItem;
  };

  // Submit Claim
  const submitClaim = async ({ itemId, answer, studentProof, contactInfo }) => {
    const item = items.find(i => i.id === itemId || i.customId === itemId);
    if (!item) return;

    const newClaim = {
      id: 'claim_' + Date.now(),
      itemId: item.id,
      itemCustomId: item.customId || item.id,
      itemTitle: item.title,
      finderId: item.reporterId,
      finderName: item.reporterName,
      claimantId: currentUser?.uid,
      claimantName: currentUser?.name,
      claimantEmail: currentUser?.email,
      claimantGender: currentUser?.gender || 'male',
      answer,
      studentProof,
      contactInfo: currentUser?.gender === 'female' ? '[Private - In-App Chat Active]' : contactInfo,
      status: 'pending',
      handoverCode: Math.floor(100000 + Math.random() * 900000).toString(),
      createdAt: new Date().toISOString()
    };

    if (isFirebaseLive() && db) {
      const docRef = await addDoc(collection(db, 'campus_claims'), newClaim);
      newClaim.id = docRef.id;
      await updateItemStatus(item.id, 'verification_pending');
    } else {
      persistClaims([newClaim, ...claims]);
      updateItemStatus(item.id, 'verification_pending');
    }

    CampusNotificationManager.addNotification({
      type: 'claim_received',
      title: '🔑 New Claim Received',
      message: `${currentUser?.name} answered the anti-fraud question for "${item.title}". Review their proof!`,
      itemId: item.id
    });

    return newClaim;
  };

  // Review Claim
  const reviewClaim = async (claimId, decision) => {
    const claim = claims.find(c => c.id === claimId || c.customId === claimId);
    if (!claim) return;

    const nextStatus = decision === 'approve' ? 'approved' : 'rejected';
    const targetDocId = claim.id;

    const updated = claims.map(c => (c.id === targetDocId || c.id === claimId) ? { ...c, status: nextStatus } : c);
    persistClaims(updated);

    if (decision !== 'approve') {
      updateItemStatus(claim.itemId, 'open');
    }

    if (isFirebaseLive() && db) {
      try {
        await updateDoc(doc(db, 'campus_claims', targetDocId), { status: nextStatus });
      } catch (err) {
        console.warn('Firebase claims update error:', err);
      }
    }

    if (decision === 'approve') {
      CampusNotificationManager.addNotification({
        type: 'claim_status',
        title: '✅ Claim Approved! Handover Pass Ready',
        message: `Your claim for "${claim.itemTitle}" was approved by the finder. Show your QR to collect!`,
        itemId: claim.itemId
      });
    } else {
      CampusNotificationManager.addNotification({
        type: 'claim_status',
        title: '❌ Claim Rejected',
        message: `Your claim for "${claim.itemTitle}" could not be verified by the finder.`,
        itemId: claim.itemId
      });
    }
  };

  // Verify Handover
  const verifyHandover = async (itemId, enteredPin) => {
    const activeClaim = claims.find(c => (c.itemId === itemId || c.itemCustomId === itemId) && c.status === 'approved');
    if (!activeClaim) {
      return { success: false, message: 'No approved claim found for this item.' };
    }

    if (activeClaim.handoverCode === enteredPin.trim()) {
      const updatedClaims = claims.map(c => c.id === activeClaim.id ? { ...c, status: 'completed' } : c);
      persistClaims(updatedClaims);
      updateItemStatus(itemId, 'returned');

      if (isFirebaseLive() && db) {
        try {
          await updateDoc(doc(db, 'campus_claims', activeClaim.id), { status: 'completed' });
        } catch (err) {
          console.warn('Firebase handover error:', err);
        }
      }

      awardPoints(100, 'Handover Verified');
      return { success: true, message: 'Handover verified successfully! +100 Hero Points awarded.' };
    } else {
      return { success: false, message: 'Invalid Handover PIN. Please check the claimant screen.' };
    }
  };

  const updateItemStatus = async (itemId, newStatus) => {
    const item = items.find(i => i.id === itemId || i.customId === itemId);
    const targetDocId = item ? item.id : itemId;

    if (isFirebaseLive() && db) {
      try {
        await updateDoc(doc(db, 'campus_items', targetDocId), { status: newStatus });
      } catch (e) {
        console.warn('updateItemStatus firebase error:', e);
        setItems(prev => prev.map(i => i.id === targetDocId ? { ...i, status: newStatus } : i));
      }
    } else {
      const updated = items.map(i => i.id === targetDocId ? { ...i, status: newStatus } : i);
      persistItems(updated);
    }
  };

  // Dispute Report ("It is my item but someone else claimed it")
  const submitDispute = async ({ itemId, proof, contactInfo }) => {
    const item = items.find(i => i.id === itemId || i.customId === itemId);
    const itemClaims = claims.filter(c => c.itemId === itemId || c.itemCustomId === itemId);
    const approvedClaim = itemClaims.find(c => c.status === 'approved' || c.status === 'completed') || itemClaims[0];

    const newDispute = {
      id: 'dispute_' + Date.now(),
      itemId: item ? item.id : itemId,
      itemTitle: item ? item.title : 'Campus Item',
      itemCategory: item?.category || 'General',
      itemImageUrl: item?.imageUrl || '',
      itemDescription: item?.description || '',
      itemSecretQuestion: item?.secretQuestion || '',
      itemSecretAnswer: item?.secretAnswer || '',
      reporterId: item?.reporterId || '',
      reporterName: item?.reporterName || '',
      claimedBy: approvedClaim ? approvedClaim.claimantName : 'Unknown Claimant',
      claimantAnswer: approvedClaim ? approvedClaim.answer : 'N/A',
      claimantProof: approvedClaim ? approvedClaim.studentProof : 'N/A',
      claimantContact: approvedClaim ? approvedClaim.contactInfo : 'N/A',
      disputerId: currentUser?.uid || 'guest',
      disputerName: currentUser?.name || 'Anonymous Student',
      disputerEmail: currentUser?.email || '',
      disputerGender: currentUser?.gender || 'male',
      disputerProof: proof,
      disputerContact: currentUser?.gender === 'female' ? '[Private In-App Chat]' : contactInfo,
      status: 'pending_moderation', // 'pending_moderation' | 'investigating' | 'resolved'
      createdAt: new Date().toISOString()
    };

    if (isFirebaseLive() && db) {
      const docRef = await addDoc(collection(db, 'campus_disputes'), newDispute);
      newDispute.id = docRef.id;
    } else {
      persistDisputes([newDispute, ...disputes]);
    }

    // Send initial dispute message to moderator chat room
    await sendMessage({
      chatRoomId: `dispute_${newDispute.id}`,
      senderId: currentUser?.uid || 'guest',
      senderName: currentUser?.name || 'Disputing Student',
      senderRole: currentUser?.role || 'student',
      text: `[New Dispute Filed] Proof submitted: "${proof}". Contact: ${newDispute.disputerContact}`
    });

    CampusNotificationManager.addNotification({
      type: 'dispute_filed',
      title: '🚨 Dispute Escalated to Campus Moderator',
      message: `Your dispute for "${item?.title}" was routed directly to Campus Safety & Student Affairs Moderation.`,
      itemId: item?.id
    });

    return newDispute;
  };

  // In-App Chat Messaging
  const sendMessage = async ({ chatRoomId, senderId, senderName, senderRole, text }) => {
    if (!text || !text.trim()) return;

    const newMsg = {
      id: 'msg_' + Date.now(),
      chatRoomId, // e.g. "claim_direct_123" or "dispute_456"
      senderId: senderId || currentUser?.uid,
      senderName: senderName || currentUser?.name,
      senderRole: senderRole || currentUser?.role || 'student',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    if (isFirebaseLive() && db) {
      try {
        const docRef = await addDoc(collection(db, 'campus_messages'), newMsg);
        newMsg.id = docRef.id;
      } catch (err) {
        console.warn('Firebase message send error:', err);
      }
    } else {
      persistMessages([...messages, newMsg]);
    }

    return newMsg;
  };

  return (
    <ItemsContext.Provider value={{
      items,
      claims,
      disputes,
      messages,
      reportItem,
      submitClaim,
      reviewClaim,
      verifyHandover,
      updateItemStatus,
      submitDispute,
      sendMessage
    }}>
      {children}
    </ItemsContext.Provider>
  );
};
