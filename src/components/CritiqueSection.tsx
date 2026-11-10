import React from 'react';
import { Scale, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { Critique } from '../types/paper';
import { ResultCard } from './ResultCard';

interface CritiqueSectionProps {
  critique: Critique;
}

export const CritiqueSection: React.FC<CritiqueSectionProps> = ({ critique }) => {
  const formattedForCopy = `### Paper Critique
  
STRENGTHS:
${(critique.strengths || []).map((s) => `• ${s}`).join('\n')}

LIMITATIONS & WEAKNESSES:
${(critique.weaknesses || []).map((w) => `• ${w}`).join('\n')}

OPEN QUESTIONS:
${(critique.open_questions || []).map((q) => `• ${q}`).join('\n')}`;

  return (
    <ResultCard
      icon={<Scale className="w-4 h-4" />}
      iconBgClass="bg-purple-50"
      iconColorClass="text-purple-600"
      title="Critical Evaluation & Discussion"
      subtitle="Balanced scientific assessment of claims, limits, and open avenues"
      copyText={formattedForCopy}
      copyLabel="Copy Critique"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Strengths */}
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
              Key Strengths
            </h4>
          </div>
          {critique.strengths && critique.strengths.length > 0 ? (
            <ul className="space-y-2">
              {critique.strengths.map((str, i) => (
                <li key={i} className="text-xs text-slate-700 leading-relaxed flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400 italic">None noted in the text.</p>
          )}
        </div>

        {/* Weaknesses & Limitations */}
        <div className="rounded-xl border border-amber-100 bg-amber-50/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
              Limitations & Gaps
            </h4>
          </div>
          {critique.weaknesses && critique.weaknesses.length > 0 ? (
            <ul className="space-y-2">
              {critique.weaknesses.map((w, i) => (
                <li key={i} className="text-xs text-slate-700 leading-relaxed flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400 italic">Not stated in the paper.</p>
          )}
        </div>

        {/* Open Questions */}
        <div className="rounded-xl border border-sky-100 bg-sky-50/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <HelpCircle className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wide">
              Open Questions
            </h4>
          </div>
          {critique.open_questions && critique.open_questions.length > 0 ? (
            <ul className="space-y-2">
              {critique.open_questions.map((q, i) => (
                <li key={i} className="text-xs text-slate-700 leading-relaxed flex items-start gap-2">
                  <span className="text-sky-500 font-bold">•</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400 italic">No open questions extracted.</p>
          )}
        </div>
      </div>
    </ResultCard>
  );
};
