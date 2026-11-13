'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { storage } from '@/lib/storage';
import { initializeDemoData } from '@/lib/storage';
import { UserProfile, UserSettings } from '@/lib/types';
import { BRANCHES, SEMESTERS, SUBJECTS } from '@/lib/constants';
import { Save, Edit, User, GraduationCap, Calendar, BookOpen, Target, Settings, Loader2, CheckCircle, Camera, X } from 'lucide-react';
import { toast } from 'sonner';

const ProfilePage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    college: '',
    branch: '',
    semester: 1,
    subjects: [] as string[],
    examGoal: '',
  });

  useEffect(() => {
    initializeDemoData();
    const userData = storage.user.get();
    const settingsData = storage.settings.get();
    setUser(userData);
    setSettings(settingsData);
    if (userData) {
      setFormData({
        name: userData.name,
        email: userData.email,
        college: userData.college,
        branch: userData.branch,
        semester: userData.semester,
        subjects: userData.subjects,
        examGoal: userData.examGoal,
      });
    }
    setMounted(true);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedUser: UserProfile = {
        ...user!,
        ...formData,
        updatedAt: new Date().toISOString(),
      };
      storage.user.set(updatedUser);
      setUser(updatedUser);
      setEditing(false);
      toast.success('Profile saved successfully!');
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSubjectChange = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!mounted) return <div className="flex items-center justify-center min-h-[60vh]">Loading...</div>;
  if (!user) return <div className="flex items-center justify-center min-h-[60vh]">No user data</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold mb-1">Profile</h1>
          <p className="text-slate-400">Manage your student profile and preferences</p>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          disabled={saving}
          className={cn('btn-neon-primary flex items-center gap-2', editing && 'bg-green-500/20 text-green-400 border-green-500/30')}
        >
          {editing ? (
            saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />
          ) : (
            <Edit className="w-4 h-4" />
          )}
          {editing ? (saving ? 'Saving...' : 'Save') : 'Edit Profile'}
        </button>
      </motion.div>

      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="relative">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-3xl font-bold text-white">
              {formData.name.charAt(0)}
            </div>
            {editing && (
              <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-slate-800 border border-border flex items-center justify-center cursor-pointer hover:bg-slate-700">
                <Camera className="w-4 h-4 text-slate-400" />
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
              </label>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            {editing ? (
              <div className="space-y-3 max-w-md mx-auto md:mx-0">
                <input
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input-neon text-center md:text-left text-xl font-bold"
                  placeholder="Name"
                />
                <input
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="input-neon text-center md:text-left text-slate-400"
                  placeholder="Email"
                />
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold">{formData.name}</h2>
                <p className="text-slate-400">{formData.email}</p>
              </>
            )}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
              <span className="px-3 py-1 rounded-full text-sm bg-cyan-500/20 text-cyan-400">
                {formData.branch}
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-purple-500/20 text-purple-400">
                Semester {formData.semester}
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-orange-500/20 text-orange-400">
                {formData.college}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Profile Details Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass p-6 space-y-6"
      >
        <h2 className="text-xl font-bold flex items-center gap-2">
          <User className="w-5 h-5 text-cyan-400" />
          Personal Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            {editing ? (
              <input
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input-neon"
              />
            ) : (
              <p className="text-slate-300 p-3 rounded-xl bg-slate-900/50">{formData.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            {editing ? (
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="input-neon"
              />
            ) : (
              <p className="text-slate-300 p-3 rounded-xl bg-slate-900/50">{formData.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">College</label>
            {editing ? (
              <input
                value={formData.college}
                onChange={e => setFormData(prev => ({ ...prev, college: e.target.value }))}
                className="input-neon"
                placeholder="Enter college name"
              />
            ) : (
              <p className="text-slate-300 p-3 rounded-xl bg-slate-900/50">{formData.college}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Branch</label>
            {editing ? (
              <select
                value={formData.branch}
                onChange={e => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                className="input-neon"
              >
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            ) : (
              <p className="text-slate-300 p-3 rounded-xl bg-slate-900/50">{formData.branch}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Semester</label>
            {editing ? (
              <select
                value={formData.semester}
                onChange={e => setFormData(prev => ({ ...prev, semester: parseInt(e.target.value) }))}
                className="input-neon"
              >
                {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            ) : (
              <p className="text-slate-300 p-3 rounded-xl bg-slate-900/50">Semester {formData.semester}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Exam Goal</label>
            {editing ? (
              <input
                value={formData.examGoal}
                onChange={e => setFormData(prev => ({ ...prev, examGoal: e.target.value }))}
                className="input-neon"
                placeholder="e.g., Score 90% in VTU exams"
              />
            ) : (
              <p className="text-slate-300 p-3 rounded-xl bg-slate-900/50">{formData.examGoal || 'Not set'}</p>
            )}
          </div>
        </div>

        {/* Subjects */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium mb-0">Subjects</label>
          </div>
          {editing ? (
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map(subject => (
                <button
                  key={subject}
                  onClick={() => handleSubjectChange(subject)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm transition-all',
                    formData.subjects.includes(subject)
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                  )}
                >
                  {subject}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {formData.subjects.length > 0 ? (
                formData.subjects.map(s => (
                  <span key={s} className="px-3 py-1.5 rounded-full text-sm bg-slate-800/50 text-slate-300">
                    {s}
                  </span>
                ))
              ) : (
                <p className="text-slate-500">No subjects added yet</p>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <StatCard icon={GraduationCap} label="Semester" value={formData.semester} color="text-cyan-400" />
        <StatCard icon={BookOpen} label="Subjects" value={formData.subjects.length} color="text-purple-400" />
        <StatCard icon={Calendar} label="Member Since" value={formatDate(user.createdAt).split(' ')[0]} color="text-green-400" />
        <StatCard icon={Target} label="Goal" value="Set" color="text-orange-400" />
      </motion.div>

      {/* Settings Summary */}
      {settings && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass p-6"
        >
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-cyan-400" />
            Current Preferences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SettingItem label="Theme" value={settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1)} />
            <SettingItem label="AI Style" value={settings.aiResponseStyle.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())} />
            <SettingItem label="Default Marks" value={`${settings.defaultMarksFormat} marks`} />
            <SettingItem label="Language" value={settings.preferredLanguage.charAt(0).toUpperCase() + settings.preferredLanguage.slice(1)} />
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default ProfilePage;

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; color: string }) {
  return (
    <div className="glass p-4 text-center">
      <Icon className={cn('w-5 h-5 mx-auto mb-1', color)} />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}

function SettingItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-xl bg-slate-900/50 border border-border">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}