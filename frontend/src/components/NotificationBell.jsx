import React, { useState, useEffect, useRef } from 'react'
import { useNotifications } from '../context/NotificationContext'
import { useTheme } from '../context/ThemeContext'

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, fetchNotifications } = useNotifications()
  const { colors } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          padding: '8px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <span style={{ fontSize: '20px' }}>🔔</span>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '0',
            right: '0',
            background: 'var(--danger)',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          width: '320px',
          maxHeight: '400px',
          background: colors.surface,
          border: '1px solid var(--border)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px',
            borderBottom: '1px solid var(--border)',
            fontWeight: '600',
            color: colors.text,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Notifications ({unreadCount} unread)</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                fetchNotifications()
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '4px'
              }}
              title="Refresh notifications"
            >
              🔄
            </button>
          </div>
          
          <div style={{
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: '24px',
                textAlign: 'center',
                color: colors.textMuted
              }}>
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: notification.isRead ? 'transparent' : 'rgba(var(--primary-rgb), 0.05)',
                    ':hover': {
                      background: 'rgba(var(--primary-rgb), 0.1)'
                    }
                  }}
                >
                  <div style={{
                    fontWeight: notification.isRead ? 'normal' : '600',
                    color: colors.text,
                    fontSize: '14px',
                    marginBottom: '4px'
                  }}>
                    {notification.title}
                  </div>
                  <div style={{
                    color: colors.textMuted,
                    fontSize: '13px',
                    marginBottom: '4px'
                  }}>
                    {notification.message}
                  </div>
                  <div style={{
                    color: colors.textMuted,
                    fontSize: '12px'
                  }}>
                    {formatTime(notification.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell