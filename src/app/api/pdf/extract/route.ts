import { NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import { chunkPdfPages } from '@/lib/pdf-processing';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 20 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No PDF file was uploaded.' }, { status: 400 });
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are supported.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'PDF is too large. Please upload a file under 20MB.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();

    const pages = result.pages.map((page) => ({
      pageNumber: page.num,
      text: page.text.trim(),
    }));

    const extractedTextLength = pages.reduce((sum, page) => sum + page.text.length, 0);
    if (extractedTextLength < 30) {
      return NextResponse.json(
        { error: 'Text could not be extracted from this PDF. It may be scanned or image-only.' },
        { status: 422 }
      );
    }

    const chunks = chunkPdfPages(pages);

    return NextResponse.json({
      fileName: file.name,
      fileSize: file.size,
      pageCount: pages.length,
      pages,
      chunks,
      mode: 'real',
    });
  } catch (error) {
    console.error('PDF extraction failed:', error);
    return NextResponse.json(
      { error: 'Unable to extract PDF text. Please try a text-based PDF.' },
      { status: 500 }
    );
  }
}
