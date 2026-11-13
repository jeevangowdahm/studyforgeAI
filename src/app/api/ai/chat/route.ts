import { NextResponse } from 'next/server';
import { z } from 'zod';
import { chatWithPdf } from '@/lib/server-ai';

export const runtime = 'nodejs';

const ChatSchema = z.object({
  question: z.string().min(2),
  chunks: z.array(z.object({ id: z.string(), pageNumber: z.number(), module: z.string(), text: z.string() })).optional(),
});

export async function POST(request: Request) {
  try {
    const body = ChatSchema.parse(await request.json());
    const result = await chatWithPdf(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('PDF chat failed:', error);
    const message = error instanceof Error && error.message.includes('Gemini API key')
      ? error.message
      : 'Could not answer from the PDF safely. Please try again.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
