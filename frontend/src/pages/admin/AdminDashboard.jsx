import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, FileText, Database, Activity, BarChart3, Bell,
  Trash2, ShieldCheck, GraduationCap, BookOpen, Calendar,
  Upload, MessageSquare, Plus, X, ChevronDown, AlertCircle,
  TrendingUp, UserCog, Clock, Search
} from 'lucide-react';
import api from '../../services/api';
import Announcements from '../student/Announcements';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (ts) => ts ? new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
const fmtTime = (ts) => ts ? new Date(ts).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-';

const ROLE_COLORS = {
  admin:   'bg-red-100 text-red-700 border-red-200',
  faculty: 'bg-purple-100 text-purple-700 border-purple-200',
  student: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-5"
  >
    <div className={`p-4 rounded-2xl ${color}`}>{icon}</div>
    <div>
      <p className="text-3xl font-black text-slate-900">{value ?? '–'}</p>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{label}</p>
    </div>
  </motion.div>
);

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

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────
const NavItem = ({ icon, label, tab, active, onClick, badge }) => (
  <button
    onClick={() => onClick(tab)}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
      active
        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-100'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
    }`}
  >
    {icon}
    <span>{label}</span>
    {badge !== undefined && (
      <span className={`ml-auto text-xs font-black px-2 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
        {badge}
      </span>
    )}
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [forms, setForms] = useState([]);
  const [chatLogs, setChatLogs] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [showTTForm, setShowTTForm] = useState(false);
  const [ttForm, setTtForm] = useState({ department:'Computer Science', semester:3, day_of_week:'Monday', time_slot:'', subject_name:'', subject_code:'', room:'', faculty_name:'' });

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { setSearchQ(''); }, [activeTab]);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes, studentsRes, facultyRes, formsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/students'),
        api.get('/admin/faculty'),
        api.get('/admin/forms'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setStudents(studentsRes.data);
      setFaculty(facultyRes.data);
      setForms(formsRes.data);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const fetchChatLogs = async () => {
    try { const r = await api.get('/admin/chat-logs'); setChatLogs(r.data); } catch (e) { console.error(e); }
  };
  const fetchTimetable = async () => {
    try { const r = await api.get('/admin/timetable'); setTimetable(r.data); } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (activeTab === 'chatlogs') fetchChatLogs();
    if (activeTab === 'timetable') fetchTimetable();
  }, [activeTab]);

  // ── Actions ──
  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try { await api.delete(`/admin/users/${id}`); setUsers(p => p.filter(u => u.id !== id)); setStats(s => ({...s, total_users: s.total_users - 1})); }
    catch (e) { alert(e.response?.data?.detail || 'Failed to delete user'); }
  };

  const changeRole = async (id, role) => {
    try { await api.patch(`/admin/users/${id}/role?role=${role}`); setUsers(p => p.map(u => u.id === id ? {...u, role} : u)); }
    catch (e) { alert('Failed to change role'); }
  };

  const deleteForm = async (id) => {
    if (!window.confirm('Delete this form?')) return;
    try { await api.delete(`/admin/forms/${id}`); setForms(p => p.filter(f => f.id !== id)); }
    catch (e) { alert('Failed to delete'); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { setUploadMsg('Only PDF files are allowed.'); return; }
    const fd = new FormData();
    fd.append('file', file);
    const t = file.name.replace('.pdf','').replace(/[-_]/g,' ');
    fd.append('title', t.charAt(0).toUpperCase()+t.slice(1));
    fd.append('description', 'Uploaded via Admin portal.');
    try {
      setIsUploading(true); setUploadMsg('Uploading...');
      await api.post('/admin/forms/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploadMsg('✓ Upload successful!');
      const r = await api.get('/admin/forms'); setForms(r.data);
    } catch { setUploadMsg('✗ Upload failed.'); }
    finally { setIsUploading(false); setTimeout(() => setUploadMsg(''), 4000); }
  };

  const deleteTTEntry = async (id) => {
    if (!window.confirm('Delete this timetable entry?')) return;
    try { await api.delete(`/admin/timetable/${id}`); setTimetable(p => p.filter(t => t.id !== id)); }
    catch { alert('Failed to delete'); }
  };

  const addTTEntry = async (e) => {
    e.preventDefault();
    try { const r = await api.post('/admin/timetable', ttForm); setTimetable(p => [...p, r.data]); setShowTTForm(false); }
    catch { alert('Failed to add entry'); }
  };

  // ── Filter ──
  const filtered = (arr, keys) => arr.filter(item => keys.some(k => String(item[k] || '').toLowerCase().includes(searchQ.toLowerCase())));

  const DAYS_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const groupTT = (entries) => {
    const g = {};
    DAYS_ORDER.forEach(d => { g[d] = entries.filter(e => e.day_of_week === d); });
    return g;
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 hidden lg:flex flex-col shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-100">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-black text-slate-900 text-sm">Admin Console</h1>
              <p className="text-xs text-slate-400 font-medium">EduSphere Portal</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-black text-slate-300 uppercase tracking-widest px-4 mb-3 mt-2">Dashboard</p>
          <NavItem icon={<BarChart3 className="h-4 w-4"/>} label="Overview" tab="overview" active={activeTab==='overview'} onClick={setActiveTab} />
          <p className="text-xs font-black text-slate-300 uppercase tracking-widest px-4 mb-3 mt-5">Members</p>
          <NavItem icon={<Users className="h-4 w-4"/>} label="All Users" tab="users" active={activeTab==='users'} onClick={setActiveTab} badge={stats?.total_users} />
          <NavItem icon={<GraduationCap className="h-4 w-4"/>} label="Students" tab="students" active={activeTab==='students'} onClick={setActiveTab} badge={stats?.total_students} />
          <NavItem icon={<UserCog className="h-4 w-4"/>} label="Faculty" tab="faculty" active={activeTab==='faculty'} onClick={setActiveTab} badge={stats?.total_faculty} />
          <p className="text-xs font-black text-slate-300 uppercase tracking-widest px-4 mb-3 mt-5">Content</p>
          <NavItem icon={<Bell className="h-4 w-4"/>} label="Announcements" tab="announcements" active={activeTab==='announcements'} onClick={setActiveTab} badge={stats?.total_announcements} />
          <NavItem icon={<FileText className="h-4 w-4"/>} label="Forms" tab="forms" active={activeTab==='forms'} onClick={setActiveTab} badge={stats?.total_forms} />
          <NavItem icon={<Calendar className="h-4 w-4"/>} label="Timetable" tab="timetable" active={activeTab==='timetable'} onClick={setActiveTab} />
          <p className="text-xs font-black text-slate-300 uppercase tracking-widest px-4 mb-3 mt-5">AI & Logs</p>
          <NavItem icon={<MessageSquare className="h-4 w-4"/>} label="Chat Logs" tab="chatlogs" active={activeTab==='chatlogs'} onClick={setActiveTab} badge={stats?.total_chat_queries} />
          <NavItem icon={<Database className="h-4 w-4"/>} label="Knowledge Base" tab="rag" active={activeTab==='rag'} onClick={setActiveTab} />
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-auto">
        <header className="bg-white border-b border-slate-100 px-8 py-5 flex items-center gap-4 sticky top-0 z-30">
          <div className="flex-1">
            <h2 className="text-lg font-black text-slate-900 capitalize">{activeTab === 'rag' ? 'Knowledge Base' : activeTab === 'chatlogs' ? 'Chat Logs' : activeTab}</h2>
            <p className="text-xs text-slate-400 font-medium">EduSphere Admin Console</p>
          </div>
          {/* Mobile tab selector */}
          <div className="lg:hidden">
            <select className="text-sm border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={activeTab} onChange={e => setActiveTab(e.target.value)}>
              {['overview','users','students','faculty','announcements','forms','timetable','chatlogs','rag'].map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
              ))}
            </select>
          </div>
        </header>

        <div className="p-6 lg:p-8 max-w-7xl">

          {/* ── OVERVIEW ─────────────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard icon={<Users className="h-6 w-6 text-indigo-600"/>} label="Total Users" value={stats?.total_users} color="bg-indigo-50" delay={0.05}/>
                <StatCard icon={<GraduationCap className="h-6 w-6 text-emerald-600"/>} label="Students" value={stats?.total_students} color="bg-emerald-50" delay={0.1}/>
                <StatCard icon={<UserCog className="h-6 w-6 text-purple-600"/>} label="Faculty" value={stats?.total_faculty} color="bg-purple-50" delay={0.15}/>
                <StatCard icon={<Bell className="h-6 w-6 text-amber-600"/>} label="Announcements" value={stats?.total_announcements} color="bg-amber-50" delay={0.2}/>
                <StatCard icon={<FileText className="h-6 w-6 text-blue-600"/>} label="Forms" value={stats?.total_forms} color="bg-blue-50" delay={0.25}/>
                <StatCard icon={<MessageSquare className="h-6 w-6 text-rose-600"/>} label="AI Chat Queries" value={stats?.total_chat_queries} color="bg-rose-50" delay={0.3}/>
              </div>

              {/* Quick sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.35}} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-black text-slate-800 mb-4 text-sm uppercase tracking-widest">Recent Users</h3>
                  <div className="space-y-3">
                    {users.slice(0,5).map(u => (
                      <div key={u.id} className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                          {u.email[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-slate-700 flex-1 truncate">{u.email}</span>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Recent Forms */}
                <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-black text-slate-800 mb-4 text-sm uppercase tracking-widest">Recent Forms</h3>
                  {forms.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-6">No forms uploaded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {forms.slice(0,5).map(f => (
                        <div key={f.id} className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 text-red-500"/>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-700 truncate">{f.title}</p>
                            <p className="text-xs text-slate-400">{fmt(f.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          )}

          {/* ── USERS ────────────────────────────────────────────────────── */}
          {activeTab === 'users' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-wrap items-center gap-4">
                <h3 className="font-black text-slate-800">All Users</h3>
                <div className="ml-auto flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                    <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search by email…" className="pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 w-56"/>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50/80">
                    <tr>
                      {['ID','Email','Role','Joined','Actions'].map(h=>(
                        <th key={h} className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered(users, ['email','role']).map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-xs font-black text-slate-400">#{u.id}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">{u.email}</td>
                        <td className="px-6 py-4">
                          <select value={u.role} onChange={e=>changeRole(u.id,e.target.value)}
                            className={`text-xs font-black px-3 py-1.5 rounded-full border cursor-pointer ${ROLE_COLORS[u.role]} focus:outline-none`}>
                            <option value="student">student</option>
                            <option value="faculty">faculty</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">{fmt(u.created_at)}</td>
                        <td className="px-6 py-4">
                          <button onClick={()=>deleteUser(u.id)} className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 className="h-4 w-4"/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ── STUDENTS ─────────────────────────────────────────────────── */}
          {activeTab === 'students' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-wrap items-center gap-4">
                <h3 className="font-black text-slate-800">Student Profiles</h3>
                <div className="ml-auto relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                  <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search students…" className="pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 w-56"/>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50/80">
                    <tr>
                      {['Name','Email','Enroll No.','Dept','Sem','CGPA','Attendance'].map(h=>(
                        <th key={h} className="px-4 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered(students, ['first_name','last_name','email','enrollment_no','department']).map(s=>(
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                              {s.first_name?.[0]}
                            </div>
                            <span className="text-sm font-bold text-slate-800">{s.first_name} {s.last_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-500">{s.email}</td>
                        <td className="px-4 py-4 text-xs font-black text-indigo-600">{s.enrollment_no}</td>
                        <td className="px-4 py-4 text-sm text-slate-500">{s.department}</td>
                        <td className="px-4 py-4 text-sm font-bold text-slate-700 text-center">{s.current_semester}</td>
                        <td className="px-4 py-4">
                          <span className={`text-sm font-black ${s.cgpa>=8?'text-emerald-600':s.cgpa>=6?'text-amber-500':'text-red-500'}`}>{s.cgpa}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-100 rounded-full h-1.5 w-16">
                              <div className={`h-1.5 rounded-full ${s.attendance_pct>=75?'bg-emerald-500':'bg-red-400'}`} style={{width:`${s.attendance_pct}%`}}/>
                            </div>
                            <span className={`text-xs font-black ${s.attendance_pct>=75?'text-emerald-600':'text-red-500'}`}>{s.attendance_pct}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ── FACULTY ─────────────────────────────────────────────────── */}
          {activeTab === 'faculty' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-wrap items-center gap-4">
                <h3 className="font-black text-slate-800">Faculty Directory</h3>
                <div className="ml-auto relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                  <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search faculty…" className="pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 w-56"/>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50/80">
                    <tr>
                      {['Name','Email','Employee ID','Department','Designation'].map(h=>(
                        <th key={h} className="px-4 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered(faculty, ['first_name','last_name','email','department','designation']).map(f=>(
                      <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                              {f.first_name?.[0]}
                            </div>
                            <span className="text-sm font-bold text-slate-800">{f.first_name} {f.last_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-500">{f.email}</td>
                        <td className="px-4 py-4 text-xs font-black text-purple-600">{f.employee_id}</td>
                        <td className="px-4 py-4 text-sm text-slate-500">{f.department}</td>
                        <td className="px-4 py-4">
                          <span className="bg-purple-50 text-purple-700 text-xs font-black px-2 py-1 rounded-full border border-purple-100">{f.designation}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ── ANNOUNCEMENTS ─────────────────────────────────────────────── */}
          {activeTab === 'announcements' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}}>
              <Announcements isAdmin={true} />
            </motion.div>
          )}

          {/* ── FORMS ─────────────────────────────────────────────────────── */}
          {activeTab === 'forms' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
              {/* Upload area */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-50 rounded-2xl"><Upload className="h-5 w-5 text-blue-600"/></div>
                  <div>
                    <h3 className="font-black text-slate-800">Upload Application Form</h3>
                    <p className="text-xs text-slate-400 mt-0.5">PDF only — the AI chatbot will serve these to students automatically.</p>
                  </div>
                </div>
                <label className="block border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50 rounded-2xl p-10 text-center cursor-pointer transition-all group">
                  <Upload className="h-10 w-10 text-indigo-300 group-hover:text-indigo-500 mx-auto mb-3 transition-colors"/>
                  <p className="text-sm font-bold text-indigo-600">{isUploading ? 'Uploading…' : 'Click to upload PDF'}</p>
                  <p className="text-xs text-slate-400 mt-1">PDF up to 10 MB</p>
                  <input type="file" accept=".pdf" onChange={handleFileUpload} disabled={isUploading} className="sr-only"/>
                </label>
                {uploadMsg && (
                  <p className={`mt-3 text-sm font-bold text-center ${uploadMsg.startsWith('✓') ? 'text-emerald-600' : 'text-red-500'}`}>{uploadMsg}</p>
                )}
              </div>

              {/* List */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-black text-slate-800">Forms in System ({forms.length})</h3>
                </div>
                {forms.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <FileText className="h-12 w-12 mx-auto opacity-20 mb-3"/>
                    <p className="font-bold">No forms uploaded yet</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-50">
                    {forms.map(f=>(
                      <li key={f.id} className="flex items-center gap-4 p-6 hover:bg-slate-50/50 transition-colors">
                        <div className="h-10 w-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-red-500"/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 truncate">{f.title}</p>
                          <p className="text-xs text-slate-400">{f.description} · Added {fmt(f.created_at)}</p>
                        </div>
                        <button onClick={()=>deleteForm(f.id)} className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                          <Trash2 className="h-4 w-4"/>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          )}

          {/* ── TIMETABLE ─────────────────────────────────────────────────── */}
          {activeTab === 'timetable' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-800 text-lg">Timetable Entries ({timetable.length})</h3>
                <button onClick={()=>setShowTTForm(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 transition-colors">
                  <Plus className="h-4 w-4"/> Add Entry
                </button>
              </div>
              {Object.entries(groupTT(timetable)).map(([day, entries]) => entries.length === 0 ? null : (
                <div key={day} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-100">
                    <h4 className="font-black text-indigo-800 text-sm uppercase tracking-widest">{day}</h4>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {entries.map(e=>(
                      <div key={e.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                        <div className="text-xs font-black text-slate-400 w-24 flex-shrink-0 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5"/>{e.time_slot}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 text-sm">{e.subject_name}</p>
                          <p className="text-xs text-slate-400">{e.subject_code} · {e.faculty_name} · {e.room}</p>
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
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
                      </div>
                    ))}
                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-1.5">Day</label>
                      <select value={ttForm.day_of_week} onChange={e=>setTtForm(p=>({...p,day_of_week:e.target.value}))}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300">
                        {DAYS_ORDER.map(d=><option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-black transition-colors shadow-lg shadow-indigo-100 mt-2">
                      Add Entry
                    </button>
                  </form>
                </Modal>
              )}
            </motion.div>
          )}

          {/* ── CHAT LOGS ─────────────────────────────────────────────────── */}
          {activeTab === 'chatlogs' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
              <div className="flex items-center gap-4">
                <h3 className="font-black text-slate-800 text-lg">AI Chat History ({chatLogs.length})</h3>
                <div className="ml-auto relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                  <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search queries…" className="pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 w-64"/>
                </div>
              </div>
              {filtered(chatLogs, ['query','user_email','answer']).map(m=>(
                <div key={m.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                        {m.user_email?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-slate-500">{m.user_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-slate-100 text-slate-500 font-black px-2 py-0.5 rounded-full">{m.source}</span>
                      <span className="text-xs text-slate-400">{fmtTime(m.timestamp)}</span>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-800 mb-2">Q: {m.query}</p>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">A: {m.answer}</p>
                </div>
              ))}
              {chatLogs.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 text-center py-20 text-slate-400">
                  <MessageSquare className="h-12 w-12 mx-auto opacity-20 mb-3"/>
                  <p className="font-bold">No chat history yet</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── KNOWLEDGE BASE ─────────────────────────────────────────────── */}
          {activeTab === 'rag' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 max-w-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-indigo-50 rounded-2xl"><Database className="h-6 w-6 text-indigo-600"/></div>
                <div>
                  <h3 className="font-black text-slate-800 text-xl">AI Knowledge Base</h3>
                  <p className="text-sm text-slate-400 mt-0.5">Feed PDFs into ChromaDB for the AI chatbot to retrieve answers from.</p>
                </div>
              </div>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                <Database className="h-12 w-12 text-slate-200 mx-auto mb-4"/>
                <p className="font-black text-slate-400 mb-1">ChromaDB Ingestion</p>
                <p className="text-sm text-slate-400 mb-6">Upload college handbooks, syllabi, or prospectuses here. The AI will use them to answer student queries.</p>
                <button disabled className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black opacity-50 cursor-not-allowed">
                  Ingest to ChromaDB (coming soon)
                </button>
              </div>
              <div className="mt-6 bg-blue-50 rounded-2xl p-5 space-y-2 text-sm text-blue-700">
                <p className="font-black text-blue-900 mb-2">How it works</p>
                <p>① PDF uploaded to <code className="bg-blue-100 px-1 rounded">data/uploads/</code></p>
                <p>② PyPDFLoader extracts text chunks</p>
                <p>③ HuggingFace Embeddings convert to vectors</p>
                <p>④ Vectors stored permanently in ChromaDB</p>
                <p>⑤ Chatbot retrieves context for student queries</p>
              </div>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
