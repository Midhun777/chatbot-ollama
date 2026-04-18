import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Bell, Clock, Plus, Trash2, Upload, MessageSquare, Users, X, ShieldCheck, AlertCircle, Info, Lock, Edit } from 'lucide-react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import Announcements from '../student/Announcements';
import Messages from '../public/Messages';

const DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
    <motion.div
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative bg-white rounded-xl shadow-formal w-full max-w-lg p-6 z-10 max-h-[90vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <h2 className="text-lg font-bold text-brand-900">{title}</h2>
        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
          <X className="h-5 w-5" />
        </button>
      </div>
      {children}
    </motion.div>
  </div>
);

const FacultyDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const isPending = user?.status === 'pending';
    
    const [activeTab, setActiveTab] = useState(isPending ? 'announcements' : 'materials');
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [students, setStudents] = useState([]);
    

    // Timetable
    const [timetable, setTimetable] = useState([]);
    const [showTTForm, setShowTTForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const inicialTT = { 
        department: user?.faculty_profile?.department || '', 
        semester: 1, 
        day_of_week: 'Monday', 
        time_slot: '', 
        subject_name: '', 
        subject_code: '', 
        room: '', 
        faculty_name: user?.faculty_profile ? `${user.faculty_profile.first_name} ${user.faculty_profile.last_name}` : '' 
    };
    const [ttForm, setTtForm] = useState(inicialTT);

    // Forms / Materials
    const [materials, setMaterials] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadMsg, setUploadMsg] = useState('');

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
        try { 
            // For faculty, we want to see their department's timetable
            if (!user?.faculty_profile?.department) return;
            const r = await api.get(`/timetable/?dept=${encodeURIComponent(user.faculty_profile.department)}`); 
            setTimetable(r.data); 
        } catch (e) { console.error(e); }
    };

    const groupTT = (entries) => {
        const grouped = DAYS_ORDER.reduce((acc, day) => ({ ...acc, [day]: [] }), {});
        entries.forEach(e => {
            if (grouped[e.day_of_week]) grouped[e.day_of_week].push(e);
        });
        return grouped;
    };

    const saveTTEntry = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/timetable/${editingId}`, ttForm);
            } else {
                await api.post('/timetable/', ttForm);
            }
            setShowTTForm(false);
            setEditingId(null);
            setTtForm(inicialTT);
            fetchTimetable();
        } catch (err) {
            alert(`Failed to ${editingId ? 'update' : 'add'} timetable entry.`);
        }
    };

    const handleEditTTEntry = (entry) => {
        setTtForm({
            department: entry.department,
            semester: entry.semester,
            day_of_week: entry.day_of_week,
            time_slot: entry.time_slot,
            subject_name: entry.subject_name,
            subject_code: entry.subject_code,
            room: entry.room,
            faculty_name: entry.faculty_name
        });
        setEditingId(entry.id);
        setShowTTForm(true);
    };

    const deleteTTEntry = async (id) => {
        if (!window.confirm("Delete this entry?")) return;
        try {
            await api.delete(`/timetable/${id}`);
            fetchTimetable();
        } catch (err) {
            alert("Failed to delete entry.");
        }
    };
    
    const fetchMaterials = async () => {
        try { const r = await api.get('/admin/forms'); setMaterials(r.data); } catch (e) { console.error(e); }
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


    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-brand-900 tracking-tight">Faculty Dashboard</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Manage courses, students, timetable, and announcements.</p>
                </div>
                <button
                    onClick={() => navigate('/faculty/profile')}
                    className="p-2 flex items-center gap-2 rounded-lg text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors border border-brand-100 font-semibold text-sm"
                    title="Edit Profile"
                >
                    <Edit className="h-4 w-4" />
                    Edit Profile
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Nav */}
                <div className="w-full md:w-64 flex flex-col gap-1.5 shrink-0">
                        {[
                            { id: 'materials', label: 'Course Materials', icon: <BookOpen className="h-5 w-5" />, disabled: isPending },
                            { id: 'messages', label: 'Live Chat', icon: <MessageSquare className="h-5 w-5" />, disabled: isPending },
                            { id: 'timetable', label: 'Timetable', icon: <Clock className="h-5 w-5" />, disabled: isPending },
                            { id: 'announcements', label: 'Announcements', icon: <Bell className="h-5 w-5" />, disabled: false },
                        ].map(tab => (
                        <button
                            key={tab.id}
                            disabled={tab.disabled}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 text-left relative ${
                                activeTab === tab.id 
                                    ? 'bg-brand-900 text-white shadow-sm' 
                                    : tab.disabled 
                                        ? 'text-slate-300 cursor-not-allowed' 
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-brand-900'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                            {tab.disabled && <Lock className="h-3 w-3 ml-auto text-slate-300" />}
                        </button>
                    ))}
                </div>

                {/* Main Workspace */}
                <div className="flex-1 formal-card min-h-[600px] flex flex-col">

                    {/* Generic Course Selector (Shared between Attendance, Marks, Materials) */}
                    {['materials'].includes(activeTab) && (
                        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-wrap gap-5 items-end rounded-t-2xl">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Assigned Course</label>
                                <select 
                                    className="w-full border-slate-300 rounded-lg shadow-sm focus:border-brand-primary focus:ring-brand-primary p-2.5 text-sm font-semibold text-slate-800 bg-white"
                                    value={selectedCourseId}
                                    onChange={e => setSelectedCourseId(e.target.value)}
                                >
                                    <option value="" disabled>Select a course...</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.course_code} - {c.course_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {isPending && (
                        <div className="bg-amber-50 border-b border-amber-100 px-6 py-4 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                <ShieldCheck className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-amber-900">Account Approval Pending</h3>
                                <p className="text-xs text-amber-700 font-medium">Your faculty credentials are being verified by administration. Some tools are temporarily restricted.</p>
                            </div>
                            <div className="ml-auto hidden sm:block">
                                <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border border-amber-200">Pending Review</span>
                            </div>
                        </div>
                    )}

                    <div className="p-6 flex-1">

                        {/* MATERIALS TAB */}
                        {activeTab === 'materials' && (
                            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-8">
                                <div>
                                    <h2 className="text-lg font-bold text-brand-900 mb-1">Study Materials</h2>
                                    <p className="text-sm text-slate-500 font-medium mb-5">Upload PDFs for your students. The AI Chatbot uses these to answer queries.</p>
                                    
                                    <label className="block border-2 border-dashed border-slate-300 hover:border-brand-primary bg-slate-50 hover:bg-brand-50 rounded-xl p-10 text-center cursor-pointer transition-all group">
                                        <Upload className="h-8 w-8 text-slate-400 group-hover:text-brand-primary mx-auto mb-3 transition-colors"/>
                                        <p className="text-sm font-semibold text-slate-700 group-hover:text-brand-700">{isUploading ? 'Uploading & Processing...' : 'Click to upload PDF Document'}</p>
                                        <p className="text-xs text-slate-500 mt-1 font-medium bg-white border border-slate-200 rounded px-2 py-1 mx-auto max-w-xs">{selectedCourseId ? 'Course ID appended automatically' : 'Select a course first'}</p>
                                        <input type="file" accept=".pdf" onChange={handleFileUpload} disabled={isUploading || !selectedCourseId} className="sr-only"/>
                                    </label>
                                    {uploadMsg && (
                                        <p className={`mt-3 text-sm font-semibold text-center ${uploadMsg.startsWith('✓') ? 'text-emerald-600' : 'text-rose-600'}`}>{uploadMsg}</p>
                                    )}
                                </div>

                                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                                        <h3 className="font-semibold text-sm text-slate-700">Previously Uploaded Materials</h3>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {materials.length === 0 ? (
                                            <div className="p-6 text-center text-slate-500 text-sm font-medium">No materials uploaded yet.</div>
                                        ) : (
                                            <ul className="divide-y divide-slate-100">
                                                {materials.map(m => (
                                                    <li key={m.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-slate-100 border border-slate-200 rounded-md">
                                                                <BookOpen className="h-4 w-4 text-slate-600" />
                                                            </div>
                                                            <span className="font-semibold text-sm text-brand-900">{m.title}</span>
                                                        </div>
                                                        <span className="text-xs text-slate-500 font-medium">{new Date(m.created_at).toLocaleDateString()}</span>
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
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                    <h3 className="font-bold text-brand-900 text-lg">Manage Timetable</h3>
                                    <button onClick={()=>{setEditingId(null); setTtForm(inicialTT); setShowTTForm(true);}} className="btn-primary text-sm px-4 py-2">
                                        <Plus className="h-4 w-4 mr-1.5 inline-block"/> Add Entry
                                    </button>
                                </div>
                                {Object.entries(groupTT(timetable)).map(([day, entries]) => entries.length === 0 ? null : (
                                <div key={day} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-4">
                                    <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200">
                                        <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">{day}</h4>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                    {entries.map(e=>(
                                        <div key={e.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                                            <div className="text-xs font-semibold text-slate-500 w-24 flex-shrink-0 flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded">
                                                <Clock className="h-3 w-3"/>{e.time_slot}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-brand-900 text-sm mb-0.5">{e.subject_name}</p>
                                                <p className="text-xs font-medium text-slate-500">{e.subject_code} &bull; {e.faculty_name} &bull; Room {e.room}</p>
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <button onClick={()=>handleEditTTEntry(e)} className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-colors">
                                                    <Edit className="h-4 w-4"/>
                                                </button>
                                                <button onClick={()=>deleteTTEntry(e.id)} className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors">
                                                    <Trash2 className="h-4 w-4"/>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    </div>
                                </div>
                                ))}
                                {showTTForm && (
                                <Modal title={editingId ? "Edit Timetable Entry" : "Add Timetable Entry"} onClose={()=>setShowTTForm(false)}>
                                    <form onSubmit={saveTTEntry} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                {label:'Department',key:'department',type:'text'},
                                                {label:'Semester',key:'semester',type:'number'},
                                                {label:'Time Slot (e.g. 09:00 - 10:00)',key:'time_slot',type:'text'},
                                                {label:'Subject Name',key:'subject_name',type:'text'},
                                                {label:'Subject Code',key:'subject_code',type:'text'},
                                                {label:'Room',key:'room',type:'text'},
                                                {label:'Faculty Name',key:'faculty_name',type:'text'},
                                            ].map(({label,key,type})=>(
                                                <div key={key} className={key === 'subject_name' ? 'col-span-2' : ''}>
                                                    <label className="text-xs font-bold text-slate-600 mb-1.5 block">{label}</label>
                                                    <input type={type} value={ttForm[key]} onChange={e=>setTtForm(p=>({...p,[key]:type==='number'?+e.target.value:e.target.value}))} required
                                                        className="w-full border-slate-300 rounded-lg shadow-sm focus:border-brand-primary focus:ring-brand-primary p-2.5 text-sm font-medium text-slate-800 bg-white"/>
                                                </div>
                                            ))}
                                            <div>
                                                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Day of Week</label>
                                                <select value={ttForm.day_of_week} onChange={e=>setTtForm(p=>({...p,day_of_week:e.target.value}))}
                                                    className="w-full border-slate-300 rounded-lg shadow-sm focus:border-brand-primary focus:ring-brand-primary p-2.5 text-sm font-medium text-slate-800 bg-white">
                                                    {DAYS_ORDER.map(d=><option key={d}>{d}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-slate-100 mt-6 flex justify-end gap-3">
                                            <button type="button" onClick={()=>setShowTTForm(false)} className="btn-secondary px-4 py-2 text-sm">Cancel</button>
                                            <button type="submit" className="btn-primary px-4 py-2 text-sm">Save Entry</button>
                                        </div>
                                    </form>
                                </Modal>
                                )}
                            </motion.div>
                        )}

                        {/* MESSAGES TAB */}
                        {activeTab === 'messages' && (
                            <div className="h-full">
                                <Messages />
                            </div>
                        )}

                        {/* ANNOUNCEMENTS TAB */}
                        {activeTab === 'announcements' && (
                            <div className="">
                                {/* Only give admin UI privileges if the faculty account is approved */}
                                <Announcements isAdmin={!isPending} />
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;
