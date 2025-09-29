import React, { createContext, useContext, useState, useEffect } from 'react'
import { notificationAPI } from '../services/api'
import { useAuth } from './AuthContext'

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = async () => {
    if (!user?.id) return
    
    try {
      console.log('🔔 Fetching notifications for user:', user.id, 'Role:', user.role)
      const response = await notificationAPI.getNotificationsByUser(user.id)
      console.log('🔔 Received notifications:', response.data.length)
      setNotifications(response.data)
      
      const unreadResponse = await notificationAPI.getUnreadNotificationsByUser(user.id)
      console.log('🔔 Unread notifications:', unreadResponse.data.length)
      setUnreadCount(unreadResponse.data.length)
    } catch (error) {
      console.error('❌ Error fetching notifications:', error)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId)
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchNotifications()
      // Poll for new notifications every 10 seconds for better responsiveness
      const interval = setInterval(fetchNotifications, 10000)
      return () => clearInterval(interval)
    }
  }, [user?.id])

  const value = {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}