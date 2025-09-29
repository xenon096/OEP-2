import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'STUDENT'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [emailError, setEmailError] = useState('')
  const navigate = useNavigate()

  const validatePassword = (password) => {
    const minLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    if (!minLength) return 'Password must be at least 8 characters long'
    if (!hasUpperCase) return 'Password must contain at least 1 uppercase letter'
    if (!hasNumber) return 'Password must contain at least 1 number'
    if (!hasSymbol) return 'Password must contain at least 1 symbol (!@#$%^&*(),.?":{}|<>)'
    return ''
  }

  const validateEmail = (email) => {
    if (!email.endsWith('@gmail.com')) {
      return 'Email must end with @gmail.com'
    }
    return ''
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    
    if (name === 'password') {
      setPasswordError(validatePassword(value))
    }
    if (name === 'email') {
      setEmailError(validateEmail(value))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const passwordValidation = validatePassword(formData.password)
    if (passwordValidation) {
      setError(passwordValidation)
      setLoading(false)
      return
    }

    const emailValidation = validateEmail(formData.email)
    if (emailValidation) {
      setError(emailValidation)
      setLoading(false)
      return
    }

    try {
      await authAPI.register(formData)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '80px' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>Ace-X</h1>
          <h2 style={{ fontSize: '18px', fontWeight: '500' }}>Register</h2>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              className="form-control"
              placeholder="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              className="form-control"
              placeholder="Email (must end with @gmail.com)"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
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
              value={formData.password}
              onChange={handleChange}
              required
            />
            {passwordError && (
              <small style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {passwordError}
              </small>
            )}
            <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              Password must contain: 8+ characters, 1 uppercase, 1 number, 1 symbol
            </small>
          </div>
          <div className="form-group">
            <select
              className="form-control"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="STUDENT">Student</option>
              
            </select>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
          <p className="text-center mt-4">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Register