import React, { useState, useEffect } from 'react';
import {
  Recycle,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Building2,
  FileCheck,
  Layers,
  ArrowRight,
  RefreshCw,
  Save,
  Check,
  Info,
} from 'lucide-react';
import { PackageItem, RecoveryRecommendationResponse, NavView } from '../types';
import { fetchPackages, getRecoveryRecommendation, recordRecoveryOutcome } from '../api';
import { DecisionPathway } from '../components/DecisionPathway';
import { StatusBadge } from '../components/StatusBadge';

interface EcoFirstRecoveryProps {
  initialPackageId?: string;
  onNavigate: (view: NavView, param?: string) => void;
}

export const EcoFirstRecovery: React.FC<EcoFirstRecoveryProps> = ({
  initialPackageId,
  onNavigate,
}) => {
  // Input states
  const [packageId, setPackageId] = useState(initialPackageId || 'PKG-PET-1001');
  const [plasticType, setPlasticType] = useState('PET');
  const [packageType, setPackageType] = useState('Bottle');
  const [visibleCondition, setVisibleCondition] = useState('Intact Surface');
  const [damageFindings, setDamageFindings] = useState<string[]>(['No obvious visible damage detected']);
  const [contamination, setContamination] = useState('None');
  const [intendedUse, setIntendedUse] = useState('Food & Beverage');
  const [localAcceptance, setLocalAcceptance] = useState('Unverified');
  const [usageCount, setUsageCount] = useState(8);

  // Package inventory list for auto-population
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);

  // Advisor result states
  const [recommendation, setRecommendation] = useState<RecoveryRecommendationResponse | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  // Outcome recording states
  const [facilityInfo, setFacilityInfo] = useState('');
  const [finalOutcomeChoice, setFinalOutcomeChoice] = useState('');
  const [recordNotes, setRecordNotes] = useState('');
  const [savingRecord, setSavingRecord] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchPackages({ limit: 100 })
      .then((res) => {
        setPackages(res.items);
        setLoadingPackages(false);

        // If initial ID provided, pre-populate
        const targetId = initialPackageId || 'PKG-PET-1001';
        const match = res.items.find((p) => p.id === targetId);
        if (match) {
          applyPackageData(match);
        } else if (res.items.length > 0) {
          applyPackageData(res.items[0]);
        }
      })
      .catch((err) => {
        console.error(err);
        setLoadingPackages(false);
      });
  }, [initialPackageId]);

  const applyPackageData = (p: PackageItem) => {
    setPackageId(p.id);
    setPlasticType(p.plastic_type);
    setPackageType(p.package_type);
    setVisibleCondition(p.current_condition);
    setUsageCount(p.usage_count);
    setIntendedUse(p.intended_use || 'General');

    // Estimate findings based on condition label
    let f = ['No obvious visible damage detected'];
    if (p.current_condition.toLowerCase().includes('crack')) {
      f = ['Visible cracks detected'];
    } else if (p.current_condition.toLowerCase().includes('deform') || p.current_condition.toLowerCase().includes('dent')) {
      f = ['Geometric deformation / sidewall denting detected'];
    } else if (p.current_condition.toLowerCase().includes('wear') || p.current_condition.toLowerCase().includes('scuff')) {
      f = ['Surface scratches detected (4 abrasion marks)'];
    }
    setDamageFindings(f);

    runRecommendation({
      pId: p.id,
      pPlastic: p.plastic_type,
      pType: p.package_type,
      pCondition: p.current_condition,
      pFindings: f,
      pContam: contamination,
      pIntended: p.intended_use || 'General',
      pLocal: localAcceptance,
      pUses: p.usage_count,
    });
  };

  const runRecommendation = async (params?: {
    pId?: string;
    pPlastic?: string;
    pType?: string;
    pCondition?: string;
    pFindings?: string[];
    pContam?: string;
    pIntended?: string;
    pLocal?: string;
    pUses?: number;
  }) => {
    setEvaluating(true);
    setSaveSuccess(false);

    try {
      const res = await getRecoveryRecommendation({
        package_id: params?.pId || packageId,
        plastic_type: params?.pPlastic || plasticType,
        package_type: params?.pType || packageType,
        visible_condition: params?.pCondition || visibleCondition,
        findings: params?.pFindings || damageFindings,
        contamination: params?.pContam || contamination,
        intended_use: params?.pIntended || intendedUse,
        local_acceptance: params?.pLocal || localAcceptance,
        usage_count: params?.pUses !== undefined ? params.pUses : usageCount,
      });

      setRecommendation(res);
      setFinalOutcomeChoice(res.recommended_action);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleSelectPackageChange = (id: string) => {
    const found = packages.find((p) => p.id === id);
    if (found) {
      applyPackageData(found);
    } else {
      setPackageId(id);
    }
  };

  const handleFindingCheckboxToggle = (findingText: string) => {
    let next: string[];
    if (damageFindings.includes(findingText)) {
      next = damageFindings.filter((item) => item !== findingText);
      if (next.length === 0) next = ['No obvious visible damage detected'];
    } else {
      next = [...damageFindings.filter((item) => !item.includes('No obvious')), findingText];
    }
    setDamageFindings(next);
  };

  const handleRecordRecovery = async () => {
    if (!recommendation) return;
    setSavingRecord(true);
    try {
      await recordRecoveryOutcome({
        package_id: packageId,
        priority_level: recommendation.priority_level,
        recommended_action: recommendation.recommended_action,
        final_outcome: finalOutcomeChoice || recommendation.recommended_action,
        environmental_rationale: recommendation.environmental_rationale,
        preparation_steps: recommendation.preparation_steps,
        safety_notes: recommendation.safety_notes.join('; '),
        facility_info: facilityInfo,
        is_verified: localAcceptance === 'Yes' ? 1 : 0,
        inspector_notes: recordNotes,
      });
      setSaveSuccess(true);
    } catch (err: any) {
      alert(`Error saving recovery decision: ${err.message}`);
    } finally {
      setSavingRecord(false);
    }
  };

  // Demo trigger helper: PET Bottle visibly cracked
  const loadExampleDemoCase = () => {
    setPackageId('PKG-PET-DEMO-CRACK');
    setPackageType('Bottle');
    setPlasticType('PET');
    setVisibleCondition('Visible Surface Cracks');
    setDamageFindings(['Visible cracks detected (1 fracture zone)']);
    setContamination('None');
    setIntendedUse('Food & Beverage');
    setLocalAcceptance('Unverified');
    setUsageCount(14);

    runRecommendation({
      pId: 'PKG-PET-DEMO-CRACK',
      pPlastic: 'PET',
      pType: 'Bottle',
      pCondition: 'Visible Surface Cracks',
      pFindings: ['Visible cracks detected (1 fracture zone)'],
      pContam: 'None',
      pIntended: 'Food & Beverage',
      pLocal: 'Unverified',
      pUses: 14,
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn text-left">
      {/* Featured Header Banner */}
      <section className="bg-[#14532D] rounded-[20px] p-6 sm:p-8 text-white shadow-card relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-6 pointer-events-none">
          <Recycle className="w-72 h-72 text-emerald-300" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-300/30 text-emerald-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Core Circularity Intelligence</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2 leading-tight">
            Eco-First Recovery Advisor
          </h2>
          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-normal mb-5">
            Find the most responsible next step for every plastic package. We prioritize maximum life extension before routing to mechanical recycling or authorized recovery.
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-[#166534] border border-emerald-500/30 font-medium text-emerald-100">
              1. Assess Condition
            </span>
            <span className="text-emerald-400">→</span>
            <span className="px-3 py-1.5 rounded-lg bg-[#166534] border border-emerald-500/30 font-medium text-emerald-100">
              2. Reuse Priority
            </span>
            <span className="text-emerald-400">→</span>
            <span className="px-3 py-1.5 rounded-lg bg-[#166534] border border-emerald-500/30 font-medium text-emerald-100">
              3. Repair Assessment
            </span>
            <span className="text-emerald-400">→</span>
            <span className="px-3 py-1.5 rounded-lg bg-[#166534] border border-emerald-500/30 font-medium text-emerald-100">
              4. Recycle Routing
            </span>
            <span className="text-emerald-400">→</span>
            <span className="px-3 py-1.5 rounded-lg bg-[#166534] border border-emerald-500/30 font-medium text-emerald-100">
              5. Authorized Recovery
            </span>
          </div>
        </div>
      </section>

      {/* Visual Decision Pathway */}
      <DecisionPathway steps={recommendation?.pathway_steps} />

      {/* Main 2-Column Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN: ADVISOR INPUT FORM ================= */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-[16px] p-5 sm:p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-[#14532D]">Package Circularity Inputs</h3>
              <p className="text-xs text-[#64748B]">Provide physical & supply chain conditions</p>
            </div>
            <button
              type="button"
              onClick={loadExampleDemoCase}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-[#14532D] hover:bg-emerald-100 transition-colors border border-emerald-200"
              title="Loads the PET cracked demo example required by specification"
            >
              Demo Crack Test
            </button>
          </div>

          {/* Select Existing Package */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Package from Inventory:
            </label>
            <select
              value={packageId}
              onChange={(e) => handleSelectPackageChange(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500"
            >
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.id} — {pkg.name} ({pkg.plastic_type}, {pkg.current_recommendation})
                </option>
              ))}
            </select>
          </div>

          {/* Plastic Type & Package Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Declared Plastic Type
              </label>
              <select
                value={plasticType}
                onChange={(e) => setPlasticType(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="PET">PET (1)</option>
                <option value="HDPE">HDPE (2)</option>
                <option value="PVC">PVC (3)</option>
                <option value="LDPE">LDPE (4)</option>
                <option value="PP">PP (5)</option>
                <option value="PS">PS (6)</option>
                <option value="Other">Other (7)</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Package Format
              </label>
              <select
                value={packageType}
                onChange={(e) => setPackageType(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Bottle">Bottle</option>
                <option value="Food Container">Food Container</option>
                <option value="Storage Container">Storage Container</option>
                <option value="Packaging Box">Packaging Box</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Physical Damage Checkboxes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Observed Visible Conditions & Damage:
            </label>
            <div className="space-y-1.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              {[
                { id: 'Visible cracks detected', label: 'Visible cracks / structural fracture' },
                { id: 'Geometric deformation / sidewall denting detected', label: 'Deformation / warped rim or seal' },
                { id: 'Surface scratches detected', label: 'Surface scratches / scuffs' },
                { id: 'Discoloration / uneven surface staining observed', label: 'Discoloration / chemical haze' },
              ].map((item) => (
                <label key={item.id} className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={damageFindings.includes(item.id)}
                    onChange={() => handleFindingCheckboxToggle(item.id)}
                    className="rounded text-[#14532D] focus:ring-emerald-500 w-3.5 h-3.5"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Contamination Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Known Contamination Status
            </label>
            <select
              value={contamination}
              onChange={(e) => setContamination(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="None">None (Clean / normal food/dry residue)</option>
              <option value="Moderate">Moderate (Grease or organic soil)</option>
              <option value="Hazardous">Hazardous / Industrial Chemicals / Motor Oil</option>
            </select>
          </div>

          {/* Intended Previous Use */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Intended Previous Use
            </label>
            <select
              value={intendedUse}
              onChange={(e) => setIntendedUse(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Food & Beverage">Food & Beverage (Strict Direct Contact)</option>
              <option value="Household Chemistry">Household Chemistry (Detergent / Cleaning)</option>
              <option value="Warehouse Logistics">Warehouse Logistics (Secondary Transit Packaging)</option>
              <option value="General">General Logistics / Non-critical</option>
            </select>
          </div>

          {/* Local Recycling Acceptance */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Local Recycling Acceptance Information
            </label>
            <select
              value={localAcceptance}
              onChange={(e) => setLocalAcceptance(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Unverified">Unverified (Facility acceptance not yet checked)</option>
              <option value="Yes">Yes (Confirmed accepted by regional facility)</option>
              <option value="No">No (Rejected by municipal curbside)</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Never assume 100% acceptance without regional facility verification.
            </p>
          </div>

          {/* Evaluate Button */}
          <button
            type="button"
            onClick={() => runRecommendation()}
            disabled={evaluating}
            className="w-full py-2.5 px-4 rounded-xl bg-[#14532D] hover:bg-[#166534] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            {evaluating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                <span>Evaluating Recovery Hierarchy...</span>
              </>
            ) : (
              <>
                <Recycle className="w-4 h-4 text-emerald-300" />
                <span>Update Advisor Recommendation</span>
              </>
            )}
          </button>
        </div>

        {/* ================= RIGHT COLUMN: ADVISOR RECOMMENDATION CARD ================= */}
        <div className="lg:col-span-7 space-y-5">
          {recommendation && (
            <div className="bg-white border-2 border-emerald-500/80 rounded-[18px] p-6 shadow-card space-y-6 animate-fadeIn">
              {/* Priority & Action Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#14532D] text-white shadow-2xs">
                      {recommendation.priority_level}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      Resin #{recommendation.resin_code} ({recommendation.plastic_type})
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#14532D] tracking-tight">
                    {recommendation.recommended_action}
                  </h3>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {recommendation.verified_status}
                  </span>
                </div>
              </div>

              {/* Rationale & Why */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[#14532D]" />
                  <span>Why This Step Was Recommended:</span>
                </h4>
                <ul className="space-y-1 text-xs text-slate-700">
                  {recommendation.reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#10B981] font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Environmental Rationale */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
                <h4 className="font-bold flex items-center gap-1.5 text-[#14532D]">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Environmental & Resource Rationale:</span>
                </h4>
                <p className="leading-relaxed text-emerald-900">
                  {recommendation.environmental_rationale}
                </p>
              </div>

              {/* Step-by-Step Preparation Protocol */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-[#166534]" />
                  <span>Preparation Protocol:</span>
                </h4>
                <div className="space-y-2">
                  {recommendation.preparation_steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3 text-xs"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#14532D] text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="text-slate-800 font-medium leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Notes */}
              {recommendation.safety_notes && recommendation.safety_notes.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Important Safety Cautions:</span>
                  </div>
                  {recommendation.safety_notes.map((sn, i) => (
                    <p key={i} className="pl-5 text-amber-800 leading-relaxed">
                      • {sn}
                    </p>
                  ))}
                </div>
              )}

              {/* Record Final Recovery Decision Card */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#14532D]">
                  Commit & Record Recovery Decision
                </h4>
                <p className="text-xs text-[#64748B]">
                  Permanently record this recovery outcome in the package passport and lifecycle inventory.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Final Verified Facility / Channel
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Metro Sorting Hub #4 or Internal Wash Cell"
                      value={facilityInfo}
                      onChange={(e) => setFacilityInfo(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Final Selected Outcome
                    </label>
                    <input
                      type="text"
                      value={finalOutcomeChoice}
                      onChange={(e) => setFinalOutcomeChoice(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRecordRecovery}
                  disabled={savingRecord || saveSuccess}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all ${
                    saveSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#14532D] hover:bg-[#166534] text-white active:scale-98'
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Recovery Decision Recorded in Inventory</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{savingRecord ? 'Recording Decision...' : 'Commit Recovery Decision'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
