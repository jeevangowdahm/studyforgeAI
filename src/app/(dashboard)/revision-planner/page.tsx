'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { generateRevisionPlan } from '@/lib/mock-ai';
import { SUBJECTS } from '@/lib/constants';
import { RevisionPlan, DailyPlan } from '@/lib/types';
import { Calendar, Clock, Target, BookOpen, CheckCircle, Loader2, Sparkles, Download, ChevronDown, ChevronUp, AlertTriangle, Zap, Copy } from 'lucide-react';

const RevisionPlannerPage = () => {
  const [step, setStep] = useState<'form' | 'plan'>('form');
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState(3);
  const [difficulty, setDifficulty] = useState('medium');
  const [plan, setPlan] = useState<RevisionPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 14);
    setExamDate(tomorrow.toISOString().split('T')[0]);
    setMounted(true);
  }, []);

  const handleGenerate = async () => {
    if (!subject || !examDate || !hoursPerDay) return;
    setLoading(true);
    try {
      const result = await generateRevisionPlan(subject, examDate, hoursPerDay, difficulty);
      setPlan(result);
      setStep('plan');
      // Expand first 3 days by default
      const expanded: Record<number, boolean> = {};
      result.dailyPlan.slice(0, 3).forEach(d => { expanded[d.day] = true; });
      setExpandedDays(expanded);
    } catch (error) {
      console.error('Failed to generate plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: number) => {
    setExpandedDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const copyPlan = () => {
    if (!plan) return;
    let text = `REVISION PLAN: ${plan.subject}\n`;
    text += `Exam Date: ${plan.examDate}\n`;
    text += `Hours/Day: ${plan.hoursPerDay}\n`;
    text += `Difficulty: ${plan.difficulty}\n\n`;
    plan.dailyPlan.forEach(day => {
      text += `DAY ${day.day} (${day.date})\n`;
      text += `Modules: ${day.modules.join(', ')}\n`;
      text += `Hours: ${day.hours}\n`;
      text += `Tasks:\n${day.tasks.map(t => `  - ${t}`).join('\n')}\n`;
      if (day.quizPractice) text += `  - Quiz Practice\n`;
      if (day.isRevisionDay) text += `  ⚡ REVISION DAY\n`;
      text += '\n';
    });
    navigator.clipboard.writeText(text);
  };

  if (!mounted) return <div className="flex items-center justify-center min-h-[60vh]">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold mb-2">Revision Planner</h1>
        <p className="text-slate-400">Generate AI-powered day-wise revision timetable for your exams</p>
      </motion.div>

      {/* Form Step */}
      {step === 'form' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 space-y-6"
        >
          <div className="text-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Create Your Revision Plan</h2>
            <p className="text-slate-400">Enter your exam details to get a personalized day-wise schedule</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)} className="input-neon">
                <option value="">Select subject</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">Exam Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={e => setExamDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-neon"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Hours per Day</label>
                <select value={hoursPerDay} onChange={e => setHoursPerDay(parseInt(e.target.value))} className="input-neon">
                  <option value={1}>1 Hour</option>
                  <option value={2}>2 Hours</option>
                  <option value={3}>3 Hours</option>
                  <option value={4}>4 Hours</option>
                  <option value={5}>5 Hours</option>
                  <option value={6}>6+ Hours</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-3">
                {['easy', 'medium', 'hard'].map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={cn(
                      'p-4 rounded-xl text-center transition-all',
                      difficulty === d
                        ? 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400'
                        : 'bg-slate-900/50 border border-border text-slate-400 hover:border-cyan-500/50'
                    )}
                  >
                    <span className="block text-lg font-bold capitalize">{d}</span>
                    <span className="text-xs text-slate-500">
                      {d === 'easy' && 'Light review'}
                      {d === 'medium' && 'Balanced'}
                      {d === 'hard' && 'Intensive'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleGenerate} disabled={loading || !subject || !examDate || !hoursPerDay} className={cn('w-full btn-neon-primary py-4 text-lg', loading && 'opacity-50')}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <> <Sparkles className="w-5 h-5 mr-2" /> Generate Revision Plan </>}
            </button>
          </div>
        </motion.div>
      )}

      {/* Plan Step */}
      {step === 'plan' && plan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Plan Header */}
          <div className="glass p-5 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-xl">{plan.subject} Revision Plan</h2>
                  <p className="text-sm text-slate-400">
                    Exam: {new Date(plan.examDate).toLocaleDateString()} • {plan.totalDays} Days • {plan.hoursPerDay}h/day
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={copyPlan} className="btn-ghost px-4 py-2 text-sm flex items-center gap-1">
                  <Copy className="w-4 h-4" />
                  Copy Plan
                </button>
                <button className="btn-ghost px-4 py-2 text-sm flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button onClick={() => setStep('form')} className="btn-neon-primary px-4 py-2 text-sm flex items-center gap-1">
                  <Loader2 className="w-4 h-4" />
                  New Plan
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon={Calendar} label="Total Days" value={plan.totalDays} color="text-cyan-400" />
              <StatCard icon={Clock} label="Hours/Day" value={plan.hoursPerDay} color="text-purple-400" />
              <StatCard icon={Target} label="Modules" value={new Set(plan.dailyPlan.flatMap(d => d.modules)).size} color="text-green-400" />
              <StatCard icon={Zap} label="Revision Days" value={plan.dailyPlan.filter(d => d.isRevisionDay).length} color="text-yellow-400" />
            </div>
          </div>

          {/* Daily Plan */}
          <div className="space-y-3">
            {plan.dailyPlan.map((day) => {
              const isExpanded = expandedDays[day.day];
              const isRevisionDay = day.isRevisionDay;
              const completedTasks = day.tasks.filter(() => false).length; // placeholder
              
              return (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(day.day * 0.02, 0.3) }}
                  className={cn(
                    'glass overflow-hidden',
                    isRevisionDay && 'border-l-4 border-yellow-400 bg-yellow-500/5'
                  )}
                >
                  <button
                    onClick={() => toggleDay(day.day)}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                        isRevisionDay ? 'bg-yellow-500/20' : 'bg-cyan-500/20'
                      )}>
                        {isRevisionDay ? (
                          <Zap className="w-6 h-6 text-yellow-400" />
                        ) : (
                          <span className="font-bold text-lg text-cyan-400">Day {day.day}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold">{isRevisionDay ? 'Final Revision' : `Day ${day.day}`}</h3>
                          <span className="text-sm text-slate-400">{day.date}</span>
                          {isRevisionDay && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
                              <Zap className="w-3 h-3" /> REVISION DAY
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {day.modules.join(', ')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {day.hours}h
                          </span>
                          {day.quizPractice && (
                            <span className="flex items-center gap-1 text-purple-400">
                              <Target className="w-3 h-3" />
                              Quiz Practice
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronDown className={cn('w-5 h-5 text-slate-400 transition-transform', isExpanded && 'rotate-180')} />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pb-4 border-t border-border/50"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                          {/* Tasks */}
                          <div>
                            <h4 className="font-bold mb-3 flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-cyan-400" />
                              Study Tasks
                            </h4>
                            <ul className="space-y-2">
                              {day.tasks.map((task, i) => (
                                <li key={i} className="flex items-start gap-2 p-2 rounded-lg text-slate-300 bg-slate-900/50 rounded-lg">
                                  <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                                  <span>{task}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Important Questions */}
                          <div>
                            <h4 className="font-bold mb-3 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-orange-400" />
                              Important Questions
                            </h4>
                            <ul className="space-y-2">
                              {day.importantQuestions.map((q, i) => (
                                <li key={i} className="p-2 rounded-lg text-slate-300 bg-slate-900/50 border border-orange-500/20">
                                  {q}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Quiz Practice */}
                          {day.quizPractice && (
                            <div className="md:col-span-2">
                              <h4 className="font-bold mb-3 flex items-center gap-2">
                                <Target className="w-4 h-4 text-purple-400" />
                                Quiz Practice
                              </h4>
                              <p className="text-slate-400">
                                Practice module-wise MCQs for today's topics. Focus on weak areas identified in previous quizzes.
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {step === 'plan' && !plan && (
        <div className="flex items-center justify-center min-h-[60vh]">Loading plan...</div>
      )}
    </div>
  );
}

export default RevisionPlannerPage;

function StatCard({ icon: Icon, label, value, color }: { 
  icon: React.ComponentType<{ className?: string }>; 
  label: string; 
  value: number; 
  color: string; 
}) {
  return (
    <div className="p-4 rounded-xl bg-slate-900/50 border border-border text-center">
      <Icon className={cn('w-5 h-5 mx-auto mb-1', color)} />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}