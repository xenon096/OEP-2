import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { NotificationProvider } from './context/NotificationContext'

import HomePage from './pages/HomePage.jsx'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ExamList from './pages/ExamList'
import ExamTaking from './pages/ExamTaking'

import AdminPanel from './pages/AdminPanel'
import TeacherPanel from './pages/TeacherPanel'
import ExamQuestionManager from './pages/ExamQuestionManager'
import Results from './pages/Results'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'


function App() {
  const { loading } = useAuth()

  if (loading) {
    return <div className="container text-center mt-4">Loading...</div>
  }

  return (
    <ThemeProvider>
        <NotificationProvider>
          <Router>
          <Navbar />
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/exams" element={
          <ProtectedRoute>
            <ExamList />
          </ProtectedRoute>
        } />
        <Route path="/exam/:examId" element={
          <ProtectedRoute roles={['STUDENT']}>
            <ExamTaking />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminPanel />
          </ProtectedRoute>
        } />
        <Route path="/teacher" element={
          <ProtectedRoute roles={['TEACHER']}>
            <TeacherPanel />
          </ProtectedRoute>
        } />

        <Route path="/results" element={
          <ProtectedRoute>
            <Results />
          </ProtectedRoute>
        } />
        <Route path="/exam-manager" element={
          <ProtectedRoute roles={['ADMIN', 'TEACHER']}>
            <ExamQuestionManager />
          </ProtectedRoute>
        } />

          </Routes>
        </Router>
      </NotificationProvider>
  </ThemeProvider>
  )
}

export default App