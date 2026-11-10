# PaperLens: Research Paper Agent

A research paper agent built in Google AI Studio (Build tab) that helps undergraduate students understand academic papers.

## What it does
Paste a paper's text or abstract, or upload a PDF, pick a level (Beginner / Intermediate / Advanced), and PaperLens returns:
- One-line summary
- Problem statement
- Method explanation
- Key results with specific metrics
- Critique: strengths, weaknesses, and open questions

Results stream in section by section and each card has a copy button. Non-paper input is rejected with an error message.

## Prompting approach
Few-shot prompting. The system prompt includes a worked example (input, level, and full output) so the model copies the exact section format. It also sets strict rules: use only information from the paper, write "Not stated in the paper" when something is missing, and never fabricate numbers.

The system prompt is in `system_prompt.txt` and in `server.ts`.

## Tech stack
- Frontend: React + Vite + Tailwind
- Backend: Node.js + Express (the Gemini API key stays server-side)
- Model: Gemini Flash-Lite with minimal thinking, falling back to Flash
- Streaming responses via Server-Sent Events

## Iteration notes
- v1 asked for nine sections including a Mermaid diagram, glossary, and reading guide in one JSON response. It was slow and the output was shallow.
- v2 removed the diagram, glossary, and reading guide, switched to a lighter model, added streaming, and removed length caps so the content is more specific.

## Run locally
1. `npm install`
2. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY`
3. `npm run dev`

## Notes
Built with Google AI Studio's free tier, which has rate limits. If you see a quota message, wait a minute and retry with a short abstract.
