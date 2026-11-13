'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { storage } from '@/lib/storage';
import { initializeDemoData } from '@/lib/storage';
import { QUICK_ACTIONS } from '@/lib/constants';
import { PDFUpload, QuizScore, UserProfile } from '@/lib/types';
import {
  LayoutDashboard,
  Upload,
  FileText,
  Brain,
  HelpCircle,
  Trophy,
  PenTool,
  Calendar,
  TrendingUp,
  Clock,
  Target,
  BookOpen,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="w-5 h-5" />,
  Upload: <Upload className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
  Brain: <Brain className="w-5 h-5" />,
  HelpCircle: <HelpCircle className="w-5 h-5" />,
  Trophy: <Trophy className="w-5 h-5" />,
  PenTool: <PenTool className="w-5 h-5" />,
  Calendar: <Calendar className="w-5 h-5" />,
};

const statCards = [
  { label: 'PDFs Uploaded', value: '3', change: '+1 this week', icon: FileText, color: 'from-cyan-500 to-blue-500' },
  { label: 'Generated Notes', value: '10', change: '+5 this week', icon: BookOpen, color: 'from-purple-500 to-pink-500' },
  { label: 'Important Questions', value: '47', change: '+12 this week', icon: HelpCircle, color: 'from-orange-500 to-red-500' },
  { label: 'Avg Quiz Score', value: '75%', change: '+5% this week', icon: Trophy, color: 'from-green-500 to-teal-500' },
  { label: 'Completed Modules', value: '8', change: '+2 this week', icon: Target, color: 'from-indigo-500 to-purple-500' },
  { label: 'Study Hours', value: '24h', change: '+3h this week', icon: Clock, color: 'from-pink-500 to-rose-500' },
];

const chartData = [
  { name: 'Mon', modules: 2, questions: 8, quizzes: 1 },
  { name: 'Tue', modules: 1, questions: 5, quizzes: 2 },
  { name: 'Wed', modules: 3, questions: 12, quizzes: 1 },
  { name: 'Thu', modules: 2, questions: 7, quizzes: 3 },
  { name: 'Fri', modules: 1, questions: 6, quizzes: 1 },
  { name: 'Sat', modules: 4, questions: 15, quizzes: 2 },
  { name: 'Sun', modules: 2, questions: 9, quizzes: 1 },
];

const progressData = [
  { module: 'Module 1', progress: 90, color: '#00d4ff' },
  { module: 'Module 2', progress: 75, color: '#06b6d4' },
  { module: 'Module 3', progress: 60, color: '#a855f7' },
  { module: 'Module 4', progress: 40, color: '#ec4899' },
  { module: 'Module 5', progress: 20, color: '#f97316' },
];

export function DashboardPage() {
  const [pdfs, setPdfs] = useState<PDFUpload[]>([]);
  const [quizScores, setQuizScores] = useState<QuizScore[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initializeDemoData();
    setPdfs(storage.pdfs.get());
    setQuizScores(storage.quizScores.get());
    setUser(storage.user.get());
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setPdfs(storage.pdfs.get());
      setQuizScores(storage.quizScores.get());
      setUser(storage.user.get());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-cyan-400">Loading dashboard...</div>
      </div>
    );
  }

  const recentUploads = pdfs.slice(0, 3);
  const avgScore = quizScores.length > 0
    ? Math.round(quizScores.reduce((sum, s) => sum + s.percentage, 0) / quizScores.length)
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0] || 'Student'}</span>!
          </h1>
          <p className="text-slate-400 mt-1">
            {user?.branch} • Semester {user?.semester} • {user?.college}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {QUICK_ACTIONS.slice(0, 4).map((action) => (
            <a
              key={action.href}
              href={action.href}
              className={cn(
                'btn-neon px-4 py-2 text-sm gap-2',
                `bg-gradient-to-r ${action.color}/20 border-${action.color.split('-')[0]}-500/30`
              )}
            >
              {iconMap[action.icon]}
              {action.label}
            </a>
          ))}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="glass card-hover p-5 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs text-green-400 mt-1">{stat.change}</p>
              </div>
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', stat.color)}>
                {React.createElement(stat.icon, { className: 'w-6 h-6 text-white' })}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass card-hover p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Weekly Activity</h2>
            <select className="input-neon py-1 px-3 text-xs w-auto">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorModules" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorQuestions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis
                  dataKey="name"
                  stroke="rgba(148, 163, 184, 0.5)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="rgba(148, 163, 184, 0.5)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => val}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(17, 24, 39, 0.95)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '12px',
                  }}
                  labelStyle={{ color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area
                  type="monotone"
                  dataKey="modules"
                  stroke="#00d4ff"
                  fillOpacity={1}
                  fill="url(#colorModules)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="questions"
                  stroke="#a855f7"
                  fillOpacity={1}
                  fill="url(#colorQuestions)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-400" />
              <span className="text-slate-400">Modules Studied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-slate-400">Questions Practiced</span>
            </div>
          </div>
        </motion.div>

        {/* Module Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass card-hover p-6"
        >
          <h2 className="text-xl font-bold mb-6">Module Progress</h2>
          <div className="space-y-4">
            {progressData.map((item, index) => (
              <motion.div
                key={item.module}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{item.module}</span>
                  <span className="text-sm text-slate-400">{item.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.progress}%` }}
                    transition={{ duration: 1, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${item.color}, ${item.color}dd)` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Uploads & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Uploads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass card-hover p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Uploads</h2>
            <a href="/upload" className="text-sm text-cyan-400 hover:text-cyan-300 font-medium">View All</a>
          </div>
          {recentUploads.length > 0 ? (
            <div className="space-y-3">
              {recentUploads.map((pdf) => (
                <motion.div
                  key={pdf.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-slate-900/50 hover:bg-slate-900 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{pdf.name}</p>
                    <p className="text-sm text-slate-400">{pdf.subject} • {pdf.modules.length} modules</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      pdf.status === 'completed' && 'bg-green-500/20 text-green-400'
                    )}>
                      {pdf.status}
                    </span>
                    <span className="text-sm text-slate-500">
                      {(pdf.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400">No PDFs uploaded yet</p>
              <a href="/upload" className="btn-neon mt-4 inline-block">Upload Your First PDF</a>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass card-hover p-6"
        >
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <a
                key={action.href}
                href={action.href}
                className={cn(
                  'p-4 rounded-xl text-left transition-all duration-300 group',
                  'bg-slate-900/50 hover:bg-slate-900 border border-border',
                  `border-l-4 ${action.color.replace('from-', '').replace('to-', '')}`
                )}
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', action.color + '/20')}>
                  {React.createElement(action.icon as any, { className: 'w-5 h-5', style: { color: action.color.split(' ')[0].replace('from-', '') } })}
                </div>
                <p className="font-medium">{action.label}</p>
              </a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Upcoming Exam */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass card-hover p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Engineering Chemistry Exam</h3>
              <p className="text-slate-400">VTU Semester 3 • 15 days remaining</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-4">
            <div className="text-center p-4 bg-slate-900/50 rounded-xl">
              <p className="text-3xl font-bold text-cyan-400">15</p>
              <p className="text-xs text-slate-400">Days Left</p>
            </div>
            <div className="text-center p-4 bg-slate-900/50 rounded-xl">
              <p className="text-3xl font-bold text-purple-400">5</p>
              <p className="text-xs text-slate-400">Modules</p>
            </div>
            <div className="text-center p-4 bg-slate-900/50 rounded-xl">
              <p className="text-3xl font-bold text-green-400">{avgScore}%</p>
              <p className="text-xs text-slate-400">Avg Score</p>
            </div>
            <a href="/revision-planner" className="btn-neon-primary px-6 py-3">
              Generate Revision Plan
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}