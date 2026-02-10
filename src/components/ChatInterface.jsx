import React, { useState, useEffect, useRef } from 'react';
import { Send, Volume2, User, Package, UserPlus, PackagePlus, Sparkles, Camera, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CameraView from './CameraView'; // Import CameraView

function ChatInterface({
    messages,
    onSendMessage,
    suggestions = [],
    onSuggestionClick,
    onPlayAudio,
    onCapture,
    onScanFace,
    onScanObject,
    onEnroll,
    onEnrollObject,
    isTyping,
    typingStatus,
    captureTrigger,
    enrollType
}) {
    const [input, setInput] = useState("");
    const [showTools, setShowTools] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [cameraMode, setCameraMode] = useState('person');
    const endRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping, showCamera]);

    // Handle External Capture Trigger (e.g. Enrollment)
    useEffect(() => {
        if (captureTrigger && captureTrigger > 0) {
            setCameraMode(enrollType || 'person');
            setShowCamera(true);
        }
    }, [captureTrigger, enrollType]);

    const handleSend = () => {
        if (!input.trim()) return;
        onSendMessage(input);
        setInput("");
    };

    const handleCameraCapture = (blob) => {
        onCapture(blob);
        setShowCamera(false);
    };

    const openCamera = (mode) => {
        if (mode === 'person') onScanFace();
        else onScanObject();
        setCameraMode(mode);
        setShowCamera(true);
    };

    return (
        <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-xl border-l border-white/5 relative">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-slate-900/80 sticky top-0 z-10">
                <Sparkles className="text-purple-400" size={20} />
                <h2 className="font-semibold text-slate-200 text-sm tracking-wide uppercase">Convolve Memory</h2>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide" ref={containerRef}>
                {messages.length === 0 && !showCamera && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 opacity-60">
                        <div className="p-4 bg-slate-800 rounded-full mb-2 animate-pulse">
                            <Sparkles size={40} className="text-purple-500" />
                        </div>
                        <h2 className="text-lg font-medium">How can I help you?</h2>
                    </div>
                )}

                <AnimatePresence mode="popLayout">
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${msg.role === 'user'
                                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                                    : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                                    }`}>
                                    {msg.role === 'user' ? <User size={14} className="text-white" /> : <Sparkles size={14} className="text-white" />}
                                </div>

                                {/* Content Bubble */}
                                <div className={`flex flex-col space-y-2 p-4 shadow-xl backdrop-blur-sm border border-white/5 ${msg.role === 'user'
                                    ? 'bg-indigo-600/90 text-white rounded-2xl rounded-tr-none'
                                    : 'bg-slate-800/90 text-slate-200 rounded-2xl rounded-tl-none'
                                    }`}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                    {msg.image && (
                                        <motion.img
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            src={msg.image.startsWith('data:') ? msg.image : `data:image/jpeg;base64,${msg.image}`}
                                            alt="Visual Memory"
                                            className="rounded-lg max-h-64 w-full object-contain border border-white/10 bg-black/40"
                                        />
                                    )}
                                    {msg.gallery && msg.gallery.length > 0 && (
                                        <div className="flex gap-2 overflow-x-auto py-2 scroll-smooth no-scrollbar">
                                            {msg.gallery.map((img, idx) => (
                                                <img
                                                    key={idx}
                                                    src={img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`}
                                                    className="w-16 h-16 rounded-md object-cover border border-white/10 hover:scale-110 transition-transform cursor-pointer"
                                                />
                                            ))}
                                        </div>
                                    )}
                                    {msg.audioUrl && (
                                        <button
                                            onClick={() => onPlayAudio(msg.audioUrl)}
                                            className="flex items-center gap-2 bg-black/20 hover:bg-black/40 text-xs px-3 py-2 rounded-lg w-fit transition-colors"
                                        >
                                            <Volume2 size={14} />
                                            <span>Play Audio</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Inline Camera View */}
                    {showCamera && (
                        <motion.div
                            key="camera-view"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="flex justify-end w-full"
                        >
                            <div className="bg-slate-900 border border-purple-500/50 p-2 rounded-2xl shadow-2xl relative max-w-sm">
                                <div className="flex justify-between items-center mb-2 px-1">
                                    <span className="text-xs text-purple-300 font-bold uppercase tracking-wider">{cameraMode} SCAN</span>
                                    <button onClick={() => setShowCamera(false)} className="text-slate-400 hover:text-white">
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="rounded-xl overflow-hidden aspect-video bg-black relative">
                                    <CameraView
                                        isActive={true}
                                        onCapture={handleCameraCapture}
                                        trigger={captureTrigger}
                                        isProcessing={false}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Typing Indicator (TEXT ONLY NO DOTS) */}
                    {isTyping && (
                        <motion.div
                            key="typing-indicator"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start w-full"
                        >
                            <div className="flex flex-row gap-3 items-center">
                                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center animate-pulse">
                                    <Sparkles size={14} className="text-white" />
                                </div>
                                <div className="bg-slate-800/80 p-3 rounded-2xl rounded-tl-none flex items-center border border-emerald-500/20">
                                    <span className="text-xs font-semibold text-emerald-400 tracking-wide uppercase animate-pulse">
                                        {typingStatus || "Thinking..."}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={endRef} />
                </AnimatePresence>
            </div>

            {/* Input Footer */}
            <div className="p-4 bg-slate-900 border-t border-white/5 space-y-3 z-20">
                {/* Suggestions */}
                {suggestions.length > 0 && !showCamera && (
                    <div className="flex gap-2 overflow-x-auto pb-2 noscroll">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => onSuggestionClick(s)}
                                className="whitespace-nowrap px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-full border border-slate-700 transition-colors"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}
                {/* Input Bar */}
                <div className="relative flex items-end gap-2 bg-slate-800/50 p-2 rounded-3xl border border-white/10 shadow-lg focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">

                    {/* Tools Toggle */}
                    <div className="relative">
                        <button
                            onClick={() => setShowTools(!showTools)}
                            className={`p-2 rounded-full transition-colors ${showTools ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                        >
                            <Plus size={20} />
                        </button>

                        {/* Tools Menu (Popup) */}
                        <AnimatePresence>
                            {showTools && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                    className="absolute bottom-full mb-4 left-0 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl p-2 min-w-[200px] flex flex-col gap-1 z-30"
                                >
                                    <MenuAction icon={<User size={18} />} label="Scan Face" onClick={() => { openCamera('person'); setShowTools(false); }} />
                                    <MenuAction icon={<Package size={18} />} label="Scan Object" onClick={() => { openCamera('object'); setShowTools(false); }} />
                                    <div className="h-px bg-white/10 my-1" />
                                    <MenuAction icon={<UserPlus size={18} />} label="Enroll Person" onClick={() => { onEnroll(); setShowTools(false); }} color="text-purple-400" />
                                    <MenuAction icon={<PackagePlus size={18} />} label="Enroll Item" onClick={() => { onEnrollObject(); setShowTools(false); }} color="text-orange-400" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Message Convolve..."
                        disabled={showCamera}
                        rows={1}
                        style={{ minHeight: '44px', maxHeight: '200px' }}
                        className="flex-1 bg-transparent text-white px-2 py-3 text-[15px] outline-none placeholder:text-slate-500 disabled:opacity-50 resize-none font-medium leading-relaxed"
                    />

                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className={`p-2 mb-1 rounded-xl transition-all duration-200 ${input.trim()
                            ? 'bg-white text-black hover:bg-slate-200 shadow-md'
                            : 'bg-transparent text-slate-500 cursor-not-allowed'}`}
                    >
                        <Send size={20} />
                    </button>
                </div>
                <div className="text-center">
                    <p className="text-[10px] text-slate-600 font-medium">Convolve AI Memory Assistant</p>
                </div>
            </div>
        </div>
    );
}

const MenuAction = ({ icon, label, onClick, color = "text-slate-300" }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 w-full p-2 hover:bg-white/10 rounded-lg transition-colors text-left text-sm font-medium ${color}`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export default ChatInterface;
