import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { ArrowRight, Check, Camera, Mic, UploadCloud, Activity, UserPlus } from 'lucide-react';
import AudioRecorder from '../components/AudioRecorder';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/*
  Caregiver Dashboard
  - Tab 1: Enrollment (Typeform Style)
  - Tab 2: Analytics (Memory Progress)
*/

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api/v1";

const EnrollmentView = () => {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({ name: '', relation: '', notes: '', age: '' });
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [status, setStatus] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, [step]);

    const handleNext = () => {
        if (step === 0 && !formData.name) return alert("Please enter a name.");
        if (step === 2 && !file) return alert("Please upload a photo.");
        setStep(prev => prev + 1);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && step !== 3) handleNext();
    };

    const handleSubmit = async () => {
        setStatus('submitting');
        const data = new FormData();
        data.append('name', formData.name);
        data.append('relation', formData.relation || 'Acquaintance');
        data.append('notes', formData.notes);
        data.append('file', file);
        if (audioBlob) data.append('audio_file', audioBlob, 'voice.webm');

        try {
            const res = await axios.post(`${API_BASE}/remember/person`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.status === 'stored') {
                setStatus('success');
                setTimeout(() => {
                    setStep(0);
                    setFormData({ name: '', relation: '', notes: '', age: '' });
                    setFile(null);
                    setFilePreview(null);
                    setAudioBlob(null);
                    setStatus(null);
                }, 3000);
            }
        } catch (e) {
            console.error(e);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="success-screen">
                <h1>All done! 🎉</h1>
                <p>Memory has been securely stored.</p>
            </div>
        );
    }

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <div className="step-content">
                        <h2 className="step-number">1 <span className="arrow">→</span></h2>
                        <h1 className="question">What is the person's name?</h1>
                        <p className="sub-text">We'll use this to identify them.</p>
                        <input
                            ref={inputRef}
                            className="big-input"
                            placeholder="Type name..."
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            onKeyDown={handleKeyDown}
                        />
                        <button className="btn-next" onClick={handleNext}>OK <Check size={18} /></button>
                    </div>
                );
            case 1:
                return (
                    <div className="step-content">
                        <h2 className="step-number">2 <span className="arrow">→</span></h2>
                        <h1 className="question">How are they related?</h1>
                        <p className="sub-text">Sister, Doctor, Old Friend...</p>
                        <input
                            ref={inputRef}
                            className="big-input"
                            placeholder="Type relationship..."
                            value={formData.relation}
                            onChange={e => setFormData({ ...formData, relation: e.target.value })}
                            onKeyDown={handleKeyDown}
                        />
                        <button className="btn-next" onClick={handleNext}>OK <Check size={18} /></button>
                    </div>
                );
            case 2:
                return (
                    <div className="step-content">
                        <h2 className="step-number">3 <span className="arrow">→</span></h2>
                        <h1 className="question">Upload a photo.</h1>
                        <p className="sub-text">A clear face photo works best.</p>

                        <div className="upload-box" onClick={() => document.getElementById('file-upload').click()}>
                            {filePreview ? (
                                <img src={filePreview} className="preview-img" alt="Preview" />
                            ) : (
                                <div className="upload-placeholder">
                                    <Camera size={48} className="icon-pulse" />
                                    <span>Click to Upload</span>
                                </div>
                            )}
                            <input id="file-upload" type="file" accept="image/*" onChange={e => {
                                const f = e.target.files[0];
                                if (f) { setFile(f); setFilePreview(URL.createObjectURL(f)); }
                            }} hidden />
                        </div>

                        {file && <button className="btn-next" onClick={handleNext}>OK <Check size={18} /></button>}
                    </div>
                );
            case 3:
                return (
                    <div className="step-content">
                        <h2 className="step-number">4 <span className="arrow">→</span></h2>
                        <h1 className="question">Any context or notes?</h1>
                        <p className="sub-text">"She likes coffee", "He is your neighbor"...</p>
                        <textarea
                            ref={inputRef}
                            className="big-input textarea"
                            placeholder="Type here..."
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        />

                        <div className="voice-opt">
                            <span style={{ opacity: 0.7, marginRight: 10 }}>Voice Sample (Optional):</span>
                            <AudioRecorder onRecordingComplete={setAudioBlob} />
                        </div>

                        <button className="btn-submit" onClick={handleSubmit}>
                            {status === 'submitting' ? 'Saving...' : 'Submit'}
                        </button>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="enroll-wrapper">
            <div className="progress-bar" style={{ width: `${(step + 1) * 25}%` }}></div>
            {renderStep()}
        </div>
    );
}

const AnalyticsView = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${API_BASE}/quiz/stats`);
                setStats(res.data);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="flex-center">Loading Analytics...</div>;

    if (!stats || stats.history.length === 0) return (
        <div className="empty-state">
            <h2>No Memory Data Yet</h2>
            <p>Once the patient starts interacting with the memory quiz, data will appear here.</p>
        </div>
    );

    return (
        <div className="analytics-container">
            <div className="stats-header">
                <div className="stat-card">
                    <h3>Average Accuracy</h3>
                    <div className="stat-value">{(stats.average_score * 100).toFixed(1)}%</div>
                </div>
                <div className="stat-card">
                    <h3>Total Interactions</h3>
                    <div className="stat-value">{stats.total_quizzes}</div>
                </div>
            </div>

            <div className="chart-wrapper">
                <h3>Memory Recall Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="date" stroke="#94a3b8" tickFormatter={(t) => t.split(' ')[0]} />
                        <YAxis stroke="#94a3b8" domain={[0, 1]} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                            itemStyle={{ color: '#a78bfa' }}
                        />
                        <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="recent-activity">
                <h3>Recent Activity</h3>
                <ul>
                    {stats.history.slice(0, 5).map((item, idx) => (
                        <li key={idx} className="activity-item">
                            <span>{item.date}</span>
                            <span className={`score-badge ${item.score > 0.8 ? 'high' : item.score > 0.5 ? 'med' : 'low'}`}>
                                {(item.score * 100).toFixed(0)}%
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const CaregiverDashboard = () => {
    const [activeTab, setActiveTab] = useState('enroll'); // 'enroll' | 'analytics'

    return (
        <div className="dashboard-container">
            <div className="tabs">
                <div className={`tab ${activeTab === 'enroll' ? 'active' : ''}`} onClick={() => setActiveTab('enroll')}>
                    <UserPlus size={20} />
                    Enrollment
                </div>
                <div className={`tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
                    <Activity size={20} />
                    Analytics
                </div>
            </div>

            <div className="dashboard-content">
                {activeTab === 'enroll' ? <EnrollmentView /> : <AnalyticsView />}
            </div>

            <style>{`
                .dashboard-container {
                    min-height: 100vh;
                    background: #0f172a;
                    color: white;
                    font-family: 'Inter', system-ui, sans-serif;
                    padding-top: 20px;
                }
                .tabs {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin-bottom: 40px;
                }
                .tab {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: rgba(30, 41, 59, 0.5);
                    border-radius: 20px;
                    cursor: pointer;
                    color: #94a3b8;
                    transition: 0.2s;
                    border: 1px solid transparent;
                }
                .tab:hover { background: rgba(30, 41, 59, 0.8); color: white; }
                .tab.active {
                    background: #8b5cf6;
                    color: white;
                    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
                }

                .enroll-wrapper {
                    display: flex;
                    justify-content: center;
                    max-width: 800px;
                    margin: 0 auto;
                    position: relative;
                }
                
                /* Analytics Styles */
                .analytics-container {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .stats-header {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .stat-card {
                    background: rgba(30, 41, 59, 0.5);
                    padding: 20px;
                    border-radius: 16px;
                    border: 1px solid #334155;
                    text-align: center;
                }
                .stat-card h3 { color: #94a3b8; margin: 0 0 10px; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
                .stat-value { font-size: 3rem; font-weight: bold; color: white; }
                
                .chart-wrapper {
                    background: rgba(30, 41, 59, 0.5);
                    padding: 30px;
                    border-radius: 24px;
                    border: 1px solid #334155;
                    margin-bottom: 30px;
                }
                .chart-wrapper h3 { margin-top: 0; margin-bottom: 20px; }

                .recent-activity h3 { border-bottom: 1px solid #334155; padding-bottom: 10px; margin-bottom: 15px; }
                .activity-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 15px 0;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .score-badge { padding: 4px 12px; border-radius: 12px; font-weight: bold; font-size: 0.9rem; }
                .score-badge.high { background: rgba(16, 185, 129, 0.2); color: #10b981; }
                .score-badge.med { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
                .score-badge.low { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

                .empty-state { text-align: center; padding: 50px; color: #94a3b8; }

                /* RECYCLED ENROLLMENT STYLES */
                .progress-bar { position: absolute; top: 0; left: 0; height: 4px; background: #8b5cf6; transition: width 0.5s ease; }
                .step-number { font-size: 1.2rem; color: #8b5cf6; margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
                .arrow { font-size: 1.5rem; }
                .question { font-size: 2.5rem; margin-bottom: 15px; font-weight: 300; line-height: 1.2; }
                .sub-text { font-size: 1.2rem; color: #94a3b8; margin-bottom: 40px; }
                .big-input { width: 100%; background: transparent; border: none; border-bottom: 2px solid rgba(255,255,255,0.2); color: #a78bfa; font-size: 2rem; padding: 10px 0; outline: none; margin-bottom: 30px; }
                .big-input:focus { border-color: #8b5cf6; }
                .textarea { height: 100px; resize: none; font-size: 1.5rem; }
                .btn-next { background: #8b5cf6; color: white; border: none; padding: 12px 24px; border-radius: 4px; font-size: 1.2rem; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; }
                .upload-box { border: 2px dashed #475569; border-radius: 12px; padding: 40px; text-align: center; cursor: pointer; margin-bottom: 30px; }
                .preview-img { max-height: 300px; border-radius: 8px; }
                .btn-submit { background: #10b981; color: white; border: none; padding: 15px 40px; border-radius: 30px; font-size: 1.5rem; font-weight: bold; cursor: pointer; margin-top: 20px; }
                .success-screen { height: 50vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
                .success-screen h1 { font-size: 3rem; color: #10b981; }
                .voice-opt { margin-bottom: 30px; display: flex; align-items: center; }
            `}</style>
        </div>
    );
};

export default CaregiverDashboard;
