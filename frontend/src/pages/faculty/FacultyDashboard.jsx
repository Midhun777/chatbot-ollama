import React, { useState, useEffect } from 'react';
import { CalendarCheck, FileSpreadsheet, Users, BookOpen, Clock, Bell, Upload, Plus, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import Announcements from '../student/Announcements';

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 z-10 max-h-[90vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-slate-900">{title}</h2>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <X className="h-5 w-5 text-slate-500" />
        </button>
      </div>
      {children}
    </motion.div>
  </div>
);

const FacultyDashboard = () => {
    const [activeTab, setActiveTab] = useState('attendance');
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [students, setStudents] = useState([]);
    
    // Attendance specific
    const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
    
    // Marks specific
    const [examType, setExamType] = useState('Mid-Semester');
    const [totalMarks, setTotalMarks] = useState(100);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadMsg, setUploadMsg] = useState('');

    // Timetable
    const [timetable, setTimetable] = useState([]);
    const [showTTForm, setShowTTForm] = useState(false);
    const [ttForm, setTtForm] = useState({ department:'', semester:1, day_of_week:'Monday', time_slot:'', subject_name:'', subject_code:'', room:'', faculty_name:'' });

    // Forms / Materials
    const [materials, setMaterials] = useState([]);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedCourseId) {
            fetchStudents(selectedCourseId);
        } else {
            setStudents([]);
        }
    }, [selectedCourseId]);
    
    useEffect(() => {
        if (activeTab === 'timetable') fetchTimetable();
        if (activeTab === 'materials') fetchMaterials();
    }, [activeTab]);

    const fetchCourses = async () => {
        try {
            const res = await api.get('/faculty/courses');
            setCourses(res.data);
            if (res.data.length > 0 && !selectedCourseId) {
                // Preselect first course if none selected
                setSelectedCourseId(res.data[0].id.toString());
            }
        } catch (e) {
            console.error("Failed to load courses");
        }
    };

    const fetchStudents = async (cId) => {
        try {
            const res = await api.get(`/faculty/courses/${cId}/students`);
            // Add local states for inputs
            const mapped = res.data.map(s => ({
                ...s,
                attStatus: 'Present',
                markObtained: ''
            }));
            setStudents(mapped);
        } catch (e) {
            console.error("Failed to load students");
        }
    };

    const fetchTimetable = async () => {
        try { const r = await api.get('/timetable/'); setTimetable(r.data); } catch (e) { console.error(e); }
    };
    
    const fetchMaterials = async () => {
        try { const r = await api.get('/admin/forms'); setMaterials(r.data); } catch (e) { console.error(e); }
    };

    const handleAttendanceSubmit = async (studentId, status) => {
        try {
            await api.post('/faculty/attendance', {
                student_id: studentId,
                course_id: parseInt(selectedCourseId),
                date: attDate,
                status: status
            });
            alert('Attendance saved successfully');
        } catch (e) {
            alert('Failed to save attendance');
        }
    };

    const handleMarkSubmit = async (studentId, marks) => {
        if (marks === '') return alert('Enter marks before saving');
        try {
            await api.post('/faculty/marks', {
                student_id: studentId,
                course_id: parseInt(selectedCourseId),
                exam_type: examType,
                marks_obtained: parseFloat(marks),
                total_marks: parseFloat(totalMarks)
            });
            alert('Marks saved successfully');
        } catch (e) {
            alert('Failed to save marks');
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type !== 'application/pdf') { setUploadMsg('Only PDF files are allowed.'); return; }
        const fd = new FormData();
        fd.append('file', file);
        const selected = courses.find(c => c.id.toString() === selectedCourseId);
        const prefix = selected ? `[${selected.course_code}] ` : "";
        
        const t = file.name.replace('.pdf','').replace(/[-_]/g,' ');
        fd.append('title', prefix + t.charAt(0).toUpperCase()+t.slice(1));
        fd.append('description', 'Uploaded via Faculty portal.');
        try {
          setIsUploading(true); setUploadMsg('Uploading...');
          await api.post('/faculty/materials', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
          setUploadMsg('✓ Upload successful!');
          fetchMaterials();
        } catch { setUploadMsg('✗ Upload failed.'); }
        finally { setIsUploading(false); setTimeout(() => setUploadMsg(''), 4000); }
    };

    // Timetable Handlers
    const DAYS_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const groupTT = (entries) => {
      const g = {};
      DAYS_ORDER.forEach(d => { g[d] = entries.filter(e => e.day_of_week === d); });
      return g;
    };
    
    const deleteTTEntry = async (id) => {
      if (!window.confirm('Delete this timetable entry?')) return;
      try { await api.delete(`/timetable/${id}`); setTimetable(p => p.filter(t => t.id !== id)); }
      catch { alert('Failed to delete'); }
    };
  
    const addTTEntry = async (e) => {
      e.preventDefault();
      try { const r = await api.post('/timetable/', ttForm); setTimetable(p => [...p, r.data]); setShowTTForm(false); }
      catch { alert('Failed to add entry'); }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900">Faculty Portal</h1>
                <p className="text-sm font-medium text-slate-500 mt-1">Manage your assigned courses, students, timetable, and announcements.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Nav */}
                <div className="w-full md:w-64 flex flex-col gap-2">
                    {[
                        { id: 'attendance', label: 'Mark Attendance', icon: <CalendarCheck className="h-5 w-5" /> },
                        { id: 'marks', label: 'Upload Marks', icon: <FileSpreadsheet className="h-5 w-5" /> },
                        { id: 'materials', label: 'Course Materials', icon: <BookOpen className="h-5 w-5" /> },
                        { id: 'timetable', label: 'Timetable', icon: <Clock className="h-5 w-5" /> },
                        { id: 'announcements', label: 'Announcements', icon: <Bell className="h-5 w-5" /> },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-5 py-3.5 text-sm font-bold rounded-2xl transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200' : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'}`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Workspace */}
                <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 p-8 min-h-[600px]">

                    {/* Generic Course Selector (Shared between Attendance, Marks, Materials) */}
                    {['attendance', 'marks', 'materials'].includes(activeTab) && (
                        <div className="mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-wrap gap-6 items-end">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Select Assigned Course</label>
                                <select 
                                    className="w-full border-slate-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 text-sm font-bold text-slate-700 bg-white"
                                    value={selectedCourseId}
                                    onChange={e => setSelectedCourseId(e.target.value)}
                                >
                                    <option value="" disabled>Select a course...</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.course_code} - {c.course_name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            {activeTab === 'attendance' && (
                                <div className="w-[200px]">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Date</label>
                                    <input type="date" className="w-full border border-slate-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 text-sm font-bold text-slate-700 bg-white" value={attDate} onChange={e => setAttDate(e.target.value)} />
                                </div>
                            )}

                            {activeTab === 'marks' && (
                                <>
                                    <div className="w-[200px]">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Exam Type</label>
                                        <select className="w-full border border-slate-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 text-sm font-bold text-slate-700 bg-white" value={examType} onChange={e => setExamType(e.target.value)}>
                                            <option>Mid-Semester</option>
                                            <option>End-Semester</option>
                                            <option>Internal Assignment</option>
                                        </select>
                                    </div>
                                    <div className="w-[150px]">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Marks</label>
                                        <input type="number" className="w-full border border-slate-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 text-sm font-bold text-slate-700 bg-white" value={totalMarks} onChange={e => setTotalMarks(e.target.value)} />
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* ATTENDANCE TAB */}
                    {activeTab === 'attendance' && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}}>
                            <h2 className="text-xl font-black text-slate-800 mb-6">Daily Attendance Entry</h2>
                            {students.length === 0 ? (
                                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-12 text-center">
                                    <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <p className="font-bold text-slate-500">No students found or course not selected.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                                    <table className="min-w-full divide-y divide-slate-100">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Enrollment No</th>
                                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Student Name</th>
                                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 bg-white">
                                            {students.map((s, idx) => (
                                                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-bold text-indigo-600">{s.enrollment_no}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{s.first_name} {s.last_name}</td>
                                                    <td className="px-6 py-4">
                                                        <select 
                                                            className={`text-xs font-black px-3 py-1.5 rounded-full border focus:outline-none cursor-pointer ${s.attStatus === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                                                            value={s.attStatus}
                                                            onChange={e => {
                                                                const newSt = [...students];
                                                                newSt[idx].attStatus = e.target.value;
                                                                setStudents(newSt);
                                                            }}
                                                        >
                                                            <option value="Present">Present</option>
                                                            <option value="Absent">Absent</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button 
                                                            onClick={() => handleAttendanceSubmit(s.id, s.attStatus)}
                                                            className="text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition"
                                                        >
                                                            Save
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* MARKS TAB */}
                    {activeTab === 'marks' && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}}>
                            <h2 className="text-xl font-black text-slate-800 mb-6">Grade Uploads</h2>
                            {students.length === 0 ? (
                                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-12 text-center">
                                    <FileSpreadsheet className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <p className="font-bold text-slate-500">No students found or course not selected.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                                    <table className="min-w-full divide-y divide-slate-100">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Enrollment No</th>
                                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Student Name</th>
                                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Marks Obtained</th>
                                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 bg-white">
                                            {students.map((s, idx) => (
                                                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-bold text-indigo-600">{s.enrollment_no}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{s.first_name} {s.last_name}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <input 
                                                                type="number" 
                                                                className="w-20 border border-slate-200 rounded-lg p-2 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                                                                placeholder="0"
                                                                value={s.markObtained}
                                                                onChange={e => {
                                                                    const newSt = [...students];
                                                                    newSt[idx].markObtained = e.target.value;
                                                                    setStudents(newSt);
                                                                }}
                                                            />
                                                            <span className="text-sm font-bold text-slate-400">/ {totalMarks}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button 
                                                            onClick={() => handleMarkSubmit(s.id, s.markObtained)}
                                                            className="text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition"
                                                        >
                                                            Save Grade
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* MATERIALS TAB */}
                    {activeTab === 'materials' && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-8">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 mb-2">Study Materials</h2>
                                <p className="text-sm text-slate-500 font-medium mb-6">Upload PDFs for your students. These will also be used by the AI Chatbot to answer their questions!</p>
                                
                                <label className="block border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50 rounded-3xl p-12 text-center cursor-pointer transition-all group">
                                    <Upload className="h-10 w-10 text-indigo-300 group-hover:text-indigo-500 mx-auto mb-4 transition-colors"/>
                                    <p className="text-base font-bold text-indigo-600">{isUploading ? 'Uploading & Processing...' : 'Click to upload Course Material PDF'}</p>
                                    <p className="text-sm text-slate-400 mt-2 font-medium">Selected Course code will automatically be appended to the file name.</p>
                                    <input type="file" accept=".pdf" onChange={handleFileUpload} disabled={isUploading || !selectedCourseId} className="sr-only"/>
                                </label>
                                {uploadMsg && (
                                    <p className={`mt-4 text-sm font-bold text-center ${uploadMsg.startsWith('✓') ? 'text-emerald-600' : 'text-red-500'}`}>{uploadMsg}</p>
                                )}
                            </div>

                            <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                                    <h3 className="font-black text-slate-700">Previously Uploaded Materials</h3>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto">
                                    {materials.length === 0 ? (
                                        <div className="p-8 text-center text-slate-400 font-medium">No materials uploaded yet.</div>
                                    ) : (
                                        <ul className="divide-y divide-slate-100">
                                            {materials.map(m => (
                                                <li key={m.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
                                                    <div className="flex items-center gap-3">
                                                        <BookOpen className="h-5 w-5 text-indigo-500" />
                                                        <span className="font-bold text-sm text-slate-700">{m.title}</span>
                                                    </div>
                                                    <span className="text-xs text-slate-400 font-medium">{new Date(m.created_at).toLocaleDateString()}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* TIMETABLE TAB */}
                    {activeTab === 'timetable' && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
                            <div className="flex items-center justify-between">
                            <h3 className="font-black text-slate-800 text-xl">Manage Timetable</h3>
                            <button onClick={()=>setShowTTForm(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 transition-colors">
                                <Plus className="h-4 w-4"/> Add Entry
                            </button>
                            </div>
                            {Object.entries(groupTT(timetable)).map(([day, entries]) => entries.length === 0 ? null : (
                            <div key={day} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
                                <h4 className="font-black text-indigo-800 text-sm uppercase tracking-widest">{day}</h4>
                                </div>
                                <div className="divide-y divide-slate-100">
                                {entries.map(e=>(
                                    <div key={e.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                                    <div className="text-xs font-black text-slate-400 w-24 flex-shrink-0 flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5"/>{e.time_slot}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 text-sm">{e.subject_name}</p>
                                        <p className="text-xs font-medium text-slate-500 mt-0.5">{e.subject_code} · {e.faculty_name} · {e.room}</p>
                                    </div>
                                    <button onClick={()=>deleteTTEntry(e.id)} className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                                        <Trash2 className="h-4 w-4"/>
                                    </button>
                                    </div>
                                ))}
                                </div>
                            </div>
                            ))}
                            {showTTForm && (
                            <Modal title="Add Timetable Entry" onClose={()=>setShowTTForm(false)}>
                                <form onSubmit={addTTEntry} className="space-y-4">
                                {[
                                    {label:'Department',key:'department',type:'text'},
                                    {label:'Semester',key:'semester',type:'number'},
                                    {label:'Time Slot (e.g. 09:00 - 10:00)',key:'time_slot',type:'text'},
                                    {label:'Subject Name',key:'subject_name',type:'text'},
                                    {label:'Subject Code',key:'subject_code',type:'text'},
                                    {label:'Room',key:'room',type:'text'},
                                    {label:'Faculty Name',key:'faculty_name',type:'text'},
                                ].map(({label,key,type})=>(
                                    <div key={key}>
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-1.5">{label}</label>
                                    <input type={type} value={ttForm[key]} onChange={e=>setTtForm(p=>({...p,[key]:type==='number'?+e.target.value:e.target.value}))} required
                                        className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white transition-all"/>
                                    </div>
                                ))}
                                <div>
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-1.5">Day</label>
                                    <select value={ttForm.day_of_week} onChange={e=>setTtForm(p=>({...p,day_of_week:e.target.value}))}
                                    className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white transition-all">
                                    {DAYS_ORDER.map(d=><option key={d}>{d}</option>)}
                                    </select>
                                </div>
                                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-black transition-colors shadow-lg shadow-indigo-100 mt-4">
                                    Save Timetable Entry
                                </button>
                                </form>
                            </Modal>
                            )}
                        </motion.div>
                    )}

                    {/* ANNOUNCEMENTS TAB */}
                    {activeTab === 'announcements' && (
                        <div className="-mt-10">
                            {/* Reusing existing Announcements component component with admin privileges enabled */}
                            <Announcements isAdmin={true} />
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;
