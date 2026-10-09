import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Download,
  Printer,
  History,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Search,
  ScanSearch,
  Package,
} from 'lucide-react';
import { PackageItem, InspectionItem, RecoveryRecord, NavView } from '../types';
import { fetchPackages, fetchPackageDetail } from '../api';
import { StatusBadge, DemoDataBadge } from '../components/StatusBadge';

interface ReusePassportProps {
  initialPackageId?: string;
  onNavigate: (view: NavView, param?: string) => void;
}

export const ReusePassport: React.FC<ReusePassportProps> = ({
  initialPackageId,
  onNavigate,
}) => {
  const [selectedId, setSelectedId] = useState(initialPackageId || 'PKG-PET-1001');
  const [packageList, setPackageList] = useState<PackageItem[]>([]);
  const [currentPackage, setCurrentPackage] = useState<PackageItem | null>(null);
  const [inspections, setInspections] = useState<InspectionItem[]>([]);
  const [recoveryRecords, setRecoveryRecords] = useState<RecoveryRecord[]>([]);
  const [qrCodeUri, setQrCodeUri] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages({ limit: 50 })
      .then((res) => {
        setPackageList(res.items);
        const match = res.items.find((p) => p.id === selectedId) || res.items[0];
        if (match) {
          loadPackagePassport(match.id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const loadPackagePassport = async (id: string) => {
    setLoading(true);
    setSelectedId(id);
    try {
      const data = await fetchPackageDetail(id);
      setCurrentPackage(data.package);
      setInspections(data.inspections);
      setRecoveryRecords(data.recovery_records);
      setQrCodeUri(data.qr_code_data_uri);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQr = () => {
    if (!qrCodeUri) return;
    const link = document.createElement('a');
    link.href = qrCodeUri;
    link.download = `QR_${selectedId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn text-left">
      {/* Title & Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#17251D]">
            Smart Reuse Passport
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Immutable digital identity, inspection lineage, and circular tracking certificate.
          </p>
        </div>

        {/* Package Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700 shrink-0">Select Asset:</label>
          <select
            value={selectedId}
            onChange={(e) => loadPackagePassport(e.target.value)}
            className="text-xs sm:text-sm p-2 bg-white border border-[#E2E8F0] rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          >
            {packageList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} — {p.name} ({p.plastic_type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentPackage && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================= LEFT COLUMN: DIGITAL PASSPORT CERTIFICATE ================= */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border-2 border-emerald-500/80 rounded-[20px] p-6 shadow-card relative overflow-hidden">
              {/* Header Certificate Bar */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#14532D]">
                      Digital Reuse Passport
                    </span>
                  </div>
                  <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">
                    {currentPackage.name}
                  </h3>
                </div>
                {Boolean(currentPackage.is_demo) && <DemoDataBadge />}
              </div>

              {/* Passport Specs Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs mb-5">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Package ID</span>
                  <span className="font-mono font-bold text-slate-800">{currentPackage.id}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Polymer Material</span>
                  <span className="font-bold text-[#14532D]">
                    {currentPackage.plastic_type} (Resin #{currentPackage.resin_code})
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Registered Date</span>
                  <span className="font-semibold text-slate-700">{currentPackage.registration_date}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Rotation Uses</span>
                  <span className="font-bold text-emerald-700">{currentPackage.usage_count} Complete Cycles</span>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100 flex flex-col items-center justify-center text-center">
                <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-xs mb-3">
                  {qrCodeUri ? (
                    <img
                      src={qrCodeUri}
                      alt={`QR Code for ${currentPackage.id}`}
                      className="w-40 h-40 object-contain"
                    />
                  ) : (
                    <div className="w-40 h-40 bg-slate-100 flex items-center justify-center text-slate-400">
                      <QrCode className="w-12 h-12" />
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-600 mb-3 max-w-xs leading-relaxed">
                  Scannable URL routes directly to this active package record in EcoTrack AI.
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadQr}
                    className="px-3.5 py-1.5 rounded-xl bg-[#14532D] hover:bg-[#166534] text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download QR</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Label</span>
                  </button>
                </div>
              </div>

              {/* Status & Recommendation Footer */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Current Status</span>
                  <StatusBadge status={currentPackage.recovery_status} size="sm" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Latest Assessment</span>
                  <StatusBadge status={currentPackage.current_recommendation} size="sm" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('inspect')}
                className="flex-1 py-2 px-3 rounded-xl bg-[#14532D] hover:bg-[#166534] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <ScanSearch className="w-3.5 h-3.5" />
                <span>Inspect This Item</span>
              </button>
              <button
                onClick={() => onNavigate('recovery', currentPackage.id)}
                className="flex-1 py-2 px-3 rounded-xl bg-white border border-emerald-600 text-[#14532D] hover:bg-emerald-50 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <span>Recovery Advisor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: HISTORICAL TIMELINE ================= */}
          <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-[20px] p-6 shadow-subtle space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-[#17251D] flex items-center gap-2">
                  <History className="w-4 h-4 text-[#14532D]" />
                  <span>Lifecycle Audit Timeline</span>
                </h3>
                <p className="text-xs text-[#64748B]">Chronological log of inspections and recovery decisions</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {inspections.length} recorded events
              </span>
            </div>

            {inspections.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No past inspections recorded yet for this asset.
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
                {inspections.map((ins, index) => (
                  <div key={ins.id} className="relative text-left">
                    {/* Node dot */}
                    <div className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#10B981] border-2 border-white ring-2 ring-emerald-200" />

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-800">{ins.id}</span>
                          <span className="text-[11px] text-slate-500">{ins.inspection_date}</span>
                        </div>
                        <StatusBadge status={ins.recommendation} size="sm" />
                      </div>

                      <div className="text-xs font-medium text-slate-700">
                        {ins.assessment_method}
                      </div>

                      <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                        {ins.rationale}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>Integrity Score: <strong className="text-slate-700">{ins.condition_score}/100</strong></span>
                        <span>Confidence: <strong className="text-slate-700">{ins.confidence_pct}%</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
