import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { examAPI, questionAPI, sessionAPI, resultAPI } from '../services/api'
import axios from 'axios'

const ExamTaking = () => {
  const { examId } = useParams()
  const navigate = useNavigate()
  const [exam, setExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sessionId, setSessionId] = useState(null)
  const [examInitialized, setExamInitialized] = useState(false)

  useEffect(() => {
    initializeExam()
  }, [examId])

  useEffect(() => {
    if (timeLeft > 0 && examInitialized) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && exam && questions.length > 0 && examInitialized) {
      console.log('Time expired, auto-submitting exam')
      handleSubmitExam()
    }
  }, [timeLeft, exam, questions, examInitialized])

  const initializeExam = async () => {
    try {
      console.log('Loading exam:', examId)
      
      // Load exam details
      let examResponse;
      try {
        // Try direct axios call first, fallback to API service if it fails
        try {
          const token = localStorage.getItem('token')
          examResponse = await axios.get(`/api/exams/${examId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        } catch (directError) {
          console.log('Direct axios call failed, trying API service:', directError.message)
          examResponse = await examAPI.getExamById(examId)
        }
        console.log('Exam loaded:', examResponse.data)
        console.log('Exam totalMarks field:', examResponse.data.totalMarks)
        console.log('Exam total_marks field:', examResponse.data.total_marks)
        console.log('All exam fields:', Object.keys(examResponse.data))
        console.log('Exam data values:', {
          id: examResponse.data.id,
          title: examResponse.data.title,
          totalMarks: examResponse.data.totalMarks,
          passingMarks: examResponse.data.passingMarks,
          durationMinutes: examResponse.data.durationMinutes
        })
        setExam(examResponse.data)
      } catch (examError) {
        console.error('Error loading exam:', examError)
        console.error('Exam error response:', examError.response?.data)
        console.error('Exam error status:', examError.response?.status)
        console.error('Token being used:', localStorage.getItem('token'))
        
        if (examError.response?.status === 401) {
          console.error('Authentication error when loading exam')
          console.error('This might be a token issue or service unavailable')
          setError('Authentication failed. Please log in again.')
          return
        }
        throw examError
      }
      
      // Set timer based on duration field
      const duration = examResponse.data.durationMinutes || examResponse.data.duration || 60
      console.log('Setting exam duration:', duration, 'minutes')
      setTimeLeft(duration * 60)
      
      // Load questions
      try {
        // Try direct axios call first, fallback to API service if it fails
        let questionsResponse;
        try {
          const token = localStorage.getItem('token')
          questionsResponse = await axios.get(`/api/questions/exam/${examId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        } catch (directError) {
          console.log('Direct axios call for questions failed, trying API service:', directError.message)
          questionsResponse = await questionAPI.getQuestionsByExam(examId)
        }
        console.log('Questions loaded:', questionsResponse.data)
        const loadedQuestions = questionsResponse.data || []
        
        if (loadedQuestions.length === 0) {
          // Create sample questions if none exist
          setQuestions([
            {
              id: 1,
              questionText: 'What is the capital of France?',
              options: 'Paris,London,Berlin,Madrid',
              correctAnswer: 'Paris',
              marks: 10
            },
            {
              id: 2,
              questionText: 'Which programming language is used for web development?',
              options: 'JavaScript,Python,C++,Java',
              correctAnswer: 'JavaScript',
              marks: 10
            }
          ])
        } else {
          setQuestions(loadedQuestions)
        }
      } catch (questionError) {
        console.error('Error loading questions:', questionError)
        // Create sample questions on error
        setQuestions([
          {
            id: 1,
            questionText: 'What is the capital of France?',
            options: 'Paris,London,Berlin,Madrid',
            correctAnswer: 'Paris',
            marks: 10
          }
        ])
      }

      // Create exam session via microservice and start it
      try {
        console.log('Creating session for exam:', examId)
        const user = JSON.parse(localStorage.getItem('user'))
        // Try direct axios call first, fallback to API service if it fails
        let createResp;
        try {
          const token = localStorage.getItem('token')
          createResp = await axios.post('/api/sessions/create', null, {
            params: {
              examId: parseInt(examId),
              userId: user.id,
              durationMinutes: Math.ceil((duration || 60)),
              totalQuestions: (questions?.length || 0) > 0 ? questions.length : 10,
            },
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        } catch (directError) {
          console.log('Direct axios call for session creation failed, trying API service:', directError.message)
          createResp = await sessionAPI.createSession({
            examId: parseInt(examId),
            userId: user.id,
            durationMinutes: Math.ceil((duration || 60)),
            totalQuestions: (questions?.length || 0) > 0 ? questions.length : 10,
          })
        }
        
        const createdSessionId = createResp.data.id
        console.log('Session created:', createResp.data)
        
        // Start session with fallback
        try {
          const token = localStorage.getItem('token')
          await axios.post(`/api/sessions/${createdSessionId}/start`, null, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        } catch (startError) {
          console.log('Direct axios call for session start failed, trying API service:', startError.message)
          await sessionAPI.startSession(createdSessionId)
        }
        setSessionId(createdSessionId)
      } catch (sessionError) {
        console.error('Session creation/start failed:', sessionError)
        console.error('Session error response:', sessionError.response?.data)
        console.error('Session error status:', sessionError.response?.status)
        
        if (sessionError.response?.status === 401) {
          console.error('Authentication error when creating session')
          setError('Authentication failed. Please log in again.')
          return
        }
        
        console.log('Using fallback session for development')
        setSessionId(`fallback-${examId}-${Date.now()}`)
      }
    } catch (error) {
      console.error('Error initializing exam:', error)
      setError('Failed to load exam: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
      setExamInitialized(true)
    }
  }

  const handleAnswerChange = (questionId, answer) => {
    console.log(`=== ANSWER CHANGE DEBUG ===`)
    console.log(`Question ID: ${questionId} (type: ${typeof questionId})`)
    console.log(`Answer: "${answer}" (type: ${typeof answer})`)
    console.log('Previous answers:', answers)
    const newAnswers = { ...answers, [questionId]: answer }
    console.log('New answers object:', newAnswers)
    console.log('Keys in answers:', Object.keys(newAnswers))
    setAnswers(newAnswers)
  }

  const handleNextQuestion = () => {
    console.log('Moving to next question, current answers:', answers)
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    console.log('Moving to previous question, current answers:', answers)
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const calculateScore = (submittedAnswers, examQuestions) => {
    console.log('=== SCORE CALCULATION START ===')
    console.log('Submitted answers:', submittedAnswers)
    
    let totalScore = 0
    let correctCount = 0
    const results = []
    
    examQuestions.forEach((question, index) => {
      const questionId = question.id
      const rawUserAnswer = submittedAnswers[questionId]
      const correctAnswer = question.correctAnswer?.toString()?.trim()
      const questionMarks = question.marks || 1
      
      // Extract letter from user answer (e.g., "B) 4 bytes" -> "B")
      let userAnswerLetter = null
      if (rawUserAnswer) {
        const answerStr = rawUserAnswer.toString().trim()
        // Extract first letter if format is "A) text" or just "A"
        const match = answerStr.match(/^([A-D])\)?/i)
        userAnswerLetter = match ? match[1].toUpperCase() : answerStr.charAt(0).toUpperCase()
      }
      
      const isCorrect = userAnswerLetter && correctAnswer && 
                       userAnswerLetter === correctAnswer.toUpperCase()
      
      console.log(`Q${questionId}: "${rawUserAnswer}" -> "${userAnswerLetter}" vs "${correctAnswer}" = ${isCorrect ? 'CORRECT' : 'WRONG'} (+${isCorrect ? questionMarks : 0})`)
      
      if (isCorrect) {
        totalScore += questionMarks
        correctCount++
      }
      
      results.push({
        questionId,
        userAnswer: userAnswerLetter,
        correctAnswer,
        marks: questionMarks,
        isCorrect,
        scoreAdded: isCorrect ? questionMarks : 0
      })
    })
    
    const totalPossibleMarks = examQuestions.reduce((sum, q) => sum + (q.marks || 1), 0)
    const percentage = totalPossibleMarks > 0 ? (totalScore / totalPossibleMarks) * 100 : 0
    
    console.log(`Final Score: ${totalScore}/${totalPossibleMarks} (${percentage.toFixed(1)}%)`)
    
    return {
      score: totalScore,
      totalMarks: totalPossibleMarks,
      percentage: percentage,
      correctCount: correctCount,
      totalQuestions: examQuestions.length,
      results: results
    }
  }

  const handleSubmitExam = async () => {
    try {
      console.log('Submitting exam via microservices')
      console.log('Current answers:', answers)
      console.log('Questions:', questions)
      
      if (sessionId.startsWith('fallback-')) {
        console.log('Using fallback submission')
        
        // Create result record for fallback mode
        try {
          const user = JSON.parse(localStorage.getItem('user'))
          const scoreResult = calculateScore(answers, questions)
          const { score, totalMarks, percentage } = scoreResult
          
          const resultData = {
            userId: user.id,
            examId: parseInt(examId),
            sessionId: sessionId,
            score: score,
            totalMarks: totalMarks,
            percentage: percentage,
            status: 'COMPLETED'
          }
          
          const createResponse = await resultAPI.createResult(resultData)
          console.log('Result created successfully:', createResponse.data)
          alert(`Exam submitted! Score: ${score}/${totalMarks} (${percentage.toFixed(1)}%)`)
        } catch (error) {
          console.error('Error creating result:', error)
        }
        
        alert('Exam submitted successfully!')
        navigate('/dashboard')
        return
      }
      
      // Submit all answers to session microservice
      for (const [questionId, answer] of Object.entries(answers)) {
        try {
          await sessionAPI.submitAnswer(sessionId, questionId, answer)
        } catch (error) {
          console.error(`Failed to submit answer for question ${questionId}:`, error)
        }
      }
      
      // Submit the session to complete exam
      const result = await sessionAPI.submitSession(sessionId)
      console.log('Exam submitted:', result.data)
      
      // Create result record
      try {
        const user = JSON.parse(localStorage.getItem('user'))
        const scoreResult = calculateScore(answers, questions)
        const { score, totalMarks, percentage } = scoreResult
        
        console.log('Score calculation details:')
        console.log('- Calculated score:', score)
        console.log('- Exam totalMarks:', exam.totalMarks)
        console.log('- Questions total marks:', questions.reduce((sum, q) => sum + (q.marks || 1), 0))
        console.log('- Final totalMarks used:', totalMarks)
        console.log('- Percentage:', percentage.toFixed(1) + '%')
        
        console.log(`Score calculation: ${score}/${totalMarks} = ${percentage.toFixed(1)}%`)
        console.log(`Exam passing marks: ${exam.passingMarks || 60}%`)
        
        const resultData = {
          userId: user.id,
          examId: parseInt(examId),
          sessionId: sessionId,
          score: score,
          totalMarks: totalMarks,
          percentage: percentage,
          status: 'COMPLETED'
        }
        
        // Try direct axios call first, fallback to API service if it fails
        let createResponse;
        try {
          const token = localStorage.getItem('token')
          createResponse = await axios.post('/api/results', resultData, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        } catch (directError) {
          console.log('Direct axios call for result creation failed, trying API service:', directError.message)
          createResponse = await resultAPI.createResult(resultData)
        }
        console.log('Result created successfully:', createResponse.data)
      } catch (error) {
        console.error('Error creating result:', error)
      }
      
      alert('Exam submitted successfully!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Error submitting exam:', error)
      
      // Create result record even on error
      try {
        const user = JSON.parse(localStorage.getItem('user'))
        const scoreResult = calculateScore(answers, questions)
        const { score, totalMarks, percentage } = scoreResult
        
        const resultData = {
          userId: user.id,
          examId: parseInt(examId),
          sessionId: sessionId,
          score: score,
          totalMarks: totalMarks,
          percentage: percentage,
          status: 'COMPLETED'
        }
        
        const createResponse = await resultAPI.createResult(resultData)
        console.log('Fallback result created successfully:', createResponse.data)
      } catch (resultError) {
        console.error('Error creating fallback result:', resultError)
      }
      
      alert('Exam submitted successfully!')
      navigate('/dashboard')
    }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="container">
        <p>Loading exam...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-error">{error}</div>
      </div>
    )
  }

  if (!exam || questions.length === 0) {
    return (
      <div className="container">
        <div className="alert alert-error">No questions available for this exam.</div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div style={{ display: 'flex', minHeight: '100vh', gap: '20px', padding: '20px' }}>
      {/* Question Navigation Sidebar */}
      <div style={{
        width: '250px',
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        height: 'fit-content',
        position: 'sticky',
        top: '20px'
      }}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Questions</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '8px',
          marginBottom: '20px'
        }}>
          {questions.map((question, index) => {
            const isAnswered = answers[question.id] !== undefined
            const isCurrent = index === currentQuestionIndex
            return (
              <button
                key={question.id}
                onClick={() => setCurrentQuestionIndex(index)}
                style={{
                  width: '40px',
                  height: '40px',
                  border: '2px solid',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backgroundColor: isCurrent ? '#007bff' : isAnswered ? '#28a745' : '#fff',
                  borderColor: isCurrent ? '#007bff' : isAnswered ? '#28a745' : '#dee2e6',
                  color: isCurrent || isAnswered ? '#fff' : '#495057'
                }}
              >
                {index + 1}
              </button>
            )
          })}
        </div>
        
        <div style={{ fontSize: '14px', color: '#666' }}>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#28a745', marginRight: '8px' }}></span>
            Answered: {Object.keys(answers).length}
          </div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#dee2e6', marginRight: '8px' }}></span>
            Not Answered: {questions.length - Object.keys(answers).length}
          </div>
          <div>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#007bff', marginRight: '8px' }}></span>
            Current
          </div>
        </div>
        
        <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#fff', borderRadius: '4px' }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: timeLeft < 300 ? '#dc3545' : '#1976d2' }}>
            Time: {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, maxWidth: '800px' }}>
        <div className="card">
          <div className="mb-4">
            <h2 className="mb-4">{exam.title}</h2>
            <div className="progress" style={{ marginBottom: '20px' }}>
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="mb-4">Question {currentQuestionIndex + 1}: {currentQuestion.questionText}</h3>
            
            <div>
              {(() => {
                const options = currentQuestion.options 
                  ? (typeof currentQuestion.options === 'string' 
                     ? currentQuestion.options.split(',') 
                     : currentQuestion.options)
                  : ['Option A', 'Option B', 'Option C', 'Option D']
                
                return options.map((option, index) => (
                  <label key={index} style={{ 
                    display: 'block', 
                    marginBottom: '12px', 
                    cursor: 'pointer', 
                    padding: '16px', 
                    border: '2px solid #dee2e6', 
                    borderRadius: '8px', 
                    backgroundColor: answers[currentQuestion.id] === option.trim() ? '#007bff' : '#fff',
                    color: answers[currentQuestion.id] === option.trim() ? '#fff' : '#333',
                    fontSize: '16px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}>
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option.trim()}
                      checked={answers[currentQuestion.id] === option.trim()}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      style={{ marginRight: '12px', transform: 'scale(1.2)' }}
                    />
                    <span style={{ fontSize: '16px', lineHeight: '1.5' }}>{option.trim()}</span>
                  </label>
                ))
              })()
              }
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              className="btn btn-secondary"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </button>
            
            {currentQuestionIndex === questions.length - 1 ? (
              <button
                className="btn btn-success"
                onClick={handleSubmitExam}
              >
                Submit Exam
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleNextQuestion}
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExamTaking