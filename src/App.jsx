import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ItemsProvider } from './contexts/ItemsContext';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { UserProfileModal } from './components/UserProfileModal';
import { ReportModal } from './components/ReportModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Dashboard } from './pages/Dashboard';
import { ItemDetail } from './pages/ItemDetail';
import { LoginPage } from './pages/LoginPage';
import { ModeratorDashboard } from './pages/ModeratorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { CampusNotificationManager } from './utils/notifications';

function MainAppShell() {
  const { currentUser } = useAuth();

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const refresh = () => setNotifications(CampusNotificationManager.getNotifications());
    refresh();
    window.addEventListener('campustrace_notifs_changed', refresh);
    return () => window.removeEventListener('campustrace_notifs_changed', refresh);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleOpenNotif = () => {
    setShowNotifDrawer(prev => !prev);
    if (!showNotifDrawer) {
      CampusNotificationManager.markAllAsRead();
    }
  };

  // If user is not logged in, show Landing/Login page with project introduction
  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="app-shell has-mobile-nav">
      <Header 
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenReport={() => setReportModalOpen(true)}
        onOpenKeyModal={() => setApiKeyModalOpen(true)}
        showNotifDrawer={showNotifDrawer}
        setShowNotifDrawer={setShowNotifDrawer}
      />

      <main className="main-content">
        <Routes>
          <Route 
            path="/" 
            element={<Dashboard onOpenReport={() => setReportModalOpen(true)} />} 
          />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/moderator" element={<ModeratorDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav 
        onOpenReport={() => setReportModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenNotif={handleOpenNotif}
        unreadCount={unreadCount}
      />

      {/* Global Modals */}
      <UserProfileModal 
        isOpen={profileModalOpen} 
        onClose={() => setProfileModalOpen(false)} 
      />

      <ReportModal 
        isOpen={reportModalOpen} 
        onClose={() => setReportModalOpen(false)} 
      />

      <ApiKeyModal 
        isOpen={apiKeyModalOpen} 
        onClose={() => setApiKeyModalOpen(false)} 
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <ItemsProvider>
        <BrowserRouter>
          <MainAppShell />
        </BrowserRouter>
      </ItemsProvider>
    </AuthProvider>
  );
}

export default App;
