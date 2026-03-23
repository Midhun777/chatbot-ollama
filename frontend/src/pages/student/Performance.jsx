import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, BookOpen, BarChart2, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const GRADE_MAP = (pct) => {
    if (pct >= 90) return { grade: 'O', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (pct >= 80) return { grade: 'A+', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (pct >= 70) return { grade: 'A', color: 'text-indigo-600', bg: 'bg-indigo-50' };
    if (pct >= 60) return { grade: 'B+', color: 'text-violet-600', bg: 'bg-violet-50' };
    if (pct >= 50) return { grade: 'B', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-50' };
};

const Performance = () => {
    const [marks, setMarks] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('marks');

    useEffect(() => {
        Promise.all([
            api.get('/student/marks'),
            api.get('/student/attendance'),
            api.get('/student/profile'),
        ]).then(([marksRes, attRes, profileRes]) => {
            setMarks(marksRes.data);
            setAttendance(attRes.data);
            setProfile(profileRes.data);
        }).catch(console.error)
          .finally(() => setIsLoading(false));
    }, []);

    // Group marks by course
    const byCourse = marks.reduce((acc, m) => {
        const cid = m.course?.course_code || m.course_id;
        if (!acc[cid]) acc[cid] = { name: m.course?.course_name || 'Unknown', code: cid, entries: [] };
        acc[cid].entries.push(m);
        return acc;
    }, {});

    // Group attendance by course
    const attByCourse = attendance.reduce((acc, a) => {
        const cid = a.course_id;
        if (!acc[cid]) acc[cid] = { total: 0, present: 0 };
        acc[cid].total++;
        if (a.status === 'Present') acc[cid].present++;
        return acc;
    }, {});

    const totalAtt = attendance.length;
    const totalPresent = attendance.filter(a => a.status === 'Present').length;
    const overallAtt = totalAtt > 0 ? ((totalPresent / totalAtt) * 100).toFixed(1) : 0;

    if (isLoading) return (
        <div className="flex justify-center py-20">
            <div className="flex gap-2">{[0,1,2].map(i => <div key={i} className="w-3 h-3 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}</div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg">
                        <TrendingUp className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">Academic Performance</h1>
                        <p className="text-slate-500 font-medium">Marks, grades & attendance overview</p>
                    </div>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <SummaryCard label="CGPA" value={profile?.cgpa || '—'} icon={<Award className="h-5 w-5" />} color="bg-purple-50 text-purple-700" />
                    <SummaryCard label="Attendance" value={`${overallAtt}%`} icon={<CheckCircle className="h-5 w-5" />} color={overallAtt >= 75 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'} />
                    <SummaryCard label="Courses" value={Object.keys(byCourse).length} icon={<BookOpen className="h-5 w-5" />} color="bg-blue-50 text-blue-700" />
                    <SummaryCard label="Semester" value={profile?.current_semester || '—'} icon={<BarChart2 className="h-5 w-5" />} color="bg-amber-50 text-amber-700" />
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {['marks', 'attendance'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm capitalize transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-200'}`}>
                            {tab === 'marks' ? '📊 Marks & Grades' : '📅 Attendance'}
                        </button>
                    ))}
                </div>

                {/* Marks Tab */}
                {activeTab === 'marks' && (
                    <div className="space-y-4">
                        {Object.keys(byCourse).length === 0 ? (
                            <EmptyState icon={<BarChart2 />} message="No marks recorded yet." />
                        ) : Object.values(byCourse).map((course, i) => {
                            const finalExam = course.entries.find(e => e.exam_type === 'Final');
                            const pct = finalExam ? Math.round((finalExam.marks_obtained / finalExam.total_marks) * 100) : null;
                            const gradeInfo = pct !== null ? GRADE_MAP(pct) : null;
                            return (
                                <motion.div key={course.code} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="font-black text-slate-900">{course.name}</h3>
                                            <span className="text-xs font-bold text-slate-400">{course.code}</span>
                                        </div>
                                        {gradeInfo && (
                                            <span className={`text-xl font-black px-4 py-1.5 rounded-xl ${gradeInfo.bg} ${gradeInfo.color}`}>{gradeInfo.grade}</span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {course.entries.map(e => {
                                            const p = Math.round((e.marks_obtained / e.total_marks) * 100);
                                            return (
                                                <div key={e.id} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{e.exam_type}</p>
                                                    <p className="text-lg font-black text-slate-900">{e.marks_obtained}<span className="text-xs text-slate-400">/{e.total_marks}</span></p>
                                                    <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${p >= 70 ? 'bg-emerald-500' : p >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${p}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Attendance Tab */}
                {activeTab === 'attendance' && (
                    <div className="space-y-4">
                        {overallAtt < 75 && (
                            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <p className="font-bold text-sm">Your overall attendance is below 75%. You may be barred from exams. Please attend classes regularly.</p>
                            </div>
                        )}
                        {Object.keys(attByCourse).length === 0 ? (
                            <EmptyState icon={<CheckCircle />} message="No attendance records yet." />
                        ) : Object.entries(attByCourse).map(([cid, data], i) => {
                            const pct = Math.round((data.present / data.total) * 100);
                            return (
                                <motion.div key={cid} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="font-black text-slate-900 text-sm">Course ID: {cid}</p>
                                            <p className="text-xs text-slate-400">{data.present} / {data.total} classes attended</p>
                                        </div>
                                        <span className={`text-lg font-black px-4 py-1.5 rounded-xl ${pct >= 75 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{pct}%</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all ${pct >= 75 ? 'bg-emerald-500' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

const SummaryCard = ({ label, value, icon, color }) => (
    <div className={`rounded-2xl p-4 border border-white ${color}`}>
        <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs font-black uppercase tracking-wider">{label}</span></div>
        <p className="text-2xl font-black">{value}</p>
    </div>
);

const EmptyState = ({ icon, message }) => (
    <div className="text-center py-12 text-slate-400">
        <div className="h-12 w-12 mx-auto mb-4 opacity-30">{icon}</div>
        <p className="font-bold">{message}</p>
    </div>
);

export default Performance;
