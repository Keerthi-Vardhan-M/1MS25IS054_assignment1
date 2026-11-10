import React from 'react';
import {
  Target,
  FlaskConical,
  CheckCircle,
  RotateCcw,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { PaperAnalysisResult, AnalysisLevel } from '../types/paper';
import { ResultCard } from './ResultCard';
import { CritiqueSection } from './CritiqueSection';
import { CopyButton } from './CopyButton';

interface ResultsDisplayProps {
  result: Partial<PaperAnalysisResult>;
  level: AnalysisLevel;
  sourceName?: string;
  isStreaming?: boolean;
  onReset: () => void;
  onChangeLevel: (newLevel: AnalysisLevel) => void;
  isReanalyzing?: boolean;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  result,
  level,
  sourceName,
  isStreaming = false,
  onReset,
  onChangeLevel,
  isReanalyzing,
}) => {
  // Format markdown for one-click copy
  const fullMarkdown = `# ${result.title || 'Research Paper Analysis'}
*Level: ${level}*

> **One-Line Summary:** ${result.one_line_summary || ''}

---

## 1. The Research Problem
${result.problem || ''}

## 2. Methodology & Approach
${result.method || ''}

## 3. Key Results & Evidence
${(result.key_results || []).map((r) => `- ${r}`).join('\n')}

## 4. Critical Evaluation
### Strengths
${(result.critique?.strengths || []).map((s) => `- ${s}`).join('\n')}

### Limitations & Weaknesses
${(result.critique?.weaknesses || []).map((w) => `- ${w}`).join('\n')}

### Open Questions
${(result.critique?.open_questions || []).map((q) => `- ${q}`).join('\n')}

---
*Analyzed with PaperLens*`;

  const levelBadgeColors: Record<AnalysisLevel, string> = {
    Beginner: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Intermediate: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    Advanced: 'bg-purple-100 text-purple-800 border-purple-200',
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Analyze New Paper</span>
          </button>
          {sourceName && (
            <span className="text-xs text-slate-400 hidden sm:inline truncate max-w-xs">
              Source: <strong className="text-slate-600 font-medium">{sourceName}</strong>
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Level Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/60 text-xs font-medium">
            <span className="text-[11px] text-slate-400 px-1.5">Level:</span>
            {(['Beginner', 'Intermediate', 'Advanced'] as AnalysisLevel[]).map((lvl) => (
              <button
                key={lvl}
                type="button"
                disabled={isReanalyzing || isStreaming || lvl === level}
                onClick={() => onChangeLevel(lvl)}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  lvl === level
                    ? 'bg-white text-indigo-700 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                } ${isReanalyzing || isStreaming ? 'opacity-50 cursor-wait' : ''}`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <CopyButton
            textToCopy={fullMarkdown}
            label="Copy Complete Report"
            className="bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
          />
        </div>
      </div>

      {/* 1. Overview Card */}
      {(result.title || isStreaming) && (
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${levelBadgeColors[level]}`}>
                  {level} Level Explanation
                </span>
                {isStreaming ? (
                  <span className="text-xs text-amber-300 flex items-center gap-1.5 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Streaming sections live...
                  </span>
                ) : (
                  <span className="text-xs text-indigo-200/70 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    Verified Grounded Extraction
                  </span>
                )}
              </div>

              {result.title && (
                <CopyButton
                  textToCopy={`${result.title}\n\n${result.one_line_summary || ''}`}
                  label="Copy Title & Summary"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                />
              )}
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-3 leading-snug">
              {result.title || (
                <span className="text-indigo-300/60 inline-flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Reading paper title...
                </span>
              )}
            </h2>

            {result.one_line_summary && (
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
                <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1">
                  One-Line Summary
                </p>
                <p className="text-base font-medium text-indigo-50 leading-relaxed">
                  "{result.one_line_summary}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Research Problem Card */}
      {result.problem && (
        <ResultCard
          icon={<Target className="w-4 h-4" />}
          iconBgClass="bg-rose-50"
          iconColorClass="text-rose-600"
          title="The Research Problem"
          subtitle="Specific research question, domain motivation, and limitations of existing work"
          copyText={result.problem}
          copyLabel="Copy Problem"
        >
          <div className="text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line">
            {result.problem}
          </div>
        </ResultCard>
      )}

      {/* 3. Method & Approach Card */}
      {result.method && (
        <ResultCard
          icon={<FlaskConical className="w-4 h-4" />}
          iconBgClass="bg-blue-50"
          iconColorClass="text-blue-600"
          title="Methodology & Approach"
          subtitle="Detailed, concrete explanation of the proposed system, algorithm, and experimental setup"
          copyText={result.method}
          copyLabel="Copy Method"
        >
          <div className="text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line">
            {result.method}
          </div>
        </ResultCard>
      )}

      {/* 4. Key Results Card */}
      {result.key_results && result.key_results.length > 0 && (
        <ResultCard
          icon={<CheckCircle className="w-4 h-4" />}
          iconBgClass="bg-emerald-50"
          iconColorClass="text-emerald-600"
          title="Key Results & Evidence"
          subtitle="Exact quantitative findings, benchmark metrics, and experimental evidence"
          copyText={result.key_results.map((r) => `• ${r}`).join('\n')}
          copyLabel="Copy Results"
        >
          <div className="space-y-2.5">
            {result.key_results.map((resItem, idx) => {
              const isNotStated = resItem.toLowerCase().includes('not stated in the paper');
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border flex items-start gap-3 transition-colors ${
                    isNotStated
                      ? 'border-amber-200/80 bg-amber-50/30'
                      : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1 text-sm text-slate-800 leading-relaxed">
                    {resItem}
                  </div>
                </div>
              );
            })}
          </div>
        </ResultCard>
      )}

      {/* 5. Critique Card */}
      {result.critique &&
        ((result.critique.strengths && result.critique.strengths.length > 0) ||
          (result.critique.weaknesses && result.critique.weaknesses.length > 0) ||
          (result.critique.open_questions && result.critique.open_questions.length > 0)) && (
          <CritiqueSection critique={result.critique} />
        )}
    </div>
  );
};
