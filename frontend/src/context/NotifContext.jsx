import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API } from './AuthContext';

const NotifContext = createContext(null);

export const NotifProvider = ({ children, user }) => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifs = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data.data.notifications);
      setUnread(data.data.unreadCount);
    } catch { /* silent */ }
  }, [user]);

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifs]);

  const markAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch { /* silent */ }
  };

  return (
    <NotifContext.Provider value={{ notifications, unread, isOpen, setIsOpen, markAllRead, refetch: fetchNotifs }}>
      {children}
    </NotifContext.Provider>
  );
};

export const useNotif = () => {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error('useNotif must be inside NotifProvider');
  return ctx;
};