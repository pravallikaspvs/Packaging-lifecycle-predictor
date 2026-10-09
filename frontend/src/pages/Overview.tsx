import React, { useEffect, useState } from 'react';
import {
  Package,
  Recycle,
  Search,
  AlertCircle,
  Leaf,
  ScanSearch,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { OverviewStats, NavView } from '../types';
import { fetchOverviewStats } from '../api';
import { MetricCard } from '../components/MetricCard';

interface OverviewProps {
  onNavigate: (view: NavView, filter?: string) => void;
}

export const Overview: React.FC<OverviewProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewStats()
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load stats', err);
        setLoading(false);
      });
  }, []);

  const summary = stats?.summary || {
    total_packages: 1248,
    suitable_for_reuse: 842,
    needs_inspection: 126,
    sent_for_recycling: 184,
    recovery_pending: 96,
    waste_diverted_kg: 312,
  };

  const lifecycleData = stats?.lifecycle_distribution || [
    { name: 'Reuse Candidate', value: 842, color: '#10B981' },
    { name: 'Needs Inspection', value: 126, color: '#F59E0B' },
    { name: 'Recycling', value: 184, color: '#166534' },
    { name: 'Recovery Pending', value: 96, color: '#94A3B8' },
  ];

  const monthlyOutcomes = stats?.monthly_outcomes || [
    { month: 'May', inspected: 164, reused: 112, recycled: 28 },
    { month: 'Jun', inspected: 188, reused: 130, recycled: 32 },
    { month: 'Jul', inspected: 210, reused: 145, recycled: 35 },
    { month: 'Aug', inspected: 225, reused: 158, recycled: 39 },
    { month: 'Sep', inspected: 236, reused: 162, recycled: 41 },
    { month: 'Oct', inspected: 225, reused: 135, recycled: 45 },
  ];

  const materialDistribution = stats?.material_distribution || [
    { material: 'PET (1)', count: 486, percentage: 39, color: '#10B981' },
    { material: 'HDPE (2)', count: 342, percentage: 27, color: '#14532D' },
    { material: 'PP (5)', count: 218, percentage: 18, color: '#166534' },
    { material: 'LDPE (4)', count: 96, percentage: 8, color: '#059669' },
    { material: 'Other (7)', count: 64, percentage: 5, color: '#64748B' },
    { material: 'Unknown', count: 42, percentage: 3, color: '#F59E0B' },
  ];

  const recoveryProgress = stats?.recovery_progress || [
    { label: 'Packages awaiting inspection', count: 126, total: 1248, pct: 10.1, color: '#F59E0B' },
    { label: 'Packages awaiting recovery', count: 96, total: 1248, pct: 7.7, color: '#64748B' },
    { label: 'Packages with recorded recycling', count: 184, total: 1248, pct: 14.7, color: '#10B981' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* 1. Welcome Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#14532D] via-[#166534] to-[#0f3d21] rounded-[20px] p-6 sm:p-8 text-white shadow-card">
        {/* Subtle decorative leaf pattern in background */}
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <Leaf className="w-80 h-80 -rotate-12 translate-x-12 translate-y-6 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>AI-Assisted Packaging Lifecycle Management</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight">
            Plastic Packaging Intelligence
          </h2>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed mb-6 font-normal">
            Inspect, track, reuse, and recover plastic packaging responsibly. Make transparent decisions grounded in physical surface integrity and polymer circularity.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('inspect')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#14532D] hover:bg-emerald-50 font-bold text-sm shadow-md transition-all active:scale-98"
            >
              <ScanSearch className="w-4 h-4 text-[#14532D]" />
              <span>Inspect Packaging</span>
            </button>

            <button
              onClick={() => onNavigate('recovery')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600/40 hover:bg-emerald-600/60 border border-emerald-400/30 text-white font-semibold text-sm transition-all active:scale-98"
            >
              <Recycle className="w-4 h-4 text-emerald-200" />
              <span>View Recovery Advisor</span>
            </button>
          </div>
        </div>
      </section>

      {/* Demonstration Data Banner */}
      <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Demonstration Benchmark Data: </span>
          All initial statistics and trends reflect standardized sample records to demonstrate platform operations. Real inspection inputs dynamically integrate into your inventory.
        </div>
      </div>

      {/* 2. Six Interactive Summary Metric Cards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#17251D]">Lifecycle Summary Metrics</h3>
            <p className="text-xs text-[#64748B]">Click any card to inspect corresponding inventory records</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <MetricCard
            title="Total Packages"
            value={summary.total_packages.toLocaleString()}
            description="Registered packaging items"
            icon={Package}
            iconBg="bg-emerald-100"
            iconColor="text-[#14532D]"
            onClick={() => onNavigate('inventory', 'All Packages')}
          />

          <MetricCard
            title="Suitable for Reuse"
            value={summary.suitable_for_reuse.toLocaleString()}
            description="Requires suitability checks before reuse"
            icon={Recycle}
            iconBg="bg-[#D1FAE5]"
            iconColor="text-emerald-700"
            badgeText="Eligible"
            onClick={() => onNavigate('inventory', 'Reuse Candidates')}
          />

          <MetricCard
            title="Needs Inspection"
            value={summary.needs_inspection.toLocaleString()}
            description="Requires further assessment"
            icon={Search}
            iconBg="bg-amber-100"
            iconColor="text-amber-800"
            badgeText="Attention"
            onClick={() => onNavigate('inventory', 'Needs Inspection')}
          />

          <MetricCard
            title="Sent for Recycling"
            value={summary.sent_for_recycling.toLocaleString()}
            description="Recorded recycling outcomes"
            icon={Recycle}
            iconBg="bg-emerald-100"
            iconColor="text-[#166534]"
            onClick={() => onNavigate('inventory', 'Recycling Assessment')}
          />

          <MetricCard
            title="Recovery Pending"
            value={summary.recovery_pending.toLocaleString()}
            description="Awaiting a recovery decision"
            icon={AlertCircle}
            iconBg="bg-slate-100"
            iconColor="text-slate-700"
            onClick={() => onNavigate('recovery')}
          />

          <MetricCard
            title="Waste Diverted"
            value={`${summary.waste_diverted_kg} kg`}
            description="Illustrative demo data"
            icon={Leaf}
            iconBg="bg-emerald-100"
            iconColor="text-[#14532D]"
            onClick={() => onNavigate('impact')}
          />
        </div>
      </section>

      {/* 3. Environmental Analytics Charts Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#17251D]">Packaging Analytics & Circulation</h3>
            <p className="text-xs text-[#64748B]">Real-time evaluation charts (demonstration baseline data)</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            6-Month Aggregate
          </span>
        </div>

        {/* Charts Row 1: Donut & Bar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 1: Donut Chart - Packaging Lifecycle Distribution */}
          <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-[16px] p-5 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-bold text-[#17251D]">Packaging Lifecycle Distribution</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">Sample Demo</span>
              </div>
              <p className="text-xs text-[#64748B] mb-4">Relative proportion across circular pathways</p>
            </div>

            <div className="h-64 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={lifecycleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {lifecycleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${Number(value).toLocaleString()} packages`, 'Volume']}
                    contentStyle={{ borderRadius: '10px', fontSize: '12px', border: '1px solid #E2E8F0' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-center text-xs">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900">
                <div className="font-bold text-sm">67.5%</div>
                <div className="text-[11px] text-emerald-700">Reuse Candidate Rate</div>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-900">
                <div className="font-bold text-sm">10.1%</div>
                <div className="text-[11px] text-amber-700">Pending Technical Audit</div>
              </div>
            </div>
          </div>

          {/* Chart 2: Monthly Packaging Outcomes */}
          <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-[16px] p-5 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-bold text-[#17251D]">Monthly Packaging Outcomes</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">6 Months Demo</span>
              </div>
              <p className="text-xs text-[#64748B] mb-4">Inspection volume vs. reuse & recycling transitions</p>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyOutcomes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', fontSize: '12px', border: '1px solid #E2E8F0' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="inspected" name="Inspected" fill="#14532D" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="reused" name="Reused" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="recycled" name="Sent for Recycling" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                Consistent +12% inspection throughput observed
              </span>
              <span className="text-slate-400">Audited monthly</span>
            </div>
          </div>
        </div>

        {/* Charts Row 2: Material Distribution & Recovery Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 3: Material Distribution (Horizontal Bars) */}
          <div className="lg:col-span-6 bg-white border border-[#E2E8F0] rounded-[16px] p-5 shadow-subtle">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-bold text-[#17251D]">Material Distribution</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">SPI Resin Codes</span>
            </div>
            <p className="text-xs text-[#64748B] mb-4">Polymer resin composition across registered inventory</p>

            <div className="space-y-3">
              {materialDistribution.map((item) => (
                <div key={item.material} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-700">{item.material}</span>
                    <span className="text-slate-500 font-medium">
                      {item.count} items ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">PET & HDPE account for 66% of tracked volume</span>
              <button
                onClick={() => onNavigate('recycling-guide')}
                className="text-[#14532D] hover:underline font-semibold flex items-center gap-1"
              >
                <span>Resin Guide</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Chart 4: Recovery Progress */}
          <div className="lg:col-span-6 bg-white border border-[#E2E8F0] rounded-[16px] p-5 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-bold text-[#17251D]">Recovery Progress & Pipeline</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Target: 100% Diversion
                </span>
              </div>
              <p className="text-xs text-[#64748B] mb-4">Tracking packaging across verification milestones</p>

              <div className="space-y-4">
                {recoveryProgress.map((item) => (
                  <div key={item.label} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-800">{item.label}</span>
                      <span className="font-bold text-slate-700">
                        {item.count} / {item.total} ({item.pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Requires local facility verification before recycling claim</span>
              <button
                onClick={() => onNavigate('recovery')}
                className="text-[#166534] hover:text-[#14532D] font-bold flex items-center gap-1"
              >
                <span>Launch Advisor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Quick Action Callout */}
      <section className="bg-white border border-[#E2E8F0] rounded-[16px] p-5 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-left">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#14532D] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#17251D]">Ready to Inspect an Incoming Batch?</h4>
            <p className="text-xs text-[#64748B]">
              Upload packaging photographs or log manual technical checks to update lifecycle passports.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('inspect')}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#14532D] hover:bg-[#166534] text-white font-semibold text-xs sm:text-sm shrink-0 transition-all shadow-xs"
        >
          Begin New Inspection
        </button>
      </section>
    </div>
  );
};
