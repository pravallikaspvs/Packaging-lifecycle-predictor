import {
  PackageItem,
  InspectionItem,
  RecoveryRecord,
  OverviewStats,
  RecoveryRecommendationResponse,
  InspectionAnalysisResponse
} from './types';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

export async function fetchOverviewStats(): Promise<OverviewStats> {
  const res = await fetch(`${API_BASE}/stats/overview`);
  if (!res.ok) throw new Error('Failed to load overview analytics');
  return res.json();
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
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.filter_status) query.set('filter_status', params.filter_status);
  if (params?.plastic_type) query.set('plastic_type', params.plastic_type);
  if (params?.sort_by) query.set('sort_by', params.sort_by);
  if (params?.sort_order) query.set('sort_order', params.sort_order);
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.offset) query.set('offset', String(params.offset));

  const res = await fetch(`${API_BASE}/packages?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to load package inventory');
  return res.json();
}

export async function fetchPackageDetail(id: string): Promise<{
  package: PackageItem;
  inspections: InspectionItem[];
  recovery_records: RecoveryRecord[];
  qr_code_data_uri: string;
}> {
  const res = await fetch(`${API_BASE}/packages/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`Failed to load details for package ${id}`);
  return res.json();
}

export async function createPackage(data: Partial<PackageItem>): Promise<{ message: string; package: PackageItem }> {
  const res = await fetch(`${API_BASE}/packages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to create package' }));
    throw new Error(err.detail || 'Failed to create package');
  }
  return res.json();
}

export async function updatePackage(id: string, data: Partial<PackageItem>): Promise<{ message: string; package: PackageItem }> {
  const res = await fetch(`${API_BASE}/packages/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update package details');
  return res.json();
}

export async function deletePackage(id: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/packages/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete package');
  return res.json();
}

export async function analyzePackaging(formData: FormData): Promise<InspectionAnalysisResponse> {
  const res = await fetch(`${API_BASE}/inspect`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Analysis failed' }));
    throw new Error(err.detail || 'Analysis failed');
  }
  return res.json();
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
  const res = await fetch(`${API_BASE}/inspections/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to save inspection' }));
    throw new Error(err.detail || 'Failed to save inspection');
  }
  return res.json();
}

export async function fetchInspections(params?: {
  package_id?: string;
  recommendation?: string;
  limit?: number;
  offset?: number;
}): Promise<{ items: InspectionItem[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.package_id) query.set('package_id', params.package_id);
  if (params?.recommendation) query.set('recommendation', params.recommendation);
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.offset) query.set('offset', String(params.offset));

  const res = await fetch(`${API_BASE}/inspections?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to load inspection history');
  return res.json();
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
  const res = await fetch(`${API_BASE}/recovery/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to calculate recovery recommendation');
  return res.json();
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
  const res = await fetch(`${API_BASE}/recovery/record`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to record recovery decision');
  return res.json();
}

export async function fetchImpactStats() {
  const res = await fetch(`${API_BASE}/stats/impact`);
  if (!res.ok) throw new Error('Failed to load impact stats');
  return res.json();
}

export async function fetchSettings(): Promise<Record<string, string>> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to load settings');
  return res.json();
}

export async function updateSettings(settings: Record<string, string>): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

export async function resetDemoData(): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset demo data');
  return res.json();
}

export async function clearDemoData(): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/demo/clear`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to clear demo data');
  return res.json();
}
