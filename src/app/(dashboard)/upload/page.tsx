'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { storage } from '@/lib/storage';
import { initializeDemoData } from '@/lib/storage';
import { PDFUpload } from '@/lib/types';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, X, ChevronDown } from 'lucide-react';

const processingSteps = [
  { id: 'read', label: 'Reading PDF', detail: 'Validating file and reading pages...' },
  { id: 'extract', label: 'Extracting text', detail: 'Extracting text with page numbers...' },
  { id: 'detect', label: 'Detecting units/modules', detail: 'Mapping content to exam modules...' },
  { id: 'questions', label: 'Finding repeated questions', detail: 'Looking for high-frequency exam topics...' },
  { id: 'summaries', label: 'Creating summaries', detail: 'Preparing module-wise notes...' },
  { id: 'quiz', label: 'Preparing quiz', detail: 'Creating practice chunks for MCQs...' },
  { id: 'ready', label: 'Completed successfully', detail: 'PDF is ready for Real AI mode.' },
];

const UploadPage = () => {
  const [pdfs, setPdfs] = useState<PDFUpload[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [processingFile, setProcessingFile] = useState<PDFUpload | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [mode, setMode] = useState<'demo' | 'real'>('demo');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initializeDemoData();
    setPdfs(storage.pdfs.get());
    setMode((localStorage.getItem('studyforge_mode') as 'demo' | 'real') || 'demo');
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => setPdfs(storage.pdfs.get());
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        uploadFile(file);
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        uploadFile(file);
      }
      e.target.value = '';
    }
  };

  const uploadFile = (file: File) => {
    setErrorMessage('');
    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('PDF is too large. Please upload a file under 20MB for safe extraction.');
      return;
    }
    const newPdf: PDFUpload = {
      id: `pdf-${Date.now()}`,
      name: file.name,
      subject: 'Engineering Chemistry',
      modules: [
        'Module 1: Electrochemistry',
        'Module 2: Corrosion',
        'Module 3: Nanomaterials',
        'Module 4: Sensors',
        'Module 5: Green Chemistry',
      ],
      pages: Math.floor(Math.random() * 50) + 50,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      status: 'uploading',
      progress: 0,
    };

    setPdfs(prev => [newPdf, ...prev]);
    storage.pdfs.add(newPdf);
    startProcessing(newPdf, file);
  };

  const startProcessing = async (pdf: PDFUpload, file?: File) => {
    setProcessingFile(pdf);
    setShowProgress(true);
    setCurrentStep(0);

    for (let i = 0; i < processingSteps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, mode === 'real' ? 350 : 800 + Math.random() * 500));
      
      setPdfs(prev => prev.map(p => 
        p.id === pdf.id 
          ? { ...p, progress: Math.round(((i + 1) / processingSteps.length) * 100), status: i === processingSteps.length - 1 ? 'completed' : 'processing' }
          : p
      ));
      
      storage.pdfs.update(pdf.id, { 
        progress: Math.round(((i + 1) / processingSteps.length) * 100),
        status: i === processingSteps.length - 1 ? 'completed' : 'processing'
      });
    }
    
    if (mode === 'real' && file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/pdf/extract', { method: 'POST', body: formData });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'PDF extraction failed.');
        localStorage.setItem('studyforge_pdf_pages', JSON.stringify(data.pages));
        localStorage.setItem('studyforge_pdf_chunks', JSON.stringify(data.chunks));
        localStorage.setItem('studyforge_active_pdf', JSON.stringify({ id: pdf.id, name: pdf.name, pageCount: data.pageCount }));
        storage.pdfs.update(pdf.id, { pages: data.pageCount, status: 'completed', progress: 100 });
        setPdfs(storage.pdfs.get());
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to extract text from PDF.';
        setErrorMessage(message);
        storage.pdfs.update(pdf.id, { status: 'failed', progress: 100 });
        setPdfs(storage.pdfs.get());
      }
    }

    setTimeout(() => {
      setShowProgress(false);
      setProcessingFile(null);
    }, 1000);
  };

  const removeFile = (id: string) => {
    setPdfs(prev => prev.filter(p => p.id !== id));
    storage.pdfs.remove(id);
  };

  if (!mounted) {
    return <div className="flex items-center justify-center min-h-[60vh]">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold mb-2">Upload PDF Notes</h1>
        <p className="text-slate-400">Drag & drop your study materials to generate AI-powered notes</p>
        <div className="mt-4 inline-flex rounded-full border border-border bg-slate-900/60 p-1">
          {(['demo', 'real'] as const).map((value) => (
            <button
              key={value}
              onClick={() => { setMode(value); localStorage.setItem('studyforge_mode', value); }}
              className={cn('rounded-full px-4 py-2 text-sm transition-all', mode === value ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white')}
            >
              {value === 'demo' ? 'Demo Mode' : 'Real AI Mode'}
            </button>
          ))}
        </div>
      </motion.div>

      {errorMessage && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      {/* Drop Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={cn(
          'relative rounded-2xl p-12 text-center transition-all duration-300',
          'glass neon-border',
          dragActive && 'bg-cyan-500/10 border-cyan-500/50 scale-[1.02]',
          showProgress && 'pointer-events-none opacity-50'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileSelect}
          disabled={showProgress}
        />

        <AnimatePresence mode="wait">
          {!showProgress && !processingFile && (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className={cn(
                'w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6',
                dragActive ? 'bg-cyan-500/20' : 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20'
              )}>
                <Upload className={cn('w-10 h-10', dragActive ? 'text-cyan-400' : 'text-gradient')} />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {dragActive ? 'Drop your PDF here' : 'Drag & drop PDF files here'}
              </h3>
              <p className="text-slate-400 mb-6">
                {dragActive ? 'Release to upload' : 'or click to browse'}
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-ghost inline-flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Browse Files
              </button>
              <p className="text-xs text-slate-500 mt-4">Supports PDF files up to 50MB</p>
            </motion.div>
          )}
          
          {showProgress && processingFile && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md mx-auto"
            >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold">Processing: {processingFile.name}</h3>
                  <span className="text-sm text-cyan-400">{processingFile.progress}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${processingFile.progress}%` }}
                    className="h-full progress-glow rounded-full"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {processingSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'flex items-center gap-4 p-3 rounded-xl transition-all',
                      index < currentStep ? 'bg-green-500/10' : 
                      index === currentStep ? 'bg-cyan-500/10 border border-cyan-500/30' : 
                      'bg-slate-900/50'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                      index < currentStep ? 'bg-green-500' :
                      index === currentStep ? 'bg-cyan-500 animate-pulse' :
                      'bg-slate-700'
                    )}>
                      {index < currentStep ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : index === currentStep ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <span className="text-sm font-bold text-slate-500">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className={cn('font-medium', index <= currentStep ? 'text-white' : 'text-slate-500')}>
                        {step.label}
                      </p>
                      <p className="text-xs text-slate-500">{step.detail}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Uploaded Files List */}
      {pdfs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Uploaded Files ({pdfs.length})</h2>
            <span className="text-sm text-slate-400">Click to view generated notes</span>
          </div>
          <div className="space-y-3">
            {pdfs.map((pdf) => (
              <motion.div
                key={pdf.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass card-hover p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{pdf.name}</p>
                  <div className="flex flex-wrap gap-2 mt-1 text-sm text-slate-400">
                    <span>{pdf.subject}</span>
                    <span>•</span>
                    <span>{pdf.pages} pages</span>
                    <span>•</span>
                    <span>{(pdf.size / (1024 * 1024)).toFixed(1)} MB</span>
                    <span>•</span>
                    <span>{pdf.modules.length} modules</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium',
                    pdf.status === 'completed' && 'bg-green-500/20 text-green-400',
                    pdf.status === 'processing' && 'bg-yellow-500/20 text-yellow-400',
                    pdf.status === 'uploading' && 'bg-cyan-500/20 text-cyan-400',
                    pdf.status === 'failed' && 'bg-red-500/20 text-red-400'
                  )}>
                    {pdf.status}
                  </span>
                  {pdf.status === 'completed' && (
                    <a href="/notes" className="text-sm text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1">
                      View Notes
                      <ChevronDown className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => removeFile(pdf.id)}
                    className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {pdfs.length === 0 && !showProgress && !processingFile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass p-12 text-center"
        >
          <FileText className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <h3 className="text-xl font-bold mb-2">No PDFs uploaded yet</h3>
          <p className="text-slate-400 mb-6">Upload your first PDF to start generating exam-ready notes</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-neon-primary"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload PDF
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default UploadPage;
