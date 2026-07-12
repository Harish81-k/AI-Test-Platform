import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function About() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--bg-cream, #fdfcf8)' }}>
      <style>{`
        :root { 
            --font-heading: 'Playfair Display', serif; 
            --primary-navy: #0a192f; 
            --bg-cream: #fdfcf8;
            --border-subtle: #e0e0e0;
        }
        .mission-header { padding: 100px 0; border-bottom: 1px solid var(--border-subtle); text-align: center; }
        .stat-number { font-family: 'Inter', sans-serif; font-size: 3rem; font-weight: 700; color: var(--primary-navy); margin-bottom: 5px; }
        .value-item { border-left: 2px solid var(--primary-navy); padding-left: 25px; margin-bottom: 35px; transition: 0.4s ease; }
        .premium-card { background: #fff; border: 1px solid var(--border-subtle); padding: 40px; transition: 0.5s ease; }
        .premium-card:hover { border-color: var(--primary-navy); transform: translateY(-5px); }
      `}</style>

      <div className="container py-5">
          {/* Mission Header */}
          <div className="mission-header mb-5" data-aos="fade-up">
              <h1 className="display-3 fw-bold" style={{fontFamily: 'var(--font-heading)'}}>Redefining Talent Evaluation</h1>
              <p className="lead mx-auto text-muted mt-3" style={{maxWidth: '700px'}}>
                  We believe technical ability and cognitive potential should be measured by performance, not just resumes.
              </p>
          </div>

          {/* Mission & Values */}
          <div className="row align-items-stretch g-5 py-5">
              <div className="col-lg-6" data-aos="fade-right">
                  <h2 className="mb-4 fw-bold" style={{fontFamily: 'var(--font-heading)'}}>Our Mission</h2>
                  <p className="fs-5" style={{lineHeight: '1.8', color: '#444'}}>
                      In an era where technology evolves daily, hiring the right people is the biggest challenge for organizations. 
                      We remove the guesswork from recruitment by deploying adaptive, AI-driven assessments that accurately 
                      map a candidate's true skill set to the demands of the role.
                  </p>
              </div>
              <div className="col-lg-6" data-aos="fade-left">
                  <div className="premium-card h-100">
                      <h4 className="mb-4 text-uppercase fw-bold" style={{letterSpacing: '2px', color: 'var(--primary-navy)'}}>Core Values</h4>
                      <div className="value-item">
                          <strong className="d-block mb-1">Objectivity</strong>
                          <span className="text-muted">Using empirical data, not intuition, to drive hiring decisions.</span>
                      </div>
                      <div className="value-item">
                          <strong className="d-block mb-1">Scalability</strong>
                          <span className="text-muted">Assessing thousands of candidates simultaneously without losing quality.</span>
                      </div>
                      <div className="value-item">
                          <strong className="d-block mb-1">Precision</strong>
                          <span className="text-muted">Benchmarking against real-world, high-stakes industry standards.</span>
                      </div>
                  </div>
              </div>
          </div>

          {/* Stats Section */}
          <div className="py-5 text-center mb-5">
              <h2 className="mb-5 fw-bold" style={{fontFamily: 'var(--font-heading)'}}>Powered by Advanced AI</h2>
              <div className="row g-4">
                  <div className="col-md-3" data-aos="flip-up" data-aos-delay="100">
                      <div className="premium-card"><div className="stat-number">99%</div><div className="text-uppercase text-muted" style={{fontSize: '0.75rem', letterSpacing: '1.5px', fontWeight: 600}}>Accuracy Rating</div></div>
                  </div>
                  <div className="col-md-3" data-aos="flip-up" data-aos-delay="200">
                      <div className="premium-card"><div className="stat-number">24/7</div><div className="text-uppercase text-muted" style={{fontSize: '0.75rem', letterSpacing: '1.5px', fontWeight: 600}}>Automated Testing</div></div>
                  </div>
                  <div className="col-md-3" data-aos="flip-up" data-aos-delay="300">
                      <div className="premium-card"><div className="stat-number">500+</div><div className="text-uppercase text-muted" style={{fontSize: '0.75rem', letterSpacing: '1.5px', fontWeight: 600}}>Assessment Types</div></div>
                  </div>
                  <div className="col-md-3" data-aos="flip-up" data-aos-delay="400">
                      <div className="premium-card"><div className="stat-number">Global</div><div className="text-uppercase text-muted" style={{fontSize: '0.75rem', letterSpacing: '1.5px', fontWeight: 600}}>Candidate Reach</div></div>
                  </div>
              </div>
          </div>

          <div className="py-5 border-top border-bottom my-5">
              <div className="text-center mb-5" data-aos="fade-up">
                  <h2 className="fw-bold" style={{ fontFamily: 'var(--font-heading)' }}>Our Journey</h2>
                  <p className="text-muted">A brief history of TestNova AI.</p>
              </div>
              <div className="row g-4">
                  <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
                      <h4 className="fw-bold" style={{ color: 'var(--primary-navy)' }}>2024</h4>
                      <p className="text-muted small">Founded with a vision to eliminate hiring bias using deterministic AI logic models.</p>
                  </div>
                  <div className="col-md-4" data-aos="fade-up" data-aos-delay="300">
                      <h4 className="fw-bold" style={{ color: 'var(--primary-navy)' }}>2025</h4>
                      <p className="text-muted small">Launched our V2 Code execution engine, supporting 40+ languages with sub-millisecond execution analysis.</p>
                  </div>
                  <div className="col-md-4" data-aos="fade-up" data-aos-delay="500">
                      <h4 className="fw-bold" style={{ color: 'var(--primary-navy)' }}>2026</h4>
                      <p className="text-muted small">Passed 1 million assessments evaluated, partnering with Fortune 500 tech leaders.</p>
                  </div>
              </div>
          </div>

          <div className="py-5 mb-5">
              <div className="text-center mb-5" data-aos="fade-up">
                  <h2 className="fw-bold" style={{ fontFamily: 'var(--font-heading)' }}>Leadership Team</h2>
              </div>
              <div className="row justify-content-center g-5">
                  <div className="col-md-3 text-center" data-aos="zoom-in" data-aos-delay="200">
                      <div style={{ width: '150px', height: '150px', backgroundColor: '#e0e0e0', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="fa-solid fa-user text-muted fs-1 opacity-50"></i>
                      </div>
                      <h5 className="fw-bold mb-1">HARISH</h5>
                      <p className="text-muted small">CEO & Founder</p>
                  </div>
                  <div className="col-md-3 text-center" data-aos="zoom-in" data-aos-delay="400">
                      <div style={{ width: '150px', height: '150px', backgroundColor: '#e0e0e0', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="fa-solid fa-user text-muted fs-1 opacity-50"></i>
                      </div>
                      <h5 className="fw-bold mb-1">HARISH</h5>
                      <p className="text-muted small">Head of AI</p>
                  </div>
                  <div className="col-md-3 text-center" data-aos="zoom-in" data-aos-delay="600">
                      <div style={{ width: '150px', height: '150px', backgroundColor: '#e0e0e0', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="fa-solid fa-user text-muted fs-1 opacity-50"></i>
                      </div>
                      <h5 className="fw-bold mb-1">HARISH</h5>
                      <p className="text-muted small">VP of Engineering</p>
                  </div>
              </div>
          </div>

          <div className="py-5" data-aos="fade-up" data-aos-duration="1500">
              <div className="premium-card text-center" style={{ backgroundColor: 'var(--primary-navy)', color: '#fff' }}>
                  <h2 className="fw-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Join Our Mission</h2>
                  <p className="lead opacity-75 mb-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
                      We are always looking for exceptional engineers, researchers, and designers to help build the future of technical hiring.
                  </p>
                  <button className="btn btn-outline-light btn-lg rounded-0 px-5">View Open Roles</button>
              </div>
          </div>
      </div>
    </div>
  );
}
