import React, { useState, useEffect } from 'react'
import { examAPI, questionAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

import { useNotifications } from '../context/NotificationContext'

const ExamQuestionManager = () => {
  const { user } = useAuth()

  const { fetchNotifications } = useNotifications()
  const [exams, setExams] = useState([])
  const [selectedExam, setSelectedExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [showQuestions, setShowQuestions] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(true)
  const [csvFile, setCsvFile] = useState(null)
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const response = await examAPI.getAllExams()
      setExams(response.data)
      if (selectedExam) {
        const updated = response.data.find(ex => ex.id === selectedExam.id)
        if (updated) setSelectedExam(updated)
      }
    } catch (error) {
      console.error('Error fetching exams:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuestions = async (examId) => {
    try {
      const response = await questionAPI.getQuestionsByExam(examId)
      setQuestions(response.data)
      setShowQuestions(true)
      
      // Update exam with calculated total marks
      const totalMarks = response.data.reduce((sum, q) => sum + (q.marks || 0), 0)
      if (selectedExam && selectedExam.totalMarks !== totalMarks) {
        setSelectedExam(prev => ({ ...prev, totalMarks }))
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
      setQuestions([])
    }
  }

  const handleExamSelect = (exam) => {
    setSelectedExam(exam)
    fetchQuestions(exam.id)
  }

  const handleOpenModal = (type, item = null) => {
    setModalType(type)
    setSelectedItem(item)
    if (type === 'question' && !item) {
      setFormData({ 
        examId: selectedExam?.id,
        difficultyLevel: 'EASY',
        marks: 1
      })
    } else if (type === 'question' && item) {
      const raw = item.options
      const optionsArr = Array.isArray(raw)
        ? raw
        : (typeof raw === 'string' && raw.length > 0 ? raw.split(',') : ['', '', '', ''])
      // Map existing correctAnswer to letter if it equals an option text
      const trimmedOptions = optionsArr.map(o => (o || '').trim())
      let correct = item.correctAnswer
      const indexAsLetter = (idx) => ['A','B','C','D'][idx] || 'A'
      const foundIdx = trimmedOptions.findIndex(o => o === (correct || '').trim())
      if (foundIdx >= 0) {
        correct = indexAsLetter(foundIdx)
      }
      setFormData({
        ...item,
        optionA: (trimmedOptions[0] || ''),
        optionB: (trimmedOptions[1] || ''),
        optionC: (trimmedOptions[2] || ''),
        optionD: (trimmedOptions[3] || ''),
        correctAnswer: correct || 'A'
      })
    } else {
      setFormData(item || {})
    }
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
          totalMarks: 1, // Temporary value, will be auto-calculated when questions are added
          maxAttempts: 3,
          createdBy: user.id
        }
        
        if (selectedItem) {
          await examAPI.updateExam(selectedItem.id, examData)
        } else {
          await examAPI.createExam(examData)
        }
        fetchExams()
      } else if (modalType === 'question') {
        const optionsArray = [
          (formData.optionA || '').trim(),
          (formData.optionB || '').trim(),
          (formData.optionC || '').trim(),
          (formData.optionD || '').trim(),
        ].filter(option => option.length > 0) // Remove empty options
        
        const difficulty = formData.difficultyLevel || 'EASY';
        const defaultMarks = difficulty === 'EASY' ? 1 : difficulty === 'MEDIUM' ? 2 : 5;
        
        const questionData = {
          questionText: formData.questionText,
          questionType: 'MULTIPLE_CHOICE',
          difficultyLevel: difficulty,
          marks: parseInt(formData.marks) || defaultMarks,
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
        fetchQuestions(selectedExam.id)
      }
      handleCloseModal()
    } catch (error) {
      console.error('Error saving data:', error)
      console.error('Error details:', error.response?.data)
      alert('Error: ' + (error.response?.data?.message || error.response?.data || error.message))
    }
  }

  const handleDelete = async (type, id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        if (type === 'exam') {
          await examAPI.deleteExam(id)
          fetchExams()
          if (selectedExam?.id === id) {
            setSelectedExam(null)
            setShowQuestions(false)
          }
        } else if (type === 'question') {
          await questionAPI.deleteQuestion(id)
          fetchQuestions(selectedExam.id)
        }
      } catch (error) {
        console.error('Error deleting item:', error)
      }
    }
  }

  const publishSelected = async () => {
    if (!selectedExam) return
    try {
      await examAPI.publishExam(selectedExam.id)
      await fetchExams()
      alert(`Exam "${selectedExam.title}" has been published! All students will be notified.`)
      // Refresh notifications to show any new ones
      setTimeout(() => fetchNotifications(), 1000)
    } catch (e) {
      alert('Failed to publish exam')
    }
  }

  const unpublishSelected = async () => {
    if (!selectedExam) return
    try {
      await examAPI.unpublishExam(selectedExam.id)
      await fetchExams()
      alert('Exam moved to Draft')
    } catch (e) {
      alert('Failed to unpublish exam')
    }
  }

  const handleCSVFileChange = (e) => {
    setCsvFile(e.target.files[0])
  }

  const handleCSVImport = async () => {
    if (!csvFile || !selectedExam) {
      alert('Please select an exam first')
      return
    }

    setImporting(true)
    try {
      const response = await questionAPI.importCSV(csvFile, selectedExam.id, user.id)
      alert(`Successfully imported ${response.data.count} questions`)
      setCsvFile(null)
      fetchQuestions(selectedExam.id)
    } catch (error) {
      console.error('Error importing CSV:', error)
      alert('Error importing CSV: ' + (error.response?.data?.message || error.message))
    } finally {
      setImporting(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await questionAPI.downloadTemplate()
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'question_template.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading template:', error)
      alert('Error downloading template')
    }
  }

  if (loading) {
    return <div className="container">Loading...</div>
  }

  return (
    <div className="container">
      <h1 className="mb-4">Exam & Question Manager</h1>
      
      <div className="card">
        <div className="mb-4">
          <div className="mb-3">
            <select
              className="form-control"
              value={selectedExam?.id || ''}
              onChange={(e) => {
                const exam = exams.find(ex => ex.id === parseInt(e.target.value))
                if (exam) handleExamSelect(exam)
              }}
              style={{ width: '300px', display: 'inline-block', marginRight: '10px' }}
            >
              <option value="">Select an Exam</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>
                  {exam.title} ({exam.status})
                </option>
              ))}
            </select>
            <button
              className="btn btn-primary"
              onClick={() => handleOpenModal('exam')}
            >
              + Create Exam
            </button>
          </div>
          {selectedExam && (
            <div>
              <button 
                className="btn btn-secondary" 
                style={{ marginRight: '8px' }}
                onClick={() => handleOpenModal('exam', selectedExam)}
              >
                Edit Exam
              </button>
              <button 
                className="btn btn-danger" 
                style={{ marginRight: '8px' }}
                onClick={() => handleDelete('exam', selectedExam.id)}
              >
                Delete Exam
              </button>
              <button
                className="btn btn-success"
                style={{ marginRight: '8px' }}
                onClick={() => handleOpenModal('question')}
              >
                + Add Question
              </button>
              <button
                className="btn btn-info"
                style={{ marginRight: '8px' }}
                onClick={() => document.getElementById('csvUpload').click()}
                disabled={importing}
                title="Upload CSV file (Max size: 10MB)&#10;Format: questionText,questionType,difficultyLevel,marks,options,correctAnswer,explanation&#10;Difficulty: EASY (1 mark), MEDIUM (2 marks), HARD (5 marks)"
              >
                {importing ? 'Importing...' : '📤 Upload CSV'}
              </button>
              <input
                id="csvUpload"
                type="file"
                accept=".csv"
                onChange={async (e) => {
                  const file = e.target.files[0]
                  if (!file) return
                  
                  if (!selectedExam) {
                    alert('Please select an exam first')
                    return
                  }
                  
                  console.log('Current user:', user)
                  if (!user) {
                    alert('Please login first')
                    return
                  }
                  
                  if (user.role !== 'ADMIN' && user.role !== 'TEACHER') {
                    alert(`Your role is ${user.role}. You need ADMIN or TEACHER role to upload CSV`)
                    return
                  }
                  
                  console.log('User role:', user.role)
                  console.log('Token exists:', !!localStorage.getItem('token'))
                  console.log('Token value:', localStorage.getItem('token')?.substring(0, 20) + '...')
                  console.log('Starting CSV import for file:', file.name)
                  console.log('Exam ID:', selectedExam.id)
                  console.log('User ID:', user.id)
                  
                  setImporting(true)
                  try {
                    const response = await questionAPI.importCSV(file, selectedExam.id, user.id)
                    console.log('Import response:', response.data)
                    alert(`✅ Successfully imported ${response.data.count} questions from ${file.name}`)
                    fetchQuestions(selectedExam.id)
                  } catch (error) {
                    console.error('Full error:', error)
                    if (error.response?.status === 401) {
                      alert('❌ Authentication failed. Please login again.')
                      localStorage.removeItem('token')
                      window.location.href = '/login'
                    } else {
                      alert('❌ Error importing CSV: ' + (error.response?.data?.message || error.message))
                    }
                  } finally {
                    setImporting(false)
                    e.target.value = ''
                  }
                }}
                style={{ display: 'none' }}
              />
              {selectedExam.status === 'DRAFT' && (
                <button className="btn btn-primary" onClick={publishSelected} style={{ marginRight: '8px' }}>
                  Publish
                </button>
              )}
              {(selectedExam.status === 'ACTIVE') && (
                <button className="btn btn-secondary" onClick={unpublishSelected}>
                  Unpublish
                </button>
              )}
            </div>
          )}
        </div>
        
        {selectedExam && (
          <div className="mb-4" style={{ padding: '15px', backgroundColor: 'navyblue', border: '1px solid #dee2e6', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '10px', color: 'blue' }}>{selectedExam.title}</h3>
            <p style={{ marginBottom: '8px' }}><strong>Description:</strong> {selectedExam.description}</p>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <span><strong>Duration:</strong> {selectedExam.durationMinutes || selectedExam.duration} minutes</span>
              <span><strong>Total Marks:</strong> {questions.reduce((sum, q) => sum + (q.marks || 0), 0)}</span>
              <span><strong>Questions:</strong> {questions.length}</span>
              <span><strong>Status:</strong> <span className="chip chip-primary">{selectedExam.status}</span></span>
            </div>
          </div>
        )}
        

        
        {showQuestions && selectedExam && (
          <div>
            <h3 className="mb-3">Questions ({questions.length})</h3>
          
          {questions.length === 0 ? (
            <p style={{ color: '#666' }}>No questions found for this exam.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Options</th>
                  <th>Correct Answer</th>
                  <th>Difficulty</th>
                  <th>Marks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((question) => (
                  <tr key={question.id}>
                    <td style={{ maxWidth: '250px', wordWrap: 'break-word' }}>{question.questionText}</td>
                    <td style={{ maxWidth: '200px', wordWrap: 'break-word' }}>
                      {Array.isArray(question.options) ? question.options.join(', ') : (question.options || '')}
                    </td>
                    <td>{question.correctAnswer}</td>
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
          )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>{selectedItem ? 'Edit' : 'Create'} {modalType === 'exam' ? 'Exam' : 'Question'}</h3>
              <button type="button" className="btn btn-secondary" onClick={handleCloseModal} style={{ padding: '5px 10px' }}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
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
                    <small style={{ color: '#666' }}>Total marks and passing marks (50% of total) will be calculated automatically based on questions added</small>
                  </div>
                </>
              )}
              {modalType === 'question' && (
                <>
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
                    <label>Options:</label>
                    <input
                      className="form-control"
                      placeholder="Option A"
                      name="optionA"
                      value={formData.optionA || ''}
                      onChange={handleFormChange}
                      required
                    />
                    <input
                      className="form-control"
                      placeholder="Option B"
                      name="optionB"
                      value={formData.optionB || ''}
                      onChange={handleFormChange}
                      required
                      style={{ marginTop: '8px' }}
                    />
                    <input
                      className="form-control"
                      placeholder="Option C"
                      name="optionC"
                      value={formData.optionC || ''}
                      onChange={handleFormChange}
                      required
                      style={{ marginTop: '8px' }}
                    />
                    <input
                      className="form-control"
                      placeholder="Option D"
                      name="optionD"
                      value={formData.optionD || ''}
                      onChange={handleFormChange}
                      required
                      style={{ marginTop: '8px' }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Correct Answer:</label>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px' }}>
                        <input
                          type="radio"
                          name="correctAnswer"
                          value="A"
                          checked={formData.correctAnswer === 'A'}
                          onChange={handleFormChange}
                          style={{ marginRight: '8px' }}
                        />
                        Option A
                      </label>
                      <label style={{ display: 'block', marginBottom: '8px' }}>
                        <input
                          type="radio"
                          name="correctAnswer"
                          value="B"
                          checked={formData.correctAnswer === 'B'}
                          onChange={handleFormChange}
                          style={{ marginRight: '8px' }}
                        />
                        Option B
                      </label>
                      <label style={{ display: 'block', marginBottom: '8px' }}>
                        <input
                          type="radio"
                          name="correctAnswer"
                          value="C"
                          checked={formData.correctAnswer === 'C'}
                          onChange={handleFormChange}
                          style={{ marginRight: '8px' }}
                        />
                        Option C
                      </label>
                      <label style={{ display: 'block', marginBottom: '8px' }}>
                        <input
                          type="radio"
                          name="correctAnswer"
                          value="D"
                          checked={formData.correctAnswer === 'D'}
                          onChange={handleFormChange}
                          style={{ marginRight: '8px' }}
                        />
                        Option D
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <select
                      className="form-control"
                      name="difficultyLevel"
                      value={formData.difficultyLevel || 'EASY'}
                      onChange={(e) => {
                        const difficulty = e.target.value;
                        const defaultMarks = difficulty === 'EASY' ? 1 : difficulty === 'MEDIUM' ? 2 : 5;
                        setFormData({ 
                          ...formData, 
                          difficultyLevel: difficulty,
                          marks: defaultMarks
                        });
                      }}
                    >
                      <option value="EASY">Easy (1 mark)</option>
                      <option value="MEDIUM">Medium (2 marks)</option>
                      <option value="HARD">Hard (5 marks)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <input
                      className="form-control"
                      placeholder="Marks"
                      name="marks"
                      type="number"
                      value={formData.marks || (formData.difficultyLevel === 'EASY' ? 1 : formData.difficultyLevel === 'MEDIUM' ? 2 : 5)}
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

export default ExamQuestionManager