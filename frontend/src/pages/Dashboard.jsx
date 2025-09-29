import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNotifications } from '../context/NotificationContext'

import { examAPI, userAPI, resultAPI } from '../services/api'
import { useExamCompletion } from '../hooks/useExamCompletion'

const Dashboard = () => {
  const { user } = useAuth()
  const { colors } = useTheme()
  const { notifications } = useNotifications()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    activeExams: 0,
    upcomingExams: 0,
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalQuestions: 0,
    myResults: 0
  })
  const [recentExams, setRecentExams] = useState([])
  const { isExamCompleted, loading: completionLoading } = useExamCompletion(user?.id)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const activeExams = await examAPI.getActiveExams()
      let userStats = { totalUsers: 0, totalStudents: 0, totalTeachers: 0 }
      let completedCount = 0

      if (user?.role === 'ADMIN') {
        const users = await userAPI.getAllUsers()
        const students = users.data.filter(u => u.role === 'STUDENT')
        const teachers = users.data.filter(u => u.role === 'TEACHER')
        userStats = {
          totalUsers: students.length + teachers.length,
          totalStudents: students.length,
          totalTeachers: teachers.length
        }
      } else if (user?.role === 'STUDENT') {
        try {
          const resultsResp = await resultAPI.getResultsByUser(user.id)
          completedCount = Array.isArray(resultsResp.data) ? resultsResp.data.length : 0
          userStats = { ...userStats, myResults: completedCount }
        } catch (e) {
          console.warn('Could not fetch student results for dashboard:', e?.message)
        }
      }
      
      setStats(prev => ({
        ...prev,
        activeExams: activeExams.data.length,
        upcomingExams: completedCount, // reused as Completed for students
        ...userStats
      }))
      setRecentExams(activeExams.data.slice(0, 3))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const StatCard = ({ title, value, color }) => (
    <div className="card" style={{ 
      textAlign: 'center',
      padding: '24px 16px'
    }}>
      <h3 style={{ 
        color: color, 
        fontSize: '28px', 
        fontWeight: '600', 
        margin: '0 0 8px 0' 
      }}>{value}</h3>
      <p style={{ 
        color: colors.textMuted, 
        fontSize: '14px', 
        margin: 0,
        fontWeight: '500'
      }}>{title}</p>
    </div>
  )

  if (completionLoading && user?.role === 'STUDENT') {
    return (
      <div className="container">
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="container">
      <div style={{
        marginBottom: '24px'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          color: colors.text,
          margin: '0 0 8px 0'
        }}>Welcome back, {user?.username}</h1>
        <p style={{ 
          color: colors.textMuted, 
          fontSize: '16px', 
          margin: 0 
        }}>Dashboard</p>
      </div>
      
      <div className="grid grid-4 mb-4">
        <StatCard 
          title="Active Exams" 
          value={stats.activeExams} 
          color="var(--primary)" 
        />
        {user?.role === 'ADMIN' ? (
          <>
            <StatCard 
              title="Total Users" 
              value={stats.totalUsers} 
              color="var(--success)" 
            />
            <StatCard 
              title="Students" 
              value={stats.totalStudents} 
              color="var(--warning)" 
            />
            <StatCard 
              title="Teachers" 
              value={stats.totalTeachers} 
              color="var(--danger)" 
            />
          </>
        ) : (
          <>
            <StatCard 
              title="Completed" 
              value={stats.upcomingExams} 
              color="var(--success)" 
            />
            <StatCard 
              title="Total Questions" 
              value={stats.totalQuestions || 0} 
              color="var(--warning)" 
            />
            <StatCard 
              title="Results" 
              value={stats.myResults || 0} 
              color="var(--danger)" 
            />
          </>
        )}
      </div>

      <div className="grid grid-3">
        <div className="mobile-full" style={{ gridColumn: 'span 2' }}>
          <div className="card">
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: colors.text,
              marginBottom: '16px'
            }}>Recent Exams</h3>
            {recentExams.length > 0 ? (
              recentExams.map((exam) => {
                const completed = user?.role === 'STUDENT' && isExamCompleted(exam.id)
                return (
                  <div key={exam.id} style={{ 
                    padding: '16px',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    marginBottom: '12px',
                    background: colors.surface
                  }}>
                    <h4 style={{ 
                      fontSize: '16px',
                      fontWeight: '600',
                      color: colors.text, 
                      marginBottom: '8px' 
                    }}>{exam.title}</h4>
                    <p style={{ 
                      color: colors.textMuted, 
                      fontSize: '14px',
                      marginBottom: '12px' 
                    }}>
                      {exam.durationMinutes || exam.duration} minutes • {exam.totalMarks} marks
                    </p>
                    {user?.role === 'STUDENT' && (
                      <button 
                        className="btn btn-primary"
                        onClick={() => navigate(`/exam/${exam.id}`)}
                        style={{
                          fontSize: '14px',
                          padding: '8px 16px'
                        }}
                        disabled={completed}
                      >
                        {completed ? 'Completed' : 'Start Exam'}
                      </button>
                    )}
                  </div>
                )
              })
            ) : (
              <p style={{ color: '#666' }}>No active exams available</p>
            )}
          </div>
        </div>
        
        <div className="mobile-full">
          {user?.role === 'STUDENT' ? (
            <div className="card">
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: colors.text,
                marginBottom: '16px'
              }}>Recent Notifications</h3>
              {notifications.length === 0 ? (
                <p style={{ color: colors.textMuted, fontSize: '14px' }}>No notifications yet</p>
              ) : (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} style={{
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      marginBottom: '8px',
                      background: notification.isRead ? 'transparent' : 'rgba(var(--primary-rgb), 0.05)'
                    }}>
                      <div style={{
                        fontWeight: notification.isRead ? 'normal' : '600',
                        fontSize: '14px',
                        color: colors.text,
                        marginBottom: '4px'
                      }}>
                        {notification.title}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: colors.textMuted
                      }}>
                        {notification.message}
                      </div>
                    </div>
                  ))}
                  {notifications.length > 3 && (
                    <p style={{ 
                      fontSize: '12px', 
                      color: colors.textMuted, 
                      textAlign: 'center',
                      marginTop: '8px'
                    }}>
                      Click the bell icon to see all notifications
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="card">
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: colors.text,
                marginBottom: '16px'
              }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    marginBottom: '12px',
                    fontSize: '14px'
                  }}
                  onClick={() => navigate('/exams')}
                >
                  View All Exams
                </button>
                {user?.role === 'ADMIN' && (
                  <button 
                    className="btn btn-secondary"
                    style={{
                      width: '100%',
                      marginBottom: '12px',
                      fontSize: '14px'
                    }}
                    onClick={() => navigate('/admin')}
                  >
                    Admin Panel
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard