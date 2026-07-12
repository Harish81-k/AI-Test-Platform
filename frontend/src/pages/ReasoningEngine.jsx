import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function ReasoningEngine() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Midtier');
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const navigate = useNavigate();

  // Initialize AOS (must be before any conditional returns)
  useEffect(() => {
    AOS.init({ 
        duration: 800, 
        once: true,
        easing: 'ease-out-cubic',
        offset: 100
    });
  }, []);

  // Timer logic
  useEffect(() => {
    let timerId = null;
    if (quiz && !result && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (quiz && !result && timeLeft === 0) {
      handleSubmitQuiz();
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [timeLeft, quiz, result]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('reasoning/generate/', { topic, difficulty });
      if (res.data.quiz && res.data.quiz.length > 0) {
        setQuiz(res.data.quiz);
        setTimeLeft(res.data.quiz.length * 60); // Initialize timer synchronously
        setTopic(res.data.topic);
      } else {
        alert("Failed to generate questions. The AI engine might be temporarily rate limited. Please wait a moment and try again.");
      }
    } catch (err) {
      alert('Failed to generate quiz. The AI engine might be temporarily rate limited.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      const res = await axios.post('reasoning/submit/', { quiz, answers, topic });
      setResult(res.data);
      setQuiz(null); // Clear quiz to show results
    } catch (err) {
      alert('Failed to submit quiz');
    }
  };

  // Safety net: convert any residual markdown code fences to HTML pre/code
  const renderQuestion = (html) => {
    if (!html) return '';
    let result = html.replace(/```[\w]*\n?([\s\S]*?)```/g, (_, code) =>
      `<pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
    );
    result = result.replace(/`([^`\n]+)`/g, '<code>$1</code>');
    return result;
  };

  // Sub-component for each accordion row (hooks must not be inside .map)
  function AccordionRow({ r, idx }) {

    const [open, setOpen] = React.useState(false);
    return (
      <div className="r-accordion-item">
          <button
            className="r-accordion-button"
            type="button"
            onClick={() => setOpen(o => !o)}
          >
              <span className={`r-status-dot ${r.is_correct ? 'r-dot-correct' : 'r-dot-wrong'}`}></span>
              Question {(idx + 1).toString().padStart(2, '0')} Breakdown
              <i className={`fa-solid fa-chevron-${open ? 'up' : 'down'} ms-auto`} style={{color: '#999', fontSize: '0.85rem'}}></i>
          </button>
          {open && (
            <div className="r-accordion-body">
                <div className="r-fact-box">
                    <div className="r-fact-label">Evaluation Parameter</div>
                    <div className="r-fact-value" dangerouslySetInnerHTML={{__html: r.question}} />
                </div>
                <div className="row g-3">
                    <div className="col-md-6">
                        <div className="r-fact-box h-100">
                            <div className="r-fact-label">Your Registered Output</div>
                            <div className={`r-fact-value ${r.is_correct ? 'text-success' : 'text-danger text-decoration-line-through'}`}>
                                {r.user_answer && r.user_answer !== 'Not Answered' ? r.user_answer : <span className="text-muted">Unassigned Variable</span>}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="r-fact-box h-100">
                            <div className="r-fact-label">Absolute Reference Constant</div>
                            <div className="r-fact-value text-success">{r.correct_answer}</div>
                        </div>
                    </div>
                </div>
            </div>
          )}
      </div>
    );
  }

  // State 3: Result View — premium design matching CodingEngine
  if (result) {
    const pct = result.percentage;
    const grade = pct >= 90 ? 'Exceptional' : pct >= 75 ? 'Proficient' : pct >= 60 ? 'Adequate' : pct >= 40 ? 'Developing' : 'Insufficient';

    return (
      <div style={{ backgroundColor: '#fdfcf8', color: '#0a192f', fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
        <style>{`
            :root {
                --studio-cream: #fdfcf8;
                --studio-ink: #0a192f;
                --studio-accent: #a39074;
                --glass-bg: rgba(255, 255, 255, 0.75);
                --glass-border: rgba(0, 0, 0, 0.05);
                --state-success: #28a745;
                --state-error: #d93025;
            }
            .r-orb {
                position: fixed;
                border-radius: 50%;
                filter: blur(80px);
                z-index: 0;
                opacity: 0.6;
                animation: rfloat 20s infinite ease-in-out alternate;
            }
            .r-orb-1 { width: 400px; height: 400px; background: rgba(163, 144, 116, 0.3); top: -10%; left: -5%; animation-delay: 0s; }
            .r-orb-2 { width: 500px; height: 500px; background: rgba(200, 210, 220, 0.4); bottom: -20%; right: -10%; animation-delay: -5s; }
            @keyframes rfloat { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(50px, 50px) scale(1.1); } }

            .r-res-top-nav { display: flex; justify-content: space-between; align-items: center; padding: 30px 60px; z-index: 10; position: relative; }
            .r-brand-logo { font-weight: 700; font-size: 1.2rem; color: var(--studio-ink); text-decoration: none; display: flex; align-items: center; gap: 12px; }
            .r-btn-return { background: transparent; color: var(--studio-ink); border: 1px solid var(--studio-ink); padding: 10px 24px; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; border-radius: 6px; text-decoration: none; transition: all 0.3s ease; cursor: pointer; }
            .r-btn-return:hover { background: var(--studio-ink); color: #fff; }

            .r-main-container { max-width: 1100px; margin: 20px auto 80px; padding: 0 20px; position: relative; z-index: 10; }
            .r-glass-panel { background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 20px; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); padding: 60px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.03); }

            .r-result-hero { text-align: center; margin-bottom: 60px; }
            .r-score-circle { width: 200px; height: 200px; border-radius: 50%; border: 8px solid var(--studio-ink); display: flex; align-items: center; justify-content: center; margin: 0 auto 30px; position: relative; }
            .r-score-circle::after { content: ''; position: absolute; top: -12px; left: -12px; right: -12px; bottom: -12px; border-radius: 50%; border: 1px dashed rgba(10, 25, 47, 0.2); animation: rspin 30s linear infinite; }
            @keyframes rspin { 100% { transform: rotate(360deg); } }

            .r-percentage-value { font-family: 'Fraunces', serif; font-size: 4.5rem; font-weight: 500; color: var(--studio-ink); line-height: 1; }
            .r-grade-title { font-family: 'Fraunces', serif; font-size: 2.2rem; font-weight: 500; color: var(--studio-ink); margin-bottom: 10px; }
            .r-grade-subtitle { font-size: 0.9rem; color: #666; text-transform: uppercase; letter-spacing: 0.15em; }

            .r-telemetry-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 60px; }
            .r-telemetry-card { background: #fff; border: 1px solid var(--glass-border); border-radius: 12px; padding: 24px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.02); transition: transform 0.3s ease; }
            .r-telemetry-card:hover { transform: translateY(-5px); }
            .r-t-value { font-family: 'Fraunces', serif; font-size: 2.5rem; font-weight: 500; margin-bottom: 8px; line-height: 1; }
            .r-t-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #888; font-weight: 600; }

            .r-section-heading { font-family: 'Fraunces', serif; font-size: 1.8rem; font-weight: 500; margin-bottom: 30px; color: var(--studio-ink); text-align: center; }

            .r-accordion-item { background: transparent; border: none; border-bottom: 1px solid rgba(0,0,0,0.08); border-radius: 0 !important; margin-bottom: 10px; }
            .r-accordion-button { background: transparent !important; color: var(--studio-ink) !important; box-shadow: none !important; padding: 24px 10px; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; font-size: 1.1rem; display: flex; align-items: center; width: 100%; border: none; cursor: pointer; }
            .r-status-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 20px; flex-shrink: 0; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .r-dot-correct { background-color: var(--state-success); }
            .r-dot-wrong { background-color: var(--state-error); }

            .r-accordion-body { background: rgba(255,255,255,0.5); border-radius: 12px; padding: 24px; margin: 0 10px 24px 10px; font-size: 1rem; line-height: 1.6; }
            .r-fact-box { background: #fff; border: 1px solid var(--glass-border); border-radius: 8px; padding: 16px; margin-bottom: 12px; }
            .r-fact-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 6px; font-weight: 600; }
            .r-fact-value { color: var(--studio-ink); font-weight: 500; }

            @media (max-width: 768px) {
                .r-telemetry-grid { grid-template-columns: repeat(2, 1fr); }
                .r-glass-panel { padding: 40px 20px; }
                .r-res-top-nav { padding: 20px; }
            }
        `}</style>

        <div className="r-orb r-orb-1"></div>
        <div className="r-orb r-orb-2"></div>

        <nav className="r-res-top-nav">
            <div className="r-brand-logo">
                <i className="fa-solid fa-cube"></i> TestNova AI
            </div>
            <button className="r-btn-return" onClick={() => navigate('/')}>
                <i className="fa-solid fa-arrow-left me-2"></i> Return
            </button>
        </nav>

        <main className="r-main-container">
            <div className="r-glass-panel">
                <div className="r-result-hero">
                    <div className="r-score-circle">
                        <div className="r-percentage-value">{result.percentage}<span style={{fontSize: '2.5rem'}}>%</span></div>
                    </div>
                    <h1 className="r-grade-title">{grade}</h1>
                    <div className="r-grade-subtitle">Final Assessment Classification</div>
                </div>

                <div className="r-telemetry-grid">
                    <div className="r-telemetry-card">
                        <div className="r-t-value" style={{color: 'var(--studio-ink)'}}>{result.total}</div>
                        <div className="r-t-label">Total Load</div>
                    </div>
                    <div className="r-telemetry-card">
                        <div className="r-t-value" style={{color: 'var(--state-success)'}}>{result.score}</div>
                        <div className="r-t-label">Validated</div>
                    </div>
                    <div className="r-telemetry-card">
                        <div className="r-t-value" style={{color: 'var(--state-error)'}}>{result.wrong}</div>
                        <div className="r-t-label">Anomalies</div>
                    </div>
                    <div className="r-telemetry-card">
                        <div className="r-t-value" style={{color: 'var(--studio-accent)'}}>{result.unattempted}</div>
                        <div className="r-t-label">Omitted</div>
                    </div>
                </div>

                <h2 className="r-section-heading">Structural Audit Breakdown</h2>

                <div className="accordion" id="rResultAccordion">
                    {result.results.map((r, idx) => (
                      <AccordionRow key={idx} r={r} idx={idx} />
                    ))}
                </div>
            </div>
        </main>
      </div>
    );
  }


  // State 2: Quiz View
  if (quiz && quiz.length > 0) {
    const q = quiz[currentQ];
    return (
      <div style={{backgroundColor: 'var(--canvas-ivory)', color: 'var(--ink-black)', fontFamily: 'var(--font-body)', margin: 0, overflow: 'hidden', height: '100vh', width: '100vw'}}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=Syne:wght@500;700;800&display=swap');
          
          :root {
              --canvas-ivory: #f9f6f0;
              --pure-cashmere: #ffffff;
              --ink-black: #0d0d0c;
              --sand-stone: #aba497;
              --border-soft: #ebdcc5;
              --accent-champagne: #bd9b64;
              --state-warn: #b84a4a;
              --font-display: 'Syne', sans-serif;
              --font-body: 'DM Sans', sans-serif;
          }
          
          .test-navbar { background: var(--pure-cashmere); padding: 30px 40px; border-bottom: 1px solid var(--border-soft); display: flex; justify-content: space-between; align-items: center; }
          .test-navbar h5 { font-family: var(--font-display); font-weight: 700; font-size: 1.25rem; letter-spacing: -0.02em; margin: 0; }
          .system-badge { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; color: var(--sand-stone); font-weight: 600; }
          
          .test-wrapper { display: grid; grid-template-columns: 320px 1fr; height: calc(100vh - 165px); width: 100%; }
          
          .meta-sidebar { background: #fdfcfb; border-right: 1px solid var(--border-soft); padding: 40px 30px; display: flex; flex-direction: column; gap: 30px; overflow-y: auto; }
          .sidebar-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 600; color: var(--sand-stone); display: block; margin-bottom: 12px; }
          .tracker-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
          .nav-btn { aspect-ratio: 1; border: 1px solid var(--border-soft); background: var(--pure-cashmere); border-radius: 0; cursor: pointer; font-family: var(--font-display); font-weight: 600; font-size: 0.95rem; color: var(--ink-black); position: relative; transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
          .nav-btn:hover { border-color: var(--ink-black); }
          .nav-btn.active { background: var(--ink-black); color: var(--canvas-ivory); border-color: var(--ink-black); }
          .nav-btn.answered::after { content: ''; position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; background-color: var(--accent-champagne); border-radius: 50%; }
          
          .workspace-canvas { display: grid; grid-template-columns: 1.1fr 1fr; overflow: hidden; background: var(--pure-cashmere); }
          .question-pane { padding: 60px; border-right: 1px solid var(--border-soft); background: var(--canvas-ivory); overflow-y: auto; }
          .q-index { font-family: var(--font-display); font-weight: 700; font-size: 0.85rem; text-transform: uppercase; color: var(--accent-champagne); display: block; margin-bottom: 25px; }
          .question-pane h3 { font-family: var(--font-display); font-weight: 600; font-size: 1.4rem; line-height: 1.5; letter-spacing: -0.01em; white-space: pre-wrap; }
          
          /* Code Box Styling — explicit values to avoid CSS var resolution issues */
          .question-pane pre,
          .question-pane code {
              display: block;
              background: #1e2433 !important;
              border: 1px solid #ebdcc5;
              padding: 16px 20px;
              font-family: 'Courier New', Consolas, monospace;
              font-size: 0.88rem;
              margin: 20px 0;
              border-radius: 6px;
              overflow-x: auto;
              color: #e8eaf6 !important;
              white-space: pre;
              line-height: 1.6;
          }
          .question-pane code {
              display: inline;
              background: #f0ede8;
              color: #c62828;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 0.85em;
              border: none;
          }
          .question-pane pre code {
              display: block;
              background: transparent;
              color: #e8eaf6;
              padding: 0;
              border-radius: 0;
              font-size: inherit;
          }
          
          .answer-pane { padding: 60px; background: var(--pure-cashmere); overflow-y: auto; }
          .option-card { border: none; border-bottom: 1px solid var(--border-soft); padding: 26px 0; cursor: pointer; display: flex; align-items: center; font-size: 1.1rem; width: 100%; transition: all 0.25s ease; }
          .option-card:hover { border-bottom-color: var(--ink-black); padding-left: 12px; }
          .option-card input[type="radio"] { appearance: none; width: 18px; height: 18px; border: 1px solid var(--sand-stone); border-radius: 50%; margin-right: 24px; flex-shrink: 0; }
          .option-card input[type="radio"]:checked { background: var(--ink-black); border-color: var(--ink-black); }

          .footer-bar { position: fixed; bottom: 0; width: 100%; height: 85px; background: var(--pure-cashmere); border-top: 1px solid var(--border-soft); display: flex; align-items: center; padding: 0 40px; gap: 16px; z-index: 1000; }
          .btn-studio { padding: 16px 38px; border-radius: 0; font-weight: 500; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.12em; cursor: pointer; }
          .btn-studio-primary { background: var(--ink-black); color: var(--canvas-ivory); border: none; }
          .btn-studio-secondary { background: transparent; color: var(--ink-black); border: 1px solid var(--border-soft); }
          .btn-studio-danger { background: transparent; color: var(--state-warn); border: 1px solid var(--border-soft); margin-right: auto; }
        `}</style>
        
        <div className="test-navbar">
            <h5>{topic.toUpperCase()} — Evaluation Session</h5>
            <div className="d-flex align-items-center">
                <div id="countdown-timer" className="system-badge" style={{marginRight: '20px', color: timeLeft <= 60 ? 'var(--state-warn)' : 'inherit'}}>
                    TIME LEFT // {formatTime(timeLeft)}
                </div>
                <div className="system-badge">Protocol Node // Live</div>
            </div>
        </div>

        <div className="test-wrapper">
            <div className="meta-sidebar">
                <div>
                    <span className="sidebar-label">Index Scheme</span>
                    <div className="tracker-grid">
                        {quiz.map((_, idx) => (
                            <button 
                              key={idx}
                              type="button"
                              className={`nav-btn ${idx === currentQ ? 'active' : ''} ${answers[idx] ? 'answered' : ''}`}
                              onClick={() => setCurrentQ(idx)}
                            >
                                {(idx + 1).toString().padStart(2, '0')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="workspace-canvas">
                <div className="question-pane">
                    <span className="q-index">Verification Block // {(currentQ + 1).toString().padStart(2, '0')}</span>
                    <div dangerouslySetInnerHTML={{__html: renderQuestion(q.question)}} />
                </div>

                <div className="answer-pane">
                    <span className="sidebar-label mb-4">Select Definitive Variable</span>
                    {q.options.map((opt, i) => (
                        <label key={i} className="option-card">
                            <input 
                              type="radio" 
                              name={`q-${currentQ}`} 
                              value={opt} 
                              checked={answers[currentQ] === opt}
                              onChange={() => setAnswers({...answers, [currentQ]: opt})}
                            />
                            <span>{opt}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>

        <div className="footer-bar">
            <button type="button" className="btn-studio btn-studio-danger" onClick={() => { if(window.confirm("Terminate assessment session and push variables?")) handleSubmitQuiz() }}>Terminate Session</button>
            <button type="button" className="btn-studio btn-studio-secondary" onClick={() => currentQ < quiz.length - 1 ? setCurrentQ(currentQ + 1) : null}>Skip Matrix</button>
            <button type="button" className="btn-studio btn-studio-primary" onClick={() => currentQ < quiz.length - 1 ? setCurrentQ(currentQ + 1) : handleSubmitQuiz()}>{currentQ === quiz.length - 1 ? 'Commit & Advance' : 'Commit & Advance'}</button>
        </div>
      </div>
    );
  }

  // State 1: Setup View
  return (
    <div style={{ backgroundColor: 'var(--studio-cream)', fontFamily: 'var(--font-body)', color: 'var(--studio-ink)', overflowX: 'hidden' }}>
      <style>{`
        :root {
            --studio-cream: #fdfcf8;
            --studio-ink: #0a192f;
            --studio-accent: #a39074;
            --border-subtle: #e0e0e0;
            --font-heading: 'Fraunces', serif;
            --font-body: 'Plus Jakarta Sans', sans-serif;
        }

        /* Nav Bar */
        .top-nav {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        /* 1. Hero Configuration Section */
        .config-section {
            position: relative;
            min-height: 85vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            overflow: hidden;
        }

        /* Animated background orbs */
        .glow-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(100px);
            z-index: 0;
            animation: orbFloat 20s infinite alternate ease-in-out;
            opacity: 0.6;
        }
        .orb-1 {
            width: 600px; height: 600px;
            background: rgba(163, 144, 116, 0.25);
            top: -100px; left: -100px;
        }
        .orb-2 {
            width: 700px; height: 700px;
            background: rgba(10, 25, 47, 0.15);
            bottom: -200px; right: -100px;
            animation-delay: -5s;
            animation-duration: 25s;
        }
        
        @keyframes orbFloat {
            0% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(50px, 100px) scale(1.05); }
            100% { transform: translate(-50px, 50px) scale(1.1); }
        }

        /* Glassmorphism Configuration Panel */
        .workspace-panel {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid var(--border-subtle);
            border-radius: 24px;
            width: 100%;
            max-width: 1100px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 1fr;
            box-shadow: 0 30px 60px rgba(0,0,0,0.06);
            overflow: hidden;
            position: relative;
            z-index: 1;
        }

        .studio-sidebar { 
            padding: 80px 60px; 
            border-right: 1px solid var(--border-subtle);
            background: rgba(248, 247, 244, 0.7);
        }
        
        .badge-ai {
            font-size: 0.75rem;
            letter-spacing: 2px;
            color: var(--studio-ink);
            padding: 6px 0;
            display: inline-block;
            margin-bottom: 20px;
            text-transform: uppercase;
            font-weight: 700;
        }

        .studio-display { 
            font-family: var(--font-heading); 
            color: var(--studio-ink); 
            font-size: 3rem; 
            line-height: 1.1; 
            margin-bottom: 25px;
            font-weight: 500;
        }

        .studio-main-form { padding: 80px 60px; }
        
        .input-label { 
            font-size: 0.75rem; 
            text-transform: uppercase; 
            letter-spacing: 1.5px; 
            color: #777; 
            margin-bottom: 12px; 
            display: block;
            font-weight: 700;
        }

        .input-field-c { 
            width: 100%; 
            background: transparent;
            border: none;
            border-bottom: 1px solid var(--border-subtle);
            padding: 10px 0; 
            font-size: 1.2rem; 
            color: var(--studio-ink);
            outline: none; 
            transition: 0.3s;
        }
        .input-field-c:focus { border-bottom-color: var(--studio-accent); }
        
        /* Modern Segmented Control */
        .segmented-control { display: flex; gap: 8px; margin-bottom: 40px; }
        .segmented-option { flex: 1; }
        .segmented-option input { display: none; }
        .segmented-option label { 
            display: block; text-align: center; 
            padding: 10px 5px; 
            font-size: 0.8rem; 
            color: #555;
            cursor: pointer; 
            border: 1px solid var(--border-subtle);
            border-radius: 6px;
            transition: all 0.3s ease;
        }
        .segmented-option input:checked + label { 
            background: var(--studio-ink); 
            color: #fff; 
            border-color: var(--studio-ink);
        }

        .submit-btn-c { 
            background: var(--studio-ink);
            color: #fff; 
            padding: 16px; 
            border: none; 
            border-radius: 8px;
            text-transform: uppercase; 
            font-size: 0.9rem; 
            font-weight: 700; 
            letter-spacing: 1px;
            cursor: pointer;
            transition: 0.3s;
            width: 100%;
        }
        .submit-btn-c:hover {
            background: #06101f;
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }

        /* 2. Telemetry Section */
        .telemetry-section {
            max-width: 1100px;
            margin: 80px auto;
            padding: 0 20px;
        }
        .telemetry-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
        }
        .telemetry-card {
            background: rgba(255, 255, 255, 0.7);
            border: 1px solid var(--border-subtle);
            padding: 30px;
            border-radius: 16px;
            transition: 0.3s;
            border-left: 4px solid var(--studio-accent);
        }
        .telemetry-card:nth-child(even) { border-left-color: var(--studio-ink); }
        .telemetry-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.04); }
        
        .metric-val {
            font-family: var(--font-heading);
            font-size: 2.5rem;
            font-weight: 500;
            margin-bottom: 5px;
            color: var(--studio-ink);
        }
        .metric-label {
            font-size: 0.75rem;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 700;
        }

        /* 3. Cognitive Engine Bento Grid */
        .bento-section {
            padding: 100px 20px;
            max-width: 1100px;
            margin: 0 auto;
        }
        .bento-card {
            background: #fff;
            border: 1px solid var(--border-subtle);
            border-radius: 24px;
            padding: 40px;
            height: 100%;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .bento-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04);
            border-color: var(--studio-accent);
        }
        .bento-icon {
            width: 60px;
            height: 60px;
            background: var(--studio-cream);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            color: var(--studio-accent);
            margin-bottom: 24px;
        }

        /* 4. Best Practices (Dark Section) */
        .checklist-section {
            background-color: var(--studio-ink);
            color: var(--studio-cream);
            padding: 120px 0;
            border-radius: 40px 40px 0 0;
            margin-top: 80px;
        }
        .checklist-item {
            display: flex;
            align-items: flex-start;
            gap: 20px;
            margin-bottom: 30px;
        }
        .check-icon {
            color: var(--studio-accent);
            font-size: 1.5rem;
        }

        /* Loading Overlay */
        .loading-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(253, 252, 248, 0.95);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            z-index: 9999; display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            opacity: 0; pointer-events: none; transition: opacity 0.4s ease;
        }
        .loading-overlay.active { opacity: 1; pointer-events: all; }
        
        .loader-ring {
            width: 60px; height: 60px;
            border: 3px solid var(--border-subtle);
            border-radius: 50%;
            border-top-color: var(--studio-ink);
            animation: spin 1s linear infinite;
            margin-bottom: 25px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .loading-text {
            font-family: var(--font-heading);
            font-size: 1.8rem; color: var(--studio-ink);
            margin-bottom: 10px;
        }
        .loading-subtext {
            color: #666; font-size: 0.9rem;
        }
      `}</style>
      
      {loading && (
        <div className="loading-overlay active">
            <div className="loader-ring"></div>
            <div className="loading-text">Synthesizing Board</div>
            <div className="loading-subtext">Cross-referencing parameters with LLM core...</div>
        </div>
      )}

      {/* Global Navigation */}
      <div className="top-nav">
          <Link to="/" style={{textDecoration: 'none', color: 'var(--studio-ink)', fontSize: '1.5rem', fontWeight: 600}}>
              <i className="fa-solid fa-cube me-2"></i>TestNova <span style={{color: '#888', fontWeight: 400}}>AI</span>
          </Link>
          <Link to="/" style={{color: '#666', textDecoration: 'none', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700}}>
              <i className="fa-solid fa-arrow-left me-2"></i> Return
          </Link>
      </div>

      {/* 1. Configuration Hero Section */}
      <section className="config-section">
          <div className="glow-orb orb-1"></div>
          <div className="glow-orb orb-2"></div>
          
          <div className="workspace-panel" data-aos="zoom-in" data-aos-duration="1200">
              <div className="studio-sidebar">
                  <div className="badge-ai">Core Engine v3</div>
                  <h1 className="studio-display">Generate intelligent <br/><em>knowledge boards</em>.</h1>
                  <p style={{fontSize: '1rem', color: '#555', lineHeight: '1.6'}}>
                      Our engine cross-references academic paradigms to compile highly accurate evaluations tailored to your exact specifications.
                  </p>
              </div>

              <div className="studio-main-form">
                  <form onSubmit={handleGenerate}>
                      <label className="input-label">Target Topic</label>
                      <div className="mb-5">
                          <input type="text" className="input-field-c" placeholder="e.g. System Design, Quantum Physics" value={topic} onChange={(e)=>setTopic(e.target.value)} required />
                      </div>

                      <label className="input-label">Depth Strategy</label>
                      <div className="segmented-control">
                          {['Novice', 'Basic', 'Midtier', 'Expert', 'Mastery'].map(level => (
                            <div className="segmented-option" key={level}>
                                <input type="radio" id={level} name="difficulty" value={level} checked={difficulty === level} onChange={(e)=>setDifficulty(e.target.value)} />
                                <label htmlFor={level}>{level}</label>
                            </div>
                          ))}
                      </div>

                      <button type="submit" className="submit-btn-c">Initialize Board <i className="fa-solid fa-arrow-right ms-2"></i></button>
                  </form>
              </div>
          </div>
      </section>

      {/* 2. Live Telemetry */}
      <section className="telemetry-section">
          <div className="text-center mb-5" data-aos="fade-up">
              <h2 className="fw-medium" style={{fontFamily: 'var(--font-heading)', fontSize: '2.5rem'}}>System Diagnostics</h2>
              <p className="text-muted fs-5 mt-2">All engine systems are currently operational and ready for deployment.</p>
          </div>
          
          <div className="telemetry-grid">
              <div className="telemetry-card" data-aos="flip-up" data-aos-delay="100">
                  <div className="metric-val">12<span style={{fontSize: '1rem', color: '#888'}}>ms</span></div>
                  <div className="metric-label">Avg. Node Latency</div>
              </div>
              <div className="telemetry-card" data-aos="flip-up" data-aos-delay="200">
                  <div className="metric-val">99.8<span style={{fontSize: '1rem', color: '#888'}}>%</span></div>
                  <div className="metric-label">Precision Index</div>
              </div>
              <div className="telemetry-card" data-aos="flip-up" data-aos-delay="300">
                  <div className="metric-val" style={{color: 'var(--studio-ink)'}}>Online</div>
                  <div className="metric-label">LLM Core Status</div>
              </div>
              <div className="telemetry-card" data-aos="flip-up" data-aos-delay="400">
                  <div className="metric-val" style={{color: 'var(--studio-accent)'}}>Active</div>
                  <div className="metric-label">Secure Sandbox</div>
              </div>
          </div>
      </section>

      {/* 3. How the Cognitive Engine Works (Bento) */}
      <section className="bento-section">
          <div className="text-center mb-5" data-aos="fade-up">
              <h2 className="display-5 fw-medium" style={{fontFamily: 'var(--font-heading)'}}>Engine Architecture</h2>
          </div>
          
          <div className="row g-4">
              <div className="col-lg-4" data-aos="fade-up" data-aos-delay="100">
                  <div className="bento-card">
                      <div className="bento-icon"><i className="fa-solid fa-microchip"></i></div>
                      <h4 className="fw-bold mb-3">Dynamic Generation</h4>
                      <p className="text-muted mb-0">Unlike static question banks, TestNova uses Google Gemini to synthesize completely unique and un-Googleable logic puzzles on the fly.</p>
                  </div>
              </div>
              <div className="col-lg-4" data-aos="fade-up" data-aos-delay="200">
                  <div className="bento-card">
                      <div className="bento-icon"><i className="fa-solid fa-layer-group"></i></div>
                      <h4 className="fw-bold mb-3">Adaptive Difficulty</h4>
                      <p className="text-muted mb-0">The engine automatically scales complexity and contextual depth based on the chosen Depth Strategy (from Novice up to absolute Mastery).</p>
                  </div>
              </div>
              <div className="col-lg-4" data-aos="fade-up" data-aos-delay="300">
                  <div className="bento-card">
                      <div className="bento-icon"><i className="fa-solid fa-chart-pie"></i></div>
                      <h4 className="fw-bold mb-3">Real-time Telemetry</h4>
                      <p className="text-muted mb-0">Your problem-solving speed, precision, and logical patterns are tracked instantly, generating comprehensive post-assessment reports.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* 4. Pre-flight Checklist (Dark Section) */}
      <section className="checklist-section" data-aos="fade-up" data-aos-duration="1000">
          <div className="container px-md-5">
              <div className="row">
                  <div className="col-lg-5 mb-5 mb-lg-0">
                      <h2 className="display-4 fw-medium text-white mb-4" style={{fontFamily: 'var(--font-heading)'}}>Pre-flight Checklist</h2>
                      <p className="fs-5 opacity-75 mb-0">
                          Before clicking Initialize, please ensure you meet the following requirements to ensure a fair and stable testing environment.
                      </p>
                  </div>
                  <div className="col-lg-6 offset-lg-1">
                      <div className="checklist-item" data-aos="fade-left" data-aos-delay="100">
                          <i className="fa-solid fa-circle-check check-icon"></i>
                          <div>
                              <h5 className="fw-bold text-white mb-1">Maintain Focus</h5>
                              <p className="opacity-75 mb-0">Do not navigate away from the testing window. Tab switches are logged by the telemetry engine.</p>
                          </div>
                      </div>
                      <div className="checklist-item" data-aos="fade-left" data-aos-delay="200">
                          <i className="fa-solid fa-circle-check check-icon"></i>
                          <div>
                              <h5 className="fw-bold text-white mb-1">No External Tools</h5>
                              <p className="opacity-75 mb-0">The use of AI assistants or search engines is strictly prohibited. Your logic must be your own.</p>
                          </div>
                      </div>
                      <div className="checklist-item" data-aos="fade-left" data-aos-delay="300">
                          <i className="fa-solid fa-circle-check check-icon"></i>
                          <div>
                              <h5 className="fw-bold text-white mb-1">Stable Connection</h5>
                              <p className="opacity-75 mb-0">Ensure your network connection is stable, as the AI requires continuous synchronization.</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>
    </div>
  );
}
