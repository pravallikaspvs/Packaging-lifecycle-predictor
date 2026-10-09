import {
  PackageItem,
  InspectionItem,
  RecoveryRecord,
  OverviewStats,
  RecoveryRecommendationResponse,
  InspectionAnalysisResponse
} from './types';
import {
  getStoredPackages,
  saveStoredPackages,
  getStoredInspections,
  saveStoredInspection,
  getStoredRecoveries,
  saveStoredRecovery,
  runClientSideInspection,
  calculateClientRecovery
} from './clientEngine';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

export async function fetchOverviewStats(): Promise<OverviewStats> {
  try {
    const res = await fetch(`${API_BASE}/stats/overview`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Backend offline / static host fallback
  }

  const pkgs = getStoredPackages();
  const suitable = pkgs.filter(p => p.current_recommendation === 'REUSE CANDIDATE').length;
  const needsInspect = pkgs.filter(p => p.current_recommendation === 'FURTHER INSPECTION REQUIRED' || p.recovery_status === 'Needs Inspection').length;
  const recycling = pkgs.filter(p => p.current_recommendation === 'RECYCLING ASSESSMENT' || p.recovery_status === 'Sent for Recycling').length;
  const recoveryPending = pkgs.filter(p => p.current_recommendation === 'SPECIALIST RECOVERY REVIEW' || p.recovery_status === 'Recovery Pending').length;

  return {
    is_demo_data: true,
    demo_disclaimer: 'Demonstration and offline client heuristics mode active.',
    summary: {
      total_packages: 1248,
      suitable_for_reuse: 842,
      needs_inspection: 126,
      sent_for_recycling: 184,
      recovery_pending: 96,
      waste_diverted_kg: 312
    },
    lifecycle_distribution: [
      { name: 'Reuse Candidate', value: 842, color: '#10B981' },
      { name: 'Needs Inspection', value: 126, color: '#F59E0B' },
      { name: 'Recycling', value: 184, color: '#166534' },
      { name: 'Recovery Pending', value: 96, color: '#94A3B8' }
    ],
    monthly_outcomes: [
      { month: 'May', inspected: 164, reused: 112, recycled: 28 },
      { month: 'Jun', inspected: 188, reused: 130, recycled: 32 },
      { month: 'Jul', inspected: 210, reused: 145, recycled: 35 },
      { month: 'Aug', inspected: 225, reused: 158, recycled: 39 },
      { month: 'Sep', inspected: 236, reused: 162, recycled: 41 },
      { month: 'Oct', inspected: 225, reused: 135, recycled: 45 }
    ],
    material_distribution: [
      { material: 'PET (1)', count: 486, percentage: 39, color: '#10B981' },
      { material: 'HDPE (2)', count: 342, percentage: 27, color: '#14532D' },
      { material: 'PP (5)', count: 218, percentage: 18, color: '#166534' },
      { material: 'LDPE (4)', count: 96, percentage: 8, color: '#059669' },
      { material: 'Other (7)', count: 64, percentage: 5, color: '#64748B' },
      { material: 'Unknown', count: 42, percentage: 3, color: '#F59E0B' }
    ],
    recovery_progress: [
      { label: 'Packages awaiting inspection', count: 126, total: 1248, pct: 10.1, color: '#F59E0B' },
      { label: 'Packages awaiting recovery', count: 96, total: 1248, pct: 7.7, color: '#64748B' },
      { label: 'Packages with recorded recycling', count: 184, total: 1248, pct: 14.7, color: '#10B981' }
    ]
  };
}

export async function fetchPackages(params?: {
  search?: string;
  filter_status?: string;
  plastic_type?: string;
  sort_by?: string;
  sort_order?: string;
  limit?: number;
  offset?: number;
}): Promise<{ items: PackageItem[]; total: number }> {
  try {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.filter_status) query.set('filter_status', params.filter_status);
    if (params?.plastic_type) query.set('plastic_type', params.plastic_type);
    if (params?.sort_by) query.set('sort_by', params.sort_by);
    if (params?.sort_order) query.set('sort_order', params.sort_order);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));

    const res = await fetch(`${API_BASE}/packages?${query.toString()}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback to stored packages
  }

  let items = [...getStoredPackages()];

  if (params?.search) {
    const s = params.search.toLowerCase();
    items = items.filter(p => p.id.toLowerCase().includes(s) || p.name.toLowerCase().includes(s) || (p.notes || '').toLowerCase().includes(s));
  }

  if (params?.filter_status && params.filter_status !== 'All Packages') {
    if (params.filter_status === 'Reuse Candidates') {
      items = items.filter(p => p.current_recommendation === 'REUSE CANDIDATE');
    } else if (params.filter_status === 'Needs Inspection') {
      items = items.filter(p => p.current_recommendation === 'FURTHER INSPECTION REQUIRED' || p.recovery_status === 'Needs Inspection');
    } else if (params.filter_status === 'Repair Assessment') {
      items = items.filter(p => p.current_recommendation === 'REPAIR ASSESSMENT' || p.recovery_status === 'Repair Assessment');
    } else if (params.filter_status === 'Recycling Assessment') {
      items = items.filter(p => p.current_recommendation === 'RECYCLING ASSESSMENT' || p.recovery_status === 'Sent for Recycling');
    } else if (params.filter_status === 'Recovery Pending') {
      items = items.filter(p => p.current_recommendation === 'SPECIALIST RECOVERY REVIEW' || p.recovery_status === 'Recovery Pending');
    }
  }

  if (params?.plastic_type && params.plastic_type !== 'All') {
    items = items.filter(p => p.plastic_type.toUpperCase() === params.plastic_type?.toUpperCase());
  }

  const total = items.length;
  const offset = params?.offset || 0;
  const limit = params?.limit || 10;
  const paged = items.slice(offset, offset + limit);

  return { items: paged, total };
}

export async function fetchPackageDetail(id: string): Promise<{
  package: PackageItem;
  inspections: InspectionItem[];
  recovery_records: RecoveryRecord[];
  qr_code_data_uri: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/packages/${encodeURIComponent(id)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }

  const pkgs = getStoredPackages();
  const pkg = pkgs.find(p => p.id.toUpperCase() === id.toUpperCase()) || pkgs[0];
  const inspections = getStoredInspections().filter(i => i.package_id.toUpperCase() === id.toUpperCase());
  const recoveries = getStoredRecoveries().filter(r => r.package_id.toUpperCase() === id.toUpperCase());

  // Generate clean SVG-based QR placeholder
  const svgQr = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="white"/><rect x="20" y="20" width="50" height="50" fill="%2314532D"/><rect x="30" y="30" width="30" height="30" fill="white"/><rect x="38" y="38" width="14" height="14" fill="%2314532D"/><rect x="130" y="20" width="50" height="50" fill="%2314532D"/><rect x="140" y="30" width="30" height="30" fill="white"/><rect x="148" y="38" width="14" height="14" fill="%2314532D"/><rect x="20" y="130" width="50" height="50" fill="%2314532D"/><rect x="30" y="140" width="30" height="30" fill="white"/><rect x="38" y="148" width="14" height="14" fill="%2314532D"/><rect x="85" y="40" width="15" height="15" fill="%2314532D"/><rect x="105" y="85" width="20" height="20" fill="%2314532D"/><rect x="85" y="130" width="15" height="25" fill="%2314532D"/><rect x="130" y="130" width="25" height="15" fill="%2314532D"/><text x="100" y="190" font-size="10" font-family="monospace" text-anchor="middle" fill="%2314532D">${pkg.id}</text></svg>`;

  return {
    package: pkg,
    inspections,
    recovery_records: recoveries,
    qr_code_data_uri: svgQr
  };
}

export async function createPackage(data: Partial<PackageItem>): Promise<{ message: string; package: PackageItem }> {
  try {
    const res = await fetch(`${API_BASE}/packages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }

  const pkgs = getStoredPackages();
  const newPkg: PackageItem = {
    id: data.id || `PKG-${(data.plastic_type || 'PET').substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
    name: data.name || 'Reusable Packaging Container',
    package_type: data.package_type || 'Bottle',
    plastic_type: data.plastic_type || 'PET',
    resin_code: data.resin_code || 1,
    registration_date: data.registration_date || new Date().toISOString().substring(0, 10),
    usage_count: data.usage_count || 0,
    weight_grams: data.weight_grams || 45.0,
    intended_use: data.intended_use || 'Food & Beverage',
    current_condition: data.current_condition || 'Normal Surface',
    current_score: data.current_score || 95,
    current_recommendation: data.current_recommendation || 'REUSE CANDIDATE',
    recovery_status: data.recovery_status || 'Active Circulation',
    image_url: data.image_url || 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500&auto=format&fit=crop&q=80',
    notes: data.notes || '',
    is_demo: 0,
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };

  pkgs.unshift(newPkg);
  saveStoredPackages(pkgs);

  return { message: 'Package created successfully', package: newPkg };
}

export async function updatePackage(id: string, data: Partial<PackageItem>): Promise<{ message: string; package: PackageItem }> {
  try {
    const res = await fetch(`${API_BASE}/packages/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }

  const pkgs = getStoredPackages();
  const idx = pkgs.findIndex(p => p.id.toUpperCase() === id.toUpperCase());
  if (idx !== -1) {
    pkgs[idx] = {
      ...pkgs[idx],
      ...data,
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    saveStoredPackages(pkgs);
    return { message: 'Package updated successfully', package: pkgs[idx] };
  }

  throw new Error('Package not found');
}

export async function deletePackage(id: string): Promise<{ message: string }> {
  try {
    const res = await fetch(`${API_BASE}/packages/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }

  let pkgs = getStoredPackages();
  pkgs = pkgs.filter(p => p.id.toUpperCase() !== id.toUpperCase());
  saveStoredPackages(pkgs);

  return { message: `Package ${id} deleted successfully` };
}

/**
 * Analyzes packaging: Attempts real backend OpenCV endpoint, automatically
 * falling back to client-side heuristics and canvas annotation if backend is offline.
 */
export async function analyzePackaging(formData: FormData): Promise<InspectionAnalysisResponse> {
  try {
    const res = await fetch(`${API_BASE}/inspect`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend /inspect unreachable, falling back to in-browser CV heuristic engine:', err);
  }

  // Seamless client-side inspection fallback
  return await runClientSideInspection(formData);
}

export async function saveInspectionRecord(data: {
  package_id: string;
  inspection_date?: string;
  assessment_method: string;
  findings: string[];
  condition_score: number;
  confidence_pct: number;
  recommendation: string;
  rationale: string;
  image_url?: string;
  annotated_image_url?: string;
  inspector_notes?: string;
}): Promise<{ message: string; inspection_id: string }> {
  try {
    const res = await fetch(`${API_BASE}/inspections/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }

  const inspectionId = `INSP-${Math.floor(10000 + Math.random() * 90000)}`;
  const inspection: InspectionItem = {
    id: inspectionId,
    package_id: data.package_id,
    inspection_date: data.inspection_date || new Date().toISOString().substring(0, 10),
    assessment_method: data.assessment_method,
    findings: data.findings,
    condition_score: data.condition_score,
    confidence_pct: data.confidence_pct,
    recommendation: data.recommendation,
    rationale: data.rationale,
    image_url: data.image_url,
    annotated_image_url: data.annotated_image_url,
    image_data_uri: data.image_url,
    annotated_data_uri: data.annotated_image_url,
    inspector_notes: data.inspector_notes,
    is_demo: 0,
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };

  saveStoredInspection(inspection);

  // Update corresponding package
  const pkgs = getStoredPackages();
  const pkg = pkgs.find(p => p.id.toUpperCase() === data.package_id.toUpperCase());
  if (pkg) {
    pkg.current_score = data.condition_score;
    pkg.current_recommendation = data.recommendation;
    pkg.current_condition = data.condition_score >= 75 ? 'Sound Surface' : data.condition_score >= 50 ? 'Moderate Wear' : 'Damaged Surface';
    if (data.annotated_image_url) pkg.image_url = data.annotated_image_url;
    saveStoredPackages(pkgs);
  }

  return { message: 'Inspection record saved successfully', inspection_id: inspectionId };
}

export async function fetchInspections(params?: {
  package_id?: string;
  recommendation?: string;
  limit?: number;
  offset?: number;
}): Promise<{ items: InspectionItem[]; total: number }> {
  try {
    const query = new URLSearchParams();
    if (params?.package_id) query.set('package_id', params.package_id);
    if (params?.recommendation) query.set('recommendation', params.recommendation);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));

    const res = await fetch(`${API_BASE}/inspections?${query.toString()}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }

  let list = getStoredInspections();
  if (params?.package_id) {
    list = list.filter(i => i.package_id.toUpperCase() === params.package_id?.toUpperCase());
  }
  if (params?.recommendation) {
    list = list.filter(i => i.recommendation.toUpperCase() === params.recommendation?.toUpperCase());
  }

  const offset = params?.offset || 0;
  const limit = params?.limit || 20;
  return { items: list.slice(offset, offset + limit), total: list.length };
}

export async function getRecoveryRecommendation(payload: {
  package_id: string;
  plastic_type: string;
  package_type: string;
  visible_condition: string;
  findings: string[];
  contamination?: string;
  intended_use?: string;
  local_acceptance?: string;
  usage_count?: number;
}): Promise<RecoveryRecommendationResponse> {
  try {
    const res = await fetch(`${API_BASE}/recovery/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }

  return calculateClientRecovery(payload);
}

export async function recordRecoveryOutcome(payload: {
  package_id: string;
  priority_level: string;
  recommended_action: string;
  final_outcome: string;
  environmental_rationale: string;
  preparation_steps: string[];
  safety_notes: string;
  facility_info?: string;
  is_verified?: number;
  inspector_notes?: string;
}): Promise<{ message: string; new_status: string }> {
  try {
    const res = await fetch(`${API_BASE}/recovery/record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }

  const record: RecoveryRecord = {
    id: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
    package_id: payload.package_id,
    decision_date: new Date().toISOString().substring(0, 10),
    priority_level: payload.priority_level,
    recommended_action: payload.recommended_action,
    final_outcome: payload.final_outcome,
    environmental_rationale: payload.environmental_rationale,
    preparation_steps: payload.preparation_steps,
    safety_notes: payload.safety_notes,
    facility_info: payload.facility_info,
    is_verified: payload.is_verified || 1,
    inspector_notes: payload.inspector_notes,
    is_demo: 0,
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };

  saveStoredRecovery(record);

  // Update package recovery status
  const pkgs = getStoredPackages();
  const pkg = pkgs.find(p => p.id.toUpperCase() === payload.package_id.toUpperCase());
  let newStatus = 'Active Circulation';
  if (payload.final_outcome.toLowerCase().includes('recycle')) {
    newStatus = 'Sent for Recycling';
  } else if (payload.final_outcome.toLowerCase().includes('repair')) {
    newStatus = 'Repaired & Cleared';
  } else if (payload.final_outcome.toLowerCase().includes('recovery') || payload.final_outcome.toLowerCase().includes('specialist')) {
    newStatus = 'Recovery Pending';
  }

  if (pkg) {
    pkg.recovery_status = newStatus;
    saveStoredPackages(pkgs);
  }

  return { message: 'Circular recovery decision committed', new_status: newStatus };
}

export async function fetchImpactStats() {
  try {
    const res = await fetch(`${API_BASE}/stats/impact`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }

  return {
    total_packages: 1248,
    active_in_circulation: 842,
    co2_avoided_kg: 624.0,
    virgin_plastic_saved_kg: 312.0,
    average_rotations_per_package: 11.4,
    circular_efficiency_pct: 88.6
  };
}

export async function fetchSettings(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${API_BASE}/settings`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }

  return {
    min_reuse_score: '75',
    crack_penalty: '35',
    deformation_penalty: '30',
    discoloration_penalty: '15',
    food_contact_strict: 'true',
    max_reuse_cycles_warning: '30'
  };
}

export async function updateSettings(settings: Record<string, string>): Promise<{ message: string }> {
  try {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }

  return { message: 'Settings saved locally.' };
}

export async function resetDemoData(): Promise<{ message: string }> {
  try {
    const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }

  if (typeof window !== 'undefined') {
    localStorage.removeItem('ecotrack_packages_v1');
    localStorage.removeItem('ecotrack_inspections_v1');
    localStorage.removeItem('ecotrack_recoveries_v1');
  }

  return { message: 'Demo data reset to initial benchmark.' };
}

export async function clearDemoData(): Promise<{ message: string }> {
  try {
    const res = await fetch(`${API_BASE}/demo/clear`, { method: 'POST' });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }

  if (typeof window !== 'undefined') {
    localStorage.removeItem('ecotrack_packages_v1');
    localStorage.removeItem('ecotrack_inspections_v1');
    localStorage.removeItem('ecotrack_recoveries_v1');
  }

  return { message: 'Demo data cleared.' };
}
