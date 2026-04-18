import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { BookOpen, Lock, Mail, User, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'student'
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const { register, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate(`/${user.role}/dashboard`);
    }, [user, navigate]);

    if (user) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const result = await register(formData);

        if (result.success) {
            setSuccess(true);
            const payload = JSON.parse(atob(localStorage.getItem('token').split('.')[1]));
            setTimeout(() => {
                navigate(`/${payload.role}/dashboard`);
            }, 800);
        } else {
            setError(result.error || 'Registration failed. Check your information.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-xl w-full space-y-8"
            >
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-brand-900 rounded-lg flex items-center justify-center shadow-sm">
                        <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="mt-6 text-3xl font-heading font-bold text-brand-900 tracking-tight">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 font-medium">
                        Join the EduSphere Portal
                    </p>
                </div>

                <div className="formal-card p-8 sm:p-10 text-left">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-50 border border-green-200 mb-4">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-heading font-bold text-brand-900">Registration Successful</h3>
                            <p className="text-sm text-slate-600 mt-2 font-medium">Redirecting you securely to your dashboard...</p>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-red-700 font-medium">{error}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-brand-900 mb-1.5">First Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            name="first_name"
                                            type="text"
                                            required
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-slate-50 focus:bg-white transition-colors"
                                            placeholder="John"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-brand-900 mb-1.5">Last Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            name="last_name"
                                            type="text"
                                            required
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-slate-50 focus:bg-white transition-colors"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-brand-900 mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-slate-50 focus:bg-white transition-colors"
                                            placeholder="email@college.edu"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-brand-900 mb-1.5">Register As</label>
                                    <div className="flex p-1 bg-slate-100 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, role: 'student' })}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.role === 'student' ? 'bg-white text-brand-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            <User className="h-3.5 w-3.5 inline mr-1.5" />
                                            Student
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, role: 'faculty' })}
                                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.role === 'faculty' ? 'bg-white text-brand-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            <BookOpen className="h-3.5 w-3.5 inline mr-1.5" />
                                            Faculty
                                        </button>
                                    </div>
                                </div>
                            </div>

                                <div>
                                    <label className="block text-sm font-semibold text-brand-900 mb-1.5">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            name="password"
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary sm:text-sm bg-slate-50 focus:bg-white transition-colors"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full btn-primary py-3"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            Create Account
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {!success && (
                        <div className="mt-8 text-center border-t border-slate-200 pt-6">
                            <p className="text-sm text-slate-600 mb-4">
                                Already have an account?{' '}
                                <Link to="/login" className="font-semibold text-brand-primary hover:text-blue-800 transition-colors">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
                
                <p className="text-center text-xs text-slate-500 font-medium">
                    &copy; 2026 EduSphere Institutional Portal. All rights reserved.
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
