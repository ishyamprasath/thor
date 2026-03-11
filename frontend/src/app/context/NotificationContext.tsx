import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_URL } from '../config/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      
      // Fetch welcome details
      const welcomeResponse = await fetch(`${API_URL}/api/welcome`);
      const welcomeData = welcomeResponse.ok ? await welcomeResponse.json() : null;
      
      // Fetch safety pulse notifications
      const safetyResponse = await fetch(`${API_URL}/api/safety-pulse`);
      const safetyData = safetyResponse.ok ? await safetyResponse.json() : [];
      
      const fetchedNotifications: Notification[] = [];
      
      // Add welcome notification
      if (welcomeData) {
        fetchedNotifications.push({
          id: 'welcome',
          title: welcomeData.title || 'Welcome to THOR!',
          message: welcomeData.message || 'Start planning your next adventure with our AI-powered trip planner.',
          type: 'info',
          timestamp: new Date(welcomeData.timestamp || Date.now()),
          read: false,
          action: welcomeData.action ? {
            label: welcomeData.action.label || 'Explore',
            onClick: () => console.log('Welcome action clicked')
          } : undefined
        });
      }
      
      // Add safety pulse notifications
      if (Array.isArray(safetyData)) {
        safetyData.forEach((item: any, index: number) => {
          fetchedNotifications.push({
            id: `safety-${index}`,
            title: item.title || 'Safety Update',
            message: item.message || 'New safety information available.',
            type: item.severity === 'high' ? 'error' : item.severity === 'medium' ? 'warning' : 'info',
            timestamp: new Date(item.timestamp || Date.now()),
            read: false,
            action: item.action ? {
              label: item.action.label,
              onClick: () => console.log(`Safety action ${index} clicked`)
            } : undefined
          });
        });
      }
      
      // Fallback notifications if API fails
      if (fetchedNotifications.length === 0) {
        fetchedNotifications.push(
          {
            id: '1',
            title: 'Welcome to THOR!',
            message: 'Start planning your next adventure with our AI-powered trip planner.',
            type: 'info',
            timestamp: new Date(Date.now() - 1000 * 60 * 5),
            read: false,
            action: {
              label: 'Explore',
              onClick: () => console.log('Explore clicked')
            }
          },
          {
            id: '2',
            title: 'Safety Pulse',
            message: 'Current safety conditions are optimal for travel in your area.',
            type: 'success',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            read: false
          }
        );
      }
      
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      
      // Set fallback notifications on error
      setNotifications([
        {
          id: '1',
          title: 'Welcome to THOR!',
          message: 'Start planning your next adventure with our AI-powered trip planner.',
          type: 'info',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          read: false,
          action: {
            label: 'Explore',
            onClick: () => console.log('Explore clicked')
          }
        },
        {
          id: '2',
          title: 'Safety Pulse',
          message: 'Current safety conditions are optimal for travel in your area.',
          type: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          read: false
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Refresh notifications every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const refreshNotifications = () => {
    fetchNotifications();
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      isLoading,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll,
      refreshNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
