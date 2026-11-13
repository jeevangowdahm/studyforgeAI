export interface UserProfile {
  id: string;
  name: string;
  email: string;
  college: string;
  branch: string;
  semester: number;
  subjects: string[];
  examGoal: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PDFUpload {
  id: string;
  name: string;
  subject: string;
  modules: string[];
  pages: number;
  size: number;
  uploadedAt: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  progress?: number;
}

export interface ModuleNote {
  id: string;
  pdfId: string;
  module: string;
  subject: string;
  summary: string;
  keyFormulas: string[];
  importantQuestions: ImportantQuestion[];
  generatedAt: string;
}

export interface ImportantQuestion {
  id: string;
  module: string;
  subject: string;
  question: string;
  marks: number;
  priority: 'high' | 'medium' | 'low';
  frequency: number;
  lastAppeared?: string;
  generatedAnswer?: VTUAnswer;
}

export interface VTUAnswer {
  definition: string;
  explanation: string;
  constructionPrinciple?: string;
  working?: string;
  diagramInstructions?: string;
  applications: string[];
  conclusion: string;
  wordCount: number;
  marks: number;
}

export interface QuizQuestion {
  id: string;
  module: string;
  subject: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
}

export interface QuizScore {
  id: string;
  module: string;
  subject: string;
  score: number;
  total: number;
  percentage: number;
  answers: { questionId: string; selectedIndex: number; correct: boolean }[];
  completedAt: string;
  timeSpent: number;
}

export interface DiagramExplanation {
  id: string;
  topic: string;
  diagramName: string;
  requiredLabels: string[];
  howToDraw: string[];
  explanation: string;
  commonMistakes: string[];
  examTips: string[];
}

export interface RevisionPlan {
  id: string;
  subject: string;
  examDate: string;
  hoursPerDay: number;
  difficulty: 'easy' | 'medium' | 'hard';
  totalDays: number;
  dailyPlan: DailyPlan[];
  generatedAt: string;
}

export interface DailyPlan {
  day: number;
  date: string;
  modules: string[];
  hours: number;
  tasks: string[];
  importantQuestions: string[];
  quizPractice: boolean;
  isRevisionDay: boolean;
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  aiResponseStyle: 'short' | 'exam-focused' | 'detailed';
  defaultMarksFormat: number;
  preferredLanguage: 'english' | 'kannada' | 'hindi';
  notifications: boolean;
  autoSave: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Citation[];
  suggestedQuestions?: string[];
}

export interface Citation {
  source: string;
  module: string;
  page: number;
  snippet: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface StatCard {
  label: string;
  value: string | number;
  change?: string;
  icon: string;
  color: string;
}