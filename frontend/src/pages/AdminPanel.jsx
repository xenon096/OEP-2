import React, { useState, useEffect } from 'react'
import { examAPI, userAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import VisualAnalytics from '../components/VisualAnalytics'

const AdminPanel = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('analytics')
  const [exams, setExams] = useState([])
  const [users, setUsers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({})
  const [emailError, setEmailError] = useState('')

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    try {
      if (activeTab === 'exams') {
        const response = await examAPI.getAllExams()
        setExams(response.data)
      } else if (activeTab === 'users' && user?.role === 'ADMIN') {
        const response = await userAPI.getAllUsers()
        setUsers(response.data)
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

  const validateEmail = (email) => {
    if (!email.endsWith('@gmail.com')) {
      return 'Email must end with @gmail.com'
    }
    return ''
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    
    if (name === 'email') {
      setEmailError(validateEmail(value))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate email for user creation/update
    if (modalType === 'user') {
      const emailValidation = validateEmail(formData.email)
      if (emailValidation) {
        alert(emailValidation)
        return
      }
    }
    
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
      } else if (modalType === 'user') {
        const userData = {
          username: formData.username,
          email: formData.email,
          password: formData.password || 'defaultPassword123',
          role: formData.role,
          active: formData.active !== undefined ? formData.active : true
        }
        
        if (selectedItem) {
          await userAPI.updateUser(selectedItem.id, userData)
        } else {
          await userAPI.createUser(userData)
        }
      }
      handleCloseModal()
      fetchData()
    } catch (error) {
      console.error('Error saving data:', error)
      const itemType = modalType === 'exam' ? 'exam' : 'user'
      alert(`Error creating ${itemType}: ` + (error.response?.data?.message || error.message))
    }
  }

  const handleDelete = async (type, id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        if (type === 'exam') {
          await examAPI.deleteExam(id)
        } else if (type === 'user') {
          await userAPI.deleteUser(id)
        }
        fetchData()
      } catch (error) {
        console.error('Error deleting item:', error)
      }
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

  const handleUnpublishExam = async (examId) => {
    try {
      await examAPI.unpublishExam(examId)
      alert('Exam moved to Draft')
      fetchData()
    } catch (error) {
      console.error('Error unpublishing exam:', error)
      alert('Error unpublishing exam')
    }
  }

  const ExamManagement = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Exam Management</h2>
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
                  {exam.status === 'ACTIVE' && (
                    <button 
                      className="btn btn-secondary" 
                      style={{ marginRight: '5px' }}
                      onClick={() => handleUnpublishExam(exam.id)}
                    >
                      Unpublish
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

  const UserManagement = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>User Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => handleOpenModal('user')}
        >
          + Create User
        </button>
      </div>
      
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u => u.role !== 'ADMIN' || u.id === user.id).map((userItem) => (
              <tr key={userItem.id}>
                <td>{userItem.username}</td>
                <td>{userItem.email}</td>
                <td>
                  <span className="chip chip-primary">{userItem.role}</span>
                </td>
                <td>
                  <span className={`chip ${userItem.active ? 'chip-success' : 'chip-danger'}`}>
                    {userItem.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  {userItem.role !== 'ADMIN' && (
                    <>
                      <button 
                        className="btn btn-secondary" 
                        style={{ marginRight: '5px' }}
                        onClick={() => handleOpenModal('user', userItem)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleDelete('user', userItem.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {userItem.role === 'ADMIN' && userItem.id === user.id && (
                    <span style={{ color: '#666' }}>Current Admin</span>
                  )}
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
      <h1 className="mb-4">Admin Panel</h1>
      
      <div className="mb-4">
        {user?.role === 'ADMIN' && (
          <>
            <button 
              className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('analytics')}
              style={{ marginRight: '10px' }}
            >
              📊 Analytics
            </button>
            <button 
              className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('users')}
              style={{ marginRight: '10px' }}
            >
              User Management
            </button>
            <button 
              className={`btn ${activeTab === 'exams' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('exams')}
            >
              Exam Management
            </button>
          </>
        )}
      </div>
      
      <div>
        {activeTab === 'analytics' && user?.role === 'ADMIN' && <VisualAnalytics />}
        {activeTab === 'users' && user?.role === 'ADMIN' && <UserManagement />}
        {activeTab === 'exams' && user?.role === 'ADMIN' && <ExamManagement />}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{selectedItem ? 'Edit' : 'Create'} {modalType === 'exam' ? 'Exam' : 'User'}</h3>
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
              {modalType === 'user' && (
                <>
                  <div className="form-group">
                    <input
                      className="form-control"
                      placeholder="Username"
                      name="username"
                      value={formData.username || ''}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      className="form-control"
                      placeholder="Email (must end with @gmail.com)"
                      name="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={handleFormChange}
                      required
                    />
                    {emailError && (
                      <small style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        {emailError}
                      </small>
                    )}
                  </div>
                  <div className="form-group">
                    <input
                      className="form-control"
                      placeholder="Password"
                      name="password"
                      type="password"
                      value={formData.password || ''}
                      onChange={handleFormChange}
                      required={!selectedItem}
                    />
                  </div>
                  <div className="form-group">
                    <select
                      className="form-control"
                      name="role"
                      value={formData.role || ''}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="STUDENT">Student</option>
                      <option value="TEACHER">Teacher</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        name="active"
                        checked={formData.active !== false}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        style={{ marginRight: '10px' }}
                      />
                      Active User
                    </label>
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

export default AdminPanel