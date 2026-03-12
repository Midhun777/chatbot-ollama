import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { GraduationCap, LogIn, LogOut, LayoutDashboard, User } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="glass-nav px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between h-20 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center"
                    >
                        <Link to="/" className="flex flex-shrink-0 items-center gap-3 group">
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <GraduationCap className="h-7 w-7 text-white" />
                            </div>
                            <span className="font-black text-2xl tracking-tighter text-slate-900">
                                Smart<span className="gradient-text">College</span>
                            </span>
                        </Link>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-6"
                    >
                        {!user ? (
                            <>
                                <Link to="/" className="text-slate-600 hover:text-indigo-600 font-semibold px-2 py-1 transition-colors relative group">
                                    Home
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full"></span>
                                </Link>
                                <Link to="/courses" className="text-slate-600 hover:text-indigo-600 font-semibold px-2 py-1 transition-colors relative group">
                                    Courses
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full"></span>
                                </Link>
                                <Link
                                    to="/login"
                                    className="gradient-bg text-white hover:brightness-110 px-6 py-2.5 rounded-full font-bold shadow-xl shadow-indigo-200 transition-all hover:scale-105 flex items-center gap-2"
                                >
                                    <LogIn className="h-4 w-4" />
                                    Portal Sign In
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to={`/${user.role}/dashboard`}
                                    className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold hover:bg-indigo-100 transition-colors"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Link>
                                <div className="h-10 w-10 rounded-full border-2 border-indigo-200 p-0.5">
                                    <div className="h-full w-full rounded-full bg-slate-100 flex items-center justify-center text-indigo-600">
                                        <User className="h-5 w-5" />
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="text-slate-400 hover:text-red-500 p-2 rounded-lg transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </>
                        )}
                    </motion.div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
