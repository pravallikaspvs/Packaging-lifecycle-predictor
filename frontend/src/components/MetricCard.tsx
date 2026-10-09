import React from 'react';
import { LucideIcon, ArrowUpRight } from 'lucide-react';
import { DemoDataBadge } from './StatusBadge';

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  isDemo?: boolean;
  onClick?: () => void;
  badgeText?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  iconBg = 'bg-[#D1FAE5]',
  iconColor = 'text-[#14532D]',
  isDemo = true,
  onClick,
  badgeText,
}) => {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`stat-card relative bg-white border border-[#E2E8F0] rounded-[16px] p-5 shadow-subtle hover:border-emerald-300 hover:shadow-card-hover text-left flex flex-col justify-between transition-all group ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {badgeText && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              {badgeText}
            </span>
          )}
          {isDemo && <DemoDataBadge />}
          {onClick && (
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors opacity-0 group-hover:opacity-100" />
          )}
        </div>
      </div>

      <div>
        <div className="text-2xl md:text-3xl font-bold tracking-tight text-[#17251D] mb-1">
          {value}
        </div>
        <div className="text-sm font-semibold text-slate-700 mb-1">
          {title}
        </div>
        <div className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
          {description}
        </div>
      </div>
    </div>
  );
};
