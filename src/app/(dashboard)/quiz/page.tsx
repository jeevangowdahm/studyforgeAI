'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { generateQuiz } from '@/lib/mock-ai';
import { MODULES, SUBJECTS, DIFFICULTY_LEVELS } from '@/lib/constants';
import { QuizQuestion, QuizScore } from '@/lib/types';
import { storage } from '@/lib/storage';
import { Trophy, Loader2, Sparkles, ArrowRight, ArrowLeft, CheckCircle, XCircle, Clock, RefreshCw, Brain, Target } from 'lucide-react';

export function QuizPage() {
  const [step, setStep] = useState<'setup' | 'quiz' | 'results'>('setup');
  const [subject, setSubject] = useState('Engineering Chemistry');
  const [module, setModule] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const modules = MODULES[subject] || [];

  useEffect(() => {
    if (modules.length > 0 && !modules.includes(module)) {
      setModule(modules[0]);
    }
  }, [subject, modules]);

  const startQuiz = async () => {
    if (!module) return;
    setLoading(true);
    try {
      const quiz = await generateQuiz(module, subject, difficulty, questionCount);
      setQuestions(quiz);
      setCurrentQuestion(0);
      setAnswers({});
      setScore(0);
      setTimeSpent(0);
      setStep('quiz');
      startTimer();
    } catch (error) {
      console.error('Failed to generate quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    if (timer) clearInterval(timer);
    const interval = setInterval(() => setTimeSpent(t => t + 1), 1000);
    setTimer(interval);
  };

  const handleAnswer = (questionIndex: number, optionIndex: number) => {
    if (answers[questionIndex] !== undefined) return;
    setAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setShowExplanation(false);
    }
  };

  const finishQuiz = () => {
    if (timer) clearInterval(timer);
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) correct++;
    });
    const percentage = Math.round((correct / questions.length) * 100);
    setScore(percentage);

    // Save score
    const newScore: QuizScore = {
      id: `score-${Date.now()}`,
      module,
      subject,
      score: correct,
      total: questions.length,
      percentage,
      answers: Object.entries(answers).map(([qIdx, selected]) => ({
        questionId: questions[parseInt(qIdx)].id,
        selectedIndex: selected,
        correct: selected === questions[parseInt(qIdx)].correctIndex,
      })),
      completedAt: new Date().toISOString(),
      timeSpent,
    };
    storage.quizScores.add(newScore);
    setStep('results');
  };

  const restartQuiz = () => {
    setStep('setup');
    if (timer) clearInterval(timer);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!mounted) return <div className="flex items-center justify-center min-h-[60vh]">Loading...</div>;

  const currentQ = questions[currentQuestion];
  const answered = answers[currentQuestion] !== undefined;
  const isCorrect = answered ? answers[currentQuestion] === currentQ?.correctIndex : false;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center justify-between"
      >
        {step === 'quiz' && (
          <>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="font-bold">{subject}</p>
                <p className="text-sm text-slate-400">{module}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(timeSpent)}
              </span>
              <span className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                Question {currentQuestion + 1}/{questions.length}
              </span>
            </div>
          </>
        )}
      </motion.div>

      {/* Setup Step */}
      {step === 'setup' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 space-y-6"
        >
          <div className="text-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Practice Quiz</h1>
            <p className="text-slate-400">Test your knowledge with module-wise MCQs</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)} className="input-neon">
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Module</label>
              <select value={module} onChange={e => setModule(e.target.value)} className="input-neon" disabled={modules.length === 0}>
                <option value="">Select a module</option>
                {modules.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="input-neon">
                  {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Questions</label>
                <select value={questionCount} onChange={e => setQuestionCount(parseInt(e.target.value))} className="input-neon">
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                  <option value={20}>20 Questions</option>
                </select>
              </div>
            </div>

            <button onClick={startQuiz} disabled={loading || !module} className={cn('w-full btn-neon-primary py-4 text-lg', loading && 'opacity-50')}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <> <Sparkles className="w-5 h-5 mr-2" /> Start Quiz </>}
            </button>
          </div>
        </motion.div>
      )}

      {/* Quiz Step */}
      {step === 'quiz' && currentQ && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="glass p-6 space-y-6"
          >
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Question {currentQuestion + 1} of {questions.length}</span>
                <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  className="h-full progress-glow rounded-full"
                />
              </div>
            </div>

            {/* Question */}
            <div className="space-y-4">
              <p className="text-lg font-medium leading-relaxed">{currentQ.question}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentQ.options.map((option, i) => {
                  const isSelected = answered && answers[currentQuestion] === i;
                  const isCorrectOption = i === currentQ.correctIndex;
                  let variant = 'default';
                  if (answered) {
                    if (isSelected && isCorrectOption) variant = 'correct';
                    else if (isSelected) variant = 'incorrect';
                    else if (isCorrectOption) variant = 'correct';
                  }

                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleAnswer(currentQuestion, i)}
                      disabled={answered}
                      className={cn(
                        'p-4 rounded-xl text-left transition-all font-medium',
                        variant === 'correct' && 'bg-green-500/20 border-2 border-green-500 text-green-400',
                        variant === 'incorrect' && 'bg-red-500/20 border-2 border-red-500 text-red-400',
                        variant === 'default' && 'bg-slate-900/50 border border-border hover:border-cyan-500/50'
                      )}
                    >
                      <span className="mr-3 font-mono text-sm opacity-50">{String.fromCharCode(65 + i)}.</span>
                      {option}
                      {answered && isCorrectOption && (
                        <CheckCircle className="ml-2 w-5 h-5 text-green-400" />
                      )}
                      {answered && isSelected && !isCorrectOption && (
                        <XCircle className="ml-2 w-5 h-5 text-red-400" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {showExplanation && answered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="p-4 rounded-xl bg-slate-900/50 border border-border"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                      <span className="font-bold">Explanation</span>
                    </div>
                    <p className="text-slate-300">{currentQ.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
                className="btn-ghost"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              
              <div className="flex items-center gap-2 text-sm text-slate-400">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentQuestion(i); setShowExplanation(false); }}
                    className={cn(
                      'w-8 h-8 rounded-xl text-xs font-medium transition-all',
                      i === currentQuestion && 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
                      answers[i] !== undefined && i !== currentQuestion && 'bg-green-500/20 text-green-400',
                      'bg-slate-800/50 hover:bg-slate-700/50'
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={nextQuestion}
                disabled={currentQuestion === questions.length - 1}
                className={cn('btn-neon-primary', currentQuestion === questions.length - 1 && 'bg-green-500/20 text-green-400 border-green-500/30')}
              >
                {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
                {currentQuestion !== questions.length - 1 && <ArrowRight className="w-4 h-4 ml-1" />}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Results Step */}
      {step === 'results' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 space-y-6"
        >
          <div className="text-center">
            <div className={cn(
              'w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4',
              score >= 70 ? 'bg-green-500/20' : score >= 50 ? 'bg-yellow-500/20' : 'bg-red-500/20'
            )}>
              <Trophy className={cn('w-12 h-12', score >= 70 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400')} />
            </div>
            <h1 className="text-3xl font-bold mb-2">Quiz Complete!</h1>
            <p className="text-slate-400 mb-6">
              You scored <span className="font-bold text-cyan-400">{score}%</span> 
              ({Object.entries(answers).filter(([i, ans]) => ans === questions[parseInt(i)]?.correctIndex).length}/{questions.length} correct)
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass p-4 text-center">
              <p className="text-2xl font-bold text-green-400">
                {Object.entries(answers).filter(([i, ans]) => ans === questions[parseInt(i)]?.correctIndex).length}
              </p>
              <p className="text-sm text-slate-400">Correct</p>
            </div>
            <div className="glass p-4 text-center">
              <p className="text-2xl font-bold text-red-400">
                {Object.entries(answers).filter(([i, ans]) => ans !== undefined && ans !== questions[parseInt(i)]?.correctIndex).length}
              </p>
              <p className="text-sm text-slate-400">Incorrect</p>
            </div>
            <div className="glass p-4 text-center">
              <p className="text-2xl font-bold text-cyan-400">{formatTime(timeSpent)}</p>
              <p className="text-sm text-slate-400">Time Taken</p>
            </div>
          </div>

          {/* Question Review */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <h3 className="font-bold mb-3">Question Review</h3>
            {questions.map((q, i) => {
              const userAnswer = answers[i];
              const correct = userAnswer === q.correctIndex;
              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="p-3 rounded-xl bg-slate-900/50 border border-border"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold',
                      correct ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    )}>
                      {correct ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">Q{i + 1}. {q.question}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className={cn('px-2 py-0.5 rounded', userAnswer !== undefined ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700 text-slate-400')}>
                          Your: {userAnswer !== undefined ? String.fromCharCode(65 + userAnswer) : 'Not answered'}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                          Correct: {String.fromCharCode(65 + q.correctIndex)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={restartQuiz} className="btn-ghost">
              <RefreshCw className="w-4 h-4 mr-1" />
              Retry Quiz
            </button>
            <button onClick={() => { setStep('setup'); if (timer) clearInterval(timer); }} className="btn-neon-primary">
              <ArrowLeft className="w-4 h-4 mr-1" />
              New Quiz
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default QuizPage;