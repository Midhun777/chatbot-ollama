import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { BookOpen, LogIn, LogOut, LayoutDashboard, User, MessageSquare, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="formal-nav px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between h-20 items-center">
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center"
                    >
                        <Link to="/" className="flex flex-shrink-0 items-center gap-3">
                            <div className="bg-brand-900 p-2 rounded-lg text-white">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <span className="font-heading font-bold text-2xl text-brand-900 tracking-tight">
                                EduSphere
                            </span>
                        </Link>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="flex items-center space-x-6"
                    >
                        <Link to="/" className="text-slate-600 hover:text-brand-900 font-medium px-2 py-1 transition-colors">
                            Home
                        </Link>
                        <Link to="/courses" className="text-slate-600 hover:text-brand-900 font-medium px-2 py-1 transition-colors">
                            Courses
                        </Link>
                        
                        {!user ? (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="btn-primary">
                                    <LogIn className="h-4 w-4 mr-2" />
                                    Sign In
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200">
                                {(user.role === 'student' || user.role === 'faculty') && (
                                    <Link to={`/${user.role}/messages`} className="text-slate-600 hover:text-brand-900 font-medium px-2 py-1 transition-colors flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        Messages
                                    </Link>
                                )}
                                <Link
                                    to={`/${user.role}/dashboard`}
                                    className="flex items-center gap-2 text-slate-700 hover:text-brand-primary font-medium transition-colors"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Link>
                                <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                                    <User className="h-5 w-5" />
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="text-slate-400 hover:text-red-600 p-2 rounded-md transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
