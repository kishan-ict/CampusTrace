// ============================================================
// Constants matching the native final Kotlin models
// ============================================================

export const CATEGORIES = [
  'ID Cards',
  'Electronics',
  'Keys',
  'Bottles',
  'Documents/Bags',
  'Other'
];

export const LOCATIONS = [
  'Library',
  'Central Canteen',
  'Room MB011',
  'Seminar Hall',
  'Hostel Block',
  'Sports Complex'
];

export const BADGES = [
  {
    id: 'first_return',
    name: 'First Return Hero',
    icon: '🏆',
    description: 'Awarded on the first verified item handover.',
    requirement: '1 Handover'
  },
  {
    id: 'honesty_guardian',
    name: 'Honesty Guardian',
    icon: '🛡️',
    description: 'Awarded for returning 3 lost items to students.',
    requirement: '3 Returns'
  },
  {
    id: 'campus_legend',
    name: 'Campus Legend',
    icon: '🌟',
    description: 'Awarded for achieving 5+ verified item handovers.',
    requirement: '5+ Returns'
  },
  {
    id: 'security_desk_ally',
    name: 'Security Desk Ally',
    icon: '🚨',
    description: 'Awarded for logging or reporting an item with Campus Security.',
    requirement: 'Security Log'
  },
  {
    id: 'ai_eagle_eye',
    name: 'AI Eagle Eye',
    icon: '🦅',
    description: 'Awarded for using Gemini AI Auto-Tagging on report.',
    requirement: 'Gemini AI Used'
  }
];

export const calculateRank = (points) => {
  if (points >= 500) {
    return { title: 'Campus Hero', icon: '🏆', nextRank: 'Max Rank', target: 500, current: points, progress: 100 };
  } else if (points >= 300) {
    return { title: 'Campus Guardian', icon: '🛡️', nextRank: 'Campus Hero (500 pts)', target: 500, current: points, progress: Math.min(100, Math.round(((points - 300) / 200) * 100)) };
  } else if (points >= 100) {
    return { title: 'Campus Helper', icon: '🌟', nextRank: 'Campus Guardian (300 pts)', target: 300, current: points, progress: Math.min(100, Math.round(((points - 100) / 200) * 100)) };
  } else {
    return { title: 'Campus Rookie', icon: '🎓', nextRank: 'Campus Helper (100 pts)', target: 100, current: points, progress: Math.min(100, Math.round((points / 100) * 100)) };
  }
};

export const INITIAL_ITEMS = [
  {
    id: 'seed_1',
    title: 'Marwadi University Student ID Card',
    category: 'ID Cards',
    type: 'found',
    location: 'Room MB011',
    dateOccurred: 'Today, 10:15 AM',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    description: 'Found an ICT department student ID card on table 3 in MB011. Blue lanyard attached.',
    tags: ['id-card', 'blue-lanyard', 'ict', 'marwadi', 'mb011'],
    status: 'open', // 'open' | 'verification_pending' | 'returned'
    secretQuestion: 'What is the roll number ending 3 digits?',
    secretAnswer: '492',
    reporterId: 'demo_guard',
    reporterName: 'Security Guard Desk',
    reportedByGuard: true,
    aiTagged: true,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'seed_2',
    title: 'Boat Airdopes 141 (Black Case)',
    category: 'Electronics',
    type: 'lost',
    location: 'Library',
    dateOccurred: 'Yesterday, 4:30 PM',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
    description: 'Left my black Boat Airdopes case near the 2nd floor silent reading room desks. Has a Type-C cable inside.',
    tags: ['earbuds', 'black', 'type-c', 'boat', 'library'],
    status: 'open',
    reporterId: 'user_alex',
    reporterName: 'Alex Rivera',
    reportedByGuard: false,
    aiTagged: true,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 'seed_3',
    title: 'Milton Thermosteel Water Bottle (1000ml)',
    category: 'Bottles',
    type: 'found',
    location: 'Central Canteen',
    dateOccurred: 'Today, 1:45 PM',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
    description: 'Silver stainless steel insulated bottle left near juice counter in Central Canteen.',
    tags: ['milton', 'bottle', 'silver', 'canteen', 'insulated'],
    status: 'open',
    secretQuestion: 'What specific sticker is pasted on the back of the bottle?',
    secretAnswer: 'Naruto',
    reporterId: 'user_sarah',
    reporterName: 'Sarah Jenkins',
    reportedByGuard: false,
    aiTagged: false,
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
  },
  {
    id: 'seed_4',
    title: 'Honda Bike Keys with Leather FOB',
    category: 'Keys',
    type: 'lost',
    location: 'Hostel Block',
    dateOccurred: 'Yesterday, 9:00 PM',
    imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
    description: 'Set of two bike keys with brown leather keychain lost between Hostel 3 mess and motorcycle parking.',
    tags: ['keys', 'bike', 'honda', 'leather', 'hostel'],
    status: 'open',
    reporterId: 'user_alex',
    reporterName: 'Alex Rivera',
    reportedByGuard: false,
    aiTagged: true,
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: 'seed_5',
    title: 'B.Tech OS Notes Spiral Binder',
    category: 'Documents/Bags',
    type: 'found',
    location: 'Seminar Hall',
    dateOccurred: '2 days ago',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    description: 'Green spiral handwritten notebook of Operating Systems lectures found in the auditorium 2nd row.',
    tags: ['notes', 'os', 'btech', 'spiral', 'handwritten'],
    status: 'open',
    secretQuestion: 'What is written with sketch pen on the front cover?',
    secretAnswer: 'OS Unit 3',
    reporterId: 'demo_guard',
    reporterName: 'Security Guard Desk',
    reportedByGuard: true,
    aiTagged: false,
    createdAt: new Date(Date.now() - 3600000 * 40).toISOString()
  },
  {
    id: 'seed_6',
    title: 'Dell Pro 15.6 Laptop Backpack',
    category: 'Documents/Bags',
    type: 'lost',
    location: 'Sports Complex',
    dateOccurred: '3 days ago',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    description: 'Dark grey Dell backpack with blue zipper accent lost near the badminton spectator benches.',
    tags: ['backpack', 'dell', 'laptop', 'grey', 'sports'],
    status: 'open',
    reporterId: 'user_priya',
    reporterName: 'Priya Sharma',
    reportedByGuard: false,
    aiTagged: true,
    createdAt: new Date(Date.now() - 3600000 * 60).toISOString()
  }
];

