import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container">
      <div className="network-background"></div>
      
      <div className="home-content">
        <div className="hero-section">
          <h1 className="main-title">Ace-X Exam Portal</h1>
          <p className="subtitle">Advanced Online Examination System</p>
          <p className="description">
            Experience seamless online examinations with our cutting-edge platform
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

        <div className="features">
          <div className="feature">
            <div className="feature-icon">🎯</div>
            <h3>Smart Testing</h3>
            <p>AI-powered exam management</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🔒</div>
            <h3>Secure Platform</h3>
            <p>End-to-end encryption</p>
          </div>
          <div className="feature">
            <div className="feature-icon">📊</div>
            <h3>Real-time Analytics</h3>
            <p>Instant results & insights</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;