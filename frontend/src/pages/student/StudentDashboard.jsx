import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, TrendingUp, Send, Bot, User as UserIcon, Award, Percent, Bell, Sparkles, Edit, FileDown } from 'lucide-react';
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
        { text: "Hello! I am your EduSphere AI Assistant. Ask me about your attendance, marks, or anything in the college syllabus.", sender: "ai" }
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
                attendance_pct: 0,
                cgpa: 0
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

    const CATEGORY_DOT = { General: 'bg-slate-400', Exam: 'bg-red-500', Event: 'bg-blue-500', Holiday: 'bg-emerald-500' };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row gap-10"
            >
                {/* Left Column */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6">

                    {/* Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card rounded-[2.5rem] p-8 relative group border border-white/40"
                    >
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors" />

                        <div className="flex items-center gap-4 mb-8 relative z-10">
                            <div className="h-16 w-16 gradient-bg rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 flex-shrink-0">
                                <UserIcon className="h-8 w-8" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-black text-slate-900 leading-tight truncate">{profile?.name || "Student"}</h2>
                                <p className="text-slate-500 font-bold tracking-tight text-sm">{profile?.enrollment_no || "Loading..."}</p>
                                {profile?.department && (
                                    <p className="text-xs text-indigo-600 font-bold mt-0.5">{profile.department}</p>
                                )}
                            </div>
                            <button
                                onClick={() => navigate('/student/profile')}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                title="Edit Profile"
                            >
                                <Edit className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 relative z-10">
                            <StatBadge
                                icon={<Calendar className="h-4 w-4" />}
                                label="Semester"
                                value={profile?.semester || "-"}
                                color="bg-blue-50 text-blue-600"
                            />
                            <StatBadge
                                icon={<Percent className="h-4 w-4" />}
                                label="Attendance"
                                value={`${profile?.attendance_pct || 0}%`}
                                color="bg-emerald-50 text-emerald-600"
                                trend={profile?.attendance_pct >= 75 ? "✓ On Track" : "⚠ Low"}
                            />
                            <StatBadge
                                icon={<Award className="h-4 w-4" />}
                                label="CGPA"
                                value={profile?.cgpa || "-"}
                                color="bg-purple-50 text-purple-600"
                            />
                        </div>
                    </motion.div>

                    {/* Quick Nav Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <QuickLink icon={<Calendar className="h-5 w-5" />} title="Timetable" subtitle="Class Schedule" onClick={() => navigate('/student/timetable')} delay={0.2} color="from-blue-500 to-indigo-500" />
                        <QuickLink icon={<Bell className="h-5 w-5" />} title="Notices" subtitle="Announcements" onClick={() => navigate('/student/announcements')} delay={0.25} color="from-amber-500 to-orange-500" />
                        <QuickLink icon={<Sparkles className="h-5 w-5" />} title="AI Roadmap" subtitle="Study Planner" onClick={() => navigate('/student/roadmap')} delay={0.3} color="from-violet-500 to-purple-500" />
                        <QuickLink icon={<TrendingUp className="h-5 w-5" />} title="Performance" subtitle="Marks & CGPA" onClick={() => navigate('/student/performance')} delay={0.35} color="from-emerald-500 to-teal-500" />
                    </div>

                    {/* Recent Announcements preview */}
                    {announcements.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Latest Notices</h3>
                                <button onClick={() => navigate('/student/announcements')} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View all →</button>
                            </div>
                            <div className="space-y-3">
                                {announcements.map(ann => (
                                    <div key={ann.id} className="flex items-start gap-3">
                                        <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${CATEGORY_DOT[ann.category] || 'bg-slate-400'}`} />
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 leading-tight">{ann.title}</p>
                                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{ann.body}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
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
                                <h2 className="text-lg font-black text-white">EduSphere AI</h2>
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <p className="text-xs text-indigo-100 font-bold uppercase tracking-wider">Online & Private</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat Messages */}
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
                                        {msg.form && (
                                            <a
                                                href={msg.form.download_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-4 flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl px-5 py-3 shadow-lg hover:shadow-xl hover:brightness-110 transition-all group no-underline"
                                            >
                                                <div className="bg-white/20 p-2 rounded-xl group-hover:scale-110 transition-transform">
                                                    <FileDown className="h-5 w-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black uppercase tracking-wider opacity-80">Download PDF</span>
                                                    <span className="text-sm font-bold">{msg.form.form_title}</span>
                                                </div>
                                            </a>
                                        )}
                                        {msg.source && (
                                            <div className={`mt-3 pt-2 border-t text-[10px] font-black uppercase tracking-widest ${msg.sender === 'user' ? 'border-white/20 text-indigo-100' : 'border-slate-50 text-slate-400'}`}>
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
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0.2s' }} />
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0.4s' }} />
                                </div>
                            </motion.div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
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
            <div className="p-2 rounded-xl bg-white shadow-sm">{icon}</div>
            <span className="text-xs font-black uppercase tracking-widest opacity-80">{label}</span>
        </div>
        <div className="flex flex-col items-end">
            <span className="text-lg font-black tracking-tight">{value}</span>
            {trend && <span className="text-[10px] font-black uppercase tracking-tighter opacity-60">{trend}</span>}
        </div>
    </div>
);

const QuickLink = ({ icon, title, subtitle, onClick, delay, color }) => (
    <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        onClick={onClick}
        className="flex flex-col items-center gap-3 p-5 bg-white border border-slate-100 rounded-[1.5rem] hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all text-center group"
    >
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} group-hover:scale-110 transition-transform shadow-lg`}>
            <span className="text-white">{icon}</span>
        </div>
        <div>
            <h4 className="font-black text-slate-900 leading-none text-sm mb-0.5">{title}</h4>
            <p className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-400 transition-colors uppercase tracking-widest">{subtitle}</p>
        </div>
    </motion.button>
);

export default StudentDashboard;
