import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { examAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useExamCompletion } from '../hooks/useExamCompletion'


const ExamList = () => {
  const { user } = useAuth()
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { isExamCompleted, loading: completionLoading } = useExamCompletion(user?.id)

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const response = await examAPI.getActiveExams()
      console.log('Active exams:', response.data) // Debug log
      setExams(response.data)
    } catch (error) {
      console.error('Error fetching exams:', error)
      // Fallback to all exams if active exams fails
      try {
        const allExams = await examAPI.getAllExams()
        const activeExams = allExams.data.filter(exam => exam.status === 'ACTIVE')
        setExams(activeExams)
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading || completionLoading) {
    return (
      <div className="container">
        <p>Loading exams...</p>
      </div>
    )
  }

  return (
    <div className="container">
      <h1 className="mb-4">Available Exams</h1>
      
      {exams.length === 0 ? (
        <p style={{ color: '#666' }}>No exams available at the moment.</p>
      ) : (
        <div className="grid grid-3">
          {exams.map((exam) => {
            const completed = user?.role === 'STUDENT' && isExamCompleted(exam.id)
            return (
              <div key={exam.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ flexGrow: 1 }}>
                  <h3 className="mb-2">{exam.title}</h3>
                  <p style={{ color: '#666', marginBottom: '15px' }}>
                    {exam.description}
                  </p>
                  
                  <div className="mb-2">
                    <span className="chip chip-success">{exam.status}</span>
                    {completed && <span className="chip chip-secondary" style={{ marginLeft: 8 }}>Completed</span>}
                  </div>
                  
                  <p className="mb-2">
                    <strong>Duration:</strong> {exam.durationMinutes || exam.duration} minutes
                  </p>
                  <p className="mb-2">
                    <strong>Total Marks:</strong> {exam.totalMarks}
                  </p>
                  <p className="mb-4">
                    <strong>Passing Marks:</strong> {exam.passingMarks}
                  </p>
                </div>
                
                {user?.role === 'STUDENT' && (
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => navigate(`/exam/${exam.id}`)}
                    disabled={completed}
                  >
                    {completed ? 'Completed' : 'Start Exam'}
                  </button>
                )}
                {(user?.role === 'ADMIN' || user?.role === 'TEACHER') && (
                  <div style={{ textAlign: 'center', color: '#666', padding: '10px' }}>
                    View Only - Use Admin/Teacher Panel for Management
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ExamList