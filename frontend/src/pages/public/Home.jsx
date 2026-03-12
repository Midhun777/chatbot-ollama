import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, BookOpen, Users, Trophy, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
    return (
        <div className="bg-slate-50 overflow-hidden">
            {/* Hero Section */}
            <div className="relative pt-20 pb-24 sm:pt-32 sm:pb-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8"
                        >
                            <Sparkles className="h-4 w-4 text-indigo-600" />
                            <span className="text-sm font-bold text-indigo-600 uppercase tracking-wider">AI-Powered Education</span>
                        </motion.div>
                        
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]"
                        >
                            Experience the Future <br />
                            of <span className="gradient-text">Academic Management</span>
                        </motion.h1>
                        
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mt-8 max-w-2xl mx-auto text-lg sm:text-xl text-slate-500 leading-relaxed"
                        >
                            The ultimate intelligent portal for modern colleges. Seamlessly track attendance, 
                            manage marks, and interact with our private RAG-powered AI assistant.
                        </motion.p>
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="mt-12 flex flex-col sm:flex-row justify-center gap-4"
                        >
                            <Link to="/login" className="gradient-bg text-white px-10 py-4 rounded-2xl font-black shadow-2xl shadow-indigo-200 hover:scale-105 transition-all text-lg flex items-center justify-center gap-2 group">
                                Access Your Portal
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/courses" className="bg-white text-slate-900 border border-slate-200 px-10 py-4 rounded-2xl font-black hover:bg-slate-50 transition-all text-lg flex items-center justify-center">
                                View Courses
                            </Link>
                        </motion.div>
                    </div>
                </div>

                {/* Animated Background Elements */}
                <div className="absolute top-1/4 -right-20 w-80 h-80 bg-indigo-400 rounded-full blur-[120px] opacity-20 animate-float"></div>
                <div className="absolute bottom-0 -left-20 w-96 h-96 bg-purple-400 rounded-full blur-[150px] opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Features Grid */}
            <div className="py-32 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-indigo-600 font-black uppercase tracking-widest text-sm mb-4">Core Ecosystem</h2>
                        <p className="text-4xl font-black text-slate-900 tracking-tight">
                            Smart Tools for Smart Students
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={<Bot className="h-7 w-7 text-white" />}
                            title="AI Chatbot (RAG)"
                            description="Personalized academic support powered by your own college documents."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={<BookOpen className="h-7 w-7 text-white" />}
                            title="Smart Academics"
                            description="Real-time tracking of GPA, attendance, and performance metrics."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={<Users className="h-7 w-7 text-white" />}
                            title="Role Portals"
                            description="Secured spaces for Admin, Faculty, and Students to collaborate."
                            delay={0.3}
                        />
                        <FeatureCard
                            icon={<Trophy className="h-7 w-7 text-white" />}
                            title="Placements"
                            description="Direct integration with recruitment drives and career resources."
                            delay={0.4}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        className="glass-card p-8 rounded-[2rem] hover:scale-105 transition-all duration-300 group cursor-pointer border border-slate-100"
    >
        <div className="gradient-bg w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-100 group-hover:rotate-6 transition-transform">
            {icon}
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{title}</h3>
        <p className="text-slate-500 leading-relaxed font-medium">
            {description}
        </p>
    </motion.div>
);

export default Home;
