'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { generateDiagramExplanation } from '@/lib/mock-ai';
import { DEMO_DIAGRAMS } from '@/lib/constants';
import { DiagramExplanation } from '@/lib/types';
import { Search, Copy, Download, Sparkles, Loader2, PenTool, BookOpen, AlertTriangle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

const DiagramHelperPage = () => {
  const [topic, setTopic] = useState('');
  const [diagram, setDiagram] = useState<DiagramExplanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    labels: true,
    draw: true,
    explanation: true,
    mistakes: false,
    tips: false,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const result = await generateDiagramExplanation(topic);
      setDiagram(result);
      setExpandedSections({ labels: true, draw: true, explanation: true, mistakes: false, tips: false });
    } catch (error) {
      console.error('Failed to generate diagram:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyDiagram = () => {
    if (!diagram) return;
    let text = `DIAGRAM: ${diagram.diagramName}\n\n`;
    text += `REQUIRED LABELS:\n${diagram.requiredLabels.map((l, i) => `${i + 1}. ${l}`).join('\n')}\n\n`;
    text += `HOW TO DRAW:\n${diagram.howToDraw.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n`;
    text += `EXPLANATION:\n${diagram.explanation}\n\n`;
    text += `COMMON MISTAKES:\n${diagram.commonMistakes.map((m, i) => `${i + 1}. ${m}`).join('\n')}\n\n`;
    text += `EXAM TIPS:\n${diagram.examTips.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n`;
    navigator.clipboard.writeText(text);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
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
        <h1 className="text-3xl font-bold mb-2">Diagram Helper</h1>
        <p className="text-slate-400">Get labels, drawing steps, and exam tips for engineering diagrams</p>
      </motion.div>

      {/* Input Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass p-6"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Diagram Topic</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="e.g., Li-ion battery, Concentration cell, Supercapacitor..."
                className="input-neon pl-12"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {DEMO_DIAGRAMS.map((d) => (
              <button
                key={d}
                onClick={() => { setTopic(d); handleGenerate(); }}

className="px-3 py-1.5 rounded-full text-sm bg-slate-800/50 hover:bg-slate-700/50 border border-border text-slate-300 hover:text-white transition-colors"
              >
                {d}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className={cn('w-full btn-neon-primary py-3', loading || !topic.trim() && 'opacity-50 cursor-not-allowed')}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Generating Diagram...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Diagram Guide
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Diagram Output */}
      {diagram && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 p-4 glass rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                <PenTool className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg">{diagram.diagramName}</h2>
                <p className="text-sm text-slate-400">Topic: {diagram.topic}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={copyDiagram} className="btn-ghost px-4 py-2 text-sm flex items-center gap-1">
                <Copy className="w-4 h-4" />
                Copy All
              </button>
              <button className="btn-ghost px-4 py-2 text-sm flex items-center gap-1">
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            {/* Required Labels */}
            <DiagramSection
              title="Required Labels"
              icon={BookOpen}
              iconColor="text-cyan-400"
              expanded={expandedSections.labels}
              onToggle={() => toggleSection('labels')}
              count={diagram.requiredLabels.length}
            >
              <ol className="space-y-2">
                {diagram.requiredLabels.map((label, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-border"
                  >
                    <span className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-slate-300 font-medium">{label}</span>
                  </motion.li>
                ))}
              </ol>
            </DiagramSection>

            {/* How to Draw */}
            <DiagramSection
              title="How to Draw in Exam"
              icon={PenTool}
              iconColor="text-purple-400"
              expanded={expandedSections.draw}
              onToggle={() => toggleSection('draw')}
              count={diagram.howToDraw.length}
            >
              <ol className="space-y-3">
                {diagram.howToDraw.map((step, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-border"
                  >
                    <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="text-slate-300">{step}</div>
                  </motion.li>
                ))}
              </ol>
            </DiagramSection>

            {/* Explanation */}
            <DiagramSection
              title="Explanation"
              icon={Lightbulb}
              iconColor="text-yellow-400"
              expanded={expandedSections.explanation}
              onToggle={() => toggleSection('explanation')}
            >
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{diagram.explanation}</p>
            </DiagramSection>

            {/* Common Mistakes */}
            <DiagramSection
              title="Common Mistakes"
              icon={AlertTriangle}
              iconColor="text-red-400"
              expanded={expandedSections.mistakes}
              onToggle={() => toggleSection('mistakes')}
              count={diagram.commonMistakes.length}
            >
              <ul className="space-y-2">
                {diagram.commonMistakes.map((mistake, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
                  >
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{mistake}</span>
                  </motion.li>
                ))}
              </ul>
            </DiagramSection>

            {/* Exam Tips */}
            <DiagramSection
              title="Exam Tips"
              icon={Lightbulb}
              iconColor="text-green-400"
              expanded={expandedSections.tips}
              onToggle={() => toggleSection('tips')}
              count={diagram.examTips.length}
            >
              <ul className="space-y-2">
                {diagram.examTips.map((tip, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20"
                  >
                    <Lightbulb className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{tip}</span>
                  </motion.li>
                ))}
              </ul>
            </DiagramSection>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!diagram && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-12 text-center"
        >
          <PenTool className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <h3 className="text-xl font-bold mb-2">No diagram generated yet</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Enter a diagram topic above or click one of the suggested topics to get detailed labels, drawing steps, and exam tips.
          </p>
          <div className="text-sm text-slate-500 space-y-1">
            <p>• Labels required for full marks</p>
            <p>• Step-by-step drawing instructions</p>
            <p>• Common mistakes to avoid</p>
            <p>• Pro tips for exam presentation</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default DiagramHelperPage;

function DiagramSection({ title, icon: Icon, iconColor, expanded, onToggle, count, children }: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  expanded: boolean;
  onToggle: () => void;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="glass overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-slate-800/50 transition-colors"
      >
        <Icon className={cn('w-5 h-5', iconColor)} />
        <span className="font-bold flex-1">{title}</span>
        {count !== undefined && (
          <span className="px-2 py-1 rounded-full text-xs bg-slate-700 text-slate-300">
            {count} items
          </span>
        )}
        <ChevronDown className={cn('w-5 h-5 text-slate-400 transition-transform', expanded && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-5 pb-5"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
