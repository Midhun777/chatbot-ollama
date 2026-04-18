import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { BookOpen, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-md w-full space-y-8"
            >
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-brand-900 rounded-lg flex items-center justify-center shadow-sm">
                        <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="mt-6 text-3xl font-heading font-bold text-brand-900 tracking-tight">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 font-medium">
                        Welcome back to EduSphere
                    </p>
                </div>

                <div className="formal-card p-8 sm:p-10 text-left">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-red-700 font-medium">{error}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-brand-900 mb-1.5">Email address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-slate-50 focus:bg-white transition-colors"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-brand-900 mb-1.5">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-slate-50 focus:bg-white transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-primary py-3"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center border-t border-slate-200 pt-6">
                        <p className="text-sm text-slate-600 mb-4">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-semibold text-brand-primary hover:text-blue-800 transition-colors">
                                Apply now
                            </Link>
                        </p>
                        
                        <Link 
                            to="/guest/dashboard"
                            className="text-sm font-medium text-slate-500 hover:text-brand-900 transition-colors"
                        >
                            Continue as Guest &rarr;
                        </Link>
                    </div>
                </div>
                
                <p className="text-center text-xs text-slate-500 font-medium">
                    &copy; 2026 EduSphere Institutional Portal. All rights reserved.
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
