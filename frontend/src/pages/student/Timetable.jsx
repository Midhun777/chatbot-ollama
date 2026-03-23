import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, User, ChevronDown, BookOpen } from 'lucide-react';
import api from '../../services/api';

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
  const [schedule, setSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeDay, setActiveDay] = useState('Monday');

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const res = await api.get('/timetable/');
      setSchedule(res.data);
      // Set active day to today if possible
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      if (DAYS.includes(today)) setActiveDay(today);
    } catch (err) {
      setError('Could not load timetable. Make sure your department and semester are set in your profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const byDay = DAYS.reduce((acc, day) => {
    acc[day] = schedule.filter(e => e.day_of_week === day);
    return acc;
  }, {});

  const activeDaySchedule = byDay[activeDay] || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg">
            <Calendar className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Class Schedule</h1>
            <p className="text-slate-500 font-medium">Your weekly timetable</p>
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
          ) : activeDaySchedule.length === 0 ? (
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
              {activeDaySchedule.map((entry, i) => {
                const colors = DAY_COLORS[activeDay];
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className={`flex gap-6 items-stretch bg-white rounded-2xl border ${colors.border} shadow-sm hover:shadow-md transition-shadow overflow-hidden`}
                  >
                    {/* Time sidebar */}
                    <div className={`${colors.bg} px-5 py-5 flex flex-col items-center justify-center min-w-[110px] border-r ${colors.border}`}>
                      <Clock className="h-4 w-4 text-slate-400 mb-1" />
                      <p className="text-xs font-black text-slate-700 text-center leading-tight">
                        {entry.time_slot.split(' - ').join('\n–\n')}
                      </p>
                    </div>
                    {/* Content */}
                    <div className="flex-1 py-5 pr-6 flex flex-col justify-center">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-black text-slate-900 text-lg leading-tight">{entry.subject_name}</h3>
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
                    <div className={`w-1.5 ${colors.dot.replace('bg-', 'bg-')}`} />
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Timetable;
