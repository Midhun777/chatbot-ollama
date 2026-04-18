import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, BookOpen, ShieldCheck, BarChart3, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Hero Section */}
            <div className="relative pt-20 pb-24 sm:pt-32 sm:pb-32 overflow-hidden border-b border-slate-200 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-5xl sm:text-6xl font-heading font-bold text-brand-900 tracking-tight leading-tight"
                        >
                            Intelligent Administration for <span className="text-brand-primary">Modern Institutions</span>
                        </motion.h1>
                        
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed"
                        >
                            A comprehensive, secure platform designed to streamline academic operations. 
                            Manage attendance, track performance, and leverage AI-driven insights seamlessly.
                        </motion.p>
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
                        >
                            <Link to="/login" className="btn-primary text-lg px-8 py-3.5 group">
                                Access Portal
                                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/courses" className="btn-secondary text-lg px-8 py-3.5">
                                Explore Courses
                            </Link>
                        </motion.div>
                    </div>
                </div>
                
                {/* Subtle Grid Background for Hero */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdib3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNlMmU4ZjAiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzR2LTE2aDJ2MTZoLTh2LTJoNnYyaDJoLTh2LTJoNnYyaDZ2MTZoLTJWMzRoOHYyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20 pointer-events-none"></div>
            </div>

            {/* Platform Features Section */}
            <div className="py-24 relative bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-brand-primary font-semibold uppercase tracking-wider text-sm mb-3">Core Infrastructure</h2>
                        <h3 className="text-3xl sm:text-4xl font-heading font-bold text-brand-900">
                            Built for Academic Excellence
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<BarChart3 className="h-6 w-6 text-brand-primary" />}
                            title="Analytics & Tracking"
                            description="Comprehensive dashboards for monitoring student performance, GPA trends, and real-time attendance records."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={<Bot className="h-6 w-6 text-brand-primary" />}
                            title="AI Knowledge Assistant"
                            description="Secure Document-RAG chatbot designed to instantly answer academic queries strictly based on institutional data."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="h-6 w-6 text-brand-primary" />}
                            title="Role-Based Security"
                            description="Strict access controls ensuring Faculty, Admins, and Students only interact with authorized data environments."
                            delay={0.3}
                        />
                    </div>
                </div>
            </div>
            
            {/* Simple Footer/Bottom CTA */}
            <div className="bg-brand-900 py-16 text-center border-t border-brand-800">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-2xl font-heading font-bold text-white mb-6">Ready to streamline your academic workflow?</h2>
                    <Link to="/login" className="inline-flex items-center justify-center bg-white text-brand-900 font-semibold px-8 py-3 rounded-lg hover:bg-slate-100 transition-colors">
                        Sign In Now
                    </Link>
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4, delay }}
        className="formal-card p-8 flex flex-col h-full items-start group"
    >
        <div className="bg-brand-50 p-3 rounded-lg border border-brand-100 mb-6 group-hover:bg-white group-hover:border-brand-200 transition-colors">
            {icon}
        </div>
        <h3 className="text-xl font-heading font-bold text-brand-900 mb-3">{title}</h3>
        <p className="text-slate-600 leading-relaxed text-sm flex-grow">
            {description}
        </p>
    </motion.div>
);

export default Home;
