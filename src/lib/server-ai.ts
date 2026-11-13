import { findRelevantChunks, PdfChunk } from './pdf-processing';

export function hasAiEnv() {
  return Boolean(process.env.GEMINI_API_KEY || process.env.AI_API_KEY);
}

function getAiKey() {
  return process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
}

function getProvider() {
  return (process.env.AI_PROVIDER || 'gemini').toLowerCase();
}

function assertAiEnv() {
  if (!hasAiEnv()) {
    throw new Error('Gemini API key is not configured. Add GEMINI_API_KEY to .env.local and restart the dev server.');
  }
}

function buildExamPrompt(input: {
  question: string;
  subject: string;
  module: string;
  marks: number;
  context: string;
}) {
  return `You are StudyForge AI, an exam-focused assistant for VTU engineering students.

Rules:
- Answer mainly from the uploaded PDF context.
- If the exact answer is not found, start with: "This exact answer was not found in the uploaded notes. Here is a general explanation."
- Format the answer for ${input.marks} marks.
- Include: Question title, marks selected, Definition, Main explanation, Diagram instruction, Step-by-step working, Applications, Conclusion, Exam writing tips, Important points.
- Keep the tone concise and exam-ready.

Subject: ${input.subject}
Module: ${input.module}
Question: ${input.question}

Uploaded PDF context:
${input.context}`;
}

async function callOpenAICompatible(prompt: string, provider: string) {
  const baseUrl = provider === 'groq' ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
  const model = provider === 'groq' ? 'llama-3.1-8b-instant' : 'gpt-4o-mini';
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAiKey()}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You create exam-ready study answers with citations.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.25,
    }),
  });
  if (!res.ok) throw new Error(`AI provider failed: ${res.status}`);
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? '';
}

async function callGemini(prompt: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${getAiKey()}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );
  if (!res.ok) throw new Error(`Gemini failed: ${res.status}`);
  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

export async function generateText(prompt: string) {
  assertAiEnv();
  const provider = getProvider();
  return provider === 'gemini' ? callGemini(prompt) : callOpenAICompatible(prompt, provider);
}

export async function generateStudyAnswer(input: {
  question: string;
  subject: string;
  module: string;
  marks: number;
  chunks?: PdfChunk[];
}) {
  const relevantChunks = input.chunks?.length ? findRelevantChunks(input.question, input.chunks, 6) : [];
  const context = relevantChunks.map((chunk) => `[Page ${chunk.pageNumber} | ${chunk.module}] ${chunk.text}`).join('\n\n');
  const citation = relevantChunks[0]
    ? { page: relevantChunks[0].pageNumber, module: relevantChunks[0].module, source: 'Uploaded PDF' }
    : { page: 1, module: input.module || 'General', source: 'Uploaded PDF' };

  const prompt = buildExamPrompt({ ...input, context: context || 'No matching PDF context was found.' });
  const answerText = await generateText(prompt);
  return { mode: 'real', answerText, citation, importantPoints: [] };
}

export async function generateRealOrDemoAnswer(input: {
  question: string;
  subject: string;
  module: string;
  marks: number;
  chunks?: PdfChunk[];
}) {
  return generateStudyAnswer(input);
}

export async function chatWithPdf(input: { question: string; chunks?: PdfChunk[] }) {
  const relevantChunks = input.chunks?.length ? findRelevantChunks(input.question, input.chunks, 5) : [];
  const citation = relevantChunks[0]
    ? { source: 'Uploaded PDF', module: relevantChunks[0].module, page: relevantChunks[0].pageNumber }
    : { source: 'Uploaded PDF', module: 'Module 1', page: 12 };

  const context = relevantChunks.map((chunk) => `[Page ${chunk.pageNumber} | ${chunk.module}] ${chunk.text}`).join('\n\n');
  const prompt = `Answer the student question mainly from this PDF context. If exact answer is not found, say: "This exact answer was not found in the uploaded notes. Here is a general explanation." Cite the page/module at the end.\n\nQuestion: ${input.question}\n\nContext:\n${context || 'No relevant PDF context found.'}`;
  const answer = await generateText(prompt);
  return { mode: 'real', answer, citation, suggestedQuestions: [] };
}
