// ============================================================
// Campus Notification Manager (Feature 11)
// System & In-App Alerts with Audio & Vibration
// ============================================================

export class CampusNotificationManager {
  static STORAGE_KEY = 'campustrace_notifications';

  static getNotifications() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveNotifications(items) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(new CustomEvent('campustrace_notifs_changed'));
    } catch (e) {
      console.error(e);
    }
  }

  static addNotification({ type, title, message, itemId }) {
    const list = this.getNotifications();
    const newNotif = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      type, // 'match_radar' | 'claim_received' | 'claim_status' | 'badge_unlocked' | 'guard_log'
      title,
      message,
      itemId,
      read: false,
      timestamp: new Date().toISOString()
    };
    list.unshift(newNotif);
    this.saveNotifications(list);

    // Vibration on mobile devices
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([120, 80, 120]);
      } catch {
        // ignore
      }
    }

    return newNotif;
  }

  static markAllAsRead() {
    const list = this.getNotifications().map(n => ({ ...n, read: true }));
    this.saveNotifications(list);
  }

  static clearAll() {
    this.saveNotifications([]);
  }
}

