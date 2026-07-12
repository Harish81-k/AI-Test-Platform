import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import About from './pages/About';
import Analytics from './pages/Analytics';
import ReasoningEngine from './pages/ReasoningEngine';
import CodingEngine from './pages/CodingEngine';
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';

function MainLayout() {
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const location = useLocation();

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('access_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('access_token');
    }

    // Set up interceptor to handle 401 errors globally
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Token is expired or invalid
          setToken(null);
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount or token change
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [token]);

  const isAssessmentOrCoding = location.pathname.startsWith('/reasoning') || location.pathname.startsWith('/coding');

  return (
    <>
      {/* Conditionally hide navbar in full-screen assessment views */}
      {!isAssessmentOrCoding && (
        <nav className="navbar navbar-expand-lg sticky-top">
          <div className="container">
            <Link className="navbar-brand fs-3" to="/">
              <i className="fa-solid fa-cube me-2"></i>TestNova <span className="text-muted">AI</span>
            </Link>

            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto align-items-center">
                <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/about">About</Link></li>
                
                {token ? (
                  <>
                    <li className="nav-item"><Link className="nav-link" to="/reasoning">Assessments</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/coding">Coding IDE</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/analytics">Analytics</Link></li>
                    <li className="nav-item ms-lg-3">
                      <button className="btn btn-outline-danger" onClick={() => setToken(null)}>Logout</button>
                    </li>
                  </>
                ) : (
                  <li className="nav-item ms-lg-3">
                    <Link className="btn btn-outline-primary" to="/login">Sign In</Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content Router */}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={!token ? <Login setToken={setToken} /> : <Navigate to="/analytics" />} />
          <Route path="/register" element={!token ? <Register setToken={setToken} /> : <Navigate to="/analytics" />} />
          <Route path="/analytics" element={token ? <Analytics /> : <Navigate to="/login" />} />
          <Route path="/reasoning/*" element={token ? <ReasoningEngine /> : <Navigate to="/login" />} />
          <Route path="/coding/*" element={token ? <CodingEngine /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}

export default App;
