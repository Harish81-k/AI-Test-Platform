import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import { GoogleLogin } from '@react-oauth/google';

export default function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post('accounts/google/', {
        credential: credentialResponse.credential,
      });
      setToken(res.data.access);
    } catch (err) {
      setError('Google Authentication failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    setError('Google Login Failed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('accounts/login/', { username, password });
      setToken(res.data.access);
    } catch (err) {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-4 login-glass-panel">
          <h2 className="text-center mb-5 fw-bold login-heading">Sign In</h2>
          
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-light border text-center text-danger p-2" style={{ fontSize: '0.8rem' }}>
                {error}
              </div>
            )}
            
            <div className="input-group-custom mb-4">
              <input 
                type="text" 
                className="input-field" 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
              />
            </div>

            <div className="input-group-custom mb-4 position-relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className="input-field" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <span 
                className="toggle-password position-absolute" 
                style={{ right: '0', top: '15px', cursor: 'pointer' }} 
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </span>
            </div>

            <button type="submit" className="btn btn-login w-100 mt-2">Login</button>
          </form>

          <div className="text-center my-4 text-muted" style={{ fontSize: '0.8rem' }}>OR CONTINUE WITH</div>

          <div className="d-flex justify-content-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
            />
          </div>

          <div className="text-center mt-4">
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
              Don't have an account? <Link to="/register" style={{ borderBottom: '1px solid' }}>Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
