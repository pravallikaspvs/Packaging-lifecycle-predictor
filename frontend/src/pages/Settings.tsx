import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Sliders,
  Database,
  Info,
  Save,
  RotateCcw,
  Trash2,
  Check,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { fetchSettings, updateSettings, resetDemoData, clearDemoData } from '../api';

export const Settings: React.FC = () => {
  const [minReuseScore, setMinReuseScore] = useState('75');
  const [crackPenalty, setCrackPenalty] = useState('35');
  const [deformationPenalty, setDeformationPenalty] = useState('30');
  const [discolorationPenalty, setDiscolorationPenalty] = useState('15');
  const [foodStrict, setFoodStrict] = useState('true');
  const [maxCycles, setMaxCycles] = useState('30');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [dataMessage, setDataMessage] = useState('');

  useEffect(() => {
    fetchSettings()
      .then((cfg) => {
        if (cfg.min_reuse_score) setMinReuseScore(cfg.min_reuse_score);
        if (cfg.crack_penalty) setCrackPenalty(cfg.crack_penalty);
        if (cfg.deformation_penalty) setDeformationPenalty(cfg.deformation_penalty);
        if (cfg.discoloration_penalty) setDiscolorationPenalty(cfg.discoloration_penalty);
        if (cfg.food_contact_strict) setFoodStrict(cfg.food_contact_strict);
        if (cfg.max_reuse_cycles_warning) setMaxCycles(cfg.max_reuse_cycles_warning);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await updateSettings({
        min_reuse_score: minReuseScore,
        crack_penalty: crackPenalty,
        deformation_penalty: deformationPenalty,
        discoloration_penalty: discolorationPenalty,
        food_contact_strict: foodStrict,
        max_reuse_cycles_warning: maxCycles,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(`Error saving settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemo = async () => {
    if (!confirm('Reset all demonstration packages and inspections to initial benchmark state?')) return;
    try {
      const res = await resetDemoData();
      setDataMessage(res.message);
      setTimeout(() => setDataMessage(''), 4000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleClearDemo = async () => {
    if (!confirm('Permanently purge all sample demo records? (Only user-created records will remain)')) return;
    try {
      const res = await clearDemoData();
      setDataMessage(res.message);
      setTimeout(() => setDataMessage(''), 4000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn text-left max-w-4xl">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#17251D]">
          Engine Settings & Platform Administration
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Configure decision engine penalty thresholds, data seed modes, and system parameters.
        </p>
      </div>

      {dataMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-[#14532D] flex items-center gap-2">
          <Check className="w-4 h-4 text-[#10B981]" />
          <span>{dataMessage}</span>
        </div>
      )}

      {/* Decision Engine Configuration Form */}
      <form onSubmit={handleSaveSettings} className="bg-white border border-[#E2E8F0] rounded-[20px] p-6 shadow-subtle space-y-6">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <Sliders className="w-5 h-5 text-[#14532D]" />
          <h3 className="font-extrabold text-base text-slate-900">
            Condition Assessment Rules Engine Thresholds
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Minimum Score for "Reuse Candidate" (0 - 100)
            </label>
            <input
              type="number"
              min="50"
              max="95"
              value={minReuseScore}
              onChange={(e) => setMinReuseScore(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Packages below this score are automatically routed to further inspection or recycling.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Crack / Fracture Penalty (Deduction points)
            </label>
            <input
              type="number"
              min="15"
              max="60"
              value={crackPenalty}
              onChange={(e) => setCrackPenalty(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Point deduction applied when visible surface fractures are detected by optical analysis.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Deformation / Denting Penalty
            </label>
            <input
              type="number"
              min="10"
              max="50"
              value={deformationPenalty}
              onChange={(e) => setDeformationPenalty(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Surface Discoloration / Chemical Haze Penalty
            </label>
            <input
              type="number"
              min="5"
              max="30"
              value={discolorationPenalty}
              onChange={(e) => setDiscolorationPenalty(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Food Contact Strictness Protocol
            </label>
            <select
              value={foodStrict}
              onChange={(e) => setFoodStrict(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            >
              <option value="true">Strict (Disallow reuse repair on cracked food containers)</option>
              <option value="false">Standard / Advisory</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Max Reuse Cycles Warning Threshold
            </label>
            <input
              type="number"
              min="10"
              max="100"
              value={maxCycles}
              onChange={(e) => setMaxCycles(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#14532D] hover:bg-[#166534] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Configuration Saved</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Update Assessment Rules'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Demonstration Data Management */}
      <div className="bg-white border border-[#E2E8F0] rounded-[20px] p-6 shadow-subtle space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <Database className="w-5 h-5 text-emerald-700" />
          <h3 className="font-extrabold text-base text-slate-900">
            Demonstration Data & Benchmark Controls
          </h3>
        </div>

        <p className="text-xs text-[#64748B] leading-relaxed">
          The application is pre-seeded with realistic sample packages representing PET, HDPE, PP, and unclassified polymers. You can re-seed default demo packages or purge them when deploying to live testing.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleResetDemo}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-emerald-700" />
            <span>Reset Default Sample Data</span>
          </button>

          <button
            type="button"
            onClick={handleClearDemo}
            className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-2 border border-red-200 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
            <span>Clear All Demo Records</span>
          </button>
        </div>
      </div>

      {/* Project & System Information Card */}
      <div className="bg-gradient-to-br from-[#14532D] to-[#0f3d21] rounded-[20px] p-6 text-white shadow-card space-y-4">
        <div className="flex items-center gap-2 text-emerald-300">
          <Cpu className="w-5 h-5" />
          <h3 className="font-extrabold text-base text-white">Project Information & Architecture</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-white/10 border border-white/10">
            <span className="text-emerald-200 block font-semibold text-[11px] mb-0.5">Project Title:</span>
            <span className="font-bold text-white text-sm">Smart Reusable Packaging Life Predictor</span>
          </div>

          <div className="p-3 rounded-xl bg-white/10 border border-white/10">
            <span className="text-emerald-200 block font-semibold text-[11px] mb-0.5">Application Brand:</span>
            <span className="font-bold text-white text-sm">EcoTrack AI</span>
          </div>

          <div className="p-3 rounded-xl bg-white/10 border border-white/10">
            <span className="text-emerald-200 block font-semibold text-[11px] mb-0.5">Core Featured Module:</span>
            <span className="font-bold text-white text-sm">Eco-First Plastic Recovery Advisor</span>
          </div>

          <div className="p-3 rounded-xl bg-white/10 border border-white/10">
            <span className="text-emerald-200 block font-semibold text-[11px] mb-0.5">Engine Stack:</span>
            <span className="font-semibold text-emerald-100">React 19 + TypeScript + Vite + Tailwind + FastAPI + SQLite + OpenCV</span>
          </div>
        </div>

        <p className="text-[11px] text-emerald-100/70 leading-relaxed pt-1">
          Designed for environmental technology evaluation, hackathons, and industrial returnable packaging fleet management.
        </p>
      </div>
    </div>
  );
};
