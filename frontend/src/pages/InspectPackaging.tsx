import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileImage,
  X,
  RefreshCw,
  Scan,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Info,
  ShieldAlert,
  ArrowRight,
  Save,
  Check,
  Eye,
  Camera,
} from 'lucide-react';
import { InspectionAnalysisResponse, NavView, PackageItem } from '../types';
import { analyzePackaging, saveInspectionRecord, fetchPackages } from '../api';
import { StatusBadge } from '../components/StatusBadge';

interface InspectPackagingProps {
  onNavigate: (view: NavView, param?: string) => void;
  onInspectionSaved?: (packageId: string) => void;
}

export const InspectPackaging: React.FC<InspectPackagingProps> = ({
  onNavigate,
  onInspectionSaved,
}) => {
  // Form States
  const [packageId, setPackageId] = useState('');
  const [packageType, setPackageType] = useState('Bottle');
  const [plasticType, setPlasticType] = useState('PET');
  const [inspectionDate, setInspectionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [usageCount, setUsageCount] = useState(6);
  const [intendedUse, setIntendedUse] = useState('Food & Beverage');
  const [selectedPrevPackage, setSelectedPrevPackage] = useState('');

  // Image Upload States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');

  // Mode & Manual Options
  const [manualMode, setManualMode] = useState(false);
  const [manualFinding, setManualFinding] = useState('No obvious visible damage detected');

  // Analysis & Saving States
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<InspectionAnalysisResponse | null>(null);
  const [viewAnnotated, setViewAnnotated] = useState(true);
  const [inspectorNotes, setInspectorNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Existing packages for previous record selector
  const [existingPackages, setExistingPackages] = useState<PackageItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPackages({ limit: 50 })
      .then((res) => setExistingPackages(res.items))
      .catch((err) => console.error(err));

    // Generate random default Package ID if blank
    if (!packageId) {
      setPackageId(`PKG-PET-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, []);

  const handlePackageSelect = (id: string) => {
    setSelectedPrevPackage(id);
    const found = existingPackages.find((p) => p.id === id);
    if (found) {
      setPackageId(found.id);
      setPackageType(found.package_type);
      setPlasticType(found.plastic_type);
      setUsageCount(found.usage_count);
      setIntendedUse(found.intended_use || 'General');
    }
  };

  const generateNewId = () => {
    const code = plasticType.substring(0, 3).toUpperCase();
    const rand = Math.floor(1000 + Math.random() * 9000);
    setPackageId(`PKG-${code}-${rand}`);
    setSelectedPrevPackage('');
  };

  const handleFileValidationAndSet = (file: File) => {
    setUploadError('');
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setUploadError('Invalid format. Please upload JPG, JPEG, PNG, or WEBP.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File exceeds 10MB limit. Please upload a smaller image.');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setResult(null);
    setSaveSuccess(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileValidationAndSet(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileValidationAndSet(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!packageId.trim()) {
      setUploadError('Please enter or generate a Package ID.');
      return;
    }

    setAnalyzing(true);
    setUploadError('');
    setSaveSuccess(false);

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      formData.append('package_id', packageId.trim());
      formData.append('package_type', packageType);
      formData.append('plastic_type', plasticType);
      formData.append('usage_count', String(usageCount));
      formData.append('intended_use', intendedUse);
      formData.append('manual_mode', String(manualMode));
      if (manualMode) {
        formData.append('manual_damage', JSON.stringify([manualFinding]));
      }

      const res = await analyzePackaging(formData);
      setResult(res);
      setViewAnnotated(true);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Inspection analysis failed. Please retry.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveInspection = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await saveInspectionRecord({
        package_id: packageId,
        inspection_date: inspectionDate,
        assessment_method: result.assessment_method,
        findings: result.findings,
        condition_score: result.condition_score,
        confidence_pct: result.confidence_pct,
        recommendation: result.recommendation,
        rationale: result.rationale,
        image_url: result.image_url || previewUrl,
        annotated_image_url: result.annotated_image_url,
        inspector_notes: inspectorNotes,
      });
      setSaveSuccess(true);
      if (onInspectionSaved) onInspectionSaved(packageId);
    } catch (err: any) {
      alert(`Error saving inspection: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      {/* Title & Introduction */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#17251D]">
          Inspect Your Packaging
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-3xl">
          Upload a packaging image, review visible damage, and receive a responsible next-step recommendation. Visible-condition assessment evaluates surface integrity and deformation.
        </p>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN: UPLOAD & INPUTS ================= */}
        <div className="lg:col-span-6 space-y-5 bg-white border border-[#E2E8F0] rounded-[16px] p-5 sm:p-6 shadow-subtle">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-[#14532D]">Packaging Intake & Image Upload</h3>
              <p className="text-xs text-[#64748B]">Provide photographs or manual findings</p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setManualMode(false)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  !manualMode ? 'bg-white text-[#14532D] shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                Vision Mode
              </button>
              <button
                type="button"
                onClick={() => setManualMode(true)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  manualMode ? 'bg-white text-[#14532D] shadow-2xs font-bold' : 'text-slate-600'
                }`}
              >
                Manual Entry
              </button>
            </div>
          </div>

          {/* Drag & Drop Area (Vision Mode) */}
          {!manualMode ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Packaging Photograph (Required for Optical Inspection)
              </label>

              {!previewUrl ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
                    dragActive
                      ? 'border-[#10B981] bg-emerald-50/60'
                      : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/20'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-emerald-100 text-[#14532D] flex items-center justify-center">
                    <UploadCloud className="w-6 h-6 text-[#10B981]" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    Click to upload or drag & drop packaging image
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports JPG, JPEG, PNG, WEBP (Max 10MB)
                  </p>
                  <span className="inline-block mt-3 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-[#14532D] shadow-2xs">
                    Browse Local File
                  </span>
                </div>
              ) : (
                <div className="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 group">
                  <img
                    src={previewUrl}
                    alt="Packaging preview"
                    className="w-full h-56 object-contain mx-auto"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-[#14532D] text-xs font-bold shadow-md flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Replace</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              )}

              {uploadError && (
                <div className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1.5 bg-red-50 p-2 rounded-lg border border-red-200">
                  <AlertOctagon className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          ) : (
            /* Manual Assessment Form */
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Manual Technical Assessment Fallback</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                If camera or image capture is unavailable, choose the physical condition observed by the technician:
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observed Physical Finding:
                </label>
                <select
                  value={manualFinding}
                  onChange={(e) => setManualFinding(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-amber-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="No obvious visible damage detected">No obvious visible damage detected (Smooth surface, clean seal)</option>
                  <option value="Visible cracks detected">Visible fracture / puncture cracks</option>
                  <option value="Surface scratches detected">Surface scratches / abrasions</option>
                  <option value="Geometric deformation / sidewall denting detected">Geometric deformation / warped wall / dent</option>
                  <option value="Discoloration / uneven surface staining observed">Surface discoloration / chemical staining</option>
                  <option value="Unable to determine condition">Unable to determine (unclear or heavy contamination)</option>
                </select>
              </div>
            </div>
          )}

          {/* Form Input Fields */}
          <div className="space-y-3.5 pt-2">
            {/* Previous Package Selector */}
            {existingPackages.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Load Existing Package Record (Optional)
                </label>
                <select
                  value={selectedPrevPackage}
                  onChange={(e) => handlePackageSelect(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Or enter new packaging item below --</option>
                  {existingPackages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} — {p.name} ({p.plastic_type}, uses: {p.usage_count})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Package ID */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Package ID</label>
                <button
                  type="button"
                  onClick={generateNewId}
                  className="text-[11px] font-semibold text-[#14532D] hover:underline"
                >
                  Generate ID
                </button>
              </div>
              <input
                type="text"
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                placeholder="e.g. PKG-PET-8491"
                className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Package Type & Plastic Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Package Type
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Plastic Type (SPI Resin Code)
                </label>
                <select
                  value={plasticType}
                  onChange={(e) => setPlasticType(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="PET">PET (1) Polyethylene Terephthalate</option>
                  <option value="HDPE">HDPE (2) High-Density Polyethylene</option>
                  <option value="PVC">PVC (3) Polyvinyl Chloride</option>
                  <option value="LDPE">LDPE (4) Low-Density Polyethylene</option>
                  <option value="PP">PP (5) Polypropylene</option>
                  <option value="PS">PS (6) Polystyrene</option>
                  <option value="Other">Other (7) Multi-layer / Specialty</option>
                  <option value="Unknown">Unknown (Unidentified)</option>
                </select>
              </div>
            </div>

            {/* Inspection Date & Usage History */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Inspection Date
                </label>
                <input
                  type="date"
                  value={inspectionDate}
                  onChange={(e) => setInspectionDate(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                </input>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Previous Uses (Cycle Count)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={usageCount}
                  onChange={(e) => setUsageCount(parseInt(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Intended Use Sensitivity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Intended Application
              </label>
              <select
                value={intendedUse}
                onChange={(e) => setIntendedUse(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Food & Beverage">Food & Beverage (Strict Hygiene Protocols)</option>
                <option value="Household Chemistry">Household Chemistry (Detergent / Cleaning)</option>
                <option value="Warehouse Logistics">Warehouse Logistics (Secondary Transit Packaging)</option>
                <option value="General">General / Non-sensitive Storage</option>
              </select>
            </div>
          </div>

          {/* Prominent Analyze Button */}
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full py-3 px-5 rounded-xl bg-[#14532D] hover:bg-[#166534] disabled:bg-slate-400 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                <span>Running Computer-Vision Analysis...</span>
              </>
            ) : (
              <>
                <Scan className="w-4 h-4 text-emerald-300" />
                <span>Analyze Packaging</span>
              </>
            )}
          </button>
        </div>

        {/* ================= RIGHT COLUMN: INSPECTION RESULTS ================= */}
        <div className="lg:col-span-6 space-y-5">
          {!result ? (
            /* Helpful Empty State */
            <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-8 text-center shadow-subtle min-h-[460px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#14532D] flex items-center justify-center mb-4">
                <FileImage className="w-8 h-8 text-[#10B981]" />
              </div>
              <h3 className="font-extrabold text-base text-[#17251D] mb-1">
                Awaiting Packaging Analysis
              </h3>
              <p className="text-xs text-[#64748B] max-w-sm mb-6 leading-relaxed">
                Upload a photograph of your reusable container or choose manual parameters on the left, then click <strong>Analyze Packaging</strong>.
              </p>

              <div className="w-full max-w-sm text-left bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 text-xs">
                <div className="font-bold text-slate-700 mb-1">Detection Pipeline:</div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Fracture & hairline crack boundary detection</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Geometric contour asymmetry & denting check</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Surface discoloration & abrasion texture assessment</span>
                </div>
              </div>
            </div>
          ) : (
            /* Detailed Inspection Results Card */
            <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-5 sm:p-6 shadow-subtle space-y-5 animate-fadeIn">
              {/* Header with Badges */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {result.package_id}
                    </span>
                    <span className="text-xs text-slate-400">
                      {result.inspection_timestamp}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-lg text-[#17251D]">
                    Inspection Findings & Assessment
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  <StatusBadge status={result.recommendation} size="lg" />
                </div>
              </div>

              {/* Visual Preview (Original vs Annotated Overlay Toggle) */}
              {(result.annotated_data_uri || result.image_data_uri || previewUrl) && (
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-900">
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-800/90 text-white text-xs">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-emerald-400" />
                      {viewAnnotated ? 'Defect Annotation Overlay' : 'Raw Photograph'}
                    </span>
                    {result.annotated_data_uri && (
                      <button
                        type="button"
                        onClick={() => setViewAnnotated(!viewAnnotated)}
                        className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-xs font-medium flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>{viewAnnotated ? 'Show Raw Image' : 'Show Defect Bounding Boxes'}</span>
                      </button>
                    )}
                  </div>

                  <div className="relative h-60 bg-black flex items-center justify-center">
                    <img
                      src={
                        viewAnnotated && result.annotated_data_uri
                          ? result.annotated_data_uri
                          : result.image_data_uri || previewUrl
                      }
                      alt="Inspection visualization"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Condition Score & Confidence Gauge */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs text-[#64748B] font-medium block mb-1">
                    Visible Integrity Score
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-2xl sm:text-3xl font-extrabold ${
                        result.condition_score >= 75
                          ? 'text-[#10B981]'
                          : result.condition_score >= 50
                          ? 'text-[#F59E0B]'
                          : 'text-[#DC2626]'
                      }`}
                    >
                      {result.condition_score}
                    </span>
                    <span className="text-xs text-slate-400">/ 100</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        result.condition_score >= 75
                          ? 'bg-[#10B981]'
                          : result.condition_score >= 50
                          ? 'bg-[#F59E0B]'
                          : 'bg-[#DC2626]'
                      }`}
                      style={{ width: `${result.condition_score}%` }}
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs text-[#64748B] font-medium block mb-1">
                    Assessment Confidence
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#14532D]">
                      {result.confidence_pct}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 truncate">
                    {result.assessment_method}
                  </p>
                </div>
              </div>

              {/* Detected Visible Findings */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Observed Physical Findings:
                </h4>
                <div className="space-y-1.5">
                  {result.findings.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs font-medium text-slate-800"
                    >
                      {f.toLowerCase().includes('no obvious') ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : f.toLowerCase().includes('crack') ? (
                        <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation & Rationale */}
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-xs leading-relaxed text-emerald-950">
                <span className="font-bold block mb-1">Assessment Rationale:</span>
                {result.rationale}
              </div>

              {/* Safety Caveats */}
              {result.safety_notes && result.safety_notes.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Important Safety Cautions:</span>
                  </div>
                  {result.safety_notes.map((sn, idx) => (
                    <p key={idx} className="pl-5 text-amber-800">
                      • {sn}
                    </p>
                  ))}
                </div>
              )}

              {/* Mandatory AI Transparency Disclaimer */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{result.disclaimer}</span>
              </div>

              {/* Inspector Notes Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Inspector Audit Notes (Optional)
                </label>
                <input
                  type="text"
                  value={inspectorNotes}
                  onChange={(e) => setInspectorNotes(e.target.value)}
                  placeholder="e.g. Verified by visual bench audit, batch #B-2026."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveInspection}
                  disabled={saving || saveSuccess}
                  className={`flex-1 w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs ${
                    saveSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#14532D] hover:bg-[#166534] text-white active:scale-98'
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Saved to Passport & Inventory</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : 'Save Inspection Record'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('recovery', packageId)}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-emerald-600 text-[#14532D] hover:bg-emerald-50 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Forward to Recovery Advisor</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
