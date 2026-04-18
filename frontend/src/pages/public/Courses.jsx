import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, GraduationCap, Clock, Filter, Sparkles, AlertCircle, X } from 'lucide-react';
import api from '../../services/api';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDept, setSelectedDept] = useState('All');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get('/public/courses');
            setCourses(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load courses.');
        } finally {
            setIsLoading(false);
        }
    };

    const departments = ['All', ...new Set(courses.map(c => c.department))].filter(Boolean);

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.course_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              course.course_code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = selectedDept === 'All' || course.department === selectedDept;
        return matchesSearch && matchesDept;
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Dynamic Hero Section */}
            <div className="relative bg-brand-900 overflow-hidden py-20 px-4 sm:px-6 lg:px-8 shadow-xl">
                {/* Decorative background vectors */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-primary rounded-full blur-3xl mix-blend-screen" />
                    <div className="absolute top-32 -left-24 w-72 h-72 bg-blue-400 rounded-full blur-3xl mix-blend-screen" />
                </div>
                
                <div className="relative max-w-7xl mx-auto text-center z-10">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
                            Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-amber-300">Curriculum</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg md:text-xl text-brand-100 font-medium leading-relaxed">
                            Discover world-class courses designed to accelerate your career and expand your knowledge frontier.
                        </p>
                    </motion.div>

                    {/* Search & Filter Bar */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                        className="mt-10 max-w-3xl mx-auto bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl flex flex-col md:flex-row gap-2"
                    >
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-white/50" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-11 pr-4 py-3.5 bg-white/5 border border-transparent rounded-xl text-white placeholder-white/50 focus:bg-white/10 focus:border-brand-primary focus:ring-0 transition-all font-medium"
                                placeholder="Search courses by name or code..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="relative md:w-64">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Filter className="h-5 w-5 text-white/50" />
                            </div>
                            <select
                                className="block w-full pl-11 pr-10 py-3.5 bg-white/5 border border-transparent rounded-xl text-white appearance-none focus:bg-slate-800 focus:border-brand-primary focus:ring-0 transition-all font-medium cursor-pointer"
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                            >
                                {departments.map(dept => (
                                    <option key={dept} value={dept} className="text-slate-900 bg-white">{dept}</option>
                                ))}
                            </select>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Courses Grid Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pb-20">
                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 flex items-center justify-center p-4 bg-rose-50 border border-rose-200 rounded-2xl shadow-sm text-rose-700">
                        <AlertCircle className="h-5 w-5 mr-3" />
                        <p className="font-semibold">{error}</p>
                    </motion.div>
                )}

                {isLoading ? (
                    <div className="flex justify-center items-center py-24">
                        <div className="flex gap-2">
                            {[0, 1, 2].map(i => (
                                <motion.div 
                                    key={i} 
                                    animate={{ y: [-10, 0, -10] }} 
                                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                                    className="w-4 h-4 rounded-full bg-brand-primary" 
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {selectedDept === 'All' ? (
                            <motion.div 
                                key="departments"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            >
                                {departments.filter(d => d !== 'All').map(dept => {
                                    const count = courses.filter(c => c.department === dept).length;
                                    return (
                                        <motion.div
                                            key={dept}
                                            whileHover={{ y: -5 }}
                                            onClick={() => setSelectedDept(dept)}
                                            className="formal-card p-1 cursor-pointer group"
                                        >
                                            <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl p-6 flex flex-col justify-between group-hover:from-brand-50 transition-all duration-500">
                                                <div className="flex justify-between items-start">
                                                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-brand-100">
                                                        <GraduationCap className="h-6 w-6 text-brand-600" />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest bg-brand-900 text-white px-2.5 py-1.5 rounded-lg shadow-sm border border-white/20">
                                                        {count} {count === 1 ? 'Subject' : 'Subjects'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black text-brand-900 group-hover:text-brand-primary transition-colors leading-tight">{dept}</h3>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Academic Department</p>
                                                </div>
                                            </div>
                                            <div className="p-5 flex items-center justify-between bg-white border-t border-slate-100">
                                                <div className="flex -space-x-2">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center">
                                                            <Sparkles className="h-3 w-3 text-slate-300" />
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="text-brand-primary font-bold text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                                                    Explore Curriculums <BookOpen className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="subjects"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => setSelectedDept('All')} 
                                            className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                        <div>
                                            <h3 className="text-2xl font-black text-brand-900">{selectedDept}</h3>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Subject Catalog</p>
                                        </div>
                                    </div>
                                    <span className="hidden md:block text-xs font-black text-slate-400 uppercase tracking-tighter">Viewing {filteredCourses.length} Curriculums</span>
                                </div>

                                {filteredCourses.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                                        <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                                        <p className="text-slate-500 font-bold">No subjects found matching your criteria.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {filteredCourses.map(course => (
                                            <motion.div 
                                                key={course.id}
                                                variants={cardVariants}
                                                initial="hidden"
                                                animate="show"
                                                className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-brand-primary/10 transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full"
                                            >
                                                <div className="p-1">
                                                    <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-50 rounded-t-[22px] p-6 relative overflow-hidden group-hover:from-brand-50 group-hover:to-white transition-colors duration-500">
                                                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-brand-primary/5 rounded-full blur-xl group-hover:bg-brand-primary/20 transition-all duration-500" />
                                                        <div className="absolute top-4 right-4">
                                                            <span className="bg-white/80 backdrop-blur-sm shadow-sm text-brand-900 text-xs font-black px-3 py-1.5 rounded-full border border-slate-100 uppercase tracking-widest block">
                                                                {course.course_code}
                                                            </span>
                                                        </div>
                                                        <div className="mt-auto h-full flex items-end">
                                                           <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 inline-block">
                                                                <BookOpen className="h-6 w-6 text-brand-600" />
                                                           </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="p-6 flex-1 flex flex-col">
                                                    <div className="mb-4">
                                                        <span className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-2 block">{course.department}</span>
                                                        <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-brand-700 transition-colors line-clamp-2">{course.course_name}</h3>
                                                    </div>
                                                    
                                                    <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-100">
                                                        <div className="flex items-center gap-2 text-slate-600">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
                                                                <GraduationCap className="h-4 w-4 text-slate-500" />
                                                            </div>
                                                            <div className="text-sm">
                                                                <p className="font-semibold text-slate-900 leading-none">{course.faculty_name || 'TBA'}</p>
                                                                <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Instructor</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                                                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                                                            <span className="text-xs font-bold text-slate-700">{course.credits} Credits</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default Courses;
