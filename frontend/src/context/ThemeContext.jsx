import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : false
  })

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggleTheme = () => setIsDark(!isDark)

  const theme = {
    isDark,
    toggleTheme,
    colors: isDark ? {
      // Dark theme colors
      primary: '#0d6efd',
      success: '#198754',
      warning: '#fd7e14',
      danger: '#dc3545',
      background: '#1a1a1a',
      surface: '#2d2d2d',
      text: '#ffffff',
      textMuted: '#adb5bd',
      border: '#495057',
      shadow: 'rgba(0,0,0,0.3)',
      gradient: 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)'
    } : {
      // Light theme colors - minimal
      primary: '#007bff',
      success: '#28a745',
      warning: '#ffc107',
      danger: '#dc3545',
      background: '#f8f9fa',
      surface: '#ffffff',
      text: '#212529',
      textMuted: '#6c757d',
      border: '#dee2e6',
      shadow: 'rgba(0,0,0,0.1)'
    }
  }

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}