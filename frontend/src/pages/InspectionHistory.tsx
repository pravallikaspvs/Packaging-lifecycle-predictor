import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Download,
  Filter,
  Eye,
  CheckCircle2,
  Calendar,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { InspectionItem, NavView } from '../types';
import { fetchInspections } from '../api';
import { StatusBadge, DemoDataBadge } from '../components/StatusBadge';

interface InspectionHistoryProps {
  onNavigate: (view: NavView, param?: string) => void;
}

export const InspectionHistory: React.FC<InspectionHistoryProps> = ({ onNavigate }) => {
  const [inspections, setInspections] = useState<InspectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [recFilter, setRecFilter] = useState('All');
  const [activeModalItem, setActiveModalItem] = useState<InspectionItem | null>(null);

  const loadData = () => {
    setLoading(true);
    fetchInspections({
      package_id: search,
      recommendation: recFilter,
      limit: 100,
    })
      .then((res) => {
        setInspections(res.items);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [search, recFilter]);

  const handleExportCsv = () => {
    window.location.href = '/api/inspections/export';
  };

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      {/* Title & CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#17251D]">
            Inspection History & Audit Log
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Complete traceability log of optical and manual condition assessments.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm shadow-xs transition-all"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-4 shadow-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Package ID or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 shrink-0">Recommendation:</span>
          <select
            value={recFilter}
            onChange={(e) => setRecFilter(e.target.value)}
            className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
          >
            <option value="All">All Outcomes</option>
            <option value="REUSE CANDIDATE">Reuse Candidate</option>
            <option value="FURTHER INSPECTION REQUIRED">Further Inspection</option>
            <option value="REPAIR ASSESSMENT">Repair Assessment</option>
            <option value="RECYCLING ASSESSMENT">Recycling Assessment</option>
            <option value="SPECIALIST RECOVERY REVIEW">Specialist Recovery</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-subtle overflow-hidden">
        <div className="table-wrapper">
          <table className="text-left w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">Inspection ID</th>
                <th className="py-3 px-4">Package ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Assessment Method</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Findings</th>
                <th className="py-3 px-4">Recommendation</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {inspections.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No inspection records found.
                  </td>
                </tr>
              ) : (
                inspections.map((ins) => (
                  <tr key={ins.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{ins.id}</span>
                        {Boolean(ins.is_demo) && <DemoDataBadge />}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => onNavigate('passport', ins.package_id)}
                        className="font-mono font-semibold text-[#14532D] hover:underline"
                      >
                        {ins.package_id}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {ins.inspection_date}
                    </td>

                    <td className="py-3 px-4 text-slate-700 max-w-xs truncate">
                      {ins.assessment_method}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`font-bold ${
                          ins.condition_score >= 75
                            ? 'text-emerald-700'
                            : ins.condition_score >= 50
                            ? 'text-amber-700'
                            : 'text-red-700'
                        }`}
                      >
                        {ins.condition_score}/100
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {ins.findings.join(', ') || 'No defects'}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={ins.recommendation} size="sm" />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setActiveModalItem(ins)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-[#14532D] hover:bg-emerald-50"
                        title="View Full Inspection Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspection Detail Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-slate-500 block mb-0.5">
                  Audit Record: {activeModalItem.id}
                </span>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Inspection Details for {activeModalItem.package_id}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block font-bold text-[10px] uppercase">Date Audited</span>
                <span className="font-bold text-slate-800">{activeModalItem.inspection_date}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block font-bold text-[10px] uppercase">Confidence</span>
                <span className="font-bold text-emerald-800">{activeModalItem.confidence_pct}% Verified</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="font-bold text-slate-700 block">Assessment Recommendation:</span>
              <StatusBadge status={activeModalItem.recommendation} size="md" />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
              <span className="font-bold text-slate-800 block">Assessment Rationale:</span>
              <p className="text-slate-700 leading-relaxed">{activeModalItem.rationale}</p>
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-slate-700 block">Findings Logged:</span>
              <ul className="space-y-1">
                {activeModalItem.findings.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {activeModalItem.inspector_notes && (
              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs">
                <span className="font-bold text-[#14532D] block mb-0.5">Inspector Notes:</span>
                <p className="text-emerald-900">{activeModalItem.inspector_notes}</p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModalItem(null)}
                className="px-4 py-2 rounded-xl bg-[#14532D] hover:bg-[#166534] text-white font-bold text-xs"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
