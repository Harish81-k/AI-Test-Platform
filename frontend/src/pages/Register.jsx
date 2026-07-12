import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import { GoogleLogin } from '@react-oauth/google';

export default function Register({ setToken }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    setError('Google Registration Failed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const res = await axios.post('accounts/register/', { username, email, password });
      
      // Auto login after register
      try {
        const loginRes = await axios.post('accounts/login/', { username, password });
        setToken(loginRes.data.access);
      } catch(loginErr) {
        setError('Registered successfully, but automatic login failed. Please login manually.');
      }
    } catch (err) {
      setError('Failed to create account. Username or email may already be in use.');
    }
  };

  return (
    <div className="container py-5">
      <style>{`
        .glass-panel-reg {
            background: #ffffff;
            border: 1px solid #eaeaea;
            padding: 50px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.03);
        }
        
        .reg-heading { font-family: 'Playfair Display', serif; color: #1a1a1a; font-size: 2.2rem; }

        .input-field-reg {
            width: 100%;
            border: none;
            border-bottom: 1px solid #d1d1d1;
            background: transparent;
            padding: 15px 0;
            outline: none;
            transition: 0.3s ease;
            font-size: 1rem;
        }
        
        .input-field-reg:focus { border-bottom: 1px solid #0a192f; }
        
        .btn-signup { 
            background-color: #0a192f; 
            color: white; 
            padding: 15px; 
            border: none;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
            transition: 0.3s;
        }
        
        .btn-signup:hover { background-color: #000; color: #fff; }
        
        .toggle-password { cursor: pointer; color: #999; }
      `}</style>
      <div className="row justify-content-center">
        <div className="col-md-5 glass-panel-reg">
          <h2 className="text-center mb-5 fw-bold reg-heading">Create Account</h2>
          
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-light border text-danger text-center mb-4">{error}</div>
            )}

            <div className="mb-4">
              <input 
                type="text" 
                className="input-field-reg" 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
              />
            </div>

            <div className="mb-4">
              <input 
                type="email" 
                className="input-field-reg" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className="mb-4 position-relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className="input-field-reg" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <span 
                className="toggle-password position-absolute" 
                style={{ right: '0', top: '15px' }} 
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </span>
            </div>

            <div className="mb-4 position-relative">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                className="input-field-reg" 
                placeholder="Confirm Password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />
              <span 
                className="toggle-password position-absolute" 
                style={{ right: '0', top: '15px' }} 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </span>
            </div>

            <button type="submit" className="btn btn-signup w-100 mt-2">Sign Up</button>
          </form>
          
          <div className="text-center my-4 text-muted" style={{ fontSize: '0.8rem' }}>OR CONTINUE WITH</div>

          <div className="d-flex justify-content-center mb-3">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
            />
          </div>

          <div className="text-center mt-4">
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
              Already have an account? <Link to="/" style={{ borderBottom: '1px solid', color: '#0a192f', textDecoration: 'none' }}>Log In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
