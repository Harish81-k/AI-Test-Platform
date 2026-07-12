import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Split from 'split.js';
import Editor from '@monaco-editor/react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function CodingEngine() {
  const [difficulty, setDifficulty] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [code, setCode] = useState({}); // store code per question
  const [output, setOutput] = useState('');
  const [result, setResult] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [questionScores, setQuestionScores] = useState({});
  
  // New UI states based on HTML template
  const [isHintExpanded, setIsHintExpanded] = useState(false);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(true);
  const [customInputEnabled, setCustomInputEnabled] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [language, setLanguage] = useState('python');
  const [timer, setTimer] = useState(2700); // 45 minutes in seconds
  const [hintLoading, setHintLoading] = useState(false);
  const [hintData, setHintData] = useState({}); // Store hints per question

  const splitLeftRef = useRef(null);
  const splitRightRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ 
        duration: 800, 
        once: true,
        easing: 'ease-out-cubic',
        offset: 100
    });
  }, []);

  useEffect(() => {
    if (quiz && splitLeftRef.current && splitRightRef.current) {
      Split([splitLeftRef.current, splitRightRef.current], {
          sizes: [35, 65],
          minSize: [300, 400],
          gutterSize: 8,
          cursor: 'col-resize'
      });
      // Initialize code state for all questions
      const initialCode = {};
      quiz.forEach((q, i) => { initialCode[i] = q.stub || ''; });
      setCode(initialCode);
    }
  }, [quiz]);

  useEffect(() => {
    if (!quiz) return;
    const interval = setInterval(() => {
      setTimer(t => t > 0 ? t - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [quiz]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')} : ${s.toString().padStart(2, '0')}`;
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('coding/generate/', { difficulty });
      if (res.data.questions && res.data.questions.length > 0) {
        setQuiz(res.data.questions);
      } else {
        alert('Failed to generate coding quiz: empty result returned');
        setQuiz(null);
      }
    } catch (err) {
      alert('Failed to generate coding quiz');
      setQuiz(null);
    } finally {
      setLoading(false);
    }
  };

  const runCode = async () => {
    try {
      setOutput('Running...');
      setIsConsoleExpanded(true);
      let finalCode = code[currentQ];
      if (quiz[currentQ].test_harness && language === 'python') {
          const funcMatch = (quiz[currentQ].stub || '').match(/def\s+([a-zA-Z0-9_]+)/);
          const hasFunction = funcMatch && finalCode.includes(`def ${funcMatch[1]}`);
          const hasManualIO = finalCode.includes('input(') || finalCode.includes('sys.stdin');
          if (hasFunction && !hasManualIO) {
              finalCode += "\n\n" + quiz[currentQ].test_harness;
          }
      }

      const res = await axios.post('coding/execute/', { 
          code: finalCode, 
          input: customInputEnabled ? customInput : (quiz[currentQ].sample_input || ''), 
          language: language 
      });
      
      if (res.data.error) {
        setOutput(res.data.error);
      } else if (res.data.stderr) {
        setOutput(`Error:\n${res.data.stderr}`);
      } else {
        setOutput(res.data.stdout || 'Process finished successfully. (No output generated)');
      }
    } catch (err) {
      setOutput('Execution failed. ' + err.toString());
    }
  };

  const resetCode = () => {
    if (quiz && quiz[currentQ]) {
      setCode({...code, [currentQ]: quiz[currentQ].stub || ''});
    }
  };

  const getHint = async (e) => {
    e.stopPropagation();
    setIsHintExpanded(true);
    if (hintData[currentQ]) return; // already fetched
    
    setHintLoading(true);
    try {
      const q = quiz[currentQ];
      const res = await axios.post('coding/hint/', { title: q.title, description: q.description });
      setHintData(prev => ({...prev, [currentQ]: res.data.hint}));
    } catch (err) {
      setHintData(prev => ({...prev, [currentQ]: "Failed to generate hint."}));
    } finally {
      setHintLoading(false);
    }
  };

  const submitCurrentQuestion = async () => {
    setEvaluating(true);
    try {
      let qCode = code[currentQ];
      if (!qCode || qCode.trim() === '' || qCode === quiz[currentQ].stub) {
         setQuestionScores(prev => ({...prev, [currentQ]: 0}));
         setOutput("Submission Failed: Code is empty or untouched. Score: 0/20");
         setIsConsoleExpanded(true);
         return;
      }

      if (quiz[currentQ].test_harness && language === 'python') {
          const funcMatch = (quiz[currentQ].stub || '').match(/def\s+([a-zA-Z0-9_]+)/);
          const hasFunction = funcMatch && qCode.includes(`def ${funcMatch[1]}`);
          const hasManualIO = qCode.includes('input(') || qCode.includes('sys.stdin');
          if (hasFunction && !hasManualIO) {
              qCode += "\n\n" + quiz[currentQ].test_harness;
          }
      }

      const q = quiz[currentQ];
      const tests = [
          { input: q.sample_input || '', output: q.sample_output || '' }
      ];
      if (q.hidden_tests && Array.isArray(q.hidden_tests)) {
          tests.push(...q.hidden_tests);
      }
      
      let passed = 0;
      let total = tests.length;
      let failsLog = [];

      for (let i = 0; i < total; i++) {
          const t = tests[i];
          const res = await axios.post('coding/execute/', {
             code: qCode,
             input: t.input || '',
             language: language
          });
          
          if (res.data.error || res.data.stderr) {
              failsLog.push(`Test ${i+1} Failed (Error):\n${res.data.stderr || res.data.error}`);
          } else {
             const out = (res.data.stdout || '').trim();
             const expected = (t.output || '').trim();
             if (out === expected) {
                 passed++;
             } else {
                 failsLog.push(`Test ${i+1} Failed:\nExpected:\n${expected}\nGot:\n${out}`);
             }
          }
      }
      
      const score = Math.round((passed / total) * 20);
      setQuestionScores(prev => ({...prev, [currentQ]: score}));
      
      if (passed === total) {
          setOutput(`All ${total} test cases passed!\n\nScore: 20/20`);
      } else {
          setOutput(`${passed} out of ${total} test cases passed.\n\n` + failsLog.join('\n\n') + `\n\nScore: ${score}/20`);
      }
      
      setIsConsoleExpanded(true);
    } catch (err) {
      setOutput('Execution failed. ' + err.toString());
      setIsConsoleExpanded(true);
    } finally {
      setEvaluating(false);
    }
  };

  const terminateQuiz = async () => {
    setEvaluating(true);
    try {
      const finalScores = quiz.map((_, i) => questionScores[i] || 0);

      const submitRes = await axios.post('coding/submit/', { 
          scores: finalScores, 
          questions: quiz, 
          difficulty: difficulty 
      });
      
      setResult(submitRes.data);
      setQuiz(null);
    } catch (err) {
      alert('Failed to terminate session');
    } finally {
      setEvaluating(false);
    }
  };

  if (result) {
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
            .orb {
                position: fixed;
                border-radius: 50%;
                filter: blur(80px);
                z-index: 0;
                opacity: 0.6;
                animation: float 20s infinite ease-in-out alternate;
            }
            .orb-1 { width: 400px; height: 400px; background: rgba(163, 144, 116, 0.3); top: -10%; left: -5%; animation-delay: 0s; }
            .orb-2 { width: 500px; height: 500px; background: rgba(200, 210, 220, 0.4); bottom: -20%; right: -10%; animation-delay: -5s; }
            @keyframes float { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(50px, 50px) scale(1.1); } }
            
            .res-top-nav { display: flex; justify-content: space-between; align-items: center; padding: 30px 60px; z-index: 10; position: relative; }
            .brand-logo { font-weight: 700; font-size: 1.2rem; color: var(--studio-ink); text-decoration: none; display: flex; align-items: center; gap: 12px; }
            .btn-return { background: transparent; color: var(--studio-ink); border: 1px solid var(--studio-ink); padding: 10px 24px; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; border-radius: 6px; text-decoration: none; transition: all 0.3s ease; cursor: pointer; }
            .btn-return:hover { background: var(--studio-ink); color: #fff; }
            
            .main-container { max-width: 1100px; margin: 20px auto 80px; padding: 0 20px; position: relative; z-index: 10; }
            .glass-panel { background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 20px; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); padding: 60px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.03); }
            
            .result-hero { text-align: center; margin-bottom: 60px; }
            .score-circle { width: 200px; height: 200px; border-radius: 50%; border: 8px solid var(--studio-ink); display: flex; align-items: center; justify-content: center; margin: 0 auto 30px; position: relative; }
            .score-circle::after { content: ''; position: absolute; top: -12px; left: -12px; right: -12px; bottom: -12px; border-radius: 50%; border: 1px dashed rgba(10, 25, 47, 0.2); animation: spin 30s linear infinite; }
            @keyframes spin { 100% { transform: rotate(360deg); } }
            
            .percentage-value { font-family: 'Fraunces', serif; font-size: 4.5rem; font-weight: 500; color: var(--studio-ink); line-height: 1; }
            .grade-title { font-family: 'Fraunces', serif; font-size: 2.2rem; font-weight: 500; color: var(--studio-ink); margin-bottom: 10px; }
            .grade-subtitle { font-size: 0.9rem; color: #666; text-transform: uppercase; letter-spacing: 0.15em; }
            
            .telemetry-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 60px; }
            .telemetry-card { background: #fff; border: 1px solid var(--glass-border); border-radius: 12px; padding: 24px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.02); transition: transform 0.3s ease; }
            .telemetry-card:hover { transform: translateY(-5px); }
            .t-value { font-family: 'Fraunces', serif; font-size: 2.5rem; font-weight: 500; margin-bottom: 8px; line-height: 1; }
            .t-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #888; font-weight: 600; }
            
            .section-heading { font-family: 'Fraunces', serif; font-size: 1.8rem; font-weight: 500; margin-bottom: 30px; color: var(--studio-ink); text-align: center; }
            
            .accordion-item { background: transparent; border: none; border-bottom: 1px solid rgba(0,0,0,0.08); border-radius: 0 !important; margin-bottom: 10px; }
            .accordion-button { background: transparent !important; color: var(--studio-ink) !important; box-shadow: none !important; padding: 24px 10px; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; font-size: 1.1rem; display: flex; align-items: center; }
            .accordion-button::after { filter: grayscale(100%) contrast(200%); }
            .status-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .dot-correct { background-color: var(--state-success); }
            .dot-wrong { background-color: var(--state-error); }
            
            .accordion-body { background: rgba(255,255,255,0.5); border-radius: 12px; padding: 24px; margin: 0 10px 24px 10px; font-size: 1rem; line-height: 1.6; }
            .fact-box { background: #fff; border: 1px solid var(--glass-border); border-radius: 8px; padding: 16px; margin-bottom: 12px; }
            .fact-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 6px; font-weight: 600; }
            .fact-value { color: var(--studio-ink); font-weight: 500; }
            
            @media (max-width: 768px) {
                .telemetry-grid { grid-template-columns: repeat(2, 1fr); }
                .glass-panel { padding: 40px 20px; }
                .res-top-nav { padding: 20px; }
            }
        `}</style>
        
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        
        <nav className="res-top-nav">
            <div className="brand-logo">
                <i className="fa-solid fa-cube"></i> TestNova AI
            </div>
            <button className="btn-return" onClick={() => navigate('/')}>
                <i className="fa-solid fa-arrow-left me-2"></i> Return
            </button>
        </nav>
        
        <main className="main-container">
            <div className="glass-panel">
                <div className="result-hero">
                    <div className="score-circle">
                        <div className="percentage-value">{result.percentage}<span style={{fontSize: '2.5rem'}}>%</span></div>
                    </div>
                    <h1 className="grade-title">{result.grade}</h1>
                    <div className="grade-subtitle">Final Assessment Classification</div>
                </div>
                
                <div className="telemetry-grid">
                    <div className="telemetry-card">
                        <div className="t-value" style={{color: 'var(--studio-ink)'}}>{result.total}</div>
                        <div className="t-label">Total Load</div>
                    </div>
                    <div className="telemetry-card">
                        <div className="t-value" style={{color: 'var(--state-success)'}}>{result.score}</div>
                        <div className="t-label">Validated</div>
                    </div>
                    <div className="telemetry-card">
                        <div className="t-value" style={{color: 'var(--state-error)'}}>{result.wrong}</div>
                        <div className="t-label">Anomalies</div>
                    </div>
                    <div className="telemetry-card">
                        <div className="t-value" style={{color: 'var(--studio-accent)'}}>{result.unattempted}</div>
                        <div className="t-label">Omitted</div>
                    </div>
                </div>
                
                <h2 className="section-heading">Structural Audit Breakdown</h2>
                
                <div className="accordion" id="resultAccordion">
                    {result.results.map((r, idx) => (
                    <div className="accordion-item" key={idx}>
                        <h2 className="accordion-header">
                            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#q${idx}`}>
                                <span className={`status-dot ${r.is_correct ? 'dot-correct' : 'dot-wrong'}`}></span>
                                Question 0{idx + 1} Breakdown
                            </button>
                        </h2>
                        <div id={`q${idx}`} className="accordion-collapse collapse" data-bs-parent="#resultAccordion">
                            <div className="accordion-body">
                                
                                <div className="fact-box">
                                    <div className="fact-label">Evaluation Parameter</div>
                                    <div className="fact-value">{r.question}</div>
                                </div>
                                
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="fact-box h-100">
                                            <div className="fact-label">Your Registered Output</div>
                                            <div className={`fact-value ${r.is_correct ? 'text-success' : 'text-danger text-decoration-line-through'}`}>
                                                {r.user_answer ? r.user_answer : <span className="text-muted">Unassigned Variable</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="fact-box h-100">
                                            <div className="fact-label">Absolute Reference Constant</div>
                                            <div className="fact-value text-success">{r.correct_answer}</div>
                                        </div>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </main>
      </div>
    );
  }

  if (quiz && quiz.length > 0) {
    const q = quiz[currentQ];
    if (!q) return null;
    return (
      <div className="coding-wrapper" style={{ display: 'flex', height: '100vh', width: '100vw', background: '#fdfcf8', overflow: 'hidden' }}>
        <style>{`
          .problem-panel { display: flex; flex-direction: column; background: #fdfcf8; position: relative; overflow: hidden; border-right: 1px solid #e0e0e0; }
          .problem-top-nav { display: flex; align-items: center; padding: 0 16px; height: 50px; background: #f8f7f4; border-bottom: 1px solid #e0e0e0; }
          .problem-tabs { display: flex; gap: 24px; height: 100%; margin-left: 16px; }
          .problem-tabs .tab { font-size: 14px; font-weight: 600; color: #888; display: flex; align-items: center; border-bottom: 3px solid transparent; }
          .problem-tabs .tab.active-tab { color: #0a192f; border-bottom: 3px solid #0a192f; }
          .problem-content { flex: 1; overflow-y: auto; padding: 24px 32px; font-size: 15px; line-height: 1.7; color: #444; background: #fff; }
          .btn-back { color: #666; cursor: pointer; text-decoration: none; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 4px; transition: 0.2s; }
          .btn-back:hover { background: #e0e0e0; color: #0a192f; }
          
          .ai-chat-box { border-top: 1px solid #e0e0e0; background: #fff; padding: 16px; }
          .ai-input-container { background: #f8f7f4; border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px 16px; display: flex; }
          .btn-ai-hint { background: transparent; border: none; color: #0a192f; cursor: pointer; font-size: 16px; }
          
          .editor-panel { display: flex; flex-direction: column; background: #fff; height: 100%; overflow: hidden; }
          .editor-header { height: 60px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; border-bottom: 1px solid #e0e0e0; background: #f8f7f4; }
          .header-left { display: flex; align-items: center; gap: 16px; }
          .icon-btn { background: #fff; border: 1px solid #e0e0e0; border-radius: 6px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #666; }
          .icon-btn:hover { background: #f0f0f0; color: #0a192f; }
          .score-pill { font-weight: 600; font-size: 13px; border: 1px solid #e0e0e0; padding: 4px 12px; border-radius: 16px; background: #fff; }
          
          .header-right { display: flex; align-items: center; gap: 24px; }
          .palette { display: flex; gap: 8px; }
          .palette-btn { width: 28px; height: 28px; border-radius: 6px; border: 1px solid #e0e0e0; background: #fff; font-size: 12px; font-weight: 600; color: #555; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s ease; }
          .palette-btn:hover { background: #f0f0f0; }
          .palette-btn.active { background: #0a192f; color: #fff; border-color: #0a192f; }
          
          .timer-container { display: flex; flex-direction: column; align-items: center; }
          .timer-digits { font-family: monospace; font-size: 18px; font-weight: 700; color: #0a192f; }
          .timer-labels { font-size: 10px; color: #888; text-transform: uppercase; display: flex; gap: 12px; }
          .lang-selector { display: flex; flex-direction: column; }
          .lang-selector label { font-size: 10px; color: #888; text-transform: uppercase; font-weight: 600; margin-bottom: 2px; }
          
          .editor-footer { height: 56px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; background: #f8f7f4; border-top: 1px solid #e0e0e0; }
          .btn-console { background: transparent; border: none; color: #555; font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; }
          .btn-run { background: #fff; color: #0a192f; border: 1px solid #e0e0e0; padding: 8px 24px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; }
          .btn-submit { background: #0a192f; color: white; border: none; padding: 8px 24px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; margin-left: 8px; }
          .btn-danger { background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; margin-left: 8px; }
          
          .console-drawer { border-top: 1px solid #e0e0e0; background: #fafafa; display: flex; flex-direction: column; height: 300px; }
          .console-tabs { display: flex; justify-content: space-between; align-items: center; padding: 0 16px; height: 40px; background: #f8f7f4; border-bottom: 1px solid #e0e0e0; }
          .console-tabs .tab { font-size: 13px; font-weight: 600; color: #0a192f; border-bottom: 3px solid #0a192f; height: 100%; display: flex; align-items: center; }
          .console-drag-hint { color: #aaa; cursor: row-resize; }
          .console-body { flex: 1; padding: 16px; overflow-y: auto; }
          .gutter { background-color: #f8f7f4; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0; cursor: col-resize; }
          .console-output pre { background: #fff; color: #333; padding: 12px; border-radius: 6px; font-size: 13px; border: 1px solid #e0e0e0; white-space: pre-wrap; margin-bottom: 0; }
        `}</style>
        
        {/* LEFT PANEL */}
        <div className="problem-panel" ref={splitLeftRef}>
            <div className="problem-top-nav">
                <a className="btn-back" onClick={() => navigate('/')}><i className="fa-solid fa-chevron-left"></i></a>
                <div className="problem-tabs"><span className="tab active-tab">Problem</span></div>
            </div>
            <div className="problem-content">
                <h2 style={{fontFamily: "'Fraunces', serif", fontSize: '24px', color: '#0a192f', marginBottom: '16px'}}>{q.title}</h2>
                <div style={{marginBottom: '24px', fontSize: '15px'}} dangerouslySetInnerHTML={{__html: q.description}} />
                
                {q.input_format && (
                    <div style={{marginBottom: '16px'}}>
                        <h6 style={{fontWeight: 700, color: '#333'}}>Input Format</h6>
                        <div style={{color: '#555', fontSize: '14px'}} dangerouslySetInnerHTML={{__html: q.input_format}} />
                    </div>
                )}
                
                {q.output_format && (
                    <div style={{marginBottom: '16px'}}>
                        <h6 style={{fontWeight: 700, color: '#333'}}>Output Format</h6>
                        <div style={{color: '#555', fontSize: '14px'}} dangerouslySetInnerHTML={{__html: q.output_format}} />
                    </div>
                )}
                
                {q.constraints && (
                    <div style={{marginBottom: '24px'}}>
                        <h6 style={{fontWeight: 700, color: '#333'}}>Constraints</h6>
                        <div style={{background: '#f8f9fa', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e9ecef', fontFamily: 'monospace', fontSize: '13px', color: '#d63384'}} dangerouslySetInnerHTML={{__html: q.constraints}} />
                    </div>
                )}

                <div style={{display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px'}}>
                    {q.sample_input && (
                        <div>
                            <h6 style={{fontWeight: 700, color: '#333'}}>Sample Input</h6>
                            <pre style={{background: '#f8f9fa', padding: '12px', borderRadius: '6px', border: '1px solid #e9ecef', fontSize: '13px', margin: 0, whiteSpace: 'pre-wrap'}}>{q.sample_input}</pre>
                        </div>
                    )}
                    {q.sample_output && (
                        <div>
                            <h6 style={{fontWeight: 700, color: '#333'}}>Sample Output</h6>
                            <pre style={{background: '#f8f9fa', padding: '12px', borderRadius: '6px', border: '1px solid #e9ecef', fontSize: '13px', margin: 0, whiteSpace: 'pre-wrap'}}>{q.sample_output}</pre>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="ai-chat-box">
                <div className="ai-input-container" onClick={() => setIsHintExpanded(!isHintExpanded)} style={{cursor: 'pointer', alignItems: 'flex-start'}}>
                    <div style={{flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
                        <div id="ai-hint-display" style={{fontSize: '14px', color: '#333', maxHeight: isHintExpanded ? '300px' : '22px', overflowY: isHintExpanded ? 'auto' : 'hidden', transition: 'max-height 0.3s ease', whiteSpace: 'pre-wrap'}}>
                            {isHintExpanded ? (
                                hintData[currentQ] ? hintData[currentQ] : (hintLoading ? "Generating AI Hint... Please wait." : "Click the magic wand on the right to generate a hint for this problem!")
                            ) : "Type your message here (AI Hint)..."}
                        </div>
                    </div>
                    <div style={{display: 'flex', gap: '8px', alignItems: 'flex-start', marginLeft: '10px'}}>
                        <i className="fa-solid fa-chevron-up text-muted" style={{marginTop: '8px', transition: 'transform 0.3s ease', transform: isHintExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}}></i>
                        <button className="btn-ai-hint" title="Get Hint" onClick={getHint}>
                            <i className="fa-solid fa-wand-magic-sparkles"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="editor-panel" ref={splitRightRef}>
            <div className="editor-header">
                <div className="header-left">
                    <button className="icon-btn" title="Reset Code" onClick={resetCode}><i className="fa-solid fa-rotate-right"></i></button>
                    <div className="score-pill">Score: {questionScores[currentQ] || 0} / 20</div>
                </div>

                <div className="header-right">
                    <div className="palette">
                        {quiz.map((_, idx) => (
                            <button key={idx} className={`palette-btn ${idx === currentQ ? 'active' : ''}`} onClick={() => setCurrentQ(idx)}>
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                    
                    <div className="timer-container">
                        <div className="timer-digits">{formatTime(timer)}</div>
                        <div className="timer-labels">
                            <span>Minutes</span><span>Seconds</span>
                        </div>
                    </div>
                    
                    <div className="lang-selector">
                        <label>Language*</label>
                        <select className="form-select form-select-sm" value={language} onChange={(e) => setLanguage(e.target.value)} style={{fontSize: '13px', width: 'auto'}}>
                            <option value="python">Python 3.6</option>
                            <option value="javascript">JavaScript</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div style={{flex: 1, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column'}}>
                <Editor
                    height="100%"
                    language={language}
                    theme="light"
                    value={code[currentQ] || ''}
                    onChange={(val) => setCode({...code, [currentQ]: val})}
                    options={{ minimap: { enabled: false }, fontSize: 14 }}
                />
            </div>

            {isConsoleExpanded && (
              <div className="console-drawer">
                  <div className="console-tabs">
                      <span className="tab active-tab">Result</span>
                      <div className="console-drag-hint"><i className="fa-solid fa-ellipsis"></i></div>
                  </div>
                  <div className="console-body">
                      {output ? (
                          <div className="console-output"><pre>{output}</pre></div>
                      ) : (
                          <div style={{color: '#666', fontSize: '14px'}}>Please run the code to view the result.</div>
                      )}
                      
                      <div className="form-check mt-4">
                          <input className="form-check-input" type="checkbox" id="custom-input-checkbox" checked={customInputEnabled} onChange={(e) => setCustomInputEnabled(e.target.checked)} />
                          <label className="form-check-label" htmlFor="custom-input-checkbox" style={{fontSize: '14px', fontWeight: 600, color: '#555'}}>Custom Input</label>
                      </div>
                      
                      {customInputEnabled && (
                        <div className="custom-input-area mt-2">
                            <textarea className="form-control" rows="4" value={customInput} onChange={(e) => setCustomInput(e.target.value)} placeholder="Enter custom input here..." style={{fontSize: '14px'}}></textarea>
                        </div>
                      )}
                  </div>
              </div>
            )}

            <div className="editor-footer">
                <button className="btn-console" onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}>
                    <i className={`fa-solid fa-chevron-${isConsoleExpanded ? 'down' : 'up'}`}></i> Console
                </button>
                <div className="footer-actions">
                    <button className="btn-run" onClick={runCode}>Run</button>
                    <button className="btn-submit" onClick={submitCurrentQuestion}>Submit</button>
                    <button className="btn btn-danger" onClick={terminateQuiz}>Terminate Session</button>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // AOS is initialized at the top of the component (before conditional returns)

  // Setup View
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

        .studio-main-form { padding: 80px 60px; display: flex; flex-direction: column; justify-content: center; }
        
        .input-label { 
            font-size: 0.75rem; 
            text-transform: uppercase; 
            letter-spacing: 1.5px; 
            color: #777; 
            margin-bottom: 12px; 
            display: block;
            font-weight: 700;
        }

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
            <div className="loading-text">Synthesizing Environment</div>
            <div className="loading-subtext">Compiling IDE parameters and challenge sets...</div>
        </div>
      )}

      {evaluating && (
        <div className="loading-overlay active">
            <div className="loader-ring"></div>
            <div className="loading-text">Evaluating Code</div>
            <div className="loading-subtext">Running your solutions against the test cases...</div>
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

      <section className="config-section">
          <div className="glow-orb orb-1"></div>
          <div className="glow-orb orb-2"></div>
          
          <div className="workspace-panel" data-aos="zoom-in" data-aos-duration="1200">
              <div className="studio-sidebar">
                  <div className="badge-ai">Coding Engine v3</div>
                  <h1 className="studio-display">Generate intelligent <br/><em>coding scenarios</em>.</h1>
                  <p style={{fontSize: '1rem', color: '#555', lineHeight: '1.6'}}>
                      Our engine dynamically generates real-world programming challenges and algorithm tests tailored to your difficulty specifications.
                  </p>
              </div>

              <div className="studio-main-form">
                  <form onSubmit={handleGenerate}>
                      <label className="input-label">Difficulty Level</label>
                      <div className="segmented-control">
                          {['basic', 'intermediate', 'advanced'].map(level => (
                              <div className="segmented-option" key={level}>
                                  <input type="radio" id={level} name="difficulty" value={level} checked={difficulty === level} onChange={(e)=>setDifficulty(e.target.value)} />
                                  <label htmlFor={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</label>
                              </div>
                          ))}
                      </div>

                      <button type="submit" className="submit-btn-c">Initialize Coding Test <i className="fa-solid fa-arrow-right ms-2"></i></button>
                  </form>
              </div>
          </div>
      </section>

      <section className="py-5" style={{ background: 'var(--studio-cream)' }}>
          <div className="container">
              <div className="text-center mb-5" data-aos="fade-up">
                  <h2 className="fw-bold" style={{ fontFamily: "var(--font-heading)", color: 'var(--studio-ink)' }}>Supported Compilers</h2>
                  <p className="text-muted">A dynamic execution environment supporting multiple languages.</p>
              </div>
              <div className="row g-4 justify-content-center text-center">
                  <div className="col-md-2 col-4" data-aos="flip-up" data-aos-delay="100">
                      <div className="p-3 bg-white shadow-sm rounded-3 border" style={{transition: '0.3s', cursor: 'pointer'}} onMouseOver={e => Object.assign(e.currentTarget.style, {transform: 'translateY(-5px)', borderColor: 'var(--studio-accent)'})} onMouseOut={e => Object.assign(e.currentTarget.style, {transform: 'none', borderColor: 'var(--border-subtle)'})}>
                          <i className="fa-brands fa-python fs-1 mb-2" style={{ color: '#3776ab' }}></i>
                          <h6 className="fw-bold mb-0">Python</h6>
                      </div>
                  </div>
                  <div className="col-md-2 col-4" data-aos="flip-up" data-aos-delay="200">
                      <div className="p-3 bg-white shadow-sm rounded-3 border" style={{transition: '0.3s', cursor: 'pointer'}} onMouseOver={e => Object.assign(e.currentTarget.style, {transform: 'translateY(-5px)', borderColor: 'var(--studio-accent)'})} onMouseOut={e => Object.assign(e.currentTarget.style, {transform: 'none', borderColor: 'var(--border-subtle)'})}>
                          <i className="fa-brands fa-js fs-1 mb-2" style={{ color: '#f7df1e' }}></i>
                          <h6 className="fw-bold mb-0">JavaScript</h6>
                      </div>
                  </div>
                  <div className="col-md-2 col-4" data-aos="flip-up" data-aos-delay="300">
                      <div className="p-3 bg-white shadow-sm rounded-3 border" style={{transition: '0.3s', cursor: 'pointer'}} onMouseOver={e => Object.assign(e.currentTarget.style, {transform: 'translateY(-5px)', borderColor: 'var(--studio-accent)'})} onMouseOut={e => Object.assign(e.currentTarget.style, {transform: 'none', borderColor: 'var(--border-subtle)'})}>
                          <i className="fa-brands fa-java fs-1 mb-2" style={{ color: '#b07219' }}></i>
                          <h6 className="fw-bold mb-0">Java</h6>
                      </div>
                  </div>
                  <div className="col-md-2 col-4" data-aos="flip-up" data-aos-delay="400">
                      <div className="p-3 bg-white shadow-sm rounded-3 border" style={{transition: '0.3s', cursor: 'pointer'}} onMouseOver={e => Object.assign(e.currentTarget.style, {transform: 'translateY(-5px)', borderColor: 'var(--studio-accent)'})} onMouseOut={e => Object.assign(e.currentTarget.style, {transform: 'none', borderColor: 'var(--border-subtle)'})}>
                          <i className="fa-brands fa-rust fs-1 mb-2" style={{ color: '#dea584' }}></i>
                          <h6 className="fw-bold mb-0">Rust</h6>
                      </div>
                  </div>
                  <div className="col-md-2 col-4" data-aos="flip-up" data-aos-delay="500">
                      <div className="p-3 bg-white shadow-sm rounded-3 border" style={{transition: '0.3s', cursor: 'pointer'}} onMouseOver={e => Object.assign(e.currentTarget.style, {transform: 'translateY(-5px)', borderColor: 'var(--studio-accent)'})} onMouseOut={e => Object.assign(e.currentTarget.style, {transform: 'none', borderColor: 'var(--border-subtle)'})}>
                          <i className="fa-brands fa-golang fs-1 mb-2" style={{ color: '#00add8' }}></i>
                          <h6 className="fw-bold mb-0">Go</h6>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      <section className="py-5 border-top bg-white">
          <div className="container" data-aos="fade-up" data-aos-duration="1000">
              <div className="row align-items-center">
                  <div className="col-md-5">
                      <div className="p-5 text-center shadow-lg rounded-4" style={{ backgroundColor: 'var(--studio-ink)', color: '#fff' }}>
                          <i className="fa-solid fa-server fs-1 mb-3 text-info"></i>
                          <h4 className="fw-bold">Isolated Execution</h4>
                          <p className="text-white-50 small mb-0">Docker-containerized Sandboxes</p>
                      </div>
                  </div>
                  <div className="col-md-6 offset-md-1 mt-4 mt-md-0">
                      <h2 className="fw-bold mb-4" style={{ fontFamily: "var(--font-heading)", color: 'var(--studio-ink)' }}>Real-time Code Analysis</h2>
                      <p className="text-muted mb-4" style={{ lineHeight: '1.8' }}>
                          TestNova's coding engine doesn't just check the output. It analyzes execution time, memory complexity, and code quality in real-time.
                      </p>
                      <ul className="list-unstyled text-muted">
                          <li className="mb-2"><i className="fa-solid fa-check text-success me-2"></i> Sub-millisecond latency</li>
                          <li className="mb-2"><i className="fa-solid fa-check text-success me-2"></i> AST complexity parsing</li>
                          <li><i className="fa-solid fa-check text-success me-2"></i> Complete network isolation</li>
                      </ul>
                  </div>
              </div>
          </div>
      </section>
    </div>
  );
}
