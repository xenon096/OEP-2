import React, { useState, useEffect } from 'react';
import { resultAPI, examAPI, userAPI } from '../services/api';

const VisualAnalytics = () => {
  const [data, setData] = useState({
    totalStudents: 0,
    totalExams: 0,
    totalResults: 0,
    passRate: 0,
    examAnalytics: []
  });
  const [selectedExamId, setSelectedExamId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      let users = [], exams = [], results = [];
      
      try {
        const [usersRes, examsRes, resultsRes] = await Promise.all([
          userAPI.getAllUsers(),
          examAPI.getAllExams(),
          resultAPI.getAllResults()
        ]);
        
        users = usersRes.data || [];
        exams = examsRes.data || [];
        results = resultsRes.data || [];
      } catch (error) {
        console.error('Error fetching data:', error);
      }

      const students = users.filter(user => user.role === 'STUDENT');
      const validResults = results.filter(result => result.score !== null);
      
      const passedResults = validResults.filter(result => 
        result.passingStatus === 'PASS' || result.passed
      );
      const passRate = validResults.length > 0 ? Math.round((passedResults.length / validResults.length) * 100) : 0;

      const examAnalytics = exams.map(exam => {
        const examResults = validResults.filter(result => result.examId === exam.id);
        
        if (examResults.length === 0) {
          return {
            id: exam.id,
            title: exam.title,
            totalMarks: exam.totalMarks || 100,
            passingMarks: exam.passingMarks || 50,
            attempts: 0,
            passRate: 0,
            topScores: []
          };
        }

        const passedCount = examResults.filter(result => 
          result.passingStatus === 'PASS' || result.passed || result.score >= (exam.passingMarks || 50)
        ).length;
        const passRate = Math.round((passedCount / examResults.length) * 100);

        const topScores = examResults
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .slice(0, 5)
          .map(result => {
            const student = users.find(user => user.id === result.userId);
            return {
              userId: result.userId,
              studentName: student ? student.username : `User ${result.userId}`,
              score: result.score,
              passed: result.passingStatus === 'PASS' || result.passed || result.score >= (exam.passingMarks || 50)
            };
          });

        return {
          id: exam.id,
          title: exam.title,
          totalMarks: exam.totalMarks || 100,
          passingMarks: exam.passingMarks || 50,
          attempts: examResults.length,
          passRate,
          topScores
        };
      }).filter(exam => exam.attempts > 0);

      setData({
        totalStudents: students.length,
        totalExams: exams.length,
        totalResults: validResults.length,
        passRate,
        examAnalytics
      });
      


    } catch (error) {
      console.error('Error processing analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">📊 Loading analytics...</div>;
  }

  const selectedExam = data.examAnalytics.find(e => e.id.toString() === selectedExamId);

  return (
    <div className="visual-analytics">
      <h2>📊 Visual Analytics Dashboard</h2>
      
      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-value">{data.totalStudents}</div>
          <div className="metric-label">Students</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">📝</div>
          <div className="metric-value">{data.totalExams}</div>
          <div className="metric-label">Exams</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">✅</div>
          <div className="metric-value">{data.totalResults}</div>
          <div className="metric-label">Results</div>
        </div>
      </div>

      {/* Individual Exam Analytics */}
      <div className="exam-analytics-section">
        <div className="exam-selector-header">
          <h3>📋 Individual Exam Performance Analysis</h3>
          {data.examAnalytics.length > 0 && (
            <div className="exam-dropdown">
              <label htmlFor="exam-select">📝 Select Exam:</label>
              <select 
                id="exam-select"
                value={selectedExamId} 
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="exam-select"
              >
                <option value="">Choose an exam</option>
                {data.examAnalytics.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title} ({exam.attempts} attempts)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        {data.examAnalytics.length === 0 ? (
          <div className="no-exams">
            <div className="no-data-icon">📝</div>
            <p>No exam data available. Students need to take exams to see analytics.</p>
          </div>
        ) : selectedExam ? (
          <div className="selected-exam-card">
            <div className="exam-card">
              {/* Exam Header */}
              <div className="exam-header">
                <h4 className="exam-title">{selectedExam.title}</h4>
                <div className="exam-meta">
                  <span className="exam-attempts">👥 {selectedExam.attempts} attempts</span>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="exam-metrics">
                <div className="metric pass-rate-metric">
                  <div className="metric-label">Pass Rate</div>
                  <div className="metric-content">
                    <div className="metric-value">{selectedExam.passRate}%</div>
                    <div className="pie-chart-small">
                      <svg width="60" height="60" viewBox="0 0 60 60">
                        <circle
                          cx="30"
                          cy="30"
                          r="25"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="10"
                        />
                        <circle
                          cx="30"
                          cy="30"
                          r="25"
                          fill="none"
                          stroke="#22c55e"
                          strokeWidth="10"
                          strokeDasharray={`${2 * Math.PI * 25}`}
                          strokeDashoffset={`${2 * Math.PI * 25 * (1 - selectedExam.passRate / 100)}`}
                          transform="rotate(-90 30 30)"
                          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="metric">
                  <div className="metric-label">Passing Marks</div>
                  <div className="metric-value">{selectedExam.passingMarks}/{selectedExam.totalMarks}</div>
                </div>
              </div>



              {/* Top Performers */}
              <div className="exam-visual">
                <div className="visual-label">🏆 Top 5 Performers</div>
                <div className="top-performers">
                  {selectedExam.topScores.length === 0 ? (
                    <div className="no-performers">No data available</div>
                  ) : (
                    selectedExam.topScores.map((performer, index) => (
                      <div key={index} className="performer">
                        <div className="performer-rank">#{index + 1}</div>
                        <div className="performer-info">
                          <div className="performer-name">{performer.studentName}</div>
                        </div>
                        <div className="performer-status">
                          {performer.passed ? '✅' : '❌'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="select-exam-message">
            <div className="message-icon">👆</div>
            <p>Please select an exam from the dropdown above to view its analytics.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .visual-analytics {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .loading {
          text-align: center;
          padding: 40px;
          font-size: 18px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .metric-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          transition: transform 0.2s;
        }

        .metric-card:hover {
          transform: translateY(-2px);
        }

        .metric-icon {
          font-size: 32px;
          margin-bottom: 12px;
        }

        .metric-value {
          font-size: 28px;
          font-weight: bold;
          color: var(--primary);
          margin-bottom: 8px;
        }

        .metric-label {
          color: var(--text-secondary);
          font-size: 14px;
        }

        .exam-analytics-section {
          margin-top: 30px;
        }

        .exam-selector-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .exam-selector-header h3 {
          margin: 0;
          color: var(--text);
        }

        .exam-dropdown {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .exam-dropdown label {
          font-size: 14px;
          font-weight: 500;
          color: var(--text);
        }

        .exam-select {
          padding: 8px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--surface);
          color: var(--text);
          font-size: 14px;
          min-width: 250px;
        }

        .exam-select:focus {
          outline: none;
          border-color: var(--primary);
        }

        .selected-exam-card {
          max-width: 600px;
          margin: 0 auto;
        }

        .no-exams, .select-exam-message {
          text-align: center;
          padding: 40px;
          background: var(--surface);
          border-radius: 12px;
          border: 1px solid var(--border);
        }

        .no-data-icon, .message-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .exam-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .exam-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }

        .exam-header {
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 16px;
        }

        .exam-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: var(--text);
        }

        .exam-meta {
          font-size: 14px;
        }

        .exam-attempts {
          color: var(--text-secondary);
        }

        .exam-metrics {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .metric {
          text-align: center;
          padding: 12px;
          background: var(--background);
          border-radius: 8px;
        }

        .pass-rate-metric {
          position: relative;
        }

        .metric-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .pie-chart-small {
          flex-shrink: 0;
        }

        .metric-label {
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .metric-value {
          font-size: 18px;
          font-weight: 600;
          color: var(--primary);
        }

        .exam-visual {
          margin-bottom: 24px;
        }

        .visual-label {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 12px;
          color: var(--text);
        }



        .top-performers {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .performer {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background: var(--background);
          border-radius: 8px;
        }

        .performer-rank {
          font-weight: 600;
          color: var(--primary);
          min-width: 24px;
        }

        .performer-info {
          flex: 1;
        }

        .performer-name {
          font-size: 14px;
          font-weight: 500;
        }

        .performer-status {
          font-size: 16px;
        }

        .no-performers {
          text-align: center;
          color: var(--text-secondary);
          font-style: italic;
          padding: 16px;
        }

        @media (max-width: 768px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .exam-selector-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .exam-dropdown {
            flex-direction: column;
            align-items: stretch;
          }
          
          .exam-select {
            min-width: auto;
          }
          
          .exam-metrics {
            grid-template-columns: 1fr;
          }
          
          .metric-content {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default VisualAnalytics;