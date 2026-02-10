import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Brain, CheckCircle, XCircle, Award } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api/v1";

const PatientQuiz = ({ onFinish }) => {
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [feedback, setFeedback] = useState(null); // 'correct' or 'incorrect'
    const [error, setError] = useState("");

    useEffect(() => {
        fetchQuiz();
    }, []);

    const fetchQuiz = async () => {
        try {
            const res = await axios.get(`${API_BASE}/quiz/daily`);
            if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                setQuestions(res.data);
            } else {
                setError("No new memories to quiz you on yet! Enroll some people first.");
            }
        } catch (err) {
            console.error(err);
            setError("Could not load your daily quiz. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = async (option) => {
        const currentQ = questions[currentIndex];
        const isCorrect = option === currentQ.correct_answer;

        if (isCorrect) {
            setScore(prev => prev + 1);
            setFeedback('correct');
            playSound('correct');
        } else {
            setFeedback('incorrect');
            playSound('incorrect');
        }

        // Send result to backend
        try {
            await axios.post(`${API_BASE}/quiz/submit`, {
                question: currentQ.question,
                expected_answer: currentQ.correct_answer,
                patient_response: option,
                context_type: currentQ.context_type
            });
        } catch (e) { console.error(e); }

        setTimeout(() => {
            setFeedback(null);
            if (currentIndex < questions.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                setShowResult(true);
                playSound('complete');
            }
        }, 1500);
    };

    const playSound = (type) => {
        const synth = window.speechSynthesis;
        if (type === 'correct') {
            const u = new SpeechSynthesisUtterance("That is correct! Well done.");
            synth.speak(u);
        } else if (type === 'incorrect') {
            const u = new SpeechSynthesisUtterance("Not quite. Let's try the next one.");
            synth.speak(u);
        } else if (type === 'complete') {
            const u = new SpeechSynthesisUtterance(`Quiz complete. You got ${score + (feedback === 'correct' ? 1 : 0)} out of ${questions.length}.`);
            synth.speak(u);
        }
    };

    if (loading) {
        return (
            <div className="quiz-container loading">
                <Brain size={64} className="animate-pulse text-purple-400" />
                <h2>Generating your Daily Memory Quiz...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="quiz-container error">
                <XCircle size={64} className="text-red-400" />
                <h2>{error}</h2>
                <button className="btn-primary" onClick={onFinish}>Go Back</button>
            </div>
        );
    }

    if (showResult) {
        return (
            <div className="quiz-container result">
                <Award size={80} className="text-yellow-400 mb-4" />
                <h1>Quiz Complete!</h1>
                <p className="score-text">You scored {score} / {questions.length}</p>
                <div className="actions">
                    <button className="btn-primary" onClick={onFinish}>Back to Home</button>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentIndex];

    return (
        <div className="quiz-container">
            <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
            </div>

            <div className={`question-card ${feedback}`}>
                <h2 className="question-text">{currentQ.question}</h2>

                <div className="options-grid">
                    {currentQ.options.map((opt, idx) => (
                        <button
                            key={idx}
                            className={`option-btn ${feedback && opt === currentQ.correct_answer ? 'correct' : ''} ${feedback === 'incorrect' && opt !== currentQ.correct_answer ? 'disabled' : ''}`}
                            onClick={() => !feedback && handleAnswer(opt)}
                            disabled={!!feedback}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {feedback === 'correct' && (
                    <div className="feedback correct">
                        <CheckCircle size={32} />
                        <span>Correct!</span>
                    </div>
                )}

                {feedback === 'incorrect' && (
                    <div className="feedback incorrect">
                        <XCircle size={32} />
                        <span>The correct answer was {currentQ.correct_answer}</span>
                    </div>
                )}
            </div>

            <style>{`
                .quiz-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    padding: 2rem;
                    color: white;
                    text-align: center;
                }
                .question-card {
                    background: rgba(30, 41, 59, 0.8);
                    padding: 2rem;
                    border-radius: 20px;
                    width: 100%;
                    max-width: 800px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.1);
                    transition: 0.3s;
                }
                .question-text {
                    font-size: 2rem;
                    margin-bottom: 2rem;
                    font-weight: 600;
                }
                .options-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                .option-btn {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 1.5rem;
                    font-size: 1.25rem;
                    color: white;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .option-btn:hover:not(:disabled) {
                    background: rgba(139, 92, 246, 0.2);
                    border-color: #8b5cf6;
                }
                .option-btn.correct {
                    background: rgba(34, 197, 94, 0.2);
                    border-color: #22c55e;
                }
                .option-btn.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .feedback {
                    margin-top: 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    font-size: 1.5rem;
                    font-weight: bold;
                }
                .feedback.correct { color: #4ade80; }
                .feedback.incorrect { color: #f87171; }
                
                .progress-bar {
                    width: 100%;
                    max-width: 800px;
                    height: 8px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 4px;
                    margin-bottom: 2rem;
                    overflow: hidden;
                }
                .progress-fill {
                    height: 100%;
                    background: #8b5cf6;
                    transition: width 0.5s ease;
                }
                .btn-primary {
                    background: #8b5cf6;
                    color: white;
                    padding: 1rem 2rem;
                    border-radius: 12px;
                    font-size: 1.2rem;
                    border: none;
                    cursor: pointer;
                    margin-top: 1rem;
                }
            `}</style>
        </div>
    );
};

export default PatientQuiz;
