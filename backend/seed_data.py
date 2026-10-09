import json
from datetime import datetime, timedelta
from database import get_connection, init_db

def seed_sample_data(force: bool = False):
    init_db()
    conn = get_connection()
    cursor = conn.cursor()

    # Check if data already exists
    cursor.execute("SELECT COUNT(*) as cnt FROM packages")
    row = cursor.fetchone()
    if row["cnt"] > 0 and not force:
        conn.close()
        return

    if force:
        cursor.execute("DELETE FROM recovery_records WHERE is_demo = 1")
        cursor.execute("DELETE FROM inspections WHERE is_demo = 1")
        cursor.execute("DELETE FROM packages WHERE is_demo = 1")

    now = datetime.now()
    d_now = now.strftime("%Y-%m-%d")
    d_prev1 = (now - timedelta(days=12)).strftime("%Y-%m-%d")
    d_prev2 = (now - timedelta(days=34)).strftime("%Y-%m-%d")
    d_prev3 = (now - timedelta(days=60)).strftime("%Y-%m-%d")

    # The 5 primary showcase packages specified in Requirement 16:
    packages = [
        {
            "id": "PKG-PET-1001",
            "name": "Beverage Bottle (500ml)",
            "package_type": "Bottle",
            "plastic_type": "PET",
            "resin_code": 1,
            "registration_date": d_prev3,
            "usage_count": 8,
            "weight_grams": 45.0,
            "intended_use": "Food & Beverage",
            "current_condition": "Normal Surface",
            "current_score": 96,
            "current_recommendation": "REUSE CANDIDATE",
            "recovery_status": "Active Circulation",
            "image_url": "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500&auto=format&fit=crop&q=80",
            "notes": "Standard returnable beverage container with tamper-evident neck band. Cleaned and intact.",
            "is_demo": 1
        },
        {
            "id": "PKG-HDP-2042",
            "name": "Detergent Jug (2L)",
            "package_type": "Storage Container",
            "plastic_type": "HDPE",
            "resin_code": 2,
            "registration_date": d_prev2,
            "usage_count": 14,
            "weight_grams": 110.0,
            "intended_use": "Household Chemistry",
            "current_condition": "Moderate Surface Wear",
            "current_score": 68,
            "current_recommendation": "FURTHER INSPECTION REQUIRED",
            "recovery_status": "Needs Inspection",
            "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80",
            "notes": "Handle joint shows minor stress-whitening. Requires manual flex testing before next fill.",
            "is_demo": 1
        },
        {
            "id": "PKG-PP-3088",
            "name": "Meal Prep Container (750ml)",
            "package_type": "Food Container",
            "plastic_type": "PP",
            "resin_code": 5,
            "registration_date": d_prev2,
            "usage_count": 22,
            "weight_grams": 62.0,
            "intended_use": "Food & Beverage",
            "current_condition": "Sidewall Deformation",
            "current_score": 42,
            "current_recommendation": "RECYCLING ASSESSMENT",
            "recovery_status": "Sent for Recycling",
            "image_url": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80",
            "notes": "Corner warped due to excessive commercial microwave heating; hermetic lid seal no longer closes.",
            "is_demo": 1
        },
        {
            "id": "PKG-UNK-4015",
            "name": "Imported Logistics Tray",
            "package_type": "Packaging Box",
            "plastic_type": "Unknown",
            "resin_code": 0,
            "registration_date": d_prev1,
            "usage_count": 4,
            "weight_grams": 230.0,
            "intended_use": "Warehouse Logistics",
            "current_condition": "Unclassified Polymer",
            "current_score": 55,
            "current_recommendation": "FURTHER INSPECTION REQUIRED",
            "recovery_status": "Needs Inspection",
            "image_url": "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=500&auto=format&fit=crop&q=80",
            "notes": "No stamped SPI triangle code. Requires optical spectrometer identification before disposal.",
            "is_demo": 1
        },
        {
            "id": "PKG-LDP-5120",
            "name": "Bulk Film Liner Tarp",
            "package_type": "Other",
            "plastic_type": "LDPE",
            "resin_code": 4,
            "registration_date": d_prev3,
            "usage_count": 31,
            "weight_grams": 180.0,
            "intended_use": "Industrial Pallet Protection",
            "current_condition": "Torn Flange & Heavy Scuffs",
            "current_score": 38,
            "current_recommendation": "SPECIALIST RECOVERY REVIEW",
            "recovery_status": "Recovery Pending",
            "image_url": "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&auto=format&fit=crop&q=80",
            "notes": "Extensive puncture tears near anchor points. Sent to Eco-First Advisor for municipal or recovery routing.",
            "is_demo": 1
        },
        {
            "id": "PKG-PET-6211",
            "name": "Cold Pressed Juice Bottle (350ml)",
            "package_type": "Bottle",
            "plastic_type": "PET",
            "resin_code": 1,
            "registration_date": d_prev1,
            "usage_count": 6,
            "weight_grams": 38.0,
            "intended_use": "Food & Beverage",
            "current_condition": "Surface Intact",
            "current_score": 94,
            "current_recommendation": "REUSE CANDIDATE",
            "recovery_status": "Active Circulation",
            "image_url": "https://images.unsplash.com/photo-1589365278144-c9e705f843ba?w=500&auto=format&fit=crop&q=80",
            "notes": "High transparency, zero cracks, washed at 55°C certified cycle.",
            "is_demo": 1
        },
        {
            "id": "PKG-HDP-7319",
            "name": "Chemical Drum Carboy (10L)",
            "package_type": "Storage Container",
            "plastic_type": "HDPE",
            "resin_code": 2,
            "registration_date": d_prev2,
            "usage_count": 19,
            "weight_grams": 650.0,
            "intended_use": "Agricultural Solutions",
            "current_condition": "Deep Scuff on Corner",
            "current_score": 52,
            "current_recommendation": "REPAIR ASSESSMENT",
            "recovery_status": "Repair Assessment",
            "image_url": "https://images.unsplash.com/photo-1618220179428-22790b461013?w=500&auto=format&fit=crop&q=80",
            "notes": "Non-penetrating scuff on reinforced rib. Qualified for secondary non-hazardous storage after pressure test.",
            "is_demo": 1
        }
    ]

    for p in packages:
        cursor.execute("""
        INSERT OR REPLACE INTO packages (
            id, name, package_type, plastic_type, resin_code, registration_date,
            usage_count, weight_grams, intended_use, current_condition, current_score,
            current_recommendation, recovery_status, image_url, notes, is_demo,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            p["id"], p["name"], p["package_type"], p["plastic_type"], p["resin_code"],
            p["registration_date"], p["usage_count"], p["weight_grams"], p["intended_use"],
            p["current_condition"], p["current_score"], p["current_recommendation"],
            p["recovery_status"], p["image_url"], p["notes"], p["is_demo"],
            p["registration_date"], d_now
        ))

    # Seed inspections
    inspections = [
        {
            "id": "INS-2026-001",
            "package_id": "PKG-PET-1001",
            "inspection_date": d_prev1,
            "assessment_method": "OpenCV Surface Vision Heuristics",
            "findings": json.dumps(["No obvious visible damage detected"]),
            "condition_score": 96,
            "confidence_pct": 92.5,
            "recommendation": "REUSE CANDIDATE",
            "rationale": "Visible integrity score (96/100) meets the baseline threshold (>=75). No fractures, clouding, or geometric warping observed.",
            "inspector_notes": "Sample demo inspection record. Passed automatic optical scan.",
            "is_demo": 1
        },
        {
            "id": "INS-2026-002",
            "package_id": "PKG-HDP-2042",
            "inspection_date": d_prev2,
            "assessment_method": "OpenCV Surface Vision Heuristics + Manual Audit",
            "findings": json.dumps(["Surface scratches detected (4 abrasion marks)", "Stress discoloration at handle"]),
            "condition_score": 68,
            "confidence_pct": 78.0,
            "recommendation": "FURTHER INSPECTION REQUIRED",
            "rationale": "Condition score 68 is below safe reuse threshold. Stress whitening on handle base warrants manual flex resistance test.",
            "inspector_notes": "Demo record. Pending technician verification.",
            "is_demo": 1
        },
        {
            "id": "INS-2026-003",
            "package_id": "PKG-PP-3088",
            "inspection_date": d_prev2,
            "assessment_method": "OpenCV Surface Vision Heuristics",
            "findings": json.dumps(["Geometric deformation / sidewall denting detected", "Discoloration / uneven surface staining observed"]),
            "condition_score": 42,
            "confidence_pct": 86.4,
            "recommendation": "RECYCLING ASSESSMENT",
            "rationale": "Thermal/mechanical deformation in food containers disrupts hermetic closure; evaluate for polymer recycling.",
            "inspector_notes": "Demo record. Container deformed by microwave heating.",
            "is_demo": 1
        },
        {
            "id": "INS-2026-004",
            "package_id": "PKG-UNK-4015",
            "inspection_date": d_prev1,
            "assessment_method": "Manual Visual & Sensor Inspection",
            "findings": json.dumps(["Plastic resin identification is unknown", "Unable to determine polymer grade"]),
            "condition_score": 55,
            "confidence_pct": 58.0,
            "recommendation": "FURTHER INSPECTION REQUIRED",
            "rationale": "Plastic resin identification is unknown; resin identification code verification is required before circular routing.",
            "inspector_notes": "Demo record. Stamped SPI triangle not found.",
            "is_demo": 1
        },
        {
            "id": "INS-2026-005",
            "package_id": "PKG-LDP-5120",
            "inspection_date": d_prev3,
            "assessment_method": "OpenCV Surface Vision Heuristics",
            "findings": json.dumps(["Visible cracks detected (2 fracture zones)", "Surface scratches detected (8 abrasion marks)"]),
            "condition_score": 38,
            "confidence_pct": 89.0,
            "recommendation": "SPECIALIST RECOVERY REVIEW",
            "rationale": "Extensive puncture tears near anchor points. Structural integrity cannot support another load.",
            "inspector_notes": "Demo record. Transferred to Eco-First Advisor for recovery recommendation.",
            "is_demo": 1
        }
    ]

    for ins in inspections:
        cursor.execute("""
        INSERT OR REPLACE INTO inspections (
            id, package_id, inspection_date, assessment_method, findings,
            condition_score, confidence_pct, recommendation, rationale,
            inspector_notes, is_demo, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            ins["id"], ins["package_id"], ins["inspection_date"], ins["assessment_method"],
            ins["findings"], ins["condition_score"], ins["confidence_pct"], ins["recommendation"],
            ins["rationale"], ins["inspector_notes"], ins["is_demo"], ins["inspection_date"]
        ))

    # Seed recovery decisions
    recoveries = [
        {
            "id": "REC-2026-001",
            "package_id": "PKG-PP-3088",
            "decision_date": d_prev1,
            "priority_level": "PRIORITY 3: RECYCLE",
            "recommended_action": "ROUTE TO LOCAL PP RECYCLING FACILITY",
            "final_outcome": "Sent for Mechanical Flake Recycling",
            "environmental_rationale": "Mechanical flake recycling of PP preserves polymer value, deflecting demand for virgin petroleum feedstock.",
            "preparation_steps": json.dumps([
                "Empty completely and rinse residual liquid/contents to eliminate organic contamination.",
                "Remove silicone gasket from lid if present.",
                "Deposit into clean rigid PP recycling batch."
            ]),
            "safety_notes": "Do not attempt home repair on warped food containers.",
            "facility_info": "Metro CleanPlast Municipal Sorting Hub #4",
            "is_verified": 1,
            "inspector_notes": "Demo recovery decision recorded.",
            "is_demo": 1
        }
    ]

    for rec in recoveries:
        cursor.execute("""
        INSERT OR REPLACE INTO recovery_records (
            id, package_id, decision_date, priority_level, recommended_action,
            final_outcome, environmental_rationale, preparation_steps, safety_notes,
            facility_info, is_verified, inspector_notes, is_demo, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            rec["id"], rec["package_id"], rec["decision_date"], rec["priority_level"],
            rec["recommended_action"], rec["final_outcome"], rec["environmental_rationale"],
            rec["preparation_steps"], rec["safety_notes"], rec["facility_info"],
            rec["is_verified"], rec["inspector_notes"], rec["is_demo"], rec["decision_date"]
        ))

    conn.commit()
    conn.close()
    print("Database seeded with sample demo data successfully.")

if __name__ == "__main__":
    seed_sample_data(force=True)
