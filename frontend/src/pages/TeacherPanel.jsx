import React, { useState, useEffect } from 'react'
import { examAPI, questionAPI, resultAPI, userAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import VisualAnalytics from '../components/VisualAnalytics'
import axios from 'axios'

const TeacherPanel = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('analytics')
  const [exams, setExams] = useState([])
  const [questions, setQuestions] = useState([])
  const [results, setResults] = useState([])
  const [users, setUsers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    try {
      if (activeTab === 'exams') {
        const response = await examAPI.getAllExams()
        setExams(response.data)
      } else if (activeTab === 'questions') {
        // Get questions more efficiently
        try {
          const [examResponse, questionsResponse] = await Promise.all([
            examAPI.getAllExams(),
            questionAPI.getAllQuestions()
          ])
          
          const examMap = {}
          examResponse.data.forEach(exam => {
            examMap[exam.id] = { title: exam.title, createdBy: exam.createdBy }
          })
          
          const questionsWithExamInfo = questionsResponse.data.map(q => ({
            ...q,
            examTitle: examMap[q.examId]?.title || 'Unknown',
            examCreatedBy: examMap[q.examId]?.createdBy
          }))
          
          setQuestions(questionsWithExamInfo)
        } catch (error) {
          console.error('Error fetching questions:', error)
          setQuestions([])
        }
      } else if (activeTab === 'results') {
        // Get results data
        try {
          console.log('Fetching results data for teacher...')
          
          // First try to get exams
          const examsResponse = await examAPI.getAllExams()
          console.log('Exams fetched:', examsResponse.data)
          setExams(examsResponse.data || [])
          
          // Then try to get users - this might be the problematic call
          try {
            // Use a custom axios call to avoid the global interceptor
            const token = localStorage.getItem('token')
            const usersResponse = await axios.get('/api/users', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
            console.log('Users fetched:', usersResponse.data)
            setUsers(usersResponse.data || [])
          } catch (userError) {
            console.error('Error fetching users (this might be the issue):', userError)
            console.error('User error response:', userError.response?.data)
            console.error('User error status:', userError.response?.status)
            
            // If we can't get users, we can still show results without user names
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
        } catch (error) {
          console.error('Error fetching results:', error)
          console.error('Error response:', error.response?.data)
          console.error('Error status:', error.response?.status)
          setResults([])
          alert('Error loading results: ' + (error.response?.data?.message || error.message))
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleOpenModal = (type, item = null) => {
    setModalType(type)
    setSelectedItem(item)
    setFormData(item || {})
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedItem(null)
    setFormData({})
  }

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (modalType === 'exam') {
        const examData = {
          title: formData.title,
          description: formData.description,
          durationMinutes: parseInt(formData.duration),
          totalMarks: parseInt(formData.totalMarks),
          passingMarks: parseInt(formData.passingMarks),
          maxAttempts: 3,
          createdBy: user.id
        }
        
        if (selectedItem) {
          await examAPI.updateExam(selectedItem.id, examData)
        } else {
          await examAPI.createExam(examData)
        }
      } else if (modalType === 'question') {
        const optionsArray = [
          (formData.optionA || '').trim(),
          (formData.optionB || '').trim(),
          (formData.optionC || '').trim(),
          (formData.optionD || '').trim(),
        ].filter(option => option.length > 0) // Remove empty options
        
        const questionData = {
          questionText: formData.questionText,
          questionType: 'MULTIPLE_CHOICE',
          difficultyLevel: formData.difficultyLevel || 'EASY',
          marks: parseInt(formData.marks) || 10,
          examId: parseInt(formData.examId),
          createdBy: user.id,
          options: optionsArray,
          correctAnswer: formData.correctAnswer
        }
        
        if (selectedItem) {
          await questionAPI.updateQuestion(selectedItem.id, questionData)
        } else {
          await questionAPI.createQuestion(questionData)
        }
      }
      handleCloseModal()
      fetchData()
    } catch (error) {
      console.error('Error saving data:', error)
      alert('Error: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleDelete = async (type, id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        if (type === 'exam') {
          await examAPI.deleteExam(id)
        } else if (type === 'question') {
          await questionAPI.deleteQuestion(id)
        }
        fetchData()
      } catch (error) {
        console.error('Error deleting item:', error)
      }
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
    const passingMarks = exam?.passingMarks || 60
    const passingPercentage = exam?.totalMarks > 0 ? (passingMarks * 100) / exam.totalMarks : 60
    const isPassed = result.percentage >= passingPercentage
    
    return {
      isPassed,
      passingMarks,
      passingPercentage,
      exam
    }
  }

  const handlePublishExam = async (examId) => {
    try {
      await examAPI.publishExam(examId)
      alert('Exam published successfully!')
      fetchData()
    } catch (error) {
      console.error('Error publishing exam:', error)
      alert('Error publishing exam')
    }
  }

  const handleActivateExam = async (examId) => {
    try {
      await examAPI.activateExam(examId)
      alert('Exam activated! Students can now take this exam.')
      fetchData()
    } catch (error) {
      console.error('Error activating exam:', error)
      alert('Error activating exam')
    }
  }

  const QuestionManagement = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Questions</h2>
        <button
          className="btn btn-primary"
          onClick={() => handleOpenModal('question')}
        >
          + Add Question
        </button>
      </div>
      
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Question</th>
              <th>Exam</th>
              <th>Difficulty</th>
              <th>Marks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <tr key={question.id}>
                <td>{question.questionText.substring(0, 50)}...</td>
                <td>{question.examTitle}</td>
                <td>
                  <span className="chip chip-primary">{question.difficultyLevel}</span>
                </td>
                <td>{question.marks}</td>
                <td>
                  <button 
                    className="btn btn-secondary" 
                    style={{ marginRight: '5px' }}
                    onClick={() => handleOpenModal('question', question)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDelete('question', question.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const ResultsManagement = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Results Dashboard</h2>
        <p>View and analyze student performance across all exams.</p>
      </div>
      
      {users.length === 0 && results.length > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: '16px' }}>
          <strong>Note:</strong> User information could not be loaded. Results will show user IDs instead of names.
        </div>
      )}
      
      {results.length === 0 ? (
        <div className="card">
          <p>No results available yet.</p>
        </div>
      ) : (
        <div className="card">
          <div style={{ overflowX: 'auto', marginTop: '16px' }}>
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
                {results.map((result) => (
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
                        
                        console.log(`TeacherPanel Result ${result.id}:`, {
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
  )

  const ExamManagement = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>All Exams</h2>
        <button
          className="btn btn-primary"
          onClick={() => handleOpenModal('exam')}
        >
          + Create Exam
        </button>
      </div>
      
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Duration</th>
              <th>Total Marks</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => (
              <tr key={exam.id}>
                <td>{exam.title}</td>
                <td>{exam.description}</td>
                <td>{exam.durationMinutes || exam.duration} min</td>
                <td>{exam.totalMarks}</td>
                <td>
                  <span className="chip chip-primary">{exam.status}</span>
                </td>
                <td>
                  <button 
                    className="btn btn-secondary" 
                    style={{ marginRight: '5px' }}
                    onClick={() => handleOpenModal('exam', exam)}
                  >
                    Edit
                  </button>
                  {exam.status === 'DRAFT' && (
                    <button 
                      className="btn btn-success" 
                      style={{ marginRight: '5px' }}
                      onClick={() => handlePublishExam(exam.id)}
                    >
                      Publish
                    </button>
                  )}
                  {exam.status === 'PUBLISHED' && (
                    <button 
                      className="btn btn-primary" 
                      style={{ marginRight: '5px' }}
                      onClick={() => handleActivateExam(exam.id)}
                    >
                      Activate
                    </button>
                  )}
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDelete('exam', exam.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="container">
      <h1 className="mb-4">Teacher Panel</h1>
      
      <div className="mb-4">
        <button 
          className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ marginRight: '10px' }}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
        <button 
          className={`btn ${activeTab === 'exams' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ marginRight: '10px' }}
          onClick={() => setActiveTab('exams')}
        >
          All Exams
        </button>
        <button 
          className={`btn ${activeTab === 'questions' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ marginRight: '10px' }}
          onClick={() => setActiveTab('questions')}
        >
          Questions
        </button>
        <button 
          className={`btn ${activeTab === 'results' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('results')}
        >
          Results
        </button>
      </div>
      
      <div>
        {activeTab === 'analytics' && <VisualAnalytics />}
        {activeTab === 'exams' && <ExamManagement />}
        {activeTab === 'questions' && <QuestionManagement />}
        {activeTab === 'results' && <ResultsManagement />}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{selectedItem ? 'Edit' : 'Create'} {modalType === 'exam' ? 'Exam' : 'Question'}</h3>
            <form onSubmit={handleSubmit}>
              {modalType === 'question' && (
                <>
                  <div className="form-group">
                    <select
                      className="form-control"
                      name="examId"
                      value={formData.examId || ''}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">Select Exam</option>
                      {exams.map(exam => (
                        <option key={exam.id} value={exam.id}>{exam.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <textarea
                      className="form-control"
                      placeholder="Question Text"
                      name="questionText"
                      value={formData.questionText || ''}
                      onChange={handleFormChange}
                      rows={3}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      className="form-control"
                      placeholder="Options (comma separated)"
                      name="options"
                      value={formData.options || ''}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      className="form-control"
                      placeholder="Correct Answer"
                      name="correctAnswer"
                      value={formData.correctAnswer || ''}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <select
                      className="form-control"
                      name="difficultyLevel"
                      value={formData.difficultyLevel || 'EASY'}
                      onChange={handleFormChange}
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <input
                      className="form-control"
                      placeholder="Marks"
                      name="marks"
                      type="number"
                      value={formData.marks || 10}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </>
              )}
              {modalType === 'exam' && (
                <>
                  <div className="form-group">
                <input
                  className="form-control"
                  placeholder="Title"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <textarea
                  className="form-control"
                  placeholder="Description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleFormChange}
                  rows={3}
                />
              </div>
              <div className="form-group">
                <input
                  className="form-control"
                  placeholder="Duration (minutes)"
                  name="duration"
                  type="number"
                  value={formData.duration || ''}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  className="form-control"
                  placeholder="Total Marks"
                  name="totalMarks"
                  type="number"
                  value={formData.totalMarks || ''}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  className="form-control"
                  placeholder="Passing Marks"
                  name="passingMarks"
                  type="number"
                  value={formData.passingMarks || ''}
                  onChange={handleFormChange}
                  required
                />
                  </div>
                </>
              )}
              <div className="flex gap-2 mt-4">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {selectedItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherPanel