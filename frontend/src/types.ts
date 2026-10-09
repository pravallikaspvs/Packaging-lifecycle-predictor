export interface PackageItem {
  id: string;
  name: string;
  package_type: string; // Bottle, Food Container, Storage Container, Packaging Box, Other
  plastic_type: string; // PET, HDPE, PVC, LDPE, PP, PS, Other, Unknown
  resin_code: number;
  registration_date: string;
  usage_count: number;
  weight_grams: number;
  intended_use: string;
  current_condition: string;
  current_score: number;
  current_recommendation: string; // REUSE CANDIDATE, FURTHER INSPECTION REQUIRED, REPAIR ASSESSMENT, RECYCLING ASSESSMENT, SPECIALIST RECOVERY REVIEW
  recovery_status: string; // Active Circulation, Needs Inspection, Sent for Recycling, Recovery Pending, Repair Assessment
  image_url?: string;
  notes?: string;
  is_demo: number;
  created_at: string;
  updated_at: string;
}

export interface InspectionItem {
  id: string;
  package_id: string;
  inspection_date: string;
  assessment_method: string;
  findings: string[];
  condition_score: number;
  confidence_pct: number;
  recommendation: string;
  rationale: string;
  image_url?: string;
  annotated_image_url?: string;
  image_data_uri?: string;
  annotated_data_uri?: string;
  inspector_notes?: string;
  is_demo: number;
  created_at: string;
}

export interface RecoveryRecord {
  id: string;
  package_id: string;
  decision_date: string;
  priority_level: string;
  recommended_action: string;
  final_outcome: string;
  environmental_rationale: string;
  preparation_steps: string[];
  safety_notes: string;
  facility_info?: string;
  is_verified: number;
  inspector_notes?: string;
  is_demo: number;
  created_at: string;
}

export interface OverviewStats {
  is_demo_data: boolean;
  demo_disclaimer: string;
  summary: {
    total_packages: number;
    suitable_for_reuse: number;
    needs_inspection: number;
    sent_for_recycling: number;
    recovery_pending: number;
    waste_diverted_kg: number;
  };
  lifecycle_distribution: Array<{ name: string; value: number; color: string }>;
  monthly_outcomes: Array<{ month: string; inspected: number; reused: number; recycled: number }>;
  material_distribution: Array<{ material: string; count: number; percentage: number; color: string }>;
  recovery_progress: Array<{ label: string; count: number; total: number; pct: number; color: string }>;
}

export interface RecoveryRecommendationResponse {
  package_id: string;
  priority_level: string;
  recommended_action: string;
  condition_score: number;
  assessment_category: string;
  reasons: string[];
  environmental_rationale: string;
  preparation_steps: string[];
  safety_notes: string[];
  plastic_type: string;
  resin_code: number;
  verified_status: string;
  pathway_steps: Array<{
    step: number;
    title: string;
    status: 'completed' | 'current' | 'pending';
    desc: string;
  }>;
}

export interface InspectionAnalysisResponse {
  package_id: string;
  inspection_timestamp: string;
  assessment_method: string;
  findings: string[];
  condition_score: number;
  confidence_pct: number;
  recommendation: string;
  rationale: string;
  safety_notes: string[];
  image_url?: string;
  annotated_image_url?: string;
  image_data_uri?: string;
  annotated_data_uri?: string;
  is_food_sensitive: boolean;
  disclaimer: string;
}

export type NavView =
  | 'overview'
  | 'inspect'
  | 'inventory'
  | 'passport'
  | 'recovery'
  | 'recycling-guide'
  | 'impact'
  | 'history'
  | 'settings';
