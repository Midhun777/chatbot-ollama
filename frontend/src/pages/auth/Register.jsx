import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { GraduationCap, Lock, Mail, User, BookOpen, Fingerprint, AlertCircle, CheckCircle } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'student',
        first_name: '',
        last_name: '',
        department: '',
        id_number: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const { register, user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Redirect if already logged in
    if (user) {
        navigate(`/${user.role}/dashboard`);
        return null;
    }

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
            setTimeout(() => {
                window.location.reload(); // Refresh to sync authentication state
            }, 1500);
        } else {
            setError(result.error || 'Registration failed. Email might already be in use or data is invalid.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div className="absolute bg-indigo-100 rounded-full h-96 w-96 -top-20 -left-20 mix-blend-multiply opacity-50 blur-3xl animate-pulse"></div>
                <div className="absolute bg-blue-100 rounded-full h-80 w-80 top-40 right-10 mix-blend-multiply opacity-50 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
                <div className="flex justify-center flex-col items-center">
                    <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg">
                        <GraduationCap className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
                        Create Account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join the Smart College Portal
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
                <div className="bg-white/80 backdrop-blur-md py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Registration Successful!</h3>
                            <p className="text-gray-600 mt-2">Redirecting you to your dashboard...</p>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            name="first_name"
                                            type="text"
                                            required
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-2.5 border"
                                            placeholder="John"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            name="last_name"
                                            type="text"
                                            required
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-2.5 border"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-2.5 border"
                                            placeholder="john@college.edu"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            name="password"
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-2.5 border"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Department</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <BookOpen className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            name="department"
                                            required
                                            value={formData.department}
                                            onChange={handleChange}
                                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-2.5 border"
                                        >
                                            <option value="">Select Department</option>
                                            <option value="Computer Science">Computer Science</option>
                                            <option value="Electrical Engineering">Electrical Engineering</option>
                                            <option value="Mechanical Engineering">Mechanical Engineering</option>
                                            <option value="Information Technology">Information Technology</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        {formData.role === 'student' ? 'Enrollment No' : 'Employee ID'}
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Fingerprint className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            name="id_number"
                                            type="text"
                                            required
                                            value={formData.id_number}
                                            onChange={handleChange}
                                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-2.5 border"
                                            placeholder={formData.role === 'student' ? 'STU-12345' : 'FAC-12345'}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Register as</label>
                                <div className="mt-3 flex gap-4">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="student"
                                            checked={formData.role === 'student'}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Student</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="faculty"
                                            checked={formData.role === 'faculty'}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Faculty</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70"
                                >
                                    {isLoading ? (
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : "Create Account"}
                                </button>
                            </div>

                            <div className="text-center mt-4">
                                <p className="text-sm text-gray-600">
                                    Already have an account?{' '}
                                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 border-b border-transparent hover:border-indigo-500 transition-all px-1">
                                        Sign In
                                    </Link>
                                </p>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Register;
