from typing import Dict, Any, List

RESIN_CODES = {
    "PET": 1,
    "HDPE": 2,
    "PVC": 3,
    "LDPE": 4,
    "PP": 5,
    "PS": 6,
    "Other": 7,
    "Unknown": 0
}

def evaluate_package_condition(
    findings: List[str],
    plastic_type: str,
    package_type: str,
    usage_count: int = 0,
    intended_use: str = "General",
    contamination: str = "None",
    config: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Transparent rule-based condition assessment engine.
    Computes condition score (0-100), output category, confidence, and explanation.
    """
    if config is None:
        config = {
            "min_reuse_score": 75,
            "crack_penalty": 35,
            "deformation_penalty": 30,
            "discoloration_penalty": 15,
            "food_contact_strict": True,
            "max_reuse_cycles_warning": 30
        }

    min_reuse_score = int(config.get("min_reuse_score", 75))
    crack_penalty = int(config.get("crack_penalty", 35))
    deformation_penalty = int(config.get("deformation_penalty", 30))
    discoloration_penalty = int(config.get("discoloration_penalty", 15))
    food_strict = str(config.get("food_contact_strict", "true")).lower() == "true"

    base_score = 98
    penalties = 0
    reasons = []
    safety_notes = []

    has_cracks = any("crack" in f.lower() for f in findings)
    has_deformation = any("deformation" in f.lower() or "deformed" in f.lower() for f in findings)
    has_scratches = any("scratch" in f.lower() for f in findings)
    has_discoloration = any("discoloration" in f.lower() or "stain" in f.lower() for f in findings)
    is_unable = any("unable" in f.lower() or "unclear" in f.lower() for f in findings)
    no_damage = any("no obvious" in f.lower() for f in findings) or len(findings) == 0

    if has_cracks:
        penalties += crack_penalty
        reasons.append(f"Visible crack detected (-{crack_penalty} pts): Structural integrity compromised.")
        safety_notes.append("Cracks harbor microbial biofilms and can propagate suddenly under mechanical load.")

    if has_deformation:
        penalties += deformation_penalty
        reasons.append(f"Deformation observed (-{deformation_penalty} pts): Geometric warping may compromise seal or dimensional stability.")
        safety_notes.append("Warped packaging can fail sealing integrity or puncture during handling.")

    if has_scratches:
        penalties += 12
        reasons.append("Surface abrasion / scratches detected (-12 pts): Minor cosmetic wear.")

    if has_discoloration:
        penalties += discoloration_penalty
        reasons.append(f"Discoloration / staining (-{discoloration_penalty} pts): May indicate UV photo-degradation or chemical absorption.")
        safety_notes.append("Discoloration in food containers can reflect chemical migration or plasticizer leaching.")

    if usage_count > 30:
        wear_penalty = min(20, (usage_count - 30) // 2)
        penalties += wear_penalty
        reasons.append(f"High cumulative cycle count ({usage_count} uses, -{wear_penalty} pts): Approaching material fatigue threshold.")

    if contamination.lower() in ["hazardous", "chemical", "severe"]:
        penalties += 45
        reasons.append("Reported hazardous / chemical contamination (-45 pts): Incompatible with standard reuse.")
        safety_notes.append("Hazardous residues prohibit consumer reuse and require specialized decontamination.")

    final_score = max(5, min(100, base_score - penalties))

    # Category determination
    is_food = "food" in package_type.lower() or "food" in intended_use.lower()
    is_unknown_plastic = plastic_type.lower() in ["unknown", "other", ""]

    if is_unable or is_unknown_plastic:
        category = "FURTHER INSPECTION REQUIRED"
        if is_unknown_plastic:
            reasons.append("Plastic resin identification is unknown; resin identification code verification is required before circular routing.")
        confidence = 58.0
    elif has_cracks and is_food:
        # Food package with cracks cannot be reused or easily repaired for food
        category = "RECYCLING ASSESSMENT"
        reasons.append("Food-contact containers with fracture damage are prohibited from direct food reuse due to hygiene risks.")
        confidence = 88.0
    elif has_cracks and not is_food:
        if final_score >= 45:
            category = "REPAIR ASSESSMENT"
            reasons.append("Packaging may be evaluated for non-food industrial reconditioning or ultrasonic plastic welding if non-critical.")
        else:
            category = "RECYCLING ASSESSMENT"
        confidence = 85.0
    elif has_deformation:
        if is_food:
            category = "RECYCLING ASSESSMENT"
            reasons.append("Thermal/mechanical deformation in food containers disrupts hermetic closure; evaluate for polymer recycling.")
        else:
            category = "FURTHER INSPECTION REQUIRED"
            reasons.append("Inspect mechanical fit and pressure tolerance before approving additional circulation.")
        confidence = 82.0
    elif final_score >= min_reuse_score and not has_cracks and not has_deformation:
        category = "REUSE CANDIDATE"
        reasons.append(f"Visible integrity score ({final_score}/100) meets the baseline threshold (≥{min_reuse_score}).")
        reasons.append("Note: 'Reuse Candidate' indicates good external visual condition, not guaranteed microbiological or pressure-rated safety certification.")
        confidence = 91.0
    elif final_score >= 50:
        category = "FURTHER INSPECTION REQUIRED"
        reasons.append("Condition is borderline; requires manual physical inspection, seal testing, or thickness measurement.")
        confidence = 76.0
    elif contamination.lower() in ["hazardous", "chemical"]:
        category = "SPECIALIST RECOVERY REVIEW"
        reasons.append("Contaminants necessitate certified hazardous waste management rather than municipal recycling.")
        confidence = 94.0
    else:
        category = "RECYCLING ASSESSMENT"
        reasons.append("Cumulative physical wear makes continued circulation inefficient. Route for resin recovery.")
        confidence = 86.0

    return {
        "condition_score": final_score,
        "recommendation": category,
        "confidence_pct": confidence,
        "rationale": " ".join(reasons),
        "reasons": reasons,
        "safety_notes": safety_notes,
        "is_food_sensitive": is_food,
        "plastic_type": plastic_type,
        "resin_code": RESIN_CODES.get(plastic_type, 0)
    }

def get_eco_first_recovery_pathway(
    package_id: str,
    plastic_type: str,
    package_type: str,
    visible_condition: str,
    findings: List[str],
    contamination: str = "None",
    intended_use: str = "General",
    local_acceptance: str = "Unverified",
    usage_count: int = 0
) -> Dict[str, Any]:
    """
    Eco-First Recovery Advisor Engine based on the 5-Priority Hierarchy:
    ASSESS -> REUSE -> REPAIR -> RECYCLE -> AUTHORIZED RECOVERY -> RESPONSIBLE DISPOSAL
    """
    cond_eval = evaluate_package_condition(
        findings=findings,
        plastic_type=plastic_type,
        package_type=package_type,
        usage_count=usage_count,
        intended_use=intended_use,
        contamination=contamination
    )

    score = cond_eval["condition_score"]
    category = cond_eval["recommendation"]
    has_cracks = any("crack" in f.lower() for f in findings)
    has_deformation = any("deformation" in f.lower() or "deformed" in f.lower() for f in findings)
    is_food = cond_eval["is_food_sensitive"]
    is_unknown = plastic_type.lower() in ["unknown", "other", ""]

    pathway_steps = [
        {"step": 1, "title": "Assess", "status": "completed", "desc": "Visual & technical integrity evaluation"},
        {"step": 2, "title": "Reuse", "status": "pending", "desc": "Clean and re-enter circulation"},
        {"step": 3, "title": "Repair", "status": "pending", "desc": "Recondition or re-fit closures"},
        {"step": 4, "title": "Recycle", "status": "pending", "desc": "Mechanical or chemical polymer reprocessing"},
        {"step": 5, "title": "Authorized Recovery", "status": "pending", "desc": "Specialist material recovery"}
    ]

    action = ""
    priority_level = ""
    environmental_rationale = ""
    preparation_steps = []
    safety_notes = []
    verified_status = "General Rule"

    if is_unknown:
        priority_level = "PRIORITY 0: IDENTIFICATION REQUIRED"
        action = "SPECIALIST MATERIAL IDENTIFICATION"
        environmental_rationale = "Unidentified polymers cannot be safely recycled or reused without risk of cross-contaminating polymer streams (e.g., PVC contaminating PET melt)."
        preparation_steps = [
            "Inspect container bottom or sides for stamped SPI resin identification triangle (codes 1-7).",
            "If unmarked, segregate in an unclassified container batch for NIR (Near-Infrared) sorting.",
            "Do not mix with known mono-material bales."
        ]
        safety_notes.append("Never burn or melt unidentified plastics for identification due to toxic fume release.")
        pathway_steps[0]["status"] = "current"

    elif category == "REUSE CANDIDATE" and not has_cracks and not has_deformation:
        priority_level = "PRIORITY 1: REUSE"
        action = "PREPARE FOR RECIRCULATION"
        pathway_steps[1]["status"] = "current"
        environmental_rationale = "Reusing an existing plastic container avoids 100% of the virgin resin extraction, compounding energy, and manufacturing emissions required to produce a new unit."
        preparation_steps = [
            "Wash thoroughly using food-grade detergent or hot sanitization rinse (≤65°C for PET to avoid thermal distortion).",
            "Perform leak inspection with water test or pressure closure check.",
            "Scan or print updated digital Reuse Passport label with incremented cycle count.",
            "Re-enter distribution fleet for verified intended service."
        ]
        safety_notes.append("Confirm container has not held non-food industrial fluids if previously designated for food-contact.")
        verified_status = "Verified Heuristic"

    elif category == "REPAIR ASSESSMENT" and not is_food:
        priority_level = "PRIORITY 2: REPAIR"
        action = "TECHNICAL REPAIR & RECONDITIONING"
        pathway_steps[2]["status"] = "current"
        environmental_rationale = "Component replacement or non-structural reconditioning extends container asset lifetime, keeping raw material in high-utility service."
        preparation_steps = [
            "Inspect replaceable parts: replace gaskets, o-rings, or threaded caps with compatible certified parts.",
            "If superficial crack is on non-pressurized outer flange, evaluate sonic hot-air plastic welding with matched filler rod.",
            "Conduct proof-load testing prior to re-entering industrial logistics."
        ]
        safety_notes.append("Repairs must NOT compromise structural safety. Repaired items must not be re-allocated to food-contact or hazardous chemical containment.")
        verified_status = "General Rule"

    elif category in ["RECYCLING ASSESSMENT", "REPAIR ASSESSMENT"] or has_cracks or has_deformation:
        priority_level = "PRIORITY 3: RECYCLE"
        pathway_steps[3]["status"] = "current"
        if local_acceptance.lower() == "yes":
            action = f"ROUTE TO LOCAL {plastic_type} RECYCLING FACILITY"
            environmental_rationale = f"Mechanical flake recycling of {plastic_type} preserves polymer value, deflecting demand for virgin petroleum feedstock."
            preparation_steps = [
                f"Empty completely and rinse residual liquid/contents to eliminate organic contamination.",
                "Remove non-compatible adhesive labels, metal handles, or non-matching caps if requested by facility.",
                f"Place in dedicated {plastic_type} bale or municipal rigid plastics bin.",
                "Log recycling outcome in EcoTrack AI inventory to update divert metrics."
            ]
            verified_status = "Facility Acceptance Verified"
        elif local_acceptance.lower() == "no":
            priority_level = "PRIORITY 4: AUTHORIZED RECOVERY"
            action = "CONTACT AUTHORIZED INDUSTRIAL RECOVERY FACILITY"
            pathway_steps[4]["status"] = "current"
            environmental_rationale = f"Because local municipal systems do not process {plastic_type}, specialized industrial collectors can aggregate commercial-scale volumes for secondary industrial molding or chemical pyrolysis."
            preparation_steps = [
                f"Store clean {plastic_type} packaging in dry aggregate hopper.",
                "Schedule periodic pickup with authorized regional plastics reprocessor.",
                "Obtain chain-of-custody transfer manifest for compliance auditing."
            ]
            safety_notes.append("Do not discard in municipal landfill or mixed refuse streams where sorting is unavailable.")
        else:
            action = f"CHECK LOCAL {plastic_type} RECYCLING ACCEPTANCE"
            environmental_rationale = f"Visible structural damage prevents safe reuse. However, recycling availability for {plastic_type} varies significantly by municipal jurisdiction and local sorting infrastructure."
            preparation_steps = [
                f"Confirm whether your local municipality or waste management provider accepts rigid #{RESIN_CODES.get(plastic_type, '')} {plastic_type}.",
                "Check with your local municipal waste-management service or authorized recycler.",
                "If accepted, rinse clean, remove conflicting closures, and deposit in designated collection stream.",
                "If rejected locally, consult secondary commercial waste consolidators."
            ]
            safety_notes.append("Do not assume every item bearing a recycling triangle is collected curbside.")

    elif contamination.lower() in ["hazardous", "chemical"]:
        priority_level = "PRIORITY 4: AUTHORIZED RECOVERY"
        action = "HAZARDOUS MATERIAL DISPOSAL & RECOVERY"
        pathway_steps[4]["status"] = "current"
        environmental_rationale = "Packaging exposed to chemical residues or regulated substances requires controlled thermal recovery or certified industrial decontamination to prevent environmental leaching."
        preparation_steps = [
            "Do not rinse into municipal wastewater or storm drains.",
            "Seal packaging securely with chemical-resistant tape.",
            "Transfer to licensed hazardous waste contractor with safety data sheet documentation."
        ]
        safety_notes.append("Open dumping, uncontrolled burning, or unauthorized burial causes severe toxic emissions.")
    else:
        priority_level = "PRIORITY 5: RESPONSIBLE DISPOSAL GUIDANCE"
        action = "FOLLOW LOCAL AUTHORIZED WASTE GUIDANCE"
        pathway_steps[4]["status"] = "current"
        environmental_rationale = "When no circular pathway is presently viable, authorized containment minimizes environmental dispersion and microplastic pollution."
        preparation_steps = [
            "Check municipal bulk non-recyclable solid waste protocols.",
            "Discourage littering, open burning, and uncontrolled chemical treatment.",
            "Do not mix incompatible plastic waste types."
        ]

    return {
        "package_id": package_id,
        "priority_level": priority_level,
        "recommended_action": action,
        "condition_score": score,
        "assessment_category": category,
        "reasons": cond_eval["reasons"],
        "environmental_rationale": environmental_rationale,
        "preparation_steps": preparation_steps,
        "safety_notes": safety_notes,
        "plastic_type": plastic_type,
        "resin_code": RESIN_CODES.get(plastic_type, 0),
        "verified_status": verified_status,
        "pathway_steps": pathway_steps
    }
