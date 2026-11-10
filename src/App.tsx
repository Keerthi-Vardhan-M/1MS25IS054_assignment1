/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Search,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { AnalysisLevel, PaperAnalysisResult } from './types/paper';
import { InputArea } from './components/InputArea';
import { ResultsDisplay } from './components/ResultsDisplay';
import { parseStreamedSections } from './utils/streamParser';

export default function App() {
  const [analysisResult, setAnalysisResult] = useState<Partial<PaperAnalysisResult> | null>(null);
  const [currentLevel, setCurrentLevel] = useState<AnalysisLevel>('Beginner');
  const [currentSourceName, setCurrentSourceName] = useState<string>('');
  const [lastPayload, setLastPayload] = useState<{ text?: string; pdfBase64?: string } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [loadingStatusMessage, setLoadingStatusMessage] = useState('Connecting to Gemini Flash...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const executeAnalysis = async (
    payload: { text?: string; pdfBase64?: string },
    level: AnalysisLevel,
    sourceName?: string
  ) => {
    setIsLoading(true);
    setIsStreaming(true);
    setErrorMessage(null);
    setCurrentLevel(level);
    if (sourceName) setCurrentSourceName(sourceName);
    setLastPayload(payload);
    setLoadingStatusMessage('Streaming analysis with Gemini Flash...');

    // Initialize empty result so display transitions immediately
    setAnalysisResult({});

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: payload.text,
          pdfBase64: payload.pdfBase64,
          level,
        }),
      });

      if (!response.ok) {
        let errorMsg = `Server error (${response.status})`;
        try {
          const errData = await response.json();
          if (errData?.error) errorMsg = errData.error;
        } catch {
          // ignore
        }
        throw new Error(errorMsg);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Streaming response body is unavailable.');
      }

      const decoder = new TextDecoder();
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // keep incomplete tail in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;

          try {
            const json = JSON.parse(trimmed.slice(6));
            if (json.error) {
              throw new Error(json.error);
            }
            if (json.chunk) {
              accumulatedText += json.chunk;
              const parsed = parseStreamedSections(accumulatedText);
              setAnalysisResult({ ...parsed });
            }
          } catch (e: any) {
            if (e.message && !e.message.includes('JSON')) {
              throw e;
            }
          }
        }
      }

      // Final pass on full accumulated text
      if (accumulatedText) {
        const finalParsed = parseStreamedSections(accumulatedText);
        setAnalysisResult({ ...finalParsed });
      }
    } catch (err: any) {
      console.error('Streaming analysis error:', err);
      setErrorMessage(
        err.message || 'An unexpected error occurred while communicating with the analysis server.'
      );
      // Reset view to allow user to retry
      setAnalysisResult(null);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleAnalyze = (payload: {
    text?: string;
    pdfBase64?: string;
    level: AnalysisLevel;
    sourceName: string;
  }) => {
    executeAnalysis(
      { text: payload.text, pdfBase64: payload.pdfBase64 },
      payload.level,
      payload.sourceName
    );
  };

  const handleLevelChange = async (newLevel: AnalysisLevel) => {
    if (!lastPayload) return;
    setIsReanalyzing(true);
    await executeAnalysis(lastPayload, newLevel);
    setIsReanalyzing(false);
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setErrorMessage(null);
    setLastPayload(null);
  };

  const hasContent = Boolean(
    analysisResult &&
      (analysisResult.title ||
        analysisResult.problem ||
        analysisResult.method ||
        isStreaming)
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs backdrop-blur-md bg-white/95">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset}>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shadow-indigo-600/30">
              <Search className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                  PaperLens
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 uppercase tracking-wider">
                  Flash Stream
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Streaming research paper agent for undergraduate students
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Strict Grounding • Zero Inventions
            </span>
            {hasContent && (
              <button
                type="button"
                onClick={handleReset}
                className="text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1"
              >
                + New Analysis
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {!hasContent ? (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero / Intro Banner */}
            <div className="text-center max-w-2xl mx-auto pt-2 pb-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Demystifying Academic Literature in Real-Time</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Understand Research Papers <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 bg-clip-text text-transparent">
                  With Live Streaming Explanations
                </span>
              </h2>
              <p className="text-slate-600 mt-3 text-sm sm:text-base leading-relaxed">
                Upload any academic PDF or paste an abstract. Powered by Gemini Flash with minimal thinking:
                watch each section appear live with deep, detailed analysis of the problem, method, results, and scientific critique.
              </p>
            </div>

            {/* Input Area Card */}
            <InputArea
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              loadingStatusMessage={loadingStatusMessage}
              errorMessage={errorMessage}
              onClearError={() => setErrorMessage(null)}
            />

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <Zap className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900 mb-1">Instant Streaming</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Sections render in real time the moment they are generated. Zero delay and minimal thinking overhead.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900 mb-1">Detailed & In-Depth</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  No artificial sentence limits. Provides thorough, concrete coverage of the problem, experimental setup, and mechanisms.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900 mb-1">Critical Evaluation</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Uncovers key strengths, admitted limitations, unaddressed conditions, and open questions directly from the paper.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <ResultsDisplay
            result={analysisResult || {}}
            level={currentLevel}
            sourceName={currentSourceName}
            isStreaming={isStreaming}
            onReset={handleReset}
            onChangeLevel={handleLevelChange}
            isReanalyzing={isReanalyzing}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">PaperLens</span>
            <span>•</span>
            <span>Streaming research assistant for undergraduate students</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Gemini Flash</span>
            <span>•</span>
            <span>Live Section Streaming</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
