import React from 'react';
import { AnalysisLevel } from '../types/paper';
import { Sparkles, Layers, Award } from 'lucide-react';

interface LevelSelectorProps {
  selectedLevel: AnalysisLevel;
  onChange: (level: AnalysisLevel) => void;
  disabled?: boolean;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  selectedLevel,
  onChange,
  disabled = false,
}) => {
  const levels: {
    id: AnalysisLevel;
    label: string;
    sublabel: string;
    desc: string;
    icon: React.ReactNode;
    colorClasses: string;
  }[] = [
    {
      id: 'Beginner',
      label: 'Beginner',
      sublabel: 'Intro Undergrad (1st–2nd Yr)',
      desc: 'Plain language analogies, zero jargon barriers, all terms defined immediately.',
      icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
      colorClasses: 'border-emerald-500 bg-emerald-50/30 text-emerald-950',
    },
    {
      id: 'Intermediate',
      label: 'Intermediate',
      sublabel: 'Upper Undergrad (3rd–4th Yr)',
      desc: 'Balanced technical rigor. Standard college science concepts assumed.',
      icon: <Layers className="w-4 h-4 text-indigo-600" />,
      colorClasses: 'border-indigo-500 bg-indigo-50/30 text-indigo-950',
    },
    {
      id: 'Advanced',
      label: 'Advanced',
      sublabel: 'Senior Thesis / Pre-Grad',
      desc: 'Rigorous terminology, exact mathematical frameworks & statistical nuances.',
      icon: <Award className="w-4 h-4 text-purple-600" />,
      colorClasses: 'border-purple-500 bg-purple-50/30 text-purple-950',
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Explanation Level
        </label>
        <span className="text-xs text-slate-500">
          Selected: <strong className="text-slate-800">{selectedLevel}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {levels.map((lvl) => {
          const isSelected = selectedLevel === lvl.id;
          return (
            <label
              key={lvl.id}
              className={`relative flex items-start p-3.5 rounded-xl border cursor-pointer transition-all ${
                disabled ? 'opacity-60 cursor-not-allowed' : ''
              } ${
                isSelected
                  ? `${lvl.colorClasses} ring-2 ring-indigo-500/20 shadow-xs`
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <input
                type="radio"
                name="explanation-level"
                value={lvl.id}
                checked={isSelected}
                onChange={() => !disabled && onChange(lvl.id)}
                disabled={disabled}
                className="mt-0.5 w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-sm font-semibold text-slate-900">{lvl.label}</span>
                  {lvl.icon}
                </div>
                <div className="text-[11px] font-medium text-slate-500 mb-1">{lvl.sublabel}</div>
                <p className="text-xs text-slate-600 leading-snug">{lvl.desc}</p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};
