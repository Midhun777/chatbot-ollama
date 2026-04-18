import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, Send, Bot, User as UserIcon, Bell, Sparkles, Edit, FileDown, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const StudentDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({ totalCourses: 0 });
    const [announcements, setAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Chat State
    const [messages, setMessages] = useState([
        { text: "Hello! I am your EduSphere AI Assistant. Ask me about the syllabus, campus rules, or any institutional documents.", sender: "ai" }
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
            const [dashboardRes, historyRes, announcementsRes] = await Promise.all([
                api.get('/student/dashboard'),
                api.get('/chat/history'),
                api.get('/announcements/')
            ]);

            setProfile(dashboardRes.data.profile);
            setStats({ totalCourses: dashboardRes.data.total_courses });
            setAnnouncements(announcementsRes.data.slice(0, 3)); // Show top 3

            if (historyRes.data && historyRes.data.length > 0) {
                const historicalMessages = historyRes.data.flatMap(msg => [
                    { text: msg.query, sender: "user", timestamp: msg.timestamp },
                    { text: msg.answer, sender: "ai", source: msg.source, timestamp: msg.timestamp }
                ]);
                setMessages(prev => [prev[0], ...historicalMessages]);
            }
        } catch (error) {
            console.error("Error fetching student data", error);
            setProfile({
                name: "Student",
                enrollment_no: "Loading...",
                semester: "-",
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
            setMessages(prev => [...prev, { text: res.data.answer, sender: "ai", source: res.data.source, form: res.data.form || null }]);
        } catch (error) {
            const errMsg = error.response?.data?.detail || error.message || "Network Error";
            setMessages(prev => [...prev, { text: `Sorry, I couldn't reach the AI server. Details: ${errMsg}`, sender: "ai", source: "ERROR" }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    const CATEGORY_DOT = { General: 'bg-slate-400', Exam: 'bg-red-500', Event: 'bg-brand-primary', Holiday: 'bg-emerald-500' };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-8rem)]" // Fill height minus navbar and padding
            >
                {/* Left Column - Profile & Quick Actions */}
                <div className="w-full lg:w-80 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">

                    {/* Profile Card */}
                    <div className="formal-card p-6 border-t-4 border-t-brand-primary">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center text-brand-900 border border-slate-200 flex-shrink-0">
                                    <UserIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-heading font-bold text-brand-900 leading-tight truncate">{profile?.name || "Student"}</h2>
                                    <p className="text-slate-500 font-medium text-sm">{profile?.enrollment_no || "Loading..."}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/student/profile')}
                                className="p-1.5 rounded-md text-slate-400 hover:bg-slate-50 hover:text-brand-primary transition-colors border border-transparent hover:border-slate-200"
                                title="Edit Profile"
                            >
                                <Edit className="h-4 w-4" />
                            </button>
                        </div>

                        {profile?.department && (
                            <div className="bg-brand-50 px-3 py-1.5 rounded-md inline-block mb-6">
                                <p className="text-xs text-brand-700 font-semibold uppercase tracking-wider">{profile.department}</p>
                            </div>
                        )}

                        <div className="space-y-3">
                            <StatRow icon={<Calendar className="h-4 w-4" />} label="Semester" value={profile?.semester || "-"} />
                        </div>
                    </div>

                    {/* Navigation Links (List instead of grid for formal look) */}
                    <div className="formal-card overflow-visible">
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Actions</h3>
                        </div>
                        <div className="p-2 space-y-1">
                            <NavAction icon={<Calendar className="h-4 w-4" />} label="Timetable" onClick={() => navigate('/student/timetable')} />
                            <NavAction icon={<Bell className="h-4 w-4" />} label="Notices" onClick={() => navigate('/student/announcements')} />
                            <NavAction icon={<MessageSquare className="h-4 w-4 text-emerald-600" />} label="Live Chat with Faculty" onClick={() => navigate('/student/messages')} />
                        </div>
                    </div>

                    {/* Recent Announcements */}
                    {announcements.length > 0 && (
                        <div className="formal-card">
                            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Notices</h3>
                                <button onClick={() => navigate('/student/announcements')} className="text-xs font-semibold text-brand-primary hover:underline">View All</button>
                            </div>
                            <div className="p-4 space-y-4">
                                {announcements.map(ann => (
                                    <div key={ann.id} className="flex gap-3">
                                        <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${CATEGORY_DOT[ann.category] || 'bg-slate-400'}`} />
                                        <div>
                                            <p className="text-sm font-semibold text-brand-900 leading-tight mb-1">{ann.title}</p>
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{ann.body}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: AI Chatbot (Main Focus) */}
                <div className="flex-1 flex flex-col formal-card min-h-[500px]">
                    {/* Chat Header */}
                    <div className="px-6 py-4 border-b border-slate-200 bg-white flex justify-between items-center z-10">
                        <div className="flex items-center gap-3">
                            <div className="bg-brand-50 p-2 rounded-lg">
                                <Bot className="h-5 w-5 text-brand-primary" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-brand-900 leading-tight">EduSphere AI Assistant</h2>
                                <p className="text-xs text-slate-500 font-medium">Secure Institutional Search</p>
                            </div>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 p-6 overflow-y-auto bg-slate-50 space-y-6">
                        <AnimatePresence>
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm border ${
                                            msg.sender === 'user'
                                            ? 'bg-brand-900 text-white rounded-br-sm border-brand-900'
                                            : 'bg-white text-slate-700 rounded-bl-sm border-slate-200'
                                        }`}
                                    >
                                        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                        
                                        {msg.form && (
                                            <a
                                                href={msg.form.download_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-4 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 hover:bg-slate-100 transition-colors group no-underline text-brand-900"
                                            >
                                                <div className="bg-white p-2 rounded-md border border-slate-200 text-slate-500 group-hover:text-brand-primary transition-colors">
                                                    <FileDown className="h-4 w-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Document</span>
                                                    <span className="text-sm font-semibold">{msg.form.form_title}</span>
                                                </div>
                                            </a>
                                        )}
                                        
                                        {msg.source && (
                                            <div className={`mt-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider ${msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                <div className="h-1 w-1 rounded-full bg-current opacity-50" />
                                                Source: {msg.source}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isChatLoading && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 rounded-bl-sm shadow-sm flex items-center gap-1.5 h-12">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
                                </div>
                            </motion.div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 bg-white border-t border-slate-200">
                        <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Message EduSphere AI..."
                                className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-lg pl-4 pr-12 py-3.5 text-sm font-medium text-slate-900 focus:outline-none transition-all"
                                disabled={isChatLoading}
                            />
                            <button
                                type="submit"
                                disabled={isChatLoading || !inputMessage.trim()}
                                className="absolute right-3 p-1.5 bg-brand-primary text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:bg-slate-300 flex items-center justify-center"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </form>
                        <p className="text-center text-[10px] text-slate-400 mt-2 font-medium">AI can make mistakes. Verify important academic information with official bodies.</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const StatRow = ({ icon, label, value, status }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
        <div className="flex items-center gap-2 text-slate-600">
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-brand-900">{value}</span>
            {status === 'good' && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
            {status === 'warning' && <div className="w-2 h-2 rounded-full bg-amber-500" />}
        </div>
    </div>
);

const NavAction = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-left group"
    >
        <div className="text-slate-400 group-hover:text-brand-primary transition-colors">
            {icon}
        </div>
        <span className="text-sm font-semibold text-slate-700 group-hover:text-brand-900 transition-colors">
            {label}
        </span>
    </button>
);

export default StudentDashboard;
