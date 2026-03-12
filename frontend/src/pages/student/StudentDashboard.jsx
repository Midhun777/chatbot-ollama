import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Calendar, TrendingUp, Send, Bot, User as UserIcon, Award, Percent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const StudentDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({ totalCourses: 0 });
    const [isLoading, setIsLoading] = useState(true);

    // Chat State
    const [messages, setMessages] = useState([
        { text: "Hello! I am your Smart College AI Assistant. Ask me about your attendance, marks, or anything in the college syllabus.", sender: "ai" }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        fetchStudentData();
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchStudentData = async () => {
        setIsLoading(true);
        try {
            // Concurrent fetching for better performance
            const [dashboardRes, historyRes] = await Promise.all([
                api.get('/student/dashboard'),
                api.get('/chat/history')
            ]);

            setProfile(dashboardRes.data.profile);
            setStats({ totalCourses: dashboardRes.data.total_courses });

            // Map backend history to chat messages state
            if (historyRes.data && historyRes.data.length > 0) {
                const historicalMessages = historyRes.data.flatMap(msg => [
                    { text: msg.query, sender: "user", timestamp: msg.timestamp },
                    { text: msg.answer, sender: "ai", source: msg.source, timestamp: msg.timestamp }
                ]);
                
                // Keep the initial welcome message + history
                setMessages(prev => [prev[0], ...historicalMessages]);
            }
        } catch (error) {
            console.error("Error fetching student data", error);
            // Fallback for demo if DB issues
            setProfile({
                name: "Alex Doe",
                enrollment_no: "BCA24001",
                semester: 4,
                attendance_pct: 85,
                cgpa: 8.4
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const userMsg = inputMessage;
        setMessages(prev => [...prev, { text: userMsg, sender: "user" }]);
        setInputMessage('');
        setIsChatLoading(true);

        try {
            const res = await api.post('/chat/query', { message: userMsg });
            setMessages(prev => [...prev, { text: res.data.answer, sender: "ai", source: res.data.source }]);
        } catch (error) {
            console.error("Chat API Error:", error);
            const errMsg = error.response?.data?.detail || error.message || "Network Error";
            setMessages(prev => [...prev, { text: `Sorry, I couldn't reach the AI server right now. Details: ${errMsg}`, sender: "ai", source: "ERROR" }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row gap-10 h-auto lg:h-[calc(100vh-10rem)]"
            >

                {/* Left Column: Academic Overview */}
                <div className="w-full lg:w-1/3 flex flex-col gap-8 h-full">
                    {/* Profile Card */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card rounded-[2.5rem] p-10 relative overflow-hidden group border border-white/40"
                    >
                        {/* Decorative background circle */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors"></div>
                        
                        <div className="flex items-center gap-6 mb-10 relative z-10">
                            <div className="h-20 w-20 gradient-bg rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 rotate-3 group-hover:rotate-0 transition-transform">
                                <UserIcon className="h-10 w-10" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 leading-tight">{profile?.name || "Student"}</h2>
                                <p className="text-slate-500 font-bold tracking-tight">{profile?.enrollment_no || "Loading..."}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 relative z-10">
                            <StatBadge 
                                icon={<Calendar className="h-4 w-4" />} 
                                label="Semester" 
                                value={profile?.semester || "-"} 
                                color="bg-blue-50 text-blue-600"
                            />
                            <StatBadge 
                                icon={<Percent className="h-4 w-4" />} 
                                label="Attendance" 
                                value={`${profile?.attendance_pct || profile?.attendance || "0"}%`} 
                                color="bg-emerald-50 text-emerald-600"
                                trend="On Track"
                            />
                            <StatBadge 
                                icon={<Award className="h-4 w-4" />} 
                                label="CGPA" 
                                value={profile?.cgpa || "-"} 
                                color="bg-purple-50 text-purple-600"
                                trend="+0.2"
                            />
                        </div>
                    </motion.div>

                    {/* Quick Access Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        <QuickLink 
                            icon={<TrendingUp className="h-5 w-5" />} 
                            title="Academic Performance" 
                            subtitle="Detailed Marks & SGPA"
                            delay={0.2}
                        />
                        <QuickLink 
                            icon={<BookOpen className="h-5 w-5" />} 
                            title="Course Materials" 
                            subtitle="Syllabus & Downloads"
                            delay={0.3}
                        />
                    </div>
                </div>

                {/* Right Column: AI Chatbot */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex-1 flex flex-col bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(31,38,135,0.05)] border border-slate-100 overflow-hidden"
                >
                    <div className="gradient-bg p-6 flex items-center justify-between shadow-lg relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                                <Bot className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white">SmartCollege AI</h2>
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <p className="text-xs text-indigo-100 font-bold uppercase tracking-wider">Online & Private</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat Messages Area */}
                    <div className="flex-1 p-8 overflow-y-auto bg-slate-50/50 space-y-6 custom-scrollbar">
                        <AnimatePresence>
                            {messages.map((msg, index) => (
                                <motion.div 
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[75%] rounded-3xl px-6 py-4 relative shadow-sm ${msg.sender === 'user'
                                            ? 'gradient-bg text-white rounded-tr-none'
                                            : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none premium-shadow'
                                        }`}>
                                        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                        
                                        {msg.source && (
                                            <div className={`mt-3 pt-2 border-t text-[10px] font-black uppercase tracking-widest ${
                                                msg.sender === 'user' ? 'border-white/20 text-indigo-100' : 'border-slate-50 text-slate-400'
                                            }`}>
                                                Source: {msg.source}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isChatLoading && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                <div className="bg-white border border-slate-100 rounded-2xl px-6 py-4 shadow-sm flex gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </motion.div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-8 bg-white border-t border-slate-50">
                        <form onSubmit={handleSendMessage} className="relative group">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="What can I help you with today?"
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-[1.5rem] pl-6 pr-20 py-5 text-sm font-bold text-slate-800 focus:outline-none transition-all shadow-inner"
                                disabled={isChatLoading}
                            />
                            <button
                                type="submit"
                                disabled={isChatLoading || !inputMessage.trim()}
                                className="absolute right-3 top-2 bottom-2 gradient-bg text-white rounded-2xl px-5 hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center shadow-lg shadow-indigo-100"
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </form>
                    </div>

                </motion.div>
            </motion.div>
        </div>
    );
};

const StatBadge = ({ icon, label, value, color, trend }) => (
    <div className={`flex items-center justify-between p-4 rounded-2xl ${color} bg-opacity-40 border border-white/50 backdrop-blur-sm`}>
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white shadow-sm">
                {icon}
            </div>
            <span className="text-xs font-black uppercase tracking-widest opacity-80">{label}</span>
        </div>
        <div className="flex flex-col items-end">
            <span className="text-lg font-black tracking-tight">{value}</span>
            {trend && <span className="text-[10px] font-black uppercase tracking-tighter opacity-60">{trend}</span>}
        </div>
    </div>
);

const QuickLink = ({ icon, title, subtitle, delay }) => (
    <motion.button 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        className="flex items-center gap-5 p-6 bg-white border border-slate-100 rounded-[2rem] hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all text-left group"
    >
        <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
            {icon}
        </div>
        <div>
            <h4 className="font-black text-slate-900 leading-none mb-1">{title}</h4>
            <p className="text-xs font-bold text-slate-400 group-hover:text-indigo-400 transition-colors uppercase tracking-widest">{subtitle}</p>
        </div>
    </motion.button>
);

export default StudentDashboard;
