import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateRealOrDemoAnswer } from '@/lib/server-ai';

export const runtime = 'nodejs';

const GenerateSchema = z.object({
  question: z.string().min(3),
  subject: z.string().default('Engineering Chemistry'),
  module: z.string().default('General'),
  marks: z.number().int().min(3).max(10).default(8),
  chunks: z.array(z.object({ id: z.string(), pageNumber: z.number(), module: z.string(), text: z.string() })).optional(),
});

export async function POST(request: Request) {
  try {
    const body = GenerateSchema.parse(await request.json());
    const result = await generateRealOrDemoAnswer(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI generation failed:', error);
    const message = error instanceof Error && error.message.includes('Gemini API key')
      ? error.message
      : 'Could not generate answer safely. Please try again.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
