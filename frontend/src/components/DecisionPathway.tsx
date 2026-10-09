import React from 'react';
import { Search, RefreshCw, Wrench, Recycle, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface Step {
  step: number;
  title: string;
  status: 'completed' | 'current' | 'pending';
  desc: string;
}

interface DecisionPathwayProps {
  steps?: Step[];
  activeStep?: number;
}

export const DecisionPathway: React.FC<DecisionPathwayProps> = ({ steps, activeStep }) => {
  const defaultSteps: Step[] = [
    { step: 1, title: 'Assess', status: 'completed', desc: 'Optical & technical evaluation' },
    { step: 2, title: 'Reuse', status: 'pending', desc: 'Clean, sanitize & recirculate' },
    { step: 3, title: 'Repair', status: 'pending', desc: 'Seal/closure reconditioning' },
    { step: 4, title: 'Recycle', status: 'pending', desc: 'Mechanical polymer recovery' },
    { step: 5, title: 'Authorized Recovery', status: 'pending', desc: 'Certified hazardous / specialized' },
  ];

  const currentSteps = steps && steps.length > 0 ? steps : defaultSteps;

  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('assess')) return <Search className="w-4 h-4" />;
    if (t.includes('reuse')) return <RefreshCw className="w-4 h-4" />;
    if (t.includes('repair')) return <Wrench className="w-4 h-4" />;
    if (t.includes('recycle')) return <Recycle className="w-4 h-4" />;
    return <ShieldCheck className="w-4 h-4" />;
  };

  return (
    <div className="w-full bg-white border border-[#E2E8F0] rounded-[16px] p-5 shadow-subtle">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#14532D]">
            Circular Decision Hierarchy
          </h4>
          <p className="text-xs text-[#64748B]">
            Eco-First prioritization: maximum life extension before material reprocessing
          </p>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#D1FAE5] text-[#14532D] border border-emerald-300">
          5-Stage Protocol
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {currentSteps.map((s, index) => {
          const isCurrent = activeStep ? activeStep === s.step : s.status === 'current';
          const isCompleted = activeStep ? activeStep > s.step : s.status === 'completed';

          let stateStyle = 'bg-slate-50 border-slate-200 text-slate-500';
          let iconStyle = 'bg-slate-200 text-slate-600';
          let badgeText = 'Pending';
          let badgeStyle = 'bg-slate-100 text-slate-500';

          if (isCurrent) {
            stateStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400/40 shadow-sm';
            iconStyle = 'bg-[#14532D] text-white';
            badgeText = 'Recommended Next Step';
            badgeStyle = 'bg-[#10B981] text-white font-semibold';
          } else if (isCompleted) {
            stateStyle = 'bg-emerald-50/50 border-emerald-200 text-[#14532D]';
            iconStyle = 'bg-emerald-100 text-emerald-700';
            badgeText = 'Evaluated';
            badgeStyle = 'bg-emerald-100 text-emerald-800';
          }

          return (
            <div
              key={s.step}
              className={`relative flex flex-col p-3.5 rounded-xl border transition-all ${stateStyle}`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconStyle}`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : getIcon(s.title)}
                </div>
                <span className="text-[11px] font-bold text-slate-400">0{s.step}</span>
              </div>

              <div className="text-sm font-bold tracking-tight mb-1">
                {s.title}
              </div>
              <p className="text-[11px] text-slate-600 leading-tight mb-2.5 flex-1">
                {s.desc}
              </p>

              <div>
                <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full ${badgeStyle}`}>
                  {badgeText}
                </span>
              </div>

              {index < currentSteps.length - 1 && (
                <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
