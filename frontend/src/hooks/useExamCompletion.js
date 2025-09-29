import { useState, useEffect } from 'react'
import { resultAPI } from '../services/api'

export const useExamCompletion = (userId) => {
  const [completedExams, setCompletedExams] = useState(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchCompletedExams()
    }
  }, [userId])

  const fetchCompletedExams = async () => {
    try {
      const response = await resultAPI.getResultsByUser(userId)
      const completed = new Set(response.data.map(result => result.examId))
      setCompletedExams(completed)
    } catch (error) {
      console.error('Error fetching completed exams:', error)
    } finally {
      setLoading(false)
    }
  }

  const isExamCompleted = (examId) => {
    return completedExams.has(examId)
  }

  return { isExamCompleted, loading }
}