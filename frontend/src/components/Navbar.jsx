import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import NotificationBell from './NotificationBell'

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const { isDark, toggleTheme, colors } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Show navbar for all pages, but different content based on auth status
  const isHomePage = location.pathname === '/' || location.pathname === '/home'
  
  // Hide navbar completely on home page
  if (isHomePage) {
    return null
  }
  
  if (!isAuthenticated && !isHomePage) {
    return null
  }

  return (
    <nav className="navbar" style={{
      background: isHomePage ? 'transparent' : colors.surface,
      borderBottom: isHomePage ? 'none' : `1px solid ${colors.border}`,
      color: colors.text
    }}>
      <div className="navbar-content">
        <h2 
          style={{ color: colors.text, cursor: 'pointer' }}
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
        >
          Ace-X Exam Portal
        </h2>
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: colors.text
          }}
        >
          ☰
        </button>
        
        <div className={`navbar-nav ${isMenuOpen ? 'mobile-open' : ''}`}>
          {!isAuthenticated ? (
            // Unauthenticated navbar
            <>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); navigate('/login'); setIsMenuOpen(false) }}
                className="nav-link"
              >
                Login
              </a>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); navigate('/register'); setIsMenuOpen(false) }}
                className="nav-link"
              >
                Register
              </a>
              {!isHomePage && (
                <button 
                  onClick={toggleTheme}
                  className="theme-btn"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: colors.text,
                    fontSize: '1.2rem',
                    cursor: 'pointer'
                  }}
                >
                  {isDark ? '☀️' : '🌙'}
                </button>
              )}
            </>
          ) : (
            // Authenticated navbar
            <>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); navigate('/dashboard'); setIsMenuOpen(false) }}
            className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </a>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); navigate('/exams'); setIsMenuOpen(false) }}
            className={`nav-link ${location.pathname === '/exams' ? 'active' : ''}`}
          >
            Exams
          </a>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); navigate('/results'); setIsMenuOpen(false) }}
            className={`nav-link ${location.pathname === '/results' ? 'active' : ''}`}
          >
            Results
          </a>
          {user?.role === 'ADMIN' && (
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('/admin'); setIsMenuOpen(false) }}
              className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
            >
              Admin
            </a>
          )}
          {user?.role === 'TEACHER' && (
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('/teacher'); setIsMenuOpen(false) }}
              className={`nav-link ${location.pathname === '/teacher' ? 'active' : ''}`}
            >
              Teacher
            </a>
          )}

          {(user?.role === 'ADMIN' || user?.role === 'TEACHER') && (
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('/exam-manager'); setIsMenuOpen(false) }}
              className={`nav-link ${location.pathname === '/exam-manager' ? 'active' : ''}`}
            >
              Exam Manager
            </a>
          )}

          <NotificationBell />
          <button 
            onClick={toggleTheme}
            className="theme-btn"
            style={{
              background: 'none',
              border: 'none',
              color: colors.text,
              fontSize: '1.2rem',
              cursor: 'pointer'
            }}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <span className="user-welcome" style={{ color: colors.textSecondary }}>
            {user?.username}
          </span>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

// Add responsive navbar styles
const style = document.createElement('style')
style.textContent = `
  @media (max-width: 768px) {
    .mobile-menu-btn {
      display: block !important;
    }
    
    .navbar-nav {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--surface);
      border: 1px solid var(--border);
      border-top: none;
      flex-direction: column;
      padding: 10px;
      display: none;
      z-index: 1000;
    }
    
    .navbar-nav.mobile-open {
      display: flex;
    }
    
    .navbar-nav .nav-link {
      padding: 10px;
      border-bottom: 1px solid var(--border);
      width: 100%;
      text-align: center;
    }
    
    .navbar-nav .theme-btn {
      margin: 10px 0;
    }
    
    .navbar-nav .user-welcome {
      padding: 10px;
      text-align: center;
      font-size: 14px;
    }
    
    .navbar-nav .btn {
      margin: 10px 0;
      width: 100%;
    }
    
    .navbar {
      position: relative;
    }
  }
`
document.head.appendChild(style)

export default Navbar