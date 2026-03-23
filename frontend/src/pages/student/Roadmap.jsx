import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, Clock, BarChart2, ChevronRight, Download, RefreshCw } from 'lucide-react';
import api from '../../services/api';

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const WEEKS_OPTIONS = [2, 4, 6, 8, 12];

const Roadmap = () => {
  const [form, setForm] = useState({
    topic: '',
    skill_level: 'Beginner',
    deadline_weeks: 4,
    daily_hours: 1.5,
  });
  const [roadmap, setRoadmap] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.topic.trim()) return;
    setIsGenerating(true);
    setError('');
    setRoadmap(null);
    try {
      const res = await api.post('/roadmap/generate', form);
      setRoadmap(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'AI model is unavailable. Make sure Ollama is running.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!roadmap) return;
    const blob = new Blob([roadmap.roadmap], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roadmap-${roadmap.topic.replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl shadow-lg">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">AI Study Roadmap</h1>
            <p className="text-slate-500 font-medium">Get a personalized learning plan powered by AI</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 mb-8">
          <form onSubmit={handleGenerate} className="space-y-6">
            {/* Topic input */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">What do you want to learn?</label>
              <div className="relative">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  placeholder="e.g., Machine Learning, React.js, Data Structures..."
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Skill level */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  <BarChart2 className="inline h-4 w-4 mr-1" />Skill Level
                </label>
                <div className="flex flex-col gap-2">
                  {SKILL_LEVELS.map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setForm({ ...form, skill_level: level })}
                      className={`px-4 py-2.5 rounded-xl border font-bold text-sm transition-all ${
                        form.skill_level === level
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  <ChevronRight className="inline h-4 w-4 mr-1" />Duration (Weeks)
                </label>
                <div className="flex flex-col gap-2">
                  {WEEKS_OPTIONS.map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setForm({ ...form, deadline_weeks: w })}
                      className={`px-4 py-2.5 rounded-xl border font-bold text-sm transition-all ${
                        form.deadline_weeks === w
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {w} weeks
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily hours */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />Daily Study Hours
                </label>
                <div className="space-y-3 mt-2">
                  <input
                    type="range"
                    min="0.5"
                    max="6"
                    step="0.5"
                    value={form.daily_hours}
                    onChange={(e) => setForm({ ...form, daily_hours: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                  <div className="text-center">
                    <span className="text-2xl font-black text-indigo-600">{form.daily_hours}h</span>
                    <p className="text-xs text-slate-500 font-medium">per day</p>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-xl text-center">
                    <p className="text-xs font-bold text-indigo-700">
                      Total: ~{(form.daily_hours * 7 * form.deadline_weeks).toFixed(0)}h over {form.deadline_weeks} weeks
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating || !form.topic.trim()}
              className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-lg rounded-2xl transition-all shadow-lg shadow-indigo-100 disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  AI is generating your roadmap...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate Study Roadmap
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 font-medium text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Loading animation */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-3xl border border-indigo-100"
            >
              <div className="flex justify-center gap-3 mb-4">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <p className="text-lg font-black text-indigo-700">Crafting your personalized roadmap...</p>
              <p className="text-sm text-indigo-500 mt-2">This may take 15-30 seconds</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {roadmap && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-white font-black text-xl">{roadmap.topic}</h2>
                  <p className="text-indigo-200 text-sm mt-1">
                    {roadmap.skill_level} · {roadmap.deadline_weeks} weeks · {roadmap.daily_hours}h/day
                  </p>
                </div>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold px-4 py-2 rounded-xl transition backdrop-blur-sm"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
              <div className="p-8">
                <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono leading-relaxed bg-slate-50 rounded-2xl p-6 overflow-x-auto">
                  {roadmap.roadmap}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Roadmap;
