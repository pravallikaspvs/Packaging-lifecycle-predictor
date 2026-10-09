import React from 'react';
import { CheckCircle2, AlertTriangle, Wrench, RefreshCw, AlertOctagon, Info } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showIcon = true }) => {
  const normalized = (status || '').toUpperCase().trim();

  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let icon = <Info className="w-3.5 h-3.5" />;

  if (normalized.includes('REUSE') || normalized.includes('ACTIVE CIRCULATION') || normalized.includes('INTACT')) {
    bg = 'bg-[#D1FAE5] text-[#14532D] border-[#10B981]/30 font-medium';
    icon = <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />;
  } else if (normalized.includes('FURTHER') || normalized.includes('NEEDS INSPECTION') || normalized.includes('PENDING ASSESSMENT')) {
    bg = 'bg-amber-50 text-amber-900 border-amber-300 font-medium';
    icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
  } else if (normalized.includes('REPAIR')) {
    bg = 'bg-blue-50 text-blue-900 border-blue-200 font-medium';
    icon = <Wrench className="w-3.5 h-3.5 text-blue-600" />;
  } else if (normalized.includes('RECYCL')) {
    bg = 'bg-emerald-50 text-emerald-900 border-emerald-300 font-medium';
    icon = <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />;
  } else if (normalized.includes('SPECIALIST') || normalized.includes('HAZARDOUS') || normalized.includes('DAMAGED')) {
    bg = 'bg-red-50 text-red-900 border-red-200 font-medium';
    icon = <AlertOctagon className="w-3.5 h-3.5 text-red-600" />;
  } else if (normalized.includes('RECOVERY PENDING')) {
    bg = 'bg-purple-50 text-purple-900 border-purple-200 font-medium';
    icon = <AlertTriangle className="w-3.5 h-3.5 text-purple-600" />;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs tracking-tight ${bg} ${sizeClasses[size]}`}
    >
      {showIcon && icon}
      <span>{status}</span>
    </span>
  );
};

export const DemoDataBadge: React.FC = () => (
  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-amber-100 text-amber-800 border border-amber-200">
    Demo Data
  </span>
);
