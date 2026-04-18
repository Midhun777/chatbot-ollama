import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Bot, User, Sparkles, LogIn, ArrowRight, ShieldCheck, Database, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const GuestChat = () => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm the EduSphere Assistant. How can I help you learn about our institution today? (Guest Mode)", isBot: true }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg = { id: Date.now(), text: input, isBot: false };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const res = await api.post('/chat/query', { message: input });
            setMessages(prev => [...prev, { 
                id: Date.now() + 1, 
                text: res.data.answer || "I couldn't process that query.", 
                isBot: true,
                source: res.data.source 
            }]);
        } catch (error) {
            setMessages(prev => [...prev, { 
                id: Date.now() + 1, 
                text: "I'm having trouble connecting to the knowledge base. Please try again later.", 
                isBot: true 
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-6rem)] flex flex-col">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-formal border border-slate-200 p-6 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-brand-900 flex items-center justify-center shadow-lg shadow-brand-900/20">
                        <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-brand-900 flex items-center gap-2">
                            AI Institute Assistant
                            <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">Guest</span>
                        </h1>
                        <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                            <Sparkles className="h-3 w-3 text-amber-500" /> Powered by EduSphere RAG Knowledge Base
                        </p>
                    </div>
                </div>
                <Link to="/login" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-100 hover:bg-emerald-100 transition-all">
                    <LogIn className="h-4 w-4" />
                    Log in for Personal Tools
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-white rounded-2xl shadow-formal border border-slate-200 overflow-hidden flex flex-col mb-6">
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                    <AnimatePresence initial={false}>
                        {messages.map((m) => (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${m.isBot ? 'justify-start' : 'justify-end'}`}
                            >
                                <div className={`flex gap-3 max-w-[85%] ${m.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm border ${
                                        m.isBot ? 'bg-white text-brand-900 border-slate-200' : 'bg-brand-900 text-white border-brand-900'
                                    }`}>
                                        {m.isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                    </div>
                                    <div>
                                        <div className={`p-4 rounded-2xl shadow-sm text-sm font-medium leading-relaxed ${
                                            m.isBot 
                                                ? 'bg-white text-slate-800 border border-slate-100 rounded-tl-none' 
                                                : 'bg-brand-900 text-white rounded-tr-none'
                                        }`}>
                                            {m.text}
                                            {m.source && (
                                                <div className={`mt-3 pt-3 border-t flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${m.isBot ? 'text-slate-400 border-slate-50' : 'text-brand-200 border-brand-800'}`}>
                                                    <Database className="h-3 w-3" /> Source: {m.source}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-slate-100 rounded-full px-4 py-2 flex gap-1 items-center border border-slate-200 shadow-inner">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about courses, admissions, or faculty..."
                            className="w-full bg-slate-50 border-slate-200 rounded-xl px-5 py-4 pr-14 text-sm font-medium focus:ring-1 focus:ring-brand-primary/30 focus:border-brand-primary placeholder-slate-400 shadow-inner transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className="absolute right-2 p-2.5 rounded-lg bg-brand-900 text-white shadow-lg shadow-brand-900/20 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                </form>
            </div>

            {/* Footer Note */}
            <div className="flex items-center justify-center gap-6 px-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <ShieldCheck className="h-3 w-3" /> Secure Guest Access
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Info className="h-3 w-3" /> Responses may vary
                </div>
            </div>
        </div>
    );
};

export default GuestChat;
