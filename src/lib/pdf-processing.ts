export type ExtractedPdfPage = {
  pageNumber: number;
  text: string;
};

export type PdfChunk = {
  id: string;
  pageNumber: number;
  module: string;
  text: string;
  score?: number;
};

export function guessModule(text: string, fallback = 'General') {
  const normalized = text.toLowerCase();
  const match = normalized.match(/module\s*[-:]?\s*(\d)/i) || normalized.match(/unit\s*[-:]?\s*(\d)/i);
  if (match?.[1]) return `Module ${match[1]}`;
  if (normalized.includes('electrochem')) return 'Module 1: Electrochemistry';
  if (normalized.includes('corrosion')) return 'Module 2: Corrosion';
  if (normalized.includes('nano')) return 'Module 3: Nanomaterials';
  if (normalized.includes('sensor')) return 'Module 4: Sensors';
  if (normalized.includes('green chemistry')) return 'Module 5: Green Chemistry';
  return fallback;
}

export function chunkPdfPages(pages: ExtractedPdfPage[], chunkSize = 1400, overlap = 180): PdfChunk[] {
  const chunks: PdfChunk[] = [];
  for (const page of pages) {
    const clean = page.text.replace(/\s+/g, ' ').trim();
    if (!clean) continue;
    const module = guessModule(clean);
    let index = 0;
    for (let start = 0; start < clean.length; start += Math.max(1, chunkSize - overlap)) {
      const text = clean.slice(start, start + chunkSize).trim();
      if (text.length < 40) continue;
      chunks.push({
        id: `p${page.pageNumber}-c${index}`,
        pageNumber: page.pageNumber,
        module,
        text,
      });
      index++;
    }
  }
  return chunks;
}

export function findRelevantChunks(query: string, chunks: PdfChunk[], limit = 5) {
  const words = new Set(
    query
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 3)
  );

  return chunks
    .map((chunk) => {
      const lower = chunk.text.toLowerCase();
      let score = 0;
      for (const word of words) {
        if (lower.includes(word)) score += 2;
      }
      if (lower.includes(query.toLowerCase())) score += 8;
      return { ...chunk, score };
    })
    .filter((chunk) => (chunk.score ?? 0) > 0)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, limit);
}
