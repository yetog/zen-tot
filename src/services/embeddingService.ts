// Embedding Service for Semantic Search
// Uses simple text-based similarity for now, can be upgraded to use IONOS AI Model Hub

import { Note } from '@/types/note';

// Simple tokenization and TF-IDF-like scoring
const tokenize = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2);
};

// Calculate term frequency
const termFrequency = (tokens: string[]): Map<string, number> => {
  const freq = new Map<string, number>();
  tokens.forEach(token => {
    freq.set(token, (freq.get(token) || 0) + 1);
  });
  return freq;
};

// Calculate cosine similarity between two term frequency maps
const cosineSimilarity = (tf1: Map<string, number>, tf2: Map<string, number>): number => {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  tf1.forEach((freq, term) => {
    norm1 += freq * freq;
    if (tf2.has(term)) {
      dotProduct += freq * tf2.get(term)!;
    }
  });

  tf2.forEach((freq) => {
    norm2 += freq * freq;
  });

  if (norm1 === 0 || norm2 === 0) return 0;
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
};

// Generate a simple embedding (bag of words with frequencies)
export const generateEmbedding = (text: string): number[] => {
  const tokens = tokenize(text);
  const tf = termFrequency(tokens);
  
  // Create a simple numerical representation
  // This is a placeholder - in production, use IONOS AI Model Hub or similar
  const embedding: number[] = [];
  tf.forEach((freq, term) => {
    // Hash the term to a position and add frequency
    const hash = term.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
    const pos = Math.abs(hash) % 256;
    embedding[pos] = (embedding[pos] || 0) + freq;
  });
  
  // Fill empty slots and normalize
  for (let i = 0; i < 256; i++) {
    embedding[i] = embedding[i] || 0;
  }
  
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? embedding.map(v => v / magnitude) : embedding;
};

// Calculate similarity between two embeddings
export const calculateSimilarity = (embedding1: number[], embedding2: number[]): number => {
  if (embedding1.length !== embedding2.length) return 0;
  
  let dotProduct = 0;
  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
  }
  
  return dotProduct;
};

// Get text content from a note for embedding
export const getNoteContent = (note: Note): string => {
  const parts = [
    note.title,
    note.transcript || '',
    note.extractedText || '',
    note.summary || '',
    note.bulletedNotes || '',
    note.tags?.join(' ') || '',
  ];
  return parts.filter(Boolean).join(' ');
};

// Semantic search across notes
export const semanticSearch = (
  query: string,
  notes: Note[],
  topK: number = 5
): { note: Note; score: number }[] => {
  const queryTokens = tokenize(query);
  const queryTf = termFrequency(queryTokens);
  
  const results = notes.map(note => {
    const content = getNoteContent(note);
    const noteTokens = tokenize(content);
    const noteTf = termFrequency(noteTokens);
    
    const score = cosineSimilarity(queryTf, noteTf);
    return { note, score };
  });
  
  return results
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
};

// Find similar notes to a given note
export const findSimilarNotes = (
  targetNote: Note,
  allNotes: Note[],
  topK: number = 5
): { note: Note; similarity: number }[] => {
  const targetContent = getNoteContent(targetNote);
  const targetTokens = tokenize(targetContent);
  const targetTf = termFrequency(targetTokens);
  
  const results = allNotes
    .filter(note => note.id !== targetNote.id)
    .map(note => {
      const content = getNoteContent(note);
      const noteTokens = tokenize(content);
      const noteTf = termFrequency(noteTokens);
      
      const similarity = cosineSimilarity(targetTf, noteTf);
      return { note, similarity };
    });
  
  return results
    .filter(r => r.similarity > 0.1)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
};

// Build context string for voice agent from relevant notes
export const buildVoiceAgentContext = (
  query: string,
  notes: Note[],
  maxNotes: number = 5,
  maxChars: number = 3000
): string => {
  const relevantNotes = semanticSearch(query, notes, maxNotes);
  
  if (relevantNotes.length === 0) {
    return 'No relevant notes found in the knowledge base.';
  }
  
  let context = 'Here are the relevant notes from the user\'s knowledge base:\n\n';
  let charCount = context.length;
  
  for (const { note, score } of relevantNotes) {
    const noteSection = `## ${note.title} (${note.type})\n` +
      (note.summary ? `Summary: ${note.summary}\n` : '') +
      (note.transcript ? `Transcript excerpt: ${note.transcript.slice(0, 500)}...\n` : '') +
      (note.extractedText ? `Content excerpt: ${note.extractedText.slice(0, 500)}...\n` : '') +
      '\n';
    
    if (charCount + noteSection.length > maxChars) break;
    
    context += noteSection;
    charCount += noteSection.length;
  }
  
  return context;
};
