import React from 'react';
import { BookOpen, Users, Compass, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const GuestDashboard = () => {
    return (
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 p-6 sm:p-10">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 premium-shadow relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] opacity-60"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 mb-4">
                                <Compass className="h-4 w-4 text-slate-500" />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Guest View</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                                Welcome to <span className="gradient-text">EduSphere</span>
                            </h1>
                            <p className="mt-2 text-slate-500 font-medium">
                                You are viewing the portal as a guest. Explore our course catalog to get started.
                            </p>
                        </div>
                        <div className="shrink-0 space-y-3 w-full md:w-auto">
                            <Link 
                                to="/register" 
                                className="block text-center w-full px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1"
                            >
                                Enroll as Student
                            </Link>
                            <Link 
                                to="/login" 
                                className="block text-center w-full px-8 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold transition-all"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Courses Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full"
                    >
                        <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center mb-6 border border-purple-100">
                            <BookOpen className="h-6 w-6 text-purple-600" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 mb-3">Course Catalog</h2>
                        <p className="text-slate-500 leading-relaxed font-medium flex-grow">
                            Browse our wide selection of undergraduate and graduate programs. See what makes EduSphere the right choice for your future.
                        </p>
                        
                        <Link to="/courses" className="mt-6 flex items-center text-indigo-600 font-bold group-hover:text-indigo-700 cursor-pointer">
                            View all courses 
                            <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>

                    {/* AI Preview Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden flex flex-col h-full"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-white pointer-events-none"></div>
                        <div className="relative z-10 flex-grow">
                            <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-6 border border-indigo-100">
                                <Users className="h-6 w-6 text-indigo-600" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 mb-3">AI Student Assistant</h2>
                            <p className="text-slate-500 leading-relaxed font-medium">
                                Enrolled students get exclusive access to our custom RAG-powered chatbot. It can instantly answer questions about the syllabus, campus rules, library hours, and more based on official college documents.
                            </p>
                            
                            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-400 font-bold rounded-lg text-sm border border-slate-200 cursor-not-allowed">
                                Register to Unlock
                            </div>
                        </div>
                    </motion.div>
                </div>
                
            </div>
        </div>
    );
};

export default GuestDashboard;
