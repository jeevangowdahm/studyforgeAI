'use client';

import { UserProfile, PDFUpload, ModuleNote, ImportantQuestion, QuizScore, RevisionPlan, UserSettings } from './types';

const STORAGE_KEYS = {
  user: 'studyforge_user',
  pdfs: 'studyforge_pdfs',
  notes: 'studyforge_notes',
  questions: 'studyforge_questions',
  quizScores: 'studyforge_quiz_scores',
  revisionPlans: 'studyforge_revision_plans',
  settings: 'studyforge_settings',
} as const;

function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export const storage = {
  user: {
    get: (): UserProfile | null => getFromStorage(STORAGE_KEYS.user, null),
    set: (user: UserProfile) => setToStorage(STORAGE_KEYS.user, user),
    clear: () => localStorage.removeItem(STORAGE_KEYS.user),
  },
  pdfs: {
    get: (): PDFUpload[] => getFromStorage(STORAGE_KEYS.pdfs, []),
    set: (pdfs: PDFUpload[]) => setToStorage(STORAGE_KEYS.pdfs, pdfs),
    add: (pdf: PDFUpload) => {
      const pdfs = storage.pdfs.get();
      storage.pdfs.set([pdf, ...pdfs]);
    },
    update: (id: string, updates: Partial<PDFUpload>) => {
      const pdfs = storage.pdfs.get();
      storage.pdfs.set(pdfs.map(p => p.id === id ? { ...p, ...updates } : p));
    },
    remove: (id: string) => {
      const pdfs = storage.pdfs.get();
      storage.pdfs.set(pdfs.filter(p => p.id !== id));
    },
  },
  notes: {
    get: (): ModuleNote[] => getFromStorage(STORAGE_KEYS.notes, []),
    set: (notes: ModuleNote[]) => setToStorage(STORAGE_KEYS.notes, notes),
    add: (note: ModuleNote) => {
      const notes = storage.notes.get();
      storage.notes.set([note, ...notes]);
    },
    getByPdf: (pdfId: string) => storage.notes.get().filter(n => n.pdfId === pdfId),
  },
  questions: {
    get: (): ImportantQuestion[] => getFromStorage(STORAGE_KEYS.questions, []),
    set: (questions: ImportantQuestion[]) => setToStorage(STORAGE_KEYS.questions, questions),
    add: (question: ImportantQuestion) => {
      const questions = storage.questions.get();
      storage.questions.set([question, ...questions]);
    },
    addMany: (questions: ImportantQuestion[]) => {
      const existing = storage.questions.get();
      storage.questions.set([...questions, ...existing]);
    },
  },
  quizScores: {
    get: (): QuizScore[] => getFromStorage(STORAGE_KEYS.quizScores, []),
    set: (scores: QuizScore[]) => setToStorage(STORAGE_KEYS.quizScores, scores),
    add: (score: QuizScore) => {
      const scores = storage.quizScores.get();
      storage.quizScores.set([score, ...scores]);
    },
    getByModule: (module: string) => storage.quizScores.get().filter(s => s.module === module),
  },
  revisionPlans: {
    get: (): RevisionPlan[] => getFromStorage(STORAGE_KEYS.revisionPlans, []),
    set: (plans: RevisionPlan[]) => setToStorage(STORAGE_KEYS.revisionPlans, plans),
    add: (plan: RevisionPlan) => {
      const plans = storage.revisionPlans.get();
      storage.revisionPlans.set([plan, ...plans]);
    },
  },
  settings: {
    get: (): UserSettings => getFromStorage(STORAGE_KEYS.settings, {
      theme: 'dark',
      aiResponseStyle: 'exam-focused',
      defaultMarksFormat: 8,
      preferredLanguage: 'english',
      notifications: true,
      autoSave: true,
    }),
    set: (settings: UserSettings) => setToStorage(STORAGE_KEYS.settings, settings),
  },
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  },
};

export function initializeDemoData(): void {
  if (typeof window === 'undefined') return;
  
  const existingUser = storage.user.get();
  if (!existingUser) {
    const demoUser: UserProfile = {
      id: 'user-1',
      name: 'Alex Kumar',
      email: 'alex.kumar@vtu.ac.in',
      college: 'RV College of Engineering',
      branch: 'Computer Science & Engineering',
      semester: 3,
      subjects: ['Engineering Chemistry', 'Engineering Physics', 'Data Structures'],
      examGoal: 'Score 90% in VTU exams',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    storage.user.set(demoUser);
  }
  
  const existingPdfs = storage.pdfs.get();
  if (existingPdfs.length === 0) {
    const demoPdfs: PDFUpload[] = [
      {
        id: 'pdf-1',
        name: 'Engineering_Chemistry_Complete_Notes.pdf',
        subject: 'Engineering Chemistry',
        modules: ['Module 1: Electrochemistry', 'Module 2: Corrosion', 'Module 3: Nanomaterials', 'Module 4: Sensors', 'Module 5: Green Chemistry'],
        pages: 142,
        size: 8.5 * 1024 * 1024,
        uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        progress: 100,
      },
      {
        id: 'pdf-2',
        name: 'Engineering_Physics_Question_Bank.pdf',
        subject: 'Engineering Physics',
        modules: ['Module 1: Quantum Mechanics', 'Module 2: Semiconductor Physics', 'Module 3: Optics'],
        pages: 89,
        size: 5.2 * 1024 * 1024,
        uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        progress: 100,
      },
      {
        id: 'pdf-3',
        name: 'Previous_Year_Papers_Chemistry.pdf',
        subject: 'Engineering Chemistry',
        modules: ['Module 1: Electrochemistry', 'Module 2: Corrosion'],
        pages: 56,
        size: 3.1 * 1024 * 1024,
        uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        progress: 100,
      },
    ];
    storage.pdfs.set(demoPdfs);
  }
  
  const existingNotes = storage.notes.get();
  if (existingNotes.length === 0) {
    const demoNotes: ModuleNote[] = [
      {
        id: 'note-1',
        pdfId: 'pdf-1',
        module: 'Module 1: Electrochemistry',
        subject: 'Engineering Chemistry',
        summary: 'Electrochemistry deals with the relationship between electrical energy and chemical changes. Key concepts: Electrochemical cells (galvanic/voltaic), Nernst equation for electrode potential, concentration cells (with/without transference), electrochemical series, and applications like batteries and corrosion.',
        keyFormulas: [
          'E = E° - (RT/nF) ln Q',
          'E = E° + (0.0591/n) log[Mⁿ⁺] (at 298K)',
          'EMF_cell = E_cathode - E_anode',
          'Concentration cell (no transference): E = (0.0591/n) log(C₂/C₁)',
          'ΔG = -nFE',
        ],
        importantQuestions: [],
        generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'note-2',
        pdfId: 'pdf-1',
        module: 'Module 2: Corrosion',
        subject: 'Engineering Chemistry',
        summary: 'Corrosion is the deterioration of metals by electrochemical reaction with environment. Types: Dry (chemical) and Wet (electrochemical). Wet corrosion mechanism: Anode (oxidation), Cathode (reduction), Electrolyte, Metallic path. Forms: Uniform, Galvanic, Pitting, Crevice, Stress corrosion.',
        keyFormulas: [
          'Anode: M → Mⁿ⁺ + ne⁻',
          'Cathode (neutral): O₂ + 2H₂O + 4e⁻ → 4OH⁻',
          'Cathode (acidic): 2H⁺ + 2e⁻ → H₂',
          'Faraday\'s law: m = (I × t × M) / (n × F)',
        ],
        importantQuestions: [],
        generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    storage.notes.set(demoNotes);
  }
  
  const existingScores = storage.quizScores.get();
  if (existingScores.length === 0) {
    const demoScores: QuizScore[] = [
      {
        id: 'score-1',
        module: 'Module 1: Electrochemistry',
        subject: 'Engineering Chemistry',
        score: 8,
        total: 10,
        percentage: 80,
        answers: [],
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        timeSpent: 420,
      },
      {
        id: 'score-2',
        module: 'Module 2: Corrosion',
        subject: 'Engineering Chemistry',
        score: 7,
        total: 10,
        percentage: 70,
        answers: [],
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        timeSpent: 380,
      },
    ];
    storage.quizScores.set(demoScores);
  }
}