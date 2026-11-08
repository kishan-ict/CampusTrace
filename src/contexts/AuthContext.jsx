import React, { createContext, useContext, useState, useEffect } from 'react';
import { BADGES, calculateRank } from '../utils/constants';
import { CampusNotificationManager } from '../utils/notifications';
import { db, isFirebaseLive, collection, onSnapshot, doc, setDoc, deleteDoc } from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

// Initial default moderator list
const DEFAULT_MODERATORS = [
  { id: 'mod_1', name: 'Campus Safety Officer Sharma', email: 'safety.mod@campus.edu', password: 'modpass123', role: 'moderator' },
  { id: 'mod_2', name: 'Student Affairs Moderator Priya', email: 'priya.affairs@campus.edu', password: 'modpass123', role: 'moderator' }
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('campustrace_active_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null; // Null means user must log in or auto-fill on landing page
  });

  const [moderators, setModerators] = useState(() => {
    const saved = localStorage.getItem('campustrace_moderators');
    if (saved) {
      try { return JSON.parse(saved); } catch { return DEFAULT_MODERATORS; }
    }
    return DEFAULT_MODERATORS;
  });

  const [guardMode, setGuardMode] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem('campustrace_custom_gemini_key') || '');

  // Sync moderators from Firestore if live
  useEffect(() => {
    if (isFirebaseLive() && db) {
      const unsub = onSnapshot(collection(db, 'campus_moderators'), (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          setModerators(list);
          localStorage.setItem('campustrace_moderators', JSON.stringify(list));
        } else {
          // Initialize default mods in Firestore
          DEFAULT_MODERATORS.forEach(m => {
            setDoc(doc(db, 'campus_moderators', m.id), m).catch(console.warn);
          });
        }
      }, err => console.warn('Firestore moderators sync error:', err));
      return () => unsub();
    }
  }, []);

  const saveUser = (u) => {
    setCurrentUser(u);
    if (u) {
      localStorage.setItem('campustrace_active_user', JSON.stringify(u));
    } else {
      localStorage.removeItem('campustrace_active_user');
    }
  };

  const updateApiKey = (key) => {
    setCustomApiKey(key);
    localStorage.setItem('campustrace_custom_gemini_key', key);
  };

  const awardPoints = (points, reason = '') => {
    if (!currentUser) return;
    const newPoints = (currentUser.heroPoints || 0) + points;
    const badges = [...(currentUser.badges || [])];

    if (newPoints >= 100 && !badges.includes('first_return')) {
      badges.push('first_return');
      CampusNotificationManager.addNotification({
        type: 'badge_unlocked',
        title: '🏆 Badge Unlocked: First Return Hero!',
        message: 'You completed your first verified campus item handover!'
      });
    }

    if ((currentUser.itemsReturned || 0) + 1 >= 3 && !badges.includes('honesty_guardian')) {
      badges.push('honesty_guardian');
      CampusNotificationManager.addNotification({
        type: 'badge_unlocked',
        title: '🛡️ Badge Unlocked: Honesty Guardian!',
        message: 'Returned 3 items safely back to campus students.'
      });
    }

    const updated = {
      ...currentUser,
      heroPoints: newPoints,
      badges
    };
    saveUser(updated);
  };

  // Login handler
  const login = ({ name, email, role = 'student', gender = 'male', password = '' }) => {
    const userObj = {
      uid: (role === 'admin' ? 'admin_' : role === 'moderator' ? 'mod_' : 'student_') + Date.now(),
      name,
      email,
      role, // 'student' | 'moderator' | 'admin'
      gender, // 'male' | 'female'
      avatarUrl: gender === 'female' 
        ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      heroPoints: role === 'student' ? 175 : 500,
      itemsReturned: 1,
      itemsReported: 2,
      badges: ['first_return', 'ai_eagle_eye']
    };
    saveUser(userObj);
    return userObj;
  };

  // Quick Auto-fill login helper
  const autoFillLogin = (roleType, genderChoice = 'male') => {
    if (roleType === 'admin') {
      return login({
        name: 'Chief Campus Administrator',
        email: 'admin.trace@campus.edu',
        role: 'admin',
        gender: 'male'
      });
    } else if (roleType === 'moderator') {
      return login({
        name: 'Campus Safety Officer Sharma',
        email: 'safety.mod@campus.edu',
        role: 'moderator',
        gender: 'male'
      });
    } else {
      // Student
      if (genderChoice === 'female') {
        return login({
          name: 'Ananya Sharma',
          email: 'ananya.s@campus.edu',
          role: 'student',
          gender: 'female'
        });
      } else {
        return login({
          name: 'Alex Rivera',
          email: 'alex.rivera@campus.edu',
          role: 'student',
          gender: 'male'
        });
      }
    }
  };

  const logout = () => {
    saveUser(null);
  };

  // Admin capabilities: Create / Remove moderators
  const addModerator = async (modData) => {
    const newMod = {
      id: 'mod_' + Date.now(),
      name: modData.name,
      email: modData.email,
      password: modData.password || 'modpass123',
      role: 'moderator',
      createdAt: new Date().toISOString()
    };

    const nextList = [...moderators, newMod];
    setModerators(nextList);
    localStorage.setItem('campustrace_moderators', JSON.stringify(nextList));

    if (isFirebaseLive() && db) {
      try {
        await setDoc(doc(db, 'campus_moderators', newMod.id), newMod);
      } catch (err) {
        console.warn('Firebase add moderator error:', err);
      }
    }
    return newMod;
  };

  const removeModerator = async (modId) => {
    const nextList = moderators.filter(m => m.id !== modId);
    setModerators(nextList);
    localStorage.setItem('campustrace_moderators', JSON.stringify(nextList));

    if (isFirebaseLive() && db) {
      try {
        await deleteDoc(doc(db, 'campus_moderators', modId));
      } catch (err) {
        console.warn('Firebase delete moderator error:', err);
      }
    }
  };

  const rankInfo = calculateRank(currentUser?.heroPoints || 0);

  return (
    <AuthContext.Provider value={{
      currentUser,
      guardMode,
      setGuardMode,
      rankInfo,
      awardPoints,
      saveUser,
      login,
      autoFillLogin,
      logout,
      moderators,
      addModerator,
      removeModerator,
      customApiKey,
      updateApiKey
    }}>
      {children}
    </AuthContext.Provider>
  );
};
