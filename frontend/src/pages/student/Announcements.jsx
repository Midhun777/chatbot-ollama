import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Pin, Tag, Plus, Trash2, AlertCircle, XCircle } from 'lucide-react';
import api from '../../services/api';

const CATEGORY_STYLES = {
  General: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400' },
  Exam:    { bg: 'bg-red-100',   text: 'text-red-700',   dot: 'bg-red-500' },
  Event:   { bg: 'bg-blue-100',  text: 'text-blue-700',  dot: 'bg-blue-500' },
  Holiday: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

const Announcements = ({ isAdmin = false }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', category: 'General', is_pinned: false });
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchAnnouncements(); }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements/');
      setAnnouncements(res.data);
    } catch (err) {
      setError('Could not load announcements.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    setIsPosting(true);
    try {
      await api.post('/announcements/', form);
      setForm({ title: '', body: '', category: 'General', is_pinned: false });
      setShowForm(false);
      await fetchAnnouncements();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to post announcement.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch {
      setError('Failed to delete announcement.');
    }
  };

  const formatDate = (ts) => new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500 rounded-2xl shadow-lg">
              <Bell className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900">Notice Board</h1>
              <p className="text-slate-500 font-medium">{announcements.length} announcements</p>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-indigo-100 transition-all"
            >
              {showForm ? <XCircle className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showForm ? 'Cancel' : 'Post Notice'}
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4">
            <AlertCircle className="h-5 w-5" />
            <p className="font-semibold text-sm">{error}</p>
          </div>
        )}

        {/* Post Form (admin only) */}
        <AnimatePresence>
          {showForm && isAdmin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <form onSubmit={handlePost} className="bg-indigo-50 border border-indigo-200 rounded-3xl p-6 space-y-4">
                <h2 className="font-black text-indigo-900 text-lg">New Announcement</h2>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Title..."
                  className="w-full bg-white border border-indigo-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                />
                <textarea
                  required
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  placeholder="Message body..."
                  rows={3}
                  className="w-full bg-white border border-indigo-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none transition"
                />
                <div className="flex gap-4 flex-wrap">
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="bg-white border border-indigo-200 rounded-2xl px-4 py-2.5 text-sm font-bold focus:outline-none cursor-pointer"
                  >
                    {Object.keys(CATEGORY_STYLES).map(c => <option key={c}>{c}</option>)}
                  </select>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_pinned}
                      onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })}
                      className="accent-indigo-600 w-4 h-4"
                    />
                    <span className="text-sm font-bold text-indigo-800">Pin this notice</span>
                  </label>
                  <button
                    type="submit"
                    disabled={isPosting}
                    className="ml-auto flex items-center gap-2 bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-2xl hover:bg-indigo-700 transition disabled:opacity-60"
                  >
                    {isPosting ? 'Posting...' : 'Post Notice'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Announcements list */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="flex gap-2">
              {[0,1,2].map(i => <div key={i} className="w-3 h-3 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
            </div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-black">No announcements yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((ann, i) => {
              const catStyle = CATEGORY_STYLES[ann.category] || CATEGORY_STYLES.General;
              return (
                <motion.div
                  key={ann.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow ${ann.is_pinned ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-100'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {ann.is_pinned && (
                          <span className="flex items-center gap-1 text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Pin className="h-3 w-3" /> Pinned
                          </span>
                        )}
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${catStyle.bg} ${catStyle.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
                          {ann.category}
                        </span>
                      </div>
                      <h3 className="font-black text-slate-900 text-lg leading-tight">{ann.title}</h3>
                      <p className="text-slate-600 mt-2 text-sm leading-relaxed">{ann.body}</p>
                      <p className="text-xs text-slate-400 font-semibold mt-3">{formatDate(ann.created_at)}</p>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(ann.id)}
                        className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
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

export default Announcements;
