import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <>
    <div className="home-container">
      <div className="network-background"></div>
      
      <div className="home-content">
        <div className="hero-section">
          <div className="logo-container">
            <div className="logo">🎓</div>
          </div>
          <h1 className="main-title">Ace-X Exam Portal</h1>
          <p className="subtitle">Next-Generation Online Assessment Platform</p>
          <p className="description">
            Revolutionize your examination experience with AI-powered testing, 
            real-time analytics, and seamless user experience
          </p>
        </div>

        <div className="auth-buttons">
          <Link to="/login" className="btn btn-login">
            <span>Login</span>
          </Link>
          <Link to="/register" className="btn btn-register">
            <span>Register</span>
          </Link>
        </div>

        <div className="stats-section">
          <div className="stat">
            <div className="stat-number">10K+</div>
            <div className="stat-label">Students</div>
          </div>
          <div className="stat">
            <div className="stat-number">500+</div>
            <div className="stat-label">Exams</div>
          </div>
          <div className="stat">
            <div className="stat-number">99.9%</div>
            <div className="stat-label">Uptime</div>
          </div>
        </div>

        <div className="features">
          <div className="feature">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Optimized for speed and performance</p>
          </div>
          <div className="feature">
            <div className="feature-icon">📈</div>
            <h3>Smart Analytics</h3>
            <p>AI-driven insights and reporting</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🌐</div>
            <h3>Global Access</h3>
            <p>Available anywhere, anytime</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default HomePage;