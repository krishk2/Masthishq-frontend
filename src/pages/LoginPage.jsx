import React, { useState } from 'react';
import axios from 'axios';
import { User, HeartHandshake, ArrowRight, Lock, Mail, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api/v1";

const LoginPage = ({ onSelectRole }) => {
    const [step, setStep] = useState('role_selection'); // 'role_selection', 'auth'
    const [role, setRole] = useState(null);
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form Data
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        fullName: ""
    });

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        setStep('auth');
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (isLogin) {
                // Login Flow (OAuth2 Form Data)
                const params = new URLSearchParams();
                params.append('username', formData.email);
                params.append('password', formData.password);

                const res = await axios.post(`${API_BASE}/auth/login`, params);
                const { access_token, role } = res.data;

                localStorage.setItem('token', access_token);
                localStorage.setItem('role', role);
                onSelectRole(role);
            } else {
                // Register Flow
                await axios.post(`${API_BASE}/auth/register`, {
                    email: formData.email,
                    password: formData.password,
                    full_name: formData.fullName,
                    role: role
                });

                // Auto-login after register
                const params = new URLSearchParams();
                params.append('username', formData.email);
                params.append('password', formData.password);
                const res = await axios.post(`${API_BASE}/auth/login`, params);

                localStorage.setItem('token', res.data.access_token);
                localStorage.setItem('role', res.data.role);
                onSelectRole(role);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || "Authentication failed. Please check credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="bg-glow"></div>

            {step === 'role_selection' ? (
                <div className="cards-wrapper">
                    {/* Patient Card */}
                    <div className="role-card patient-card" onClick={() => handleRoleSelect('patient')}>
                        <div className="icon-wrapper patient-icon">
                            <User size={48} color="white" />
                        </div>
                        <h2 className="role-title">I am a User</h2>
                        <p className="role-desc">Access your assistant, memory aid, and companion.</p>
                        <div className="role-btn-wrapper">
                            <span className="role-btn patient-btn">Enter Masthishq &rarr;</span>
                        </div>
                    </div>

                    {/* Caregiver Card */}
                    <div className="role-card caregiver-card" onClick={() => handleRoleSelect('caregiver')}>
                        <div className="icon-wrapper caregiver-icon">
                            <HeartHandshake size={48} color="white" />
                        </div>
                        <h2 className="role-title">I am a Caregiver</h2>
                        <p className="role-desc">Enroll memories, manage settings, and helping loved ones.</p>
                        <div className="role-btn-wrapper">
                            <span className="role-btn caregiver-btn">Manage Care &rarr;</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="auth-form-wrapper">
                    <button className="back-btn" onClick={() => setStep('role_selection')}>&larr; Back</button>

                    <div className="auth-card">
                        <div className={`icon-wrapper ${role === 'patient' ? 'patient-icon' : 'caregiver-icon'}`}>
                            {role === 'patient' ? <User size={32} color="white" /> : <HeartHandshake size={32} color="white" />}
                        </div>

                        <h2 className="auth-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                        <p className="auth-subtitle">{role === 'patient' ? 'User Portal' : 'Caregiver Portal'}</p>

                        <form onSubmit={handleSubmit} className="auth-form">
                            {!isLogin && (
                                <div className="input-group">
                                    <User size={18} className="input-icon" />
                                    <input
                                        type="text" placeholder="Full Name" required
                                        value={formData.fullName}
                                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="input-group">
                                <Mail size={18} className="input-icon" />
                                <input
                                    type="email" placeholder="Email Address" required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="input-group">
                                <Lock size={18} className="input-icon" />
                                <input
                                    type="password" placeholder="Password" required
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            {error && <div className="error-msg">{error}</div>}

                            <button type="submit" className={`submit-btn ${role === 'patient' ? 'patient-btn' : 'caregiver-btn'}`} disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Sign In' : 'Sign Up')}
                            </button>
                        </form>

                        <div className="toggle-text">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <span onClick={() => { setIsLogin(!isLogin); setError(""); }}>
                                {isLogin ? 'Sign Up' : 'Log In'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .login-container {
            min-height: 100vh;
            background: #0f172a;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            font-family: system-ui, sans-serif;
            color: white;
        }
        /* ... Existing Styles Recycled ... */
        .bg-glow {
            position: absolute;
            width: 800px;
            height: 800px;
            background: rgba(124, 58, 237, 0.1);
            border-radius: 50%;
            filter: blur(100px);
            z-index: 0;
            pointer-events: none;
        }
        .cards-wrapper {
            position: relative;
            z-index: 10;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            width: 100%;
            max-width: 900px;
            padding: 20px;
        }
        .role-card {
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid #334155;
            padding: 40px;
            border-radius: 24px;
            cursor: pointer;
            text-align: center;
            transition: 0.3s;
            backdrop-filter: blur(10px);
        }
        .role-card:hover { transform: translateY(-10px); }
        .patient-card:hover { border-color: #8b5cf6; background: rgba(30, 41, 59, 0.8); }
        .caregiver-card:hover { border-color: #10b981; background: rgba(30, 41, 59, 0.8); }

        .icon-wrapper {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            margin: 0 auto 25px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .patient-icon { background: linear-gradient(135deg, #8b5cf6, #3b82f6); }
        .caregiver-icon { background: linear-gradient(135deg, #10b981, #059669); }

        .role-title { color: white; margin: 0 0 10px; font-size: 2rem; }
        .role-desc { color: #94a3b8; font-size: 1.1rem; line-height: 1.5; }

        .role-btn-wrapper { margin-top: 30px; }
        .role-btn {
            padding: 10px 25px;
            border-radius: 30px;
            border: 1px solid rgba(255,255,255,0.2);
            color: white;
            transition: 0.2s;
            display: inline-block;
        }
        .patient-card:hover .patient-btn { background: #8b5cf6; border-color: #8b5cf6; }
        .caregiver-card:hover .caregiver-btn { background: #10b981; border-color: #10b981; }

        /* Auth Form Styles */
        .auth-form-wrapper {
            z-index: 20;
            width: 100%;
            max-width: 400px;
            animation: fadeIn 0.5s ease;
        }
        .auth-card {
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid #334155;
            padding: 40px;
            border-radius: 24px;
            backdrop-filter: blur(20px);
            text-align: center;
        }
        .auth-title { font-size: 1.8rem; margin-bottom: 5px; }
        .auth-subtitle { color: #94a3b8; margin-bottom: 30px; }
        
        .input-group {
            position: relative;
            margin-bottom: 15px;
        }
        .input-icon {
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: #94a3b8;
        }
        .auth-form input {
            width: 100%;
            padding: 12px 12px 12px 45px;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid #334155;
            border-radius: 12px;
            color: white;
            outline: none;
            transition: 0.2s;
        }
        .auth-form input:focus { border-color: #8b5cf6; }
        
        .submit-btn {
            width: 100%;
            padding: 12px;
            border-radius: 12px;
            border: none;
            color: white;
            font-weight: bold;
            cursor: pointer;
            margin-top: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .patient-btn { background: #8b5cf6; }
        .patient-btn:hover { background: #7c3aed; }
        .caregiver-btn { background: #10b981; }
        .caregiver-btn:hover { background: #059669; }

        .toggle-text {
            margin-top: 20px;
            font-size: 0.9rem;
            color: #94a3b8;
        }
        .toggle-text span {
            color: white;
            cursor: pointer;
            font-weight: bold;
            margin-left: 5px;
        }
        .toggle-text span:hover { text-decoration: underline; }

        .back-btn {
            background: none;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            margin-bottom: 20px;
            font-size: 0.9rem;
        }
        .back-btn:hover { color: white; }
        .error-msg {
            color: #ef4444;
            font-size: 0.85rem;
            margin-bottom: 10px;
            background: rgba(239, 68, 68, 0.1);
            padding: 8px;
            border-radius: 8px;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
            .cards-wrapper { grid-template-columns: 1fr; }
        }
      `}</style>
        </div>
    );
};

export default LoginPage;
