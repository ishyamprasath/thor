import { useState, useRef, useEffect } from 'react';
import { Bell, Check, X, Trash2, Info, CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { useNotifications, Notification } from '../context/NotificationContext';
import './NotificationDropdown.css';

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
    default: return <Info className="w-4 h-4 text-blue-500" />;
  }
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export default function NotificationDropdown() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, removeNotification, clearAll, refreshNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 480);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.action) {
      notification.action.onClick();
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleRefresh = () => {
    refreshNotifications();
  };

  const handleClearAll = () => {
    clearAll();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-all hover:bg-zinc-800"
        style={{ color: "var(--thor-text-secondary)" }}
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <div className="notification-title">
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <span className="unread-count">{unreadCount}</span>
              )}
            </div>
            <div className="notification-actions">
              <button onClick={handleRefresh} className="action-btn" title="Refresh">
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllAsRead} className="action-btn" title="Mark all as read">
                  <Check className="w-4 h-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={handleClearAll} className="action-btn" title="Clear all">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="notification-list">
            {isLoading ? (
              <div className="empty-state">
                <RefreshCw className="w-8 h-8 opacity-50 animate-spin" />
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="empty-state">
                <Bell className="w-8 h-8 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-header-row">
                      <h4 className="notification-title-text">{notification.title}</h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        className="remove-btn"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="notification-message">{notification.message}</p>
                    <div className="notification-footer">
                      <span className="timestamp">{formatTimeAgo(notification.timestamp)}</span>
                      {notification.action && (
                        <button className="action-link">{notification.action.label}</button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
