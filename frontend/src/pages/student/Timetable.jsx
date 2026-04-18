import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, User, ChevronDown, BookOpen, Search, Save, CheckCircle, Layout, List } from 'lucide-react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DAY_COLORS = {
  Monday:    { bg: 'bg-violet-50',  border: 'border-violet-200',  badge: 'bg-violet-100 text-violet-700',  dot: 'bg-violet-500' },
  Tuesday:   { bg: 'bg-blue-50',    border: 'border-blue-200',    badge: 'bg-blue-100 text-blue-700',      dot: 'bg-blue-500' },
  Wednesday: { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700',dot: 'bg-emerald-500' },
  Thursday:  { bg: 'bg-amber-50',   border: 'border-amber-200',   badge: 'bg-amber-100 text-amber-700',    dot: 'bg-amber-500' },
  Friday:    { bg: 'bg-rose-50',    border: 'border-rose-200',    badge: 'bg-rose-100 text-rose-700',      dot: 'bg-rose-500' },
  Saturday:  { bg: 'bg-slate-50',   border: 'border-slate-200',   badge: 'bg-slate-100 text-slate-600',    dot: 'bg-slate-400' },
};

const Timetable = () => {
  const { user, login, refreshUser } = useContext(AuthContext);
  const [schedule, setSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeDay, setActiveDay] = useState('Monday');
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'weekly'
  
  // Browsing state
  const [available, setAvailable] = useState([]);
  const [browsing, setBrowsing] = useState({ dept: '', sem: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchAvailable();
    fetchTimetable();
  }, []);

  const fetchAvailable = async () => {
    try {
        const res = await api.get('/timetable/available');
        setAvailable(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchTimetable = async (dept = null, sem = null) => {
    setIsLoading(true);
    try {
      const url = (dept && sem) ? `/timetable/?dept=${encodeURIComponent(dept)}&sem=${sem}` : '/timetable/';
      const res = await api.get(url);
      setSchedule(res.data);
      // Set active day to today if possible
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      if (DAYS.includes(today)) setActiveDay(today);
      setError('');
    } catch (err) {
      setError('Timetable not found for this selection.');
      setSchedule([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrowse = (dept, sem) => {
    setBrowsing({ dept, sem });
    fetchTimetable(dept, sem);
  };

  const saveToProfile = async () => {
    if (!browsing.dept || !browsing.sem) return;
    setIsSaving(true);
    try {
        await api.patch('/student/profile', { 
            department: browsing.dept, 
            current_semester: parseInt(browsing.sem) 
        });
        await refreshUser(); // Trigger global update
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
        alert("Failed to save to profile");
    } finally {
        setIsSaving(false);
    }
  };

  const isCurrentSelectionSaved = () => {
    if (!browsing.dept) return true; // Default view is always saved
    return user?.student_profile?.department === browsing.dept && 
           user?.student_profile?.current_semester === parseInt(browsing.sem);
  };

  const byDay = DAYS.reduce((acc, day) => {
    acc[day] = schedule.filter(e => e.day_of_week === day);
    return acc;
  }, {});

  const activeDaySchedule = byDay[activeDay] || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      {/* SUCCESS TOAST */}
      <AnimatePresence>
          {saveSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-3xl shadow-2xl border border-white/10 backdrop-blur-md"
              >
                  <div className="bg-emerald-500 p-1.5 rounded-full">
                      <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                      <span className="text-sm font-black">Profile Updated!</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Academic path synchronized</span>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg">
                <Calendar className="h-7 w-7 text-white" />
            </div>
            <div>
                <h1 className="text-3xl font-black text-slate-900">Class Schedule</h1>
                <p className="text-slate-500 font-medium">
                    {browsing.dept ? `${browsing.dept} (Sem ${browsing.sem})` : 'Your Enrolled Timetable'}
                </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
              {/* View Toggle */}
              <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-inner">
                  <button 
                    onClick={() => setViewMode('daily')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all ${viewMode === 'daily' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                      <Layout className="h-3.5 w-3.5" /> Daily
                  </button>
                  <button 
                    onClick={() => setViewMode('weekly')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all ${viewMode === 'weekly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                      <List className="h-3.5 w-3.5" /> Full Week
                  </button>
              </div>

              <div className="relative group">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <select 
                    value={`${browsing.dept}|${browsing.sem}`}
                    onChange={(e) => {
                        const [d, s] = e.target.value.split('|');
                        handleBrowse(d, s);
                    }}
                    className="pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none cursor-pointer transition-all hover:bg-slate-50 min-w-[240px]"
                  >
                      <option value="|">My Enrolled Schedule</option>
                      {available.map((a, idx) => (
                          <option key={idx} value={`${a.department}|${a.semester}`}>
                              {a.department} - Semester {a.semester}
                          </option>
                      ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>

              <AnimatePresence mode="wait">
              {browsing.dept && !isCurrentSelectionSaved() && (
                  <motion.button 
                    key="save-btn"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={saveToProfile}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-emerald-100 transition-all active:scale-95 disabled:opacity-50"
                  >
                      {isSaving ? 'Syncing...' : saveSuccess ? <><CheckCircle className="h-4 w-4"/> Saved</> : <><Save className="h-4 w-4"/> Save to Profile</>}
                  </motion.button>
              )}
              </AnimatePresence>
          </div>
        </div>

        {/* Day tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {DAYS.map(day => {
            const count = byDay[day]?.length || 0;
            const colors = DAY_COLORS[day];
            const isActive = activeDay === day;
            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100'
                    : `${colors.bg} ${colors.border} text-slate-700 hover:border-indigo-300`
                }`}
              >
                {day.slice(0, 3)}
                {count > 0 && (
                  <span className={`text-xs rounded-full px-1.5 py-0.5 font-black ${isActive ? 'bg-white/20 text-white' : colors.badge}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Schedule Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="flex gap-2">
                {[0,1,2].map(i => (
                  <div key={i} className="w-3 h-3 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-800 font-medium text-center">
              {error}
            </div>
          ) : viewMode === 'daily' ? (
            /* DAILY VIEW */
            activeDaySchedule.length === 0 ? (
              <motion.div
                key={activeDay + '-empty'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center"
              >
                <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-xl font-black text-slate-400">No classes on {activeDay}</p>
                <p className="text-slate-400 mt-2">Enjoy your free day!</p>
              </motion.div>
            ) : (
              <motion.div
                key={activeDay}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {activeDaySchedule.map((entry, i) => (
                    <ScheduleCard key={entry.id} entry={entry} day={activeDay} index={i} />
                ))}
              </motion.div>
            )
          ) : (
            /* WEEKLY OVERVIEW */
            <motion.div
                key="weekly-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-10"
            >
                {DAYS.map(day => {
                    const dayEntries = byDay[day] || [];
                    if (dayEntries.length === 0) return null;
                    const colors = DAY_COLORS[day];
                    return (
                        <div key={day} className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className={`h-8 w-1.5 rounded-full ${colors.dot}`} />
                                <h3 className="text-lg font-black text-slate-900">{day}</h3>
                                <span className={`text-[10px] uppercase tracking-widest font-black px-2 py-0.5 rounded-md ${colors.badge}`}>
                                    {dayEntries.length} Classes
                                </span>
                            </div>
                            <div className="grid gap-4">
                                {dayEntries.map((entry, i) => (
                                    <ScheduleCard key={entry.id} entry={entry} day={day} index={i} />
                                ))}
                            </div>
                        </div>
                    );
                })}
                {schedule.length === 0 && (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
                        <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-xl font-black text-slate-400">No classes scheduled for the entire week</p>
                    </div>
                )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

/* Extracted Card for Reusability */
const ScheduleCard = ({ entry, day, index }) => {
    const colors = DAY_COLORS[day];
    return (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`flex gap-6 items-stretch bg-white rounded-2xl border ${colors.border} shadow-sm hover:shadow-md transition-shadow overflow-hidden group`}
        >
          {/* Time sidebar */}
          <div className={`${colors.bg} px-5 py-5 flex flex-col items-center justify-center min-w-[110px] border-r ${colors.border} group-hover:bg-white transition-colors`}>
            <Clock className="h-4 w-4 text-slate-400 mb-1" />
            <p className="text-xs font-black text-slate-700 text-center leading-tight">
              {entry.time_slot.split(' - ').join('\n–\n')}
            </p>
          </div>
          {/* Content */}
          <div className="flex-1 py-5 pr-6 flex flex-col justify-center">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-black text-slate-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors">{entry.subject_name}</h3>
                <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
                  {entry.subject_code}
                </span>
              </div>
            </div>
            <div className="flex gap-6 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                <User className="h-3.5 w-3.5" />
                <span className="font-semibold">{entry.faculty_name}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                <MapPin className="h-3.5 w-3.5" />
                <span className="font-semibold">{entry.room}</span>
              </div>
            </div>
          </div>
          {/* Color strip */}
          <div className={`w-1.5 ${colors.dot}`} />
        </motion.div>
    );
};

export default Timetable;
