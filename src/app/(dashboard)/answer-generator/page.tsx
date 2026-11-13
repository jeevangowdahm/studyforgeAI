'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { generateVTUAnswer } from '@/lib/mock-ai';
import { MODULES, MARKS_OPTIONS, SUBJECTS } from '@/lib/constants';
import { VTUAnswer } from '@/lib/types';
import { Copy, Download, Sparkles, Loader2, FileText, Brain } from 'lucide-react';

const marksDescriptions = {
  3: 'Short answer - Definition + Key points (50-80 words)',
  5: 'Medium answer - Definition + Explanation + Diagram (100-150 words)',
  7: 'Long answer - Definition + Principle + Working + Applications (150-200 words)',
  8: 'Very long answer - Construction + Working + Diagram + Applications (200-250 words)',
  10: 'Essay answer - Complete with derivation + Diagram + Numerical + Conclusion (300+ words)',
};

const AnswerGeneratorPage = () => {
  const [subject, setSubject] = useState('Engineering Chemistry');
  const [module, setModule] = useState('');
  const [question, setQuestion] = useState('');
  const [marks, setMarks] = useState(8);
  const [answer, setAnswer] = useState<VTUAnswer | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [citation, setCitation] = useState('');
  const [mode, setMode] = useState<'demo' | 'real'>('demo');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('question')) setQuestion(params.get('question')!);
    if (params.get('subject')) setSubject(params.get('subject')!);
    if (params.get('module')) setModule(params.get('module')!);
    if (params.get('marks')) setMarks(Number(params.get('marks')) || 8);
    setMode((localStorage.getItem('studyforge_mode') as 'demo' | 'real') || 'demo');
    setMounted(true);
  }, []);

  const modules = MODULES[subject] || [];

  useEffect(() => {
    if (modules.length > 0 && !modules.includes(module)) {
      setModule(modules[0]);
    }
  }, [subject, modules]);

  const handleGenerate = async () => {
    if (!question.trim() || !module) return;
    
    setLoading(true);
    setAnswer(null);
    setAnswerText('');
    setCitation('');
    
    try {
      if (mode === 'real') {
        const chunks = JSON.parse(localStorage.getItem('studyforge_pdf_chunks') || '[]');
        const response = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, subject, module, marks, chunks }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Generation failed');
        if (data.answerText) {
          setAnswerText(data.answerText);
        } else {
          setAnswer(data.answer);
        }
        if (data.citation) setCitation(`Source: ${data.citation.source}, ${data.citation.module}, Page ${data.citation.page}`);
      } else {
        const result = await generateVTUAnswer(question, marks, subject);
        setAnswer(result);
      }
    } catch (error) {
      console.error('Failed to generate answer:', error);
      const result = await generateVTUAnswer(question, marks, subject);
      setAnswer(result);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!answer && !answerText) return;
    const text = answerText || formatAnswerForCopy(answer!, question, subject, module, marks);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAnswer = () => {
    if (!answer && !answerText) return;
    const text = answerText || formatAnswerForCopy(answer!, question, subject, module, marks);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VTU_Answer_${subject.replace(/\s+/g, '_')}_${module.replace(/\s+/g, '_')}_${marks}marks.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold mb-2">VTU Answer Generator</h1>
        <p className="text-slate-400">Generate exam-ready answers in VTU format with proper structure</p>
        <button
          onClick={() => { const next = mode === 'demo' ? 'real' : 'demo'; setMode(next); localStorage.setItem('studyforge_mode', next); }}
          className="btn-ghost mt-4 text-sm"
        >
          {mode === 'demo' ? 'Demo Mode' : 'Real AI Mode'}
        </button>
      </motion.div>

      {/* Input Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass p-6"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input-neon"
              >
                {SUBJECTS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Module */}
            <div>
              <label className="block text-sm font-medium mb-2">Module</label>
              <select
                value={module}
                onChange={(e) => setModule(e.target.value)}
                className="input-neon"
                disabled={modules.length === 0}
              >
                {modules.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
                {modules.length === 0 && <option value="">Select subject first</option>}
              </select>
            </div>
          </div>

          {/* Question */}
          <div>
            <label className="block text-sm font-medium mb-2">Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question here... e.g., Derive Nernst equation for a single electrode potential..."
              className="input-neon min-h-[100px] resize-y font-mono text-sm"
              rows={3}
            />
          </div>

          {/* Marks Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Marks Type</label>
            <div className="flex flex-wrap gap-3">
              {MARKS_OPTIONS.map((mark) => (
                <button
                  key={mark}
                  onClick={() => setMarks(mark)}
                  className={cn(
                    'flex-1 min-w-[100px] px-4 py-3 rounded-xl border-2 transition-all font-medium text-sm',
                    marks === mark
                      ? 'border-cyan-400 bg-cyan-500/10 text-cyan-400'
                      : 'border-border text-slate-400 hover:border-cyan-400/50 hover:text-white'
                  )}
                >
                  {mark} Marks
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">{marksDescriptions[marks as keyof typeof marksDescriptions]}</p>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !question.trim() || !module}
            className={cn(
              'w-full btn-neon-primary py-4 text-lg flex items-center justify-center gap-3',
              (loading || !question.trim() || !module) && 'opacity-50 cursor-not-allowed'
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating VTU Answer...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate VTU Answer
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Answer Output */}
      {answerText && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-xl">Generated VTU Answer</h2>
              <p className="text-sm text-cyan-400">{citation || 'Source: Uploaded PDF'}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={copyToClipboard} className="btn-ghost text-sm"><Copy className="w-4 h-4 mr-1" />Copy</button>
              <button onClick={downloadAnswer} className="btn-ghost text-sm"><Download className="w-4 h-4 mr-1" />Download</button>
              <button onClick={() => window.print()} className="btn-ghost text-sm">Print</button>
            </div>
          </div>
          <pre className="whitespace-pre-wrap rounded-xl bg-slate-950/60 p-5 text-sm leading-relaxed text-slate-200">{answerText}</pre>
        </motion.div>
      )}

      {answer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold">Generated VTU Answer</h2>
                <p className="text-sm text-slate-400">
                  {marks} Marks • ~{answer.wordCount} words • {subject} • {module}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                className="btn-ghost px-4 py-2 text-sm"
              >
                <Copy className="w-4 h-4 mr-1" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={downloadAnswer}
                className="btn-ghost px-4 py-2 text-sm"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </button>
            </div>
          </div>

          <div className="space-y-5">
            {answer.definition && (
              <AnswerSection title="Definition" icon={FileText} color="text-cyan-400">
                {answer.definition}
              </AnswerSection>
            )}

            {answer.explanation && (
              <AnswerSection title="Explanation" icon={Brain} color="text-purple-400">
                {answer.explanation}
              </AnswerSection>
            )}

            {answer.constructionPrinciple && (
              <AnswerSection title="Construction / Principle" icon={FileText} color="text-orange-400">
                {answer.constructionPrinciple}
              </AnswerSection>
            )}

            {answer.working && (
              <AnswerSection title="Working" icon={Brain} color="text-green-400">
                {answer.working}
              </AnswerSection>
            )}

            {answer.diagramInstructions && (
              <AnswerSection title="Diagram Instructions" icon={FileText} color="text-pink-400">
                {answer.diagramInstructions}
              </AnswerSection>
            )}

            {answer.applications.length > 0 && (
              <AnswerSection title="Applications" icon={FileText} color="text-indigo-400">
                <ul className="space-y-2">
                  {answer.applications.map((app, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                      {app}
                    </li>
                  ))}
                </ul>
              </AnswerSection>
            )}

            {answer.conclusion && (
              <AnswerSection title="Conclusion" icon={Brain} color="text-red-400">
                {answer.conclusion}
              </AnswerSection>
            )}
          </div>

          {/* Word Count Indicator */}
          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-sm text-slate-500">
            <span>Target: ~{answer.wordCount} words for {answer.marks} marks</span>
            <span className="font-mono bg-slate-900/50 px-3 py-1 rounded">
              Generated by StudyForge AI
            </span>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!answer && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-12 text-center"
        >
          <Brain className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <h3 className="text-xl font-bold mb-2">No answer generated yet</h3>
          <p className="text-slate-400 mb-6">
            Fill in the form above and click "Generate VTU Answer" to create exam-ready answers
          </p>
          <div className="text-sm text-slate-500 space-y-1">
            <p>• Answers adapt length based on marks (3/5/7/8/10)</p>
            <p>• VTU format: Definition → Explanation → Diagram → Applications</p>
            <p>• Works for all engineering subjects</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function AnswerSection({ title, icon: Icon, color, children }: { 
  title: string; 
  icon: React.ComponentType<{ className?: string }>; 
  color: string; 
  children: React.ReactNode 
}) {
  return (
    <div className="p-5 rounded-xl bg-slate-900/30 border border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={cn('w-5 h-5', color)} />
        <h3 className="font-bold text-lg">{title}</h3>
      </div>
      <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
        {children}
      </div>
    </div>
  );
}

function formatAnswerForCopy(answer: VTUAnswer, question: string, subject: string, module: string, marks: number): string {
  let text = `STUDYFORGE AI - VTU ANSWER GENERATOR\n`;
  text += `==========================================\n\n`;
  text += `Subject: ${subject}\n`;
  text += `Module: ${module}\n`;
  text += `Question: ${question}\n`;
  text += `Marks: ${marks}\n`;
  text += `Target Word Count: ~${answer.wordCount}\n\n`;
  text += `==========================================\n\n`;

  if (answer.definition) {
    text += `1. DEFINITION\n`;
    text += `-------------\n`;
    text += `${answer.definition}\n\n`;
  }

  if (answer.explanation) {
    text += `2. EXPLANATION\n`;
    text += `--------------\n`;
    text += `${answer.explanation}\n\n`;
  }

  if (answer.constructionPrinciple) {
    text += `3. CONSTRUCTION / PRINCIPLE\n`;
    text += `---------------------------\n`;
    text += `${answer.constructionPrinciple}\n\n`;
  }

  if (answer.working) {
    text += `4. WORKING\n`;
    text += `----------\n`;
    text += `${answer.working}\n\n`;
  }

  if (answer.diagramInstructions) {
    text += `5. DIAGRAM INSTRUCTIONS\n`;
    text += `-----------------------\n`;
    text += `${answer.diagramInstructions}\n\n`;
  }

  if (answer.applications.length > 0) {
    text += `6. APPLICATIONS\n`;
    text += `---------------\n`;
    answer.applications.forEach((app, i) => {
      text += `${i + 1}. ${app}\n`;
    });
    text += `\n`;
  }

  if (answer.conclusion) {
    text += `7. CONCLUSION\n`;
    text += `-------------\n`;
    text += `${answer.conclusion}\n\n`;
  }

  text += `==========================================\n`;
  text += `Generated by StudyForge AI\n`;
  text += `https://studyforge.ai\n`;

  return text;
}

export default AnswerGeneratorPage;
