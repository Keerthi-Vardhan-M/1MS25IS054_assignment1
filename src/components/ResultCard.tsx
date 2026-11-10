import React from 'react';
import { CopyButton } from './CopyButton';

interface ResultCardProps {
  icon: React.ReactNode;
  iconBgClass?: string;
  iconColorClass?: string;
  title: string;
  subtitle?: string;
  copyText: string;
  copyLabel?: string;
  children: React.ReactNode;
  className?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  icon,
  iconBgClass = 'bg-blue-50',
  iconColorClass = 'text-blue-600',
  title,
  subtitle,
  copyText,
  copyLabel = 'Copy',
  children,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden transition-all hover:shadow-sm ${className}`}
    >
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-lg ${iconBgClass} ${iconColorClass} flex items-center justify-center shrink-0`}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-900 truncate">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
          </div>
        </div>

        <div className="shrink-0">
          <CopyButton textToCopy={copyText} label={copyLabel} />
        </div>
      </div>

      <div className="p-5">{children}</div>
    </div>
  );
};
