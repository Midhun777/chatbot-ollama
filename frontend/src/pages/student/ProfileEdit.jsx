import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, BookOpen, Save, CheckCircle, AlertCircle, Edit2 } from 'lucide-react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const ProfileEdit = () => {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    department: '',
    current_semester: '', // Student and Admin maybe
    designation: '', // Faculty specific
    profile_bio: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/${user.role}/profile`);
      const p = res.data;
      setForm({
        first_name: p.first_name || '',
        last_name: p.last_name || '',
        phone: p.phone || '',
        department: p.department || '',
        current_semester: p.current_semester || '',
        designation: p.designation || '',
        profile_bio: p.profile_bio || '',
      });
    } catch (err) {
      setError('Failed to load profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setError('');
    setSuccess(false);
    try {
      const payload = { ...form };
      if (user.role === 'student' && payload.current_semester) {
          payload.current_semester = parseInt(payload.current_semester) || undefined;
      }
      await api.patch(`/${user.role}/profile`, payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="flex gap-2">
        {[0,1,2].map(i => <div key={i} className="w-3 h-3 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg">
            <Edit2 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Edit Profile</h1>
            <p className="text-slate-500 font-medium">Keep your details up to date</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="font-semibold text-sm">{error}</p>
          </div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl p-4"
          >
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <p className="font-semibold text-sm">Profile updated successfully!</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6">
          {/* Name row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="First Name" name="first_name" value={form.first_name} onChange={handleChange} icon={<User className="h-4 w-4" />} placeholder="John" />
            <Field label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} icon={<User className="h-4 w-4" />} placeholder="Doe" />
          </div>

          {/* Contact */}
          <Field label="Phone Number" name="phone" value={form.phone} onChange={handleChange} icon={<Phone className="h-4 w-4" />} placeholder="+91 98765 43210" />

          {/* Academic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Department" name="department" value={form.department} onChange={handleChange} icon={<BookOpen className="h-4 w-4" />} placeholder="Computer Science" />
            
            {user?.role === 'student' && (
              <Field label="Current Semester" name="current_semester" value={form.current_semester} onChange={handleChange} icon={<BookOpen className="h-4 w-4" />} placeholder="3" type="number" min="1" max="8" />
            )}
            {user?.role === 'faculty' && (
              <Field label="Designation" name="designation" value={form.designation} onChange={handleChange} icon={<User className="h-4 w-4" />} placeholder="Professor" />
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Bio / About Me</label>
            <textarea
              name="profile_bio"
              value={form.profile_bio}
              onChange={handleChange}
              rows={3}
              placeholder="Tell something about yourself..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 resize-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-100 disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const Field = ({ label, name, value, onChange, icon, placeholder, type = 'text', ...rest }) => (
  <div>
    <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
        {icon}
      </div>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
        {...rest}
      />
    </div>
  </div>
);

export default ProfileEdit;
