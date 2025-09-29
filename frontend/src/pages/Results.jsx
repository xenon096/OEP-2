import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { resultAPI, examAPI, userAPI } from '../services/api'
import axios from 'axios'

const Results = () => {
  const { user } = useAuth()
  const [results, setResults] = useState([])
  const [exams, setExams] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedExam, setSelectedExam] = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')

  useEffect(() => {
    fetchData()
  }, [user])



  const fetchData = async () => {
    try {
      if (user?.role === 'STUDENT') {
        console.log('Fetching results for user:', user.id)
        const resultsResponse = await resultAPI.getResultsByUser(user.id)
        console.log('Results response:', resultsResponse.data)
        setResults(resultsResponse.data || [])
        
        // Fetch exams data for student to get proper passing marks
        const examsResponse = await examAPI.getAllExams()
        setExams(examsResponse.data || [])
        
        console.log('Student results with scores:', (resultsResponse.data || []).map(r => ({ 
          id: r.id, 
          score: r.score, 
          totalMarks: r.totalMarks, 
          percentage: r.percentage 
        })))
      } else {
        // Admin/Teacher - get all results
        console.log('Fetching results for admin/teacher...')
        
        const examsResponse = await examAPI.getAllExams()
        setExams(examsResponse.data || [])
        
        // Try to get users with custom axios call to avoid global interceptor
        try {
          const token = localStorage.getItem('token')
          const usersResponse = await axios.get('/api/users', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          console.log('Users fetched successfully:', usersResponse.data)
          setUsers(usersResponse.data || [])
        } catch (userError) {
          console.error('Error fetching users:', userError)
          console.error('User error response:', userError.response?.data)
          console.error('User error status:', userError.response?.status)
          setUsers([])
          console.log('Continuing without user data...')
        }
        
        // Get results for all exams
        const allResults = []
        for (const exam of (examsResponse.data || [])) {
          try {
            const examResults = await resultAPI.getResultsByExam(exam.id)
            allResults.push(...(examResults.data || []))
          } catch (error) {
            console.error(`Error fetching results for exam ${exam.id}:`, error)
          }
        }
        setResults(allResults)
        console.log('All results fetched:', allResults)
        console.log('Results with scores:', allResults.map(r => ({ 
          id: r.id, 
          score: r.score, 
          totalMarks: r.totalMarks, 
          percentage: r.percentage 
        })))
      }
    } catch (error) {
      console.error('Error fetching results:', error)
      console.error('Error details:', error.response?.data)
      // Set empty array on error
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const getExamTitle = (examId) => {
    const exam = exams.find(e => e.id === examId)
    return exam ? exam.title : `Exam ${examId}`
  }

  const getUserName = (userId) => {
    if (!users || users.length === 0) {
      return `User ${userId}`
    }
    const userData = users.find(u => u.id === userId)
    return userData ? userData.username : `User ${userId}`
  }

  const calculatePassingStatus = (result) => {
    const exam = exams.find(e => e.id === result.examId)
    const passingMarks = exam?.passingMarks || Math.ceil((result.totalMarks || 0) * 0.5)
    const isPassed = result.score >= passingMarks
    
    console.log(`Passing calculation for result ${result.id}:`, {
      examId: result.examId,
      examTitle: exam?.title,
      score: result.score,
      totalMarks: result.totalMarks,
      passingMarks: passingMarks,
      isPassed: isPassed
    })
    
    return {
      isPassed,
      passingMarks,
      exam
    }
  }

  const getFilteredResults = () => {
    let filtered = results
    
    if (selectedExam) {
      filtered = filtered.filter(result => result.examId.toString() === selectedExam)
    }
    
    if (selectedStudent) {
      filtered = filtered.filter(result => result.userId.toString() === selectedStudent)
    }
    
    return filtered
  }

  if (loading) {
    return <div className="container"><p>Loading results...</p></div>
  }

  return (
    <div className="container">
      <h1 className="mb-4">
        {user?.role === 'STUDENT' ? 'My Results' : 'Results Dashboard'}
      </h1>

      {user?.role === 'STUDENT' ? (
        // Student View
        <div>
          {results.length === 0 ? (
            <p>No results available yet.</p>
          ) : (
            <div className="grid grid-2">
              {results.map((result) => (
                <div key={result.id} className="card mobile-full">
                  <h3>{getExamTitle(result.examId)}</h3>
                  <div style={{ marginTop: '16px' }}>
                    <p><strong>Score:</strong> {result.score}/{result.totalMarks}</p>
                    <p><strong>Percentage:</strong> {result.percentage?.toFixed(1)}%</p>
                    <p><strong>Status:</strong> 
                      {(() => {
                        const { isPassed } = calculatePassingStatus(result)
                        
                        return (
                          <span style={{ 
                            color: isPassed ? 'var(--success)' : 'var(--danger)',
                            fontWeight: '500',
                            marginLeft: '8px'
                          }}>
                            {isPassed ? 'PASSED' : 'FAILED'}
                          </span>
                        )
                      })()}
                    </p>
                    <p><strong>Submitted:</strong> {new Date(result.submittedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Admin/Teacher View
        <div>
          <div className="flex gap-4 mb-4">
            <div className="form-group" style={{ minWidth: '200px' }}>
              <label>Filter by Exam:</label>
              <select 
                value={selectedExam} 
                onChange={(e) => setSelectedExam(e.target.value)}
                className="form-control"
              >
                <option value="">All Exams</option>
                {exams.map(exam => (
                  <option key={exam.id} value={exam.id}>{exam.title}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group" style={{ minWidth: '200px' }}>
              <label>Filter by Student:</label>
              <select 
                value={selectedStudent} 
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="form-control"
              >
                <option value="">All Students</option>
                {users.filter(user => user.role === 'STUDENT').map(user => (
                  <option key={user.id} value={user.id}>{user.username}</option>
                ))}
              </select>
            </div>
          </div>
          
          {users.length === 0 && results.length > 0 && (
            <div className="alert alert-warning" style={{ marginBottom: '16px' }}>
              <strong>Note:</strong> User information could not be loaded. Results will show user IDs instead of names.
            </div>
          )}
          
          {getFilteredResults().length === 0 ? (
            <p>{results.length === 0 ? 'No results available yet.' : 'No results match the selected filters.'}</p>
          ) : (
            <div className="card">
              <h3>Results ({getFilteredResults().length})</h3>
              <div className="responsive-table" style={{ marginTop: '16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Student</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Exam</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Score</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Percentage</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredResults().map((result) => (
                      <tr key={result.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px' }}>{getUserName(result.userId)}</td>
                        <td style={{ padding: '12px' }}>{getExamTitle(result.examId)}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {result.score}/{result.totalMarks}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {result.percentage?.toFixed(1)}%
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {(() => {
                            const { isPassed, passingMarks, passingPercentage, exam } = calculatePassingStatus(result)
                            
                            console.log(`Result ${result.id}:`, {
                              examId: result.examId,
                              examTitle: exam?.title,
                              score: result.score,
                              totalMarks: result.totalMarks,
                              percentage: result.percentage,
                              passingMarks: passingMarks,
                              examTotalMarks: exam?.totalMarks,
                              passingPercentage: passingPercentage,
                              isPassed: isPassed
                            })
                            
                            return (
                              <span style={{ 
                                color: isPassed ? 'var(--success)' : 'var(--danger)',
                                fontWeight: '500'
                              }}>
                                {isPassed ? 'PASSED' : 'FAILED'}
                              </span>
                            )
                          })()}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {new Date(result.submittedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Results