import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link } from 'react-router-dom';

export default function Home() {
  useEffect(() => {
    AOS.init({ 
      duration: 1000, 
      once: true,
      easing: 'ease-out-cubic' 
    });
  }, []);

  return (
    <div>
      <style>{`
        :root { --font-heading: 'Playfair Display', serif; --primary-navy: #0a192f; --accent-blue: #64ffda; }
        .editorial-hero { padding: 140px 0; position: relative; overflow: hidden; }
        .hero-title { font-family: var(--font-heading); font-size: 5rem; color: var(--primary-navy); letter-spacing: -1px; }
        [data-aos] { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
        .shape { position: absolute; width: 400px; height: 400px; background: #eef2f7; border-radius: 50%; filter: blur(100px); z-index: -1; pointer-events: none; }
        .service-card { border-left: 2px solid var(--accent-blue); padding-left: 20px; transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1); }
        .service-card:hover { transform: translateX(15px); border-left-color: var(--primary-navy); }
        .btn-dark { transition: all 0.3s ease; }
        .btn-dark:hover { letter-spacing: 2px; background: var(--primary-navy); }
      `}</style>

      <div className="shape" style={{top: '-100px', right: '-50px'}}></div>

      <section className="editorial-hero container text-center">
          <div data-aos="fade-up" data-aos-duration="1500">
              <h1 className="hero-title">Engineering Excellence <br/>Through <span style={{fontStyle: 'italic'}}>Precision</span></h1>
          </div>
          <div data-aos="fade-up" data-aos-delay="300">
              <p className="fs-4 text-muted mt-4" style={{maxWidth: '700px', margin: 'auto'}}>
                  The industry standard for technical evaluation, blending cognitive science with high-fidelity coding diagnostics.
              </p>
          </div>
          <div className="mt-5" data-aos="fade-up" data-aos-delay="600">
              <Link to="/login"><button className="btn btn-dark btn-lg px-5 rounded-0">Initialize Assessment</button></Link>
          </div>
      </section>

      <section className="py-4 border-top border-bottom" data-aos="fade-in" data-aos-delay="800">
          <div className="container text-center">
              <div className="row">
                  <div className="col-md-3" data-aos="zoom-in" data-aos-delay="900"><h5>+500 Companies</h5></div>
                  <div className="col-md-3" data-aos="zoom-in" data-aos-delay="1000"><h5>99.9% Accuracy</h5></div>
                  <div className="col-md-3" data-aos="zoom-in" data-aos-delay="1100"><h5>Global Infrastructure</h5></div>
                  <div className="col-md-3" data-aos="zoom-in" data-aos-delay="1200"><h5>Seamless API</h5></div>
              </div>
          </div>
      </section>

      <section className="py-5" style={{background: '#fff'}}>
          <div className="container">
              <div className="row align-items-center mb-5">
                  <div className="col-lg-5" data-aos="fade-right" data-aos-duration="1200">
                      <h2 style={{fontFamily: "var(--font-heading)", fontSize: '3rem'}}>Data-Driven Talent Discovery.</h2>
                      <p className="text-muted mt-3">We go beyond traditional testing. Our platform maps candidate performance against real-world engineering challenges.</p>
                  </div>
                  <div className="col-lg-6 offset-lg-1">
                      <div className="row g-4">
                          <div className="col-6" data-aos="fade-up" data-aos-delay="200"><div className="service-card"><h5 className="fw-bold">01. Cognitive Mapping</h5><p className="text-muted small">Deep-dive into logical reasoning patterns.</p></div></div>
                          <div className="col-6" data-aos="fade-up" data-aos-delay="400"><div className="service-card"><h5 className="fw-bold">02. Sandbox IDE</h5><p className="text-muted small">Real-world coding in a controlled environment.</p></div></div>
                          <div className="col-6" data-aos="fade-up" data-aos-delay="600"><div className="service-card"><h5 className="fw-bold">03. Bias Mitigation</h5><p className="text-muted small">Fair, meritocratic evaluation protocols.</p></div></div>
                          <div className="col-6" data-aos="fade-up" data-aos-delay="800"><div className="service-card"><h5 className="fw-bold">04. Scalable API</h5><p className="text-muted small">Integrate seamlessly with your ATS.</p></div></div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      <section className="py-5" data-aos="fade-up" data-aos-duration="1500">
          <div className="container">
              <div className="text-center mb-5">
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem' }}>How It Works</h2>
                  <p className="text-muted mt-2">A seamless pipeline from initiation to hire.</p>
              </div>
              <div className="row g-4 text-center">
                  <div className="col-md-4" data-aos="zoom-in" data-aos-delay="200">
                      <div className="p-4" style={{ background: '#fdfcf8', border: '1px solid var(--border-subtle)' }}>
                          <h1 className="display-4 fw-bold text-muted mb-3">1</h1>
                          <h5 className="fw-bold">Configure Profile</h5>
                          <p className="text-muted small">Set up custom assessment parameters based on the role requirements.</p>
                      </div>
                  </div>
                  <div className="col-md-4" data-aos="zoom-in" data-aos-delay="400">
                      <div className="p-4" style={{ background: '#fdfcf8', border: '1px solid var(--border-subtle)' }}>
                          <h1 className="display-4 fw-bold text-muted mb-3">2</h1>
                          <h5 className="fw-bold">Evaluate Skills</h5>
                          <p className="text-muted small">Candidates complete AI-generated logic and coding assignments in our secure sandbox.</p>
                      </div>
                  </div>
                  <div className="col-md-4" data-aos="zoom-in" data-aos-delay="600">
                      <div className="p-4" style={{ background: '#fdfcf8', border: '1px solid var(--border-subtle)' }}>
                          <h1 className="display-4 fw-bold text-muted mb-3">3</h1>
                          <h5 className="fw-bold">Review Analytics</h5>
                          <p className="text-muted small">Receive instantaneous, unbiased metrics mapped directly to performance.</p>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      <section className="py-5 border-top" style={{ background: '#f8f9fa' }}>
          <div className="container">
              <div className="text-center mb-5" data-aos="fade-up">
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem' }}>Trusted by Industry Leaders</h2>
              </div>
              <div className="row justify-content-center">
                  <div className="col-md-8">
                      <div className="text-center" data-aos="fade-up" data-aos-delay="200" style={{ padding: '40px', background: '#fff', border: '1px solid var(--border-subtle)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                          <i className="fa-solid fa-quote-left fs-1 text-muted mb-4 opacity-25"></i>
                          <h4 style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', color: 'var(--primary-navy)' }}>
                              "Since implementing TestNova AI, our engineering recruitment cycle has dropped by 40%. The cognitive mapping accurately identifies top-tier talent we would have otherwise missed."
                          </h4>
                          <div className="mt-4">
                              <h6 className="fw-bold mb-0">Sarah Jenkins</h6>
                              <small className="text-muted">VP of Engineering, CloudScale</small>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      <section className="py-5" data-aos="fade-up" data-aos-duration="1500">
          <div className="container">
              <div className="card p-5 border-0" style={{background: 'var(--primary-navy)', color: '#fff', borderRadius: '0'}}>
                  <div className="row align-items-center">
                      <div className="col-md-8">
                          <h2 className="display-5 fw-bold">Ready to iterate?</h2>
                          <p className="lead opacity-75">Connect your talent pipeline to the next evolution of AI-driven assessment.</p>
                      </div>
                      <div className="col-md-4 text-md-end">
                          <Link to="/login"><button className="btn btn-outline-light btn-lg px-5 rounded-0">Request Access</button></Link>
                      </div>
                  </div>
              </div>
          </div>
      </section>
    </div>
  );
}
