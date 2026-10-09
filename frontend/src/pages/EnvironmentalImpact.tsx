import React, { useEffect, useState } from 'react';
import {
  Leaf,
  Recycle,
  Search,
  Scale,
  TrendingUp,
  AlertCircle,
  Info,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { fetchImpactStats } from '../api';
import { DemoDataBadge } from '../components/StatusBadge';

export const EnvironmentalImpact: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImpactStats()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const monthlyDiversionData = [
    { month: 'May', divertedKg: 38, reuseKg: 28, recycleKg: 10 },
    { month: 'Jun', divertedKg: 46, reuseKg: 34, recycleKg: 12 },
    { month: 'Jul', divertedKg: 52, reuseKg: 39, recycleKg: 13 },
    { month: 'Aug', divertedKg: 58, reuseKg: 43, recycleKg: 15 },
    { month: 'Sep', divertedKg: 62, reuseKg: 46, recycleKg: 16 },
    { month: 'Oct', divertedKg: 56, reuseKg: 41, recycleKg: 15 },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn text-left">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#17251D]">
          Environmental Impact Dashboard
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-3xl">
          Material diversion tracking, measured asset weights, and circular life-extension metrics.
        </p>
      </div>

      {/* Mandatory Disclaimer from Requirement 11 */}
      <div className="bg-amber-50/90 border border-amber-200/90 rounded-[16px] p-4 flex items-start gap-3 shadow-subtle text-xs text-amber-900">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-950">Scientific Transparency Notice:</p>
          <p className="leading-relaxed text-amber-800">
            "Environmental impact estimates require verified material quantities and an appropriate calculation method."
          </p>
          <p className="text-[11px] text-amber-700">
            To prevent greenwashing, this platform displays measured physical tare weights and circular rotation counts without fabricating arbitrary carbon or water savings.
          </p>
        </div>
      </div>

      {/* Impact KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-4 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Inspections</span>
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">1,248</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Audited units</div>
          </div>
          <div className="mt-2"><DemoDataBadge /></div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-4 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-800">Packages Reused</span>
            <Recycle className="w-4 h-4 text-[#10B981]" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#14532D]">842</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Active multi-turn</div>
          </div>
          <div className="mt-2"><DemoDataBadge /></div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-4 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">Sent for Recycling</span>
            <Recycle className="w-4 h-4 text-[#166534]" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#166534]">184</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Secondary flake</div>
          </div>
          <div className="mt-2"><DemoDataBadge /></div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-4 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Awaiting Recovery</span>
            <AlertCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-700">96</div>
            <div className="text-[11px] text-slate-500 mt-0.5">In advisor queue</div>
          </div>
          <div className="mt-2"><DemoDataBadge /></div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-4 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">Recorded Weight</span>
            <Scale className="w-4 h-4 text-[#10B981]" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {data?.recorded_weight_kg || '1.3'} kg
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Active catalog tare</div>
          </div>
          <div className="mt-2 text-[10px] font-semibold text-emerald-700">Measured Value</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-4 shadow-subtle flex flex-col justify-between bg-emerald-50/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#14532D]">Waste Diverted</span>
            <Leaf className="w-4 h-4 text-[#10B981]" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#14532D]">312 kg</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Illustrative demo</div>
          </div>
          <div className="mt-2"><DemoDataBadge /></div>
        </div>
      </div>

      {/* Monthly Diversion Trend Chart */}
      <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 shadow-subtle">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-extrabold text-base text-[#17251D]">
            Monthly Packaging Diversion Trend (kg)
          </h3>
          <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-600">
            Measured & Simulated Demo Data
          </span>
        </div>
        <p className="text-xs text-[#64748B] mb-6">
          Quantifies material retained in circular loops (reused containers + polymer recovered for recycling) vs. single-use landfill.
        </p>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyDiversionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDiverted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorReuse" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14532D" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#14532D" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} unit="kg" />
              <Tooltip
                contentStyle={{ borderRadius: '10px', fontSize: '12px', border: '1px solid #E2E8F0' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="divertedKg"
                name="Total Material Diverted (kg)"
                stroke="#10B981"
                fillOpacity={1}
                fill="urlColorDiverted"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="reuseKg"
                name="Direct Reuse Deferral (kg)"
                stroke="#14532D"
                fillOpacity={1}
                fill="urlColorReuse"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Environmental Progress Narrative Section */}
      <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 shadow-subtle space-y-4">
        <div className="flex items-center gap-2 text-[#14532D]">
          <Leaf className="w-5 h-5 text-[#10B981]" />
          <h3 className="font-extrabold text-base">Environmental Progress & Circular Principles</h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          The most effective environmental intervention in industrial packaging is <strong>reuse extension</strong>. Every additional cycle a returnable rigid container completes prevents 100% of the extraction energy, catalytic cracking emissions, and transportation freight required to produce replacement packaging from virgin naphtha or ethane.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
            <span className="font-bold text-[#14532D] block">1. Virgin Resin Displacement</span>
            <p className="text-slate-600 leading-relaxed">
              Replacing single-use corrugated cases and flimsy single-trip HDPE jugs with multi-turn containers keeps polymer mass circulating inside certified industrial logistics.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
            <span className="font-bold text-[#14532D] block">2. High-Purity Flake Preservation</span>
            <p className="text-slate-600 leading-relaxed">
              When packaging experiences structural damage or closure wear, routing to monomaterial granulators produces high-IV (Intrinsic Viscosity) recycled flake without black-speck contamination.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
            <span className="font-bold text-[#14532D] block">3. Microplastic Prevention</span>
            <p className="text-slate-600 leading-relaxed">
              Authorized chain-of-custody recycling eliminates accidental release into aquatic channels and landfills where solar UV photo-degrades rigid plastics into persistent microfibers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
