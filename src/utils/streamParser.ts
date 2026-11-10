import { PaperAnalysisResult } from '../types/paper';

export function parseStreamedSections(text: string): Partial<PaperAnalysisResult> {
  const result: Partial<PaperAnalysisResult> = {};

  const markers = [
    '### TITLE',
    '### ONE_LINE_SUMMARY',
    '### PROBLEM',
    '### METHOD',
    '### KEY_RESULTS',
    '### CRITIQUE_STRENGTHS',
    '### CRITIQUE_WEAKNESSES',
    '### CRITIQUE_OPEN_QUESTIONS',
  ];

  const getSection = (startMarker: string, endMarkers: string[]) => {
    const startIndex = text.indexOf(startMarker);
    if (startIndex === -1) return '';
    const contentStart = startIndex + startMarker.length;
    let endIndex = text.length;

    for (const em of endMarkers) {
      const idx = text.indexOf(em, contentStart);
      if (idx !== -1 && idx < endIndex) {
        endIndex = idx;
      }
    }

    return text.substring(contentStart, endIndex).trim();
  };

  // Extract sections
  const title = getSection('### TITLE', markers.slice(1));
  if (title) result.title = title;

  const summary = getSection('### ONE_LINE_SUMMARY', markers.slice(2));
  if (summary) result.one_line_summary = summary;

  const problem = getSection('### PROBLEM', markers.slice(3));
  if (problem) result.problem = problem;

  const method = getSection('### METHOD', markers.slice(4));
  if (method) result.method = method;

  const rawResults = getSection('### KEY_RESULTS', markers.slice(5));
  if (rawResults) {
    result.key_results = rawResults
      .split('\n')
      .map((l) => l.replace(/^[-*•\d.]+\s*/, '').trim())
      .filter((l) => l.length > 0);
  }

  const rawStrengths = getSection('### CRITIQUE_STRENGTHS', markers.slice(6));
  const rawWeaknesses = getSection('### CRITIQUE_WEAKNESSES', markers.slice(7));
  const rawQuestions = getSection('### CRITIQUE_OPEN_QUESTIONS', []);

  if (rawStrengths || rawWeaknesses || rawQuestions) {
    result.critique = {
      strengths: rawStrengths
        ? rawStrengths
            .split('\n')
            .map((l) => l.replace(/^[-*•\d.]+\s*/, '').trim())
            .filter((l) => l.length > 0)
        : [],
      weaknesses: rawWeaknesses
        ? rawWeaknesses
            .split('\n')
            .map((l) => l.replace(/^[-*•\d.]+\s*/, '').trim())
            .filter((l) => l.length > 0)
        : [],
      open_questions: rawQuestions
        ? rawQuestions
            .split('\n')
            .map((l) => l.replace(/^[-*•\d.]+\s*/, '').trim())
            .filter((l) => l.length > 0)
        : [],
    };
  }

  return result;
}
