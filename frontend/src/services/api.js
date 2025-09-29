import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication error:', error.response?.data)
      // Clear invalid/expired token and redirect to login for protected operations
      localStorage.removeItem('token')
      // avoid infinite loop on login/register routes
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (credentials) => api.post('/users/auth/login', credentials),
  register: (userData) => {
    // Only allow STUDENT registration
    const studentData = { ...userData, role: 'STUDENT' }
    return api.post('/users/register', studentData)
  },
}

export const examAPI = {
  getAllExams: () => api.get('/exams'),
  getAllExamsPaginated: (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') => 
    api.get(`/exams/paginated?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),
  searchExams: (title, page = 0, size = 10) => 
    api.get(`/exams/search?title=${title}&page=${page}&size=${size}`),
  getExamById: (id) => api.get(`/exams/${id}`),
  createExam: (examData) => api.post('/exams', examData),
  updateExam: (id, examData) => api.put(`/exams/${id}`, examData),
  deleteExam: (id) => api.delete(`/exams/${id}`),
  getActiveExams: () => api.get('/exams/active'),
  publishExam: (id) => api.put(`/exams/${id}/publish`),
  activateExam: (id) => api.put(`/exams/${id}/activate`),
  unpublishExam: (id) => api.put(`/exams/${id}/unpublish`),
}

export const questionAPI = {
  getAllQuestions: () => api.get('/questions'),
  getQuestionsByExam: (examId) => api.get(`/questions/exam/${examId}`),
  getTotalMarksByExam: (examId) => api.get(`/questions/exam/${examId}/total-marks`),
  createQuestion: (questionData) => api.post('/questions', questionData),
  updateQuestion: (id, questionData) => api.put(`/questions/${id}`, questionData),
  deleteQuestion: (id) => api.delete(`/questions/${id}`),
  importCSV: (file, examId, createdBy) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('examId', examId)
    formData.append('createdBy', createdBy)
    
    return api.post('/questions/import-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  downloadTemplate: () => api.get('/questions/csv-template', {
    responseType: 'blob'
  })
}

export const userAPI = {
  getAllUsers: () => api.get('/users'),
  getAllUsersPaginated: (page = 0, size = 10, sortBy = 'id', sortDir = 'asc') => 
    api.get(`/users/paginated?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),
  searchUsers: (username, page = 0, size = 10) => 
    api.get(`/users/search?username=${username}&page=${page}&size=${size}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getUserById: (id) => api.get(`/users/${id}`),
}

export const sessionAPI = {
  createSession: ({ examId, userId, durationMinutes, totalQuestions }) =>
    api.post('/sessions/create', null, { params: { examId, userId, durationMinutes, totalQuestions } }),
  startSession: (sessionId) => api.post(`/sessions/${sessionId}/start`),
  getSession: (sessionId) => api.get(`/sessions/${sessionId}`),
  submitAnswer: (sessionId, questionId, answerText) => 
    api.post(`/sessions/${sessionId}/answer`, null, { params: { questionId, answerText } }),
  submitSession: (sessionId) => api.post(`/sessions/${sessionId}/submit`),
}

export const resultAPI = {
  getAllResults: () => api.get('/results'),
  getResultsByUser: (userId) => api.get(`/results/user/${userId}`),
  getResultsByExam: (examId) => api.get(`/results/exam/${examId}`),
  getResult: (resultId) => api.get(`/results/${resultId}`),
  checkExamCompleted: (userId, examId) => api.get(`/results/check/${userId}/${examId}`),
  createResult: (resultData) => api.post('/results', resultData),
}

export const notificationAPI = {
  notifyExamPublished: (examId) => api.post(`/notifications/exam-published/${examId}`),
  sendNotification: (notificationData) => api.post('/notifications/send', notificationData),
  getNotificationsByUser: (userId) => api.get(`/notifications/user/${userId}`),
  getUnreadNotificationsByUser: (userId) => api.get(`/notifications/user/${userId}/unread`),
  getNotificationsByExam: (examId) => api.get(`/notifications/exam/${examId}`),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
}

export default api