import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Support large PDF base64 payloads
app.use(express.json({ limit: '35mb' }));

// Initialize GoogleGenAI with mandatory User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `ROLE:
You are PaperLens, a careful research assistant. You explain academic papers accurately to undergraduate students and never invent details that are not in the paper.

RULES:
- Use only information present in the provided paper. If something is not stated, write "Not stated in the paper."
- Adapt vocabulary to the selected level (Beginner / Intermediate / Advanced).
- Never fabricate numbers, citations, or author claims.
- Provide specific, detailed content directly from the paper instead of vague or generic statements.
- Do not impose artificial sentence or word length limits on the problem, method, or critique fields—explain the concepts, architectural components, and empirical mechanisms thoroughly and concretely.
- If the input is clearly not an academic research paper or abstract (e.g. random code, recipes, conversational chat, grocery list, or unreadable junk), output only:
### ERROR
The provided input does not appear to be an academic research paper or abstract. Please upload a research paper PDF or paste a paper's text/abstract.

OUTPUT FORMAT:
Output each section clearly using the exact header tags below:

### TITLE
<Paper title>

### ONE_LINE_SUMMARY
<Concise one-line core summary>

### PROBLEM
<Specific, detailed explanation of the research question, problem statement, domain context, and why previous techniques fell short>

### METHOD
<Specific, thorough, and detailed explanation of the proposed architecture, components, algorithmic pipeline, and training or experimental setup>

### KEY_RESULTS
- <Specific result with exact metrics, benchmarks, accuracy numbers, or baseline comparisons from the paper>
- <Additional specific results...>

### CRITIQUE_STRENGTHS
- <Detailed specific technical strength, architectural advantage, or empirical breakthrough>

### CRITIQUE_WEAKNESSES
- <Specific limitation, unaddressed condition, missing evaluation, or assumption acknowledged in the paper>

### CRITIQUE_OPEN_QUESTIONS
- <Detailed open question or concrete direction for follow-up inquiry>

EXAMPLE (follow this format exactly):

Input: "We propose a lightweight convolutional network for classifying plant leaf diseases on mobile devices. Our model achieves 94.1% accuracy on the PlantVillage dataset with 1.2M parameters, 8x smaller than ResNet-50. All images were captured under controlled lighting; field performance was not evaluated."
Level: Beginner

### TITLE
Lightweight CNN for Mobile Plant Disease Classification

### ONE_LINE_SUMMARY
A small image-recognition model that spots leaf diseases accurately enough to run on a phone.

### PROBLEM
Accurate disease-detection models are too large to run on phones, so farmers can't use them in the field. The paper asks whether a much smaller model can stay accurate.

### METHOD
The authors design a small convolutional neural network (a model that learns to recognize patterns in images) and train it on PlantVillage, a dataset of labeled leaf photos.

### KEY_RESULTS
- 94.1% accuracy on PlantVillage.
- 1.2M parameters, 8x smaller than ResNet-50.
- Field performance: Not stated in the paper.

### CRITIQUE_STRENGTHS
- Small enough for real mobile deployment while keeping high accuracy.

### CRITIQUE_WEAKNESSES
- Tested only on controlled-lighting images; no field evaluation.

### CRITIQUE_OPEN_QUESTIONS
- How does it perform on real farm photos?
`;

// API Route: Analyze Paper with streaming response
app.post('/api/analyze', async (req, res) => {
  try {
    const { text, pdfBase64, level = 'Beginner' } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Gemini API key is not configured. Please add GEMINI_API_KEY in Settings > Secrets.',
      });
    }

    if (!text && !pdfBase64) {
      return res.status(400).json({
        error: 'Please provide paper text/abstract or upload a PDF document.',
      });
    }

    const selectedLevel = ['Beginner', 'Intermediate', 'Advanced'].includes(level)
      ? level
      : 'Beginner';

    const contents: any[] = [];

    if (pdfBase64) {
      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '').trim();
      contents.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: cleanBase64,
        },
      });
      contents.push({
        text: `Target Level: ${selectedLevel}\n\nPlease analyze this research paper according to your instructions. Provide detailed, specific information directly from the paper.`,
      });
    } else {
      if (text.trim().length < 40) {
        return res.status(400).json({
          error: 'The provided text is too short to be an academic paper or abstract. Please paste a more detailed section or abstract.',
        });
      }
      contents.push({
        text: `Target Level: ${selectedLevel}\n\nPaper content:\n"""\n${text.trim()}\n"""\n\nPlease analyze this research paper according to your instructions. Provide detailed, specific information directly from the paper.`,
      });
    }

    // Set Server-Sent Events streaming headers
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Try gemini-3.1-flash-lite first (separate daily quota), then fallback to gemini-flash-latest
    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let stream: any = null;
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const isGemini3 = model.startsWith('gemini-3') || model.startsWith('gemini-4');
        const config: any = {
          systemInstruction: SYSTEM_INSTRUCTION,
        };
        // For gemini-3.1-flash-lite, minimal thinking is supported; for 3.8-flash, LOW is supported
        if (model === 'gemini-3.1-flash-lite') {
          config.thinkingConfig = { thinkingLevel: ThinkingLevel.MINIMAL };
        } else if (isGemini3) {
          config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
        }

        stream = await ai.models.generateContentStream({
          model,
          contents,
          config,
        });
        if (stream) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`[PaperLens] Model ${model} stream init failed:`, err?.message || err);
      }
    }

    if (!stream) {
      throw lastError || new Error('All model stream attempts failed.');
    }

    for await (const chunk of stream) {
      const chunkText = chunk.text;
      if (chunkText) {
        res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('[PaperLens] Streaming error:', error);
    const msg = error?.message || 'An unexpected error occurred during paper analysis.';
    
    let userMsg = msg;
    if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
      userMsg = 'Free tier API quota limit reached. You can add a billing-enabled API key in Settings > Secrets to analyze papers with higher limits, or wait a short while for the quota to reset.';
    } else if (msg.includes('API_KEY_INVALID') || msg.includes('PERMISSION_DENIED')) {
      userMsg = 'Invalid Gemini API key. Please check your API key in Settings > Secrets.';
    }

    if (!res.headersSent) {
      return res.status(500).json({ error: userMsg });
    }
    res.write(`data: ${JSON.stringify({ error: userMsg })}\n\n`);
    res.end();
  }
});

// Vite or Static files handling
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PaperLens server running on http://0.0.0.0:${PORT}`);
});
