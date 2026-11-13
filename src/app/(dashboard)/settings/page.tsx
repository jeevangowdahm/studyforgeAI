'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { storage } from '@/lib/storage';
import { UserSettings } from '@/lib/types';
import { AI_RESPONSE_STYLES, LANGUAGES, MARKS_OPTIONS } from '@/lib/constants';
import { Moon, Sun, Monitor, Brain, Target, Globe, Trash2, Save, Loader2, CheckCircle, Bell, BellOff, HardDrive, Palette, Zap, Shield } from 'lucide-react';
import { toast } from 'sonner';

const SettingsPage = () => {
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'dark',
    aiResponseStyle: 'exam-focused',
    defaultMarksFormat: 8,
    preferredLanguage: 'english',
    notifications: true,
    autoSave: true,
  });
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [studyMode, setStudyMode] = useState<'demo' | 'real'>('demo');

  useEffect(() => {
    const stored = localStorage.getItem('studyforge_settings');
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch {}
    }
    setStudyMode((localStorage.getItem('studyforge_mode') as 'demo' | 'real') || 'demo');
    setMounted(true);
  }, []);

  const handleChange = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem('studyforge_settings', JSON.stringify(settings));
      localStorage.setItem('studyforge_mode', studyMode);
      // Apply theme immediately
      document.documentElement.classList.toggle('dark', settings.theme === 'dark');
      localStorage.setItem('studyforge_theme', settings.theme);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetData = () => {
    if (confirm('This will delete all your data: uploaded PDFs, generated notes, quiz scores, revision plans, and profile. This cannot be undone. Are you sure?')) {
      if (confirm('Final warning: ALL DATA WILL BE PERMANENTLY DELETED. Continue?')) {
        storage.clearAll();
        localStorage.removeItem('studyforge_theme');
        localStorage.removeItem('studyforge_settings');
        toast.success('All data has been reset');
        setTimeout(() => window.location.reload(), 1000);
      }
    }
  };

  const themeOptions = [
    { value: 'dark', label: 'Dark', icon: Moon, desc: 'Dark mode for late-night studying' },
    { value: 'light', label: 'Light', icon: Sun, desc: 'Light mode for daytime use' },
    { value: 'system', label: 'System', icon: Monitor, desc: 'Follow your system preference' },
  ];

  if (!mounted) return <div className="flex items-center justify-center min-h-[60vh]">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold mb-1">Settings</h1>
          <p className="text-slate-400">Customize your StudyForge AI experience</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-neon-primary flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </motion.div>

      <SettingsSection title="Study Mode" icon={Brain} description="Switch between safe demo data and real PDF/AI processing">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['demo', 'real'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setStudyMode(mode)}
              className={cn('rounded-xl border p-5 text-left transition-all', studyMode === mode ? 'border-cyan-500 bg-cyan-500/10' : 'border-border bg-slate-900/50 hover:border-cyan-500/30')}
            >
              <h3 className="font-bold">{mode === 'demo' ? 'Demo Mode' : 'Real AI Mode'}</h3>
              <p className="mt-1 text-sm text-slate-400">
                {mode === 'demo' ? 'Use mock AI answers and sample notes without API keys.' : 'Extract PDF text and call server-side AI APIs when keys are configured.'}
              </p>
            </button>
          ))}
        </div>
      </SettingsSection>

      {/* Theme Section */}
      <SettingsSection title="Appearance" icon={Palette} description="Choose your preferred color theme">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleChange('theme', option.value)}
              className={cn(
                'p-5 rounded-xl text-left transition-all relative',
                settings.theme === option.value
                  ? 'bg-cyan-500/10 border-2 border-cyan-500'
                  : 'bg-slate-900/50 border border-border hover:border-cyan-500/30'
              )}
            >
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center mb-3',
                settings.theme === option.value ? 'bg-cyan-500/20' : 'bg-slate-800/50'
              )}>
                <option.icon className={cn('w-6 h-6', settings.theme === option.value ? 'text-cyan-400' : 'text-slate-400')} />
              </div>
              <h3 className="font-bold mb-1">{option.label}</h3>
              <p className="text-sm text-slate-400">{option.desc}</p>
              {settings.theme === option.value && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </SettingsSection>

      {/* AI Response Style */}
      <SettingsSection title="AI Response Style" icon={Brain} description="Control how detailed the AI answers should be">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {AI_RESPONSE_STYLES.map((style) => (
            <button
              key={style.value}
              onClick={() => handleChange('aiResponseStyle', style.value)}
              className={cn(
                'p-5 rounded-xl text-left transition-all relative',
                settings.aiResponseStyle === style.value
                  ? 'bg-purple-500/10 border-2 border-purple-500'
                  : 'bg-slate-900/50 border border-border hover:border-purple-500/30'
              )}
            >
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center mb-3',
                settings.aiResponseStyle === style.value ? 'bg-purple-500/20' : 'bg-slate-800/50'
              )}>
                <Brain className={cn('w-6 h-6', settings.aiResponseStyle === style.value ? 'text-purple-400' : 'text-slate-400')} />
              </div>
              <h3 className="font-bold mb-1">{style.label}</h3>
              <p className="text-sm text-slate-400">{style.description}</p>
              {settings.aiResponseStyle === style.value && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </SettingsSection>

      {/* Default Marks Format */}
      <SettingsSection title="Default Marks Format" icon={Target} description="Set the default marks for answer generation">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {MARKS_OPTIONS.map((marks) => (
            <button
              key={marks}
              onClick={() => handleChange('defaultMarksFormat', marks)}
              className={cn(
                'p-4 rounded-xl text-center transition-all',
                settings.defaultMarksFormat === marks
                  ? 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400'
                  : 'bg-slate-900/50 border border-border text-slate-400 hover:border-cyan-500/30'
              )}
            >
              <span className="block text-2xl font-bold">{marks}</span>
              <span className="text-xs text-slate-500">Marks</span>
            </button>
          ))}
        </div>
      </SettingsSection>

      {/* Language */}
      <SettingsSection title="Preferred Language" icon={Globe} description="Select your preferred language for the interface">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              onClick={() => handleChange('preferredLanguage', lang.value)}
              className={cn(
                'p-5 rounded-xl text-left transition-all relative',
                settings.preferredLanguage === lang.value
                  ? 'bg-indigo-500/10 border-2 border-indigo-500'
                  : 'bg-slate-900/50 border border-border hover:border-indigo-500/30'
              )}
            >
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center mb-3',
                settings.preferredLanguage === lang.value ? 'bg-indigo-500/20' : 'bg-slate-800/50'
              )}>
                <Globe className={cn('w-6 h-6', settings.preferredLanguage === lang.value ? 'text-indigo-400' : 'text-slate-400')} />
              </div>
              <h3 className="font-bold mb-1">{lang.label}</h3>
              <p className="text-sm text-slate-400">Interface language</p>
              {settings.preferredLanguage === lang.value && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </SettingsSection>

      {/* Toggle Settings */}
      <SettingsSection title="Preferences" icon={Zap} description="Additional settings">
        <div className="space-y-4">
          <ToggleSetting
            label="Notifications"
            description="Receive toast notifications for actions"
            icon={Bell}
            checked={settings.notifications}
            onChange={(checked) => handleChange('notifications', checked)}
          />
          <ToggleSetting
            label="Auto-save"
            description="Automatically save progress and settings"
            icon={HardDrive}
            checked={settings.autoSave}
            onChange={(checked) => handleChange('autoSave', checked)}
          />
        </div>
      </SettingsSection>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass p-6 border border-red-500/30"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-red-400">Danger Zone</h2>
            <p className="text-slate-400">Irreversible actions</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-slate-300 mb-4">
            Resetting will permanently delete all your data including:
          </p>
          <ul className="text-slate-400 space-y-1 mb-4">
            <li>• Uploaded PDFs and generated notes</li>
            <li>• Quiz scores and history</li>
            <li>• Revision plans</li>
            <li>• Profile information</li>
            <li>• All settings and preferences</li>
          </ul>
          <button
            onClick={handleResetData}
            className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Reset All Data
          </button>
        </div>
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass p-4 text-center"
      >
        <p className="text-sm text-slate-500">
          StudyForge AI v1.0.0 • Demo Mode • All data stored locally in browser
        </p>
</motion.div>
    </div>
  );
}

export default SettingsPage;

function SettingsSection({ title, icon: Icon, description, children }: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6 space-y-5"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function ToggleSetting({ label, description, icon: Icon, checked, onChange }: {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-border">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-slate-400" />
        </div>
        <div>
          <h3 className="font-medium">{label}</h3>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-12 h-7 rounded-full transition-colors',
          checked ? 'bg-cyan-500' : 'bg-slate-700'
        )}
        role="switch"
        aria-checked={checked}
      >
        <span className={cn(
          'absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform shadow-lg',
          checked ? 'translate-x-5' : 'translate-x-0.5'
        )} />
      </button>
    </div>
  );
}
