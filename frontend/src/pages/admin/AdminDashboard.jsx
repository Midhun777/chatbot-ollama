import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, FileText, Activity, BarChart3, Bell,
  Trash2, ShieldCheck, GraduationCap, BookOpen, Calendar,
  Upload, Plus, X, ChevronDown, AlertCircle,
  TrendingUp, UserCog, Clock, Search, RefreshCw
} from 'lucide-react';
import api from '../../services/api';
import Announcements from '../student/Announcements';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (ts) => ts ? new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
const fmtTime = (ts) => ts ? new Date(ts).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-';

const ROLE_COLORS = {
  admin:   'bg-rose-50 text-rose-700 border-rose-200',
  faculty: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  student: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="formal-card p-6 flex items-center gap-5"
  >
    <div className={`p-3.5 rounded-lg border ${color}`}>{icon}</div>
    <div>
      <p className="text-3xl font-bold text-brand-900 tracking-tight">{value ?? '–'}</p>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">{label}</p>
    </div>
  </motion.div>
);

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

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────
const NavItem = ({ icon, label, tab, active, onClick, badge }) => (
  <button
    onClick={() => onClick(tab)}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 ${
      active
        ? 'bg-brand-900 text-white shadow-sm'
        : 'text-slate-600 hover:bg-slate-100 hover:text-brand-900'
    }`}
  >
    {icon}
    <span>{label}</span>
    {badge !== undefined && (
      <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-md ${active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
        {badge}
      </span>
    )}
  </button>
);

const ActionButton = ({ icon, label, onClick, color, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${color} disabled:opacity-30 disabled:cursor-not-allowed`}
  >
    {icon}
    {label}
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
  const [auditLogs, setAuditLogs] = useState([]);
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

  const fetchAuditLogs = async () => {
    try { const r = await api.get('/admin/audit-logs'); setAuditLogs(r.data); } catch (e) { console.error(e); }
  };
  const fetchTimetable = async () => {
    try { const r = await api.get('/admin/timetable'); setTimetable(r.data); } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (activeTab === 'auditlogs') fetchAuditLogs();
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
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-brand-900 flex items-center justify-center shadow-sm">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-brand-900 text-sm tracking-tight">Admin Console</h1>
              <p className="text-xs text-slate-500 font-medium">EduSphere Portal</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 mb-3 mt-2">Dashboard</p>
          <NavItem icon={<BarChart3 className="h-4 w-4"/>} label="Overview" tab="overview" active={activeTab==='overview'} onClick={setActiveTab} />
          
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 mb-3 mt-6">Members</p>
          <NavItem icon={<Users className="h-4 w-4"/>} label="All Users" tab="users" active={activeTab==='users'} onClick={setActiveTab} badge={stats?.total_users} />
          <NavItem icon={<ShieldCheck className="h-4 w-4"/>} label="User Management" tab="management" active={activeTab==='management'} onClick={setActiveTab} />
          <NavItem icon={<GraduationCap className="h-4 w-4"/>} label="Students" tab="students" active={activeTab==='students'} onClick={setActiveTab} badge={stats?.total_students} />
          <NavItem icon={<UserCog className="h-4 w-4"/>} label="Faculty" tab="faculty" active={activeTab==='faculty'} onClick={setActiveTab} badge={stats?.total_faculty} />
          
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 mb-3 mt-6">Content</p>
          <NavItem icon={<Bell className="h-4 w-4"/>} label="Announcements" tab="announcements" active={activeTab==='announcements'} onClick={setActiveTab} badge={stats?.total_announcements} />
          <NavItem icon={<FileText className="h-4 w-4"/>} label="Forms & Docs" tab="forms" active={activeTab==='forms'} onClick={setActiveTab} badge={stats?.total_forms} />
          <NavItem icon={<Calendar className="h-4 w-4"/>} label="Timetable" tab="timetable" active={activeTab==='timetable'} onClick={setActiveTab} />
          
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 mb-3 mt-6">AI & Logs</p>
          <NavItem icon={<Activity className="h-4 w-4"/>} label="Audit Logs" tab="auditlogs" active={activeTab==='auditlogs'} onClick={setActiveTab} />
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-auto bg-slate-50">
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center gap-4 sticky top-0 z-30 shadow-sm">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-brand-900 capitalize tracking-tight">{activeTab === 'auditlogs' ? 'System Audit Logs' : activeTab}</h2>
            <p className="text-sm text-slate-500 font-medium">EduSphere Admin Operations</p>
          </div>
          {/* Mobile tab selector */}
          <div className="lg:hidden">
            <select className="text-sm border-slate-300 rounded-lg shadow-sm px-3 py-2 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
              value={activeTab} onChange={e => setActiveTab(e.target.value)}>
              {['overview','users','students','faculty','announcements','forms','timetable','auditlogs'].map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
              ))}
            </select>
          </div>
        </header>

        <div className="p-6 lg:p-8 max-w-7xl mx-auto">

          {/* ── OVERVIEW ─────────────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={<Users className="h-5 w-5 text-indigo-600"/>} label="Total Users" value={stats?.total_users} color="bg-indigo-50 border-indigo-100" delay={0.05}/>
                <StatCard icon={<GraduationCap className="h-5 w-5 text-emerald-600"/>} label="Students" value={stats?.total_students} color="bg-emerald-50 border-emerald-100" delay={0.1}/>
                <StatCard icon={<UserCog className="h-5 w-5 text-purple-600"/>} label="Faculty" value={stats?.total_faculty} color="bg-purple-50 border-purple-100" delay={0.15}/>
                <StatCard icon={<Bell className="h-5 w-5 text-amber-600"/>} label="Announcements" value={stats?.total_announcements} color="bg-amber-50 border-amber-100" delay={0.2}/>
                <StatCard icon={<FileText className="h-5 w-5 text-blue-600"/>} label="Forms & Docs" value={stats?.total_forms} color="bg-blue-50 border-blue-100" delay={0.25}/>
              </div>

              {/* Quick sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Users */}
                <motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:0.35}} className="formal-card p-6">
                  <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-brand-900 text-base">Recent Users</h3>
                    <button onClick={()=>setActiveTab('users')} className="text-sm font-semibold text-brand-primary hover:text-brand-auth-hover">View All</button>
                  </div>
                  <div className="space-y-4">
                    {users.slice(0,5).map(u => (
                      <div key={u.id} className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 text-sm font-bold flex-shrink-0">
                          {u.email[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="text-sm font-semibold text-brand-900 block truncate">{u.email}</span>
                            <span className="text-xs text-slate-500 font-medium">{fmt(u.created_at)}</span>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Recent Forms */}
                <motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:0.4}} className="formal-card p-6">
                  <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-brand-900 text-base">Recent Documents</h3>
                    <button onClick={()=>setActiveTab('forms')} className="text-sm font-semibold text-brand-primary hover:text-brand-auth-hover">Manage</button>
                  </div>
                  {forms.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-8 font-medium">No forms uploaded yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {forms.slice(0,5).map(f => (
                        <div key={f.id} className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 text-slate-500"/>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-brand-900 truncate">{f.title}</p>
                            <p className="text-xs font-medium text-slate-500">{fmt(f.created_at)}</p>
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
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="formal-card overflow-hidden">
              <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center gap-4">
                <h3 className="font-bold text-brand-900 text-lg">Platform Users</h3>
                <div className="ml-auto flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                    <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search by email…" className="pl-9 pr-4 py-2 text-sm border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary w-64 shadow-sm"/>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      {['ID','Email','Role','Joined','Actions'].map(h=>(
                        <th key={h} className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filtered(users, ['email','role']).map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-xs font-semibold text-slate-500">#{u.id}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-brand-900">{u.email}</td>
                        <td className="px-6 py-4">
                          <select value={u.role} onChange={e=>changeRole(u.id,e.target.value)}
                            className={`text-xs font-bold px-2 py-1 rounded-md border cursor-pointer focus:outline-none ${ROLE_COLORS[u.role]}`}>
                            <option value="student">student</option>
                            <option value="faculty">faculty</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-500">{fmt(u.created_at)}</td>
                        <td className="px-6 py-4">
                          <button onClick={()=>deleteUser(u.id)} className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors">
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

          {/* ── USER MANAGEMENT ─────────────────────────────────────────── */}
          {activeTab === 'management' && (
            <div className="space-y-6">
              {/* Stats overview for management */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Pending Faculty</p>
                  <p className="text-3xl font-black text-brand-900">{users.filter(u => u.status === 'pending').length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Banned Users</p>
                  <p className="text-3xl font-black text-rose-600">{users.filter(u => u.status === 'banned').length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Active Staff</p>
                  <p className="text-3xl font-black text-emerald-600">{users.filter(u => u.role === 'faculty' && u.status === 'active').length}</p>
                </div>
              </div>

              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="formal-card overflow-hidden">
                <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-brand-900 text-lg">Administrative User Controls</h3>
                    <p className="text-xs text-slate-500 font-medium">Manage permissions, approvals, and access status.</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                    <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Filter users…" className="pl-9 pr-4 py-2 text-sm border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary w-64 shadow-sm font-medium"/>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        {['User Account','Current Role','Status','Quick Actions'].map(h=>(
                          <th key={h} className="px-6 py-3.5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filtered(users, ['email','role','status']).map(u => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm border ${u.status === 'banned' ? 'bg-slate-200 text-slate-400 border-slate-300' : 'bg-brand-50 text-brand-900 border-brand-100'}`}>
                                {u.email[0].toUpperCase()}
                              </div>
                              <div>
                                <p className={`font-bold text-sm leading-none ${u.status === 'banned' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{u.email}</p>
                                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">Joined {fmt(u.created_at)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-1.5">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border self-start uppercase tracking-widest ${ROLE_COLORS[u.role]}`}>
                                {u.role}
                              </span>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => changeRole(u.id, u.role === 'student' ? 'faculty' : 'student')}
                                  className="text-[10px] font-black text-brand-primary hover:underline"
                                >
                                  Swap to {u.role === 'student' ? 'Faculty' : 'Student'}
                                </button>
                                <button 
                                  onClick={() => changeRole(u.id, 'admin')}
                                  className="text-[10px] font-black text-rose-600 hover:underline border-l border-slate-200 pl-2"
                                >
                                  Make Admin
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${
                              u.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              u.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-wrap gap-2">
                              {u.status === 'pending' && u.role === 'faculty' && (
                                <ActionButton 
                                  icon={<ShieldCheck className="h-3 w-3"/>}
                                  label="Approve"
                                  onClick={async () => {
                                    try {
                                      await api.patch(`/admin/users/${u.id}/approve`);
                                      setUsers(prev => prev.map(user => user.id === u.id ? {...user, status: 'active'} : user));
                                    } catch { alert('Approval failed'); }
                                  }}
                                  color="bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700"
                                />
                              )}
                              
                              <ActionButton 
                                icon={u.status === 'banned' ? <ShieldCheck className="h-3 w-3"/> : <AlertCircle className="h-3 w-3"/>}
                                label={u.status === 'banned' ? "Restore" : "Ban User"}
                                onClick={async () => {
                                  const newStatus = u.status === 'banned' ? 'active' : 'banned';
                                  if (newStatus === 'banned' && !window.confirm(`Are you sure you want to ban ${u.email}?`)) return;
                                  try {
                                    await api.patch(`/admin/users/${u.id}/status`, { status: newStatus });
                                    setUsers(prev => prev.map(user => user.id === u.id ? {...user, status: newStatus} : user));
                                  } catch { alert('Status update failed'); }
                                }}
                                color={u.status === 'banned' ? "bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50" : "bg-white text-rose-600 border-rose-200 hover:bg-rose-50"}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          )}

          {/* ── STUDENTS ─────────────────────────────────────────────────── */}
          {activeTab === 'students' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="formal-card overflow-hidden">
              <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center gap-4">
                <h3 className="font-bold text-brand-900 text-lg">Student Directory</h3>
                <div className="ml-auto relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                  <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search students…" className="pl-9 pr-4 py-2 text-sm border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary w-64 shadow-sm"/>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      {['Name','Email','Enroll No.','Dept','Sem'].map(h=>(
                        <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filtered(students, ['first_name','last_name','email','enrollment_no','department']).map(s=>(
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold flex-shrink-0">
                              {s.first_name?.[0]}
                            </div>
                            <span className="text-sm font-semibold text-brand-900">{s.first_name} {s.last_name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-slate-600">{s.email}</td>
                        <td className="px-5 py-4 text-sm font-bold text-brand-primary">{s.enrollment_no}</td>
                        <td className="px-5 py-4 text-sm font-medium text-slate-600">{s.department}</td>
                        <td className="px-5 py-4 text-sm font-semibold text-brand-900 text-center">{s.current_semester}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ── FACULTY ─────────────────────────────────────────────────── */}
          {activeTab === 'faculty' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="formal-card overflow-hidden">
              <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center gap-4">
                <h3 className="font-bold text-brand-900 text-lg">Faculty Directory</h3>
                <div className="ml-auto relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                  <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search faculty…" className="pl-9 pr-4 py-2 text-sm border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary w-64 shadow-sm"/>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      {['Name','Email','Employee ID','Department','Designation'].map(h=>(
                        <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filtered(faculty, ['first_name','last_name','email','department','designation']).map(f=>(
                      <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold flex-shrink-0">
                              {f.first_name?.[0]}
                            </div>
                            <span className="text-sm font-semibold text-brand-900">{f.first_name} {f.last_name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-slate-600">{f.email}</td>
                        <td className="px-5 py-4 text-sm font-bold text-brand-primary">{f.employee_id}</td>
                        <td className="px-5 py-4 text-sm font-medium text-slate-600">{f.department}</td>
                        <td className="px-5 py-4">
                          <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-200">{f.designation}</span>
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
              <div className="formal-card p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg"><Upload className="h-5 w-5 text-slate-600"/></div>
                  <div>
                    <h3 className="font-bold text-brand-900 text-lg">Upload Institution Document</h3>
                    <p className="text-sm text-slate-500 mt-0.5">PDF only — the AI chatbot will serve these to users.</p>
                  </div>
                </div>
                <label className="block border-2 border-dashed border-slate-300 hover:border-brand-primary bg-slate-50 hover:bg-brand-50 rounded-xl p-10 text-center cursor-pointer transition-all group">
                  <Upload className="h-8 w-8 text-slate-400 group-hover:text-brand-primary mx-auto mb-3 transition-colors"/>
                  <p className="text-sm font-semibold text-slate-700 group-hover:text-brand-700">{isUploading ? 'Uploading & Processing...' : 'Click to Upload PDF'}</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Max size: 10 MB per PDF</p>
                  <input type="file" accept=".pdf" onChange={handleFileUpload} disabled={isUploading} className="sr-only"/>
                </label>
                {uploadMsg && (
                  <p className={`mt-4 text-sm font-semibold text-center ${uploadMsg.startsWith('✓') ? 'text-emerald-600' : 'text-rose-600'}`}>{uploadMsg}</p>
                )}
              </div>

              {/* List */}
              <div className="formal-card overflow-hidden">
                <div className="p-5 border-b border-slate-200 bg-slate-50/50">
                  <h3 className="font-bold text-brand-900 text-lg">Document Vault ({forms.length})</h3>
                </div>
                {forms.length === 0 ? (
                  <div className="text-center py-16 text-slate-500 font-medium text-sm">
                    <FileText className="h-10 w-10 mx-auto text-slate-300 mb-3"/>
                    <p>No documents found.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100 bg-white">
                    {forms.map(f=>(
                      <li key={f.id} className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors">
                        <div className="h-10 w-10 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="h-4 w-4 text-slate-600"/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-brand-900 truncate text-sm">{f.title}</p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">{f.description} &bull; Uploaded {fmt(f.created_at)}</p>
                        </div>
                        <button onClick={()=>deleteForm(f.id)} className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors flex-shrink-0">
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
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="font-bold text-brand-900 text-lg">Master Timetable ({timetable.length} entries)</h3>
                <button onClick={()=>setShowTTForm(true)} className="btn-primary text-sm px-4 py-2">
                  <Plus className="h-4 w-4 mr-1.5 inline-block"/> Add Entry
                </button>
              </div>
              {Object.entries(groupTT(timetable)).map(([day, entries]) => entries.length === 0 ? null : (
                <div key={day} className="formal-card overflow-hidden mb-6">
                  <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
                    <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">{day}</h4>
                  </div>
                  <div className="divide-y divide-slate-100 bg-white">
                    {entries.map(e=>(
                      <div key={e.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                        <div className="text-xs font-semibold text-slate-500 w-24 flex-shrink-0 flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded">
                          <Clock className="h-3 w-3"/>{e.time_slot}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-brand-900 text-sm mb-0.5">{e.subject_name}</p>
                          <p className="text-xs font-medium text-slate-500">{e.department} · {e.subject_code} · {e.faculty_name} · Room {e.room}</p>
                        </div>
                        <button onClick={()=>deleteTTEntry(e.id)} className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors flex-shrink-0">
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
                        <button type="submit" className="btn-primary px-4 py-2 text-sm">Add Entry</button>
                    </div>
                  </form>
                </Modal>
              )}
            </motion.div>
          )}


          {/* ── AUDIT LOGS ─────────────────────────────────────────────────── */}
          {activeTab === 'auditlogs' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-4">
                  <h3 className="font-bold text-brand-900 text-lg">System Audit Logs ({auditLogs.length})</h3>
                  <button 
                    onClick={fetchAuditLogs}
                    className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-all border border-transparent hover:border-brand-100"
                    title="Refresh Logs"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                  <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search logs…" className="pl-9 pr-4 py-2 text-sm border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary w-64 shadow-sm"/>
                </div>
              </div>

              <div className="formal-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        {['Admin','Action','Target','Time'].map(h=>(
                          <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filtered(auditLogs, ['admin_email', 'action', 'target']).map(log=>(
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4">
                            <span className="text-xs font-bold text-brand-900">{log.admin_email}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border tracking-tight ${
                                log.action.toLowerCase().includes('delete') || log.action.toLowerCase().includes('ban') || log.action.toLowerCase().includes('remove') ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                log.action.toLowerCase().includes('create') || log.action.toLowerCase().includes('add') || log.action.toLowerCase().includes('approve') || log.action.toLowerCase().includes('upload') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                log.action.toLowerCase().includes('system') || log.action.toLowerCase().includes('initial') ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                                {log.action}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-xs font-medium text-slate-600">{log.target}</span>
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-500">
                            {fmtTime(log.timestamp)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {auditLogs.length === 0 && (
                    <div className="text-center py-16 text-slate-400 font-medium text-sm">
                      <Activity className="h-10 w-10 mx-auto text-slate-300 mb-3"/>
                      <p>No audit history available.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}


        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
