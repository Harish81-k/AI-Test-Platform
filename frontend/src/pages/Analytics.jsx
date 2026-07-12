import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';

export default function Analytics() {
  const [data, setData] = useState(null);
  
  const assessmentLineRef = useRef(null);
  const assessmentBarRef = useRef(null);
  const codingLineRef = useRef(null);
  const codingBarRef = useRef(null);
  
  const assessmentLineChartInst = useRef(null);
  const assessmentBarChartInst = useRef(null);
  const codingLineChartInst = useRef(null);
  const codingBarChartInst = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('results/analytics/');
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!data) return;

    // Theme Colors
    const colorInk = '#0a192f';
    const colorAccent = '#a39074';
    const colorSecondary = '#64748b';
    const colorGrid = 'rgba(0, 0, 0, 0.05)';

    Chart.defaults.color = colorSecondary;
    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
    Chart.defaults.font.size = 13;

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: { beginAtZero: true, max: 100, grid: { color: colorGrid }, title: { display: true, text: 'Percentage (%)', color: colorSecondary, font: { weight: '600' } } },
            x: { grid: { display: false } }
        },
        plugins: {
            legend: { labels: { color: colorInk, font: { weight: '600' } } },
            tooltip: { backgroundColor: 'rgba(10, 25, 47, 0.9)', padding: 12, cornerRadius: 8 }
        }
    };

    const initChart = (ref, instRef, type, labels, label, chartData, pointBg) => {
        if (!ref.current) return;
        if (instRef.current) instRef.current.destroy();
        
        const dataset = {
            label: label,
            data: chartData,
            backgroundColor: type === 'line' ? 'rgba(10, 25, 47, 0.05)' : colorAccent,
            borderColor: type === 'line' ? colorInk : 'transparent',
            borderWidth: type === 'line' ? 3 : 0,
            borderRadius: type === 'bar' ? 6 : 0,
            barThickness: type === 'bar' ? 30 : undefined
        };

        if (type === 'line') {
            dataset.fill = true;
            dataset.tension = 0.4;
            dataset.pointBackgroundColor = pointBg;
            dataset.pointBorderColor = '#fff';
            dataset.pointBorderWidth = 2;
            dataset.pointRadius = 5;
            dataset.pointHoverRadius = 7;
        }

        instRef.current = new Chart(ref.current, {
            type: type,
            data: { labels: labels, datasets: [dataset] },
            options: commonOptions
        });
    };

    initChart(assessmentLineRef, assessmentLineChartInst, 'line', data.assessment_dates, 'Overall Score', data.assessment_scores, colorAccent);
    initChart(assessmentBarRef, assessmentBarChartInst, 'bar', data.topics, 'Avg Mastery', data.topic_averages, null);
    initChart(codingLineRef, codingLineChartInst, 'line', data.coding_dates, 'Coding Score', data.coding_scores, colorAccent);
    initChart(codingBarRef, codingBarChartInst, 'bar', data.difficulties, 'Avg Mastery', data.difficulty_averages, null);

  }, [data]);

  if (!data) return <div className="text-center py-5">Loading analytics...</div>;

  return (
    <div className="container py-5" style={{ maxWidth: '1200px' }}>
      <style>{`
        .chart-container { position: relative; height: 320px; width: 100%; }
        .analytics-title { font-family: 'Fraunces', serif; font-size: 2.8rem; font-weight: 600; color: #0a192f; letter-spacing: -0.02em; margin-bottom: 8px; }
        .analytics-tabs .nav-link { font-family: 'Plus Jakarta Sans', sans-serif; color: #666; background: transparent; border: 1px solid rgba(0,0,0,0.08); border-radius: 50px; padding: 12px 24px; font-weight: 600; font-size: 0.95rem; transition: all 0.3s ease; }
        .analytics-tabs .nav-link:hover { background: #fff; border-color: #ccc; color: #0a192f; }
        .analytics-tabs .nav-link.active { background: #0a192f; color: #fff; border-color: #0a192f; box-shadow: 0 4px 15px rgba(10, 25, 47, 0.15); }
        .premium-glass-card { background: rgba(255, 255, 255, 0.95); border: 1px solid rgba(0,0,0,0.08); border-radius: 16px; padding: 30px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02); transition: transform 0.3s ease; }
        .premium-glass-card:hover { transform: translateY(-4px); }
        .chart-title { font-family: 'Fraunces', serif; font-size: 1.4rem; font-weight: 500; color: #0a192f; margin-bottom: 24px; }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
              <h1 className="analytics-title">Performance Analytics</h1>
              <p className="text-muted" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Monitor your continuous growth and assessment telemetry.</p>
          </div>

          <div className="d-flex align-items-center gap-4">
              <div className="d-flex align-items-center px-3 py-2 rounded-pill shadow-sm bg-white" style={{ border: '1px solid rgba(0,0,0,0.08)', color: '#856404', fontSize: '0.95rem' }}>
                  <i className="fa-solid fa-fire text-danger me-2 fs-5"></i>
                  <span className="fw-bold text-dark">{data.streak || 0} Day Streak</span>
              </div>
              
              <div className="d-flex align-items-center gap-3 bg-white px-3 py-2 rounded-pill shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
                  <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '36px', height: '36px', backgroundColor: '#0a192f', color: 'white', fontWeight: '600', fontSize: '1rem' }}>
                      U
                  </div>
                  <span className="fw-semibold text-dark pe-2">User</span>
              </div>
          </div>
      </div>

      <ul className="nav nav-pills mb-5 analytics-tabs" id="analyticsTabs" role="tablist">
          <li className="nav-item" role="presentation">
              <button className="nav-link active" id="assessment-tab" data-bs-toggle="tab" data-bs-target="#assessment" type="button" role="tab" aria-controls="assessment" aria-selected="true">
                  <i className="fa-solid fa-puzzle-piece me-2"></i> Assessment Analytics
              </button>
          </li>
          <li className="nav-item ms-3" role="presentation">
              <button className="nav-link" id="coding-tab" data-bs-toggle="tab" data-bs-target="#coding" type="button" role="tab" aria-controls="coding" aria-selected="false">
                  <i className="fa-solid fa-code me-2"></i> Coding Analytics
              </button>
          </li>
      </ul>

      <div className="tab-content" id="analyticsTabsContent">
          <div className="tab-pane fade show active" id="assessment" role="tabpanel" aria-labelledby="assessment-tab">
              <div className="row g-4">
                  <div className="col-lg-8">
                      <div className="premium-glass-card h-100">
                          <h5 className="chart-title">Scores Over Time</h5>
                          <div className="chart-container">
                              <canvas ref={assessmentLineRef}></canvas>
                          </div>
                      </div>
                  </div>
                  <div className="col-lg-4">
                      <div className="premium-glass-card h-100">
                          <h5 className="chart-title">Average by Topic</h5>
                          <div className="chart-container">
                              <canvas ref={assessmentBarRef}></canvas>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          <div className="tab-pane fade" id="coding" role="tabpanel" aria-labelledby="coding-tab">
              <div className="row g-4">
                  <div className="col-lg-8">
                      <div className="premium-glass-card h-100">
                          <h5 className="chart-title">Scores Over Time</h5>
                          <div className="chart-container">
                              <canvas ref={codingLineRef}></canvas>
                          </div>
                      </div>
                  </div>
                  <div className="col-lg-4">
                      <div className="premium-glass-card h-100">
                          <h5 className="chart-title">Average by Difficulty</h5>
                          <div className="chart-container">
                              <canvas ref={codingBarRef}></canvas>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
