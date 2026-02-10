import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { ArrowRight, Check, Camera, Mic, UploadCloud, Activity, UserPlus, List, CheckCircle, Circle, Trash2, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api/v1";

const EnrollmentView = () => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [relation, setRelation] = useState('');
    const [notes, setNotes] = useState('');
    const [images, setImages] = useState([]);
    const [preview, setPreview] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImages([file]);
            setPreview(URL.createObjectURL(file));
        }
    };

    const toggleRecording = () => {
        setIsRecording(!isRecording);
        // Logic for recording would go here
    };

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('relation', relation);
        formData.append('notes', notes);
        if (images[0]) formData.append('files', images[0]);
        // Audio would be appended here if implemented

        try {
            await axios.post(`${API_BASE}/memory/learn_face`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setStep(5);
        } catch (e) {
            alert("Enrollment failed");
        }
    };

    return (
        <div className="enroll-wrapper">
            <div className="progress-bar" style={{ width: `${(step / 5) * 100}%` }}></div>

            {step === 1 && (
                <div className="step-content">
                    <div className="step-number">01 <ArrowRight size={16} /> WHO IS IT?</div>
                    <h1 className="question">What is their name?</h1>
                    <p className="sub-text">We'll use this to identify them.</p>
                    <input className="big-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sarah" autoFocus />
                    <button className="btn-next" onClick={() => setStep(2)}>Next <ArrowRight /></button>
                </div>
            )}

            {step === 2 && (
                <div className="step-content">
                    <div className="step-number">02 <ArrowRight size={16} /> RELATIONSHIP</div>
                    <h1 className="question">Who are they to the patient?</h1>
                    <input className="big-input" value={relation} onChange={e => setRelation(e.target.value)} placeholder="e.g. Daughter" autoFocus />
                    <button className="btn-next" onClick={() => setStep(3)}>Next <ArrowRight /></button>
                </div>
            )}

            {step === 3 && (
                <div className="step-content">
                    <div className="step-number">03 <ArrowRight size={16} /> CONTEXT</div>
                    <h1 className="question">Any important memories?</h1>
                    <textarea className="big-input textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="She lives in Chicago..." />
                    <button className="btn-next" onClick={() => setStep(4)}>Next <ArrowRight /></button>
                </div>
            )}

            {step === 4 && (
                <div className="step-content">
                    <div className="step-number">04 <ArrowRight size={16} /> APPEARANCE</div>
                    <h1 className="question">Upload a clear photo.</h1>
                    <div className="upload-box" onClick={() => fileInputRef.current.click()}>
                        {preview ? <img src={preview} className="preview-img" alt="Preview" /> : <Camera size={48} className="text-gray-400 mx-auto mb-2" />}
                        <p>Click to upload</p>
                    </div>
                    <input type="file" ref={fileInputRef} hidden onChange={handleImageUpload} />

                    <div className="voice-opt">
                        <button className={`btn-next ${isRecording ? 'bg-red-500' : 'bg-blue-500'}`} onClick={toggleRecording}>
                            <Mic /> {isRecording ? "Stop Recording" : "Record Voice Sample (Optional)"}
                        </button>
                    </div>

                    <button className="btn-submit" onClick={handleSubmit}>Finish Enrollment</button>
                </div>
            )}

            {step === 5 && (
                <div className="success-screen">
                    <CheckCircle size={80} color="#10b981" className="mb-4" />
                    <h1>Enrolled Successfully!</h1>
                    <p className="sub-text">The patient will now recognize {name}.</p>
                    <button className="btn-next" onClick={() => { setStep(1); setName(''); setPreview(null); }}>Enroll Another</button>
                </div>
            )}
        </div>
    );
};

const AnalyticsView = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${API_BASE}/quiz/stats`);
                setStats(res.data);
            } catch (e) {
                console.error("Failed to fetch stats", e);
            }
        };
        fetchStats();
    }, []);

    if (!stats) return <div>Loading Analytics...</div>;

    return (
        <div className="analytics-container">
            <div className="stats-header">
                <div className="stat-card">
                    <h3>Average Accuracy</h3>
                    <div className="stat-value">{(stats.average_score * 100).toFixed(0)}%</div>
                </div>
                <div className="stat-card">
                    <h3>Quizzes Taken</h3>
                    <div className="stat-value">{stats.total_quizzes}</div>
                </div>
            </div>

            <div className="chart-wrapper">
                <h3>Memory Recall Trend</h3>
                <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.history}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="date" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                            <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="recent-activity">
                <h3>Recent Activity</h3>
                {stats.history.map((item, idx) => (
                    <div key={idx} className="activity-item">
                        <span>{item.date}</span>
                        <span>{item.type} Quiz</span>
                        <span className={`score-badge ${item.score > 0.8 ? 'high' : item.score > 0.5 ? 'med' : 'low'}`}>
                            {(item.score * 100).toFixed(0)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TaskTrackerView = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const fetchTasks = async () => {
        try {
            const res = await axios.get(`${API_BASE}/caregiver/tasks`);
            setTasks(res.data);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            // Mock patient ID for now or use context if avail
            await axios.post(`${API_BASE}/caregiver/tasks/generate?patient_id=test_patient`);
            fetchTasks();
        } catch (e) {
            alert("Failed to generate tasks: " + e.message);
        } finally {
            setGenerating(false);
        }
    };

    const toggleStatus = async (task) => {
        const newStatus = task.status === 'pending' ? 'done' : 'pending';
        // Optimistic update
        setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: newStatus } : t));
        try {
            await axios.patch(`${API_BASE}/caregiver/tasks/${task._id}?status=${newStatus}`);
        } catch (e) {
            console.error("Failed to update task", e);
            fetchTasks(); // Revert on error
        }
    };

    const deleteTask = async (id) => {
        if (!confirm("Delete this task?")) return;
        setTasks(prev => prev.filter(t => t._id !== id));
        try {
            await axios.delete(`${API_BASE}/caregiver/tasks/${id}`);
        } catch (e) {
            console.error(e);
            fetchTasks();
        }
    };

    if (loading) return <div className="flex-center">Loading Tasks...</div>;

    return (
        <div className="tasks-container">
            <div className="tasks-header">
                <h2>Suggested Caregiver Tasks</h2>
                <button className="btn-generate" onClick={handleGenerate} disabled={generating}>
                    {generating ? <RefreshCw className="spin" size={20} /> : <RefreshCw size={20} />}
                    {generating ? 'Analyzing Chat...' : 'Analyze Chat'}
                </button>
            </div>

            {tasks.length === 0 ? (
                <div className="empty-state">
                    <p>No tasks found. Click "Analyze Chat" to find insights from recent conversations.</p>
                </div>
            ) : (
                <ul className="task-list">
                    {tasks.map(task => (
                        <li key={task._id} className={`task-item ${task.status}`}>
                            <div className="task-left" onClick={() => toggleStatus(task)}>
                                {task.status === 'done' ? <CheckCircle className="check-icon done" /> : <Circle className="check-icon" />}
                                <div>
                                    <span className="task-desc">{task.description}</span>
                                    <span className={`task-tag ${task.category}`}>{task.category}</span>
                                </div>
                            </div>
                            <button className="btn-del" onClick={() => deleteTask(task._id)}><Trash2 size={18} /></button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const CaregiverDashboard = () => {
    const [activeTab, setActiveTab] = useState('enroll'); // 'enroll' | 'analytics' | 'tasks'

    return (
        <div className="dashboard-container">
            <div className="tabs">
                <div className={`tab ${activeTab === 'enroll' ? 'active' : ''}`} onClick={() => setActiveTab('enroll')}>
                    <UserPlus size={20} />
                    Enrollment
                </div>
                <div className={`tab ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
                    <List size={20} />
                    Tasks
                </div>
                <div className={`tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
                    <Activity size={20} />
                    Analytics
                </div>
            </div>

            <div className="dashboard-content">
                {activeTab === 'enroll' && <EnrollmentView />}
                {activeTab === 'tasks' && <TaskTrackerView />}
                {activeTab === 'analytics' && <AnalyticsView />}
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

                /* TASKS STYLES */
                .tasks-container { max-width: 800px; margin: 0 auto; padding: 20px; }
                .tasks-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
                .btn-generate { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 8px; display: flex; align-items: center; gap: 10px; cursor: pointer; }
                .btn-generate:hover { background: #2563eb; }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }

                .task-list { list-style: none; padding: 0; }
                .task-item { display: flex; justify-content: space-between; align-items: center; background: rgba(30, 41, 59, 0.5); padding: 15px 20px; margin-bottom: 10px; border-radius: 12px; transition: 0.2s; border: 1px solid transparent; }
                .task-item:hover { border-color: #475569; }
                .task-item.done { opacity: 0.5; }
                .task-item.done .task-desc { text-decoration: line-through; }
                
                .task-left { display: flex; align-items: center; gap: 15px; cursor: pointer; flex: 1; }
                .check-icon { color: #64748b; }
                .check-icon.done { color: #10b981; }
                
                .task-tag { font-size: 0.75rem; padding: 2px 8px; border-radius: 4px; margin-left: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
                .task-tag.health { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
                .task-tag.social { background: rgba(139, 92, 246, 0.2); color: #8b5cf6; }
                .task-tag.logistics { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
                
                .btn-del { background: transparent; border: none; color: #ef4444; opacity: 0.5; cursor: pointer; padding: 5px; }
                .btn-del:hover { opacity: 1; background: rgba(239, 68, 68, 0.1); border-radius: 4px; }
            `}</style>
        </div>
    );
};

export default CaregiverDashboard;
