import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { GraduationCap, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Redirect if already logged in — must be in useEffect to avoid render-phase crash
    useEffect(() => {
        if (user) navigate(`/${user.role}/dashboard`);
    }, [user, navigate]);

    if (user) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const success = await login(email, password);

        if (success) {
            const payload = JSON.parse(atob(localStorage.getItem('token').split('.')[1]));
            navigate(`/${payload.role}/dashboard`);
        } else {
            setError('Invalid credentials. Please verify your email and password.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-50">
            {/* Background elements */}
            <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-200 rounded-full blur-[120px] opacity-30 animate-float"></div>
            <div className="absolute bottom-0 -right-20 w-80 h-80 bg-purple-200 rounded-full blur-[120px] opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full relative z-10"
            >
                <div className="text-center mb-10">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex gradient-bg p-4 rounded-3xl shadow-2xl shadow-indigo-200 mb-6"
                    >
                        <GraduationCap className="h-10 w-10 text-white" />
                    </motion.div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                        Welcome <span className="gradient-text">Back</span>
                    </h2>
                    <p className="mt-3 text-slate-500 font-bold">
                        Securely sign in to your EduSphere Portal
                    </p>
                </div>

                <div className="glass-card p-10 rounded-[2.5rem] border border-white/50 premium-shadow">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }} 
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-red-50/50 backdrop-blur-sm border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600"
                            >
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <p className="text-xs font-black uppercase tracking-wider">{error}</p>
                            </motion.div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-indigo-600 transition-colors">
                                    <Mail className="h-5 w-5 text-slate-300" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl text-sm font-bold text-slate-800 focus:outline-none transition-all"
                                    placeholder="alex@college.edu"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-indigo-600 transition-colors">
                                    <Lock className="h-5 w-5 text-slate-300" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl text-sm font-bold text-slate-800 focus:outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 gradient-bg text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Sign In to Portal
                                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="text-center mt-6 space-y-4">
                            <div>
                                <span className="text-sm font-bold text-slate-400">
                                    Need an account?{' '}
                                    <Link to="/register" className="text-indigo-600 hover:text-indigo-800 transition-colors">
                                        Get started
                                    </Link>
                                </span>
                            </div>
                            
                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-slate-200"></div>
                                <span className="flex-shrink-0 mx-4 text-xs font-black text-slate-300 uppercase tracking-widest">or</span>
                                <div className="flex-grow border-t border-slate-200"></div>
                            </div>
                            
                            <Link 
                                to="/guest/dashboard"
                                className="block w-full h-12 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center"
                            >
                                Continue as Guest
                            </Link>
                        </div>
                    </form>
                </div>

                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-8 text-xs font-black text-slate-300 uppercase tracking-[0.2em]"
                >
                    &copy; 2026 EduSphere Inc.
                </motion.p>
            </motion.div>
        </div>
    );
};

export default Login;
