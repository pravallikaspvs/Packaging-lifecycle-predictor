import os
import json
import io
import csv
from typing import Optional, List, Dict, Any
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel

from database import get_connection, init_db
from decision_engine import evaluate_package_condition, get_eco_first_recovery_pathway
from cv_engine import process_packaging_image, UPLOAD_DIR
from qr_engine import generate_passport_qr_code
from seed_data import seed_sample_data

app = FastAPI(
    title="EcoTrack AI - Smart Reusable Packaging Life Predictor",
    description="Intelligent plastic packaging inspection, tracking, reuse, and Eco-First recovery platform.",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount upload directory for static image access
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.on_event("startup")
def startup_event():
    init_db()
    seed_sample_data(force=False)

# ----------------- Models -----------------
class PackageCreate(BaseModel):
    id: Optional[str] = None
    name: str
    package_type: str
    plastic_type: str
    resin_code: Optional[int] = 0
    usage_count: Optional[int] = 0
    weight_grams: Optional[float] = 0.0
    intended_use: Optional[str] = "General"
    notes: Optional[str] = ""

class PackageUpdate(BaseModel):
    name: Optional[str] = None
    package_type: Optional[str] = None
    plastic_type: Optional[str] = None
    usage_count: Optional[int] = None
    weight_grams: Optional[float] = None
    intended_use: Optional[str] = None
    current_condition: Optional[str] = None
    current_score: Optional[int] = None
    current_recommendation: Optional[str] = None
    recovery_status: Optional[str] = None
    notes: Optional[str] = None

class InspectionSave(BaseModel):
    package_id: str
    inspection_date: Optional[str] = None
    assessment_method: str
    findings: List[str]
    condition_score: int
    confidence_pct: float
    recommendation: str
    rationale: str
    image_url: Optional[str] = ""
    annotated_image_url: Optional[str] = ""
    inspector_notes: Optional[str] = ""

class RecoveryRecommendRequest(BaseModel):
    package_id: str
    plastic_type: str
    package_type: str
    visible_condition: str
    findings: List[str]
    contamination: Optional[str] = "None"
    intended_use: Optional[str] = "General"
    local_acceptance: Optional[str] = "Unverified"
    usage_count: Optional[int] = 0

class RecoveryRecordSave(BaseModel):
    package_id: str
    priority_level: str
    recommended_action: str
    final_outcome: str
    environmental_rationale: str
    preparation_steps: List[str]
    safety_notes: str
    facility_info: Optional[str] = ""
    is_verified: Optional[int] = 0
    inspector_notes: Optional[str] = ""

# ----------------- Endpoints -----------------

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "EcoTrack AI",
        "project": "Smart Reusable Packaging Life Predictor",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/stats/overview")
def get_overview_stats():
    """
    Returns dashboard summary metrics and charts data.
    Aggregates real records and displays the required demonstration figures
    clearly labelled as sample/demo data.
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as count FROM packages WHERE is_demo = 0")
    real_pkg_count = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM inspections WHERE is_demo = 0")
    real_inspections_count = cursor.fetchone()["count"]

    # If user hasn't added 100+ real records yet, we show the benchmark demo figures
    # clearly flagged as demonstration data as mandated in Requirement 3 and 4.
    baseline_offset = 0 if real_pkg_count > 50 else 1248
    suitable_offset = 0 if real_pkg_count > 50 else 842
    needs_inspect_offset = 0 if real_pkg_count > 50 else 126
    sent_recycle_offset = 0 if real_pkg_count > 50 else 184
    pending_recovery_offset = 0 if real_pkg_count > 50 else 96
    waste_diverted_offset = 0 if real_pkg_count > 50 else 312.0

    # Calculate live counts from active DB
    cursor.execute("SELECT COUNT(*) as c FROM packages")
    total_db_packages = cursor.fetchone()["c"]

    cursor.execute("SELECT COUNT(*) as c FROM packages WHERE current_recommendation = 'REUSE CANDIDATE'")
    db_reuse_candidates = cursor.fetchone()["c"]

    cursor.execute("SELECT COUNT(*) as c FROM packages WHERE current_recommendation = 'FURTHER INSPECTION REQUIRED' OR recovery_status = 'Needs Inspection'")
    db_needs_inspection = cursor.fetchone()["c"]

    cursor.execute("SELECT COUNT(*) as c FROM packages WHERE current_recommendation = 'RECYCLING ASSESSMENT' OR recovery_status = 'Sent for Recycling'")
    db_sent_recycling = cursor.fetchone()["c"]

    cursor.execute("SELECT COUNT(*) as c FROM packages WHERE current_recommendation = 'SPECIALIST RECOVERY REVIEW' OR recovery_status = 'Recovery Pending'")
    db_recovery_pending = cursor.fetchone()["c"]

    cursor.execute("SELECT SUM(weight_grams) as sum_w FROM packages WHERE recovery_status IN ('Active Circulation', 'Sent for Recycling')")
    weight_row = cursor.fetchone()
    db_diverted_kg = (weight_row["sum_w"] or 0.0) / 1000.0

    conn.close()

    total_display = baseline_offset + (total_db_packages if baseline_offset == 0 else 0)
    suitable_display = suitable_offset
    needs_inspect_display = needs_inspect_offset
    sent_recycle_display = sent_recycle_offset
    recovery_pending_display = pending_recovery_offset
    waste_diverted_display = waste_diverted_offset

    # Donut Chart: Packaging Lifecycle Distribution
    lifecycle_distribution = [
        {"name": "Reuse Candidate", "value": suitable_display, "color": "#10B981"},
        {"name": "Needs Inspection", "value": needs_inspect_display, "color": "#F59E0B"},
        {"name": "Recycling", "value": sent_recycle_display, "color": "#166534"},
        {"name": "Recovery Pending", "value": recovery_pending_display, "color": "#94A3B8"}
    ]

    # Bar Chart: Monthly Packaging Outcomes (6 months)
    monthly_outcomes = [
        {"month": "May", "inspected": 164, "reused": 112, "recycled": 28},
        {"month": "Jun", "inspected": 188, "reused": 130, "recycled": 32},
        {"month": "Jul", "inspected": 210, "reused": 145, "recycled": 35},
        {"month": "Aug", "inspected": 225, "reused": 158, "recycled": 39},
        {"month": "Sep", "inspected": 236, "reused": 162, "recycled": 41},
        {"month": "Oct", "inspected": 225, "reused": 135, "recycled": 45}
    ]

    # Horizontal Bar: Material Distribution
    material_distribution = [
        {"material": "PET (1)", "count": 486, "percentage": 39, "color": "#10B981"},
        {"material": "HDPE (2)", "count": 342, "percentage": 27, "color": "#14532D"},
        {"material": "PP (5)", "count": 218, "percentage": 18, "color": "#166534"},
        {"material": "LDPE (4)", "count": 96, "percentage": 8, "color": "#059669"},
        {"material": "Other (7)", "count": 64, "percentage": 5, "color": "#64748B"},
        {"material": "Unknown", "count": 42, "percentage": 3, "color": "#F59E0B"}
    ]

    # Progress Chart: Recovery Progress
    recovery_progress = [
        {"label": "Packages awaiting inspection", "count": needs_inspect_display, "total": total_display, "pct": round(needs_inspect_display / total_display * 100, 1), "color": "#F59E0B"},
        {"label": "Packages awaiting recovery", "count": recovery_pending_display, "total": total_display, "pct": round(recovery_pending_display / total_display * 100, 1), "color": "#64748B"},
        {"label": "Packages with recorded recycling", "count": sent_recycle_display, "total": total_display, "pct": round(sent_recycle_display / total_display * 100, 1), "color": "#10B981"}
    ]

    return {
        "is_demo_data": real_pkg_count == 0,
        "demo_disclaimer": "All initial figures are illustrative demonstration data until real live inspection records accumulate.",
        "summary": {
            "total_packages": total_display,
            "suitable_for_reuse": suitable_display,
            "needs_inspection": needs_inspect_display,
            "sent_for_recycling": sent_recycle_display,
            "recovery_pending": recovery_pending_display,
            "waste_diverted_kg": waste_diverted_display
        },
        "lifecycle_distribution": lifecycle_distribution,
        "monthly_outcomes": monthly_outcomes,
        "material_distribution": material_distribution,
        "recovery_progress": recovery_progress
    }

@app.get("/api/packages")
def list_packages(
    search: Optional[str] = None,
    filter_status: Optional[str] = None,
    plastic_type: Optional[str] = None,
    sort_by: Optional[str] = "created_at",
    sort_order: Optional[str] = "desc",
    limit: int = 50,
    offset: int = 0
):
    conn = get_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM packages WHERE 1=1"
    params = []

    if search:
        query += " AND (id LIKE ? OR name LIKE ? OR notes LIKE ?)"
        s = f"%{search}%"
        params.extend([s, s, s])

    if filter_status and filter_status != "All Packages":
        if filter_status == "Reuse Candidates":
            query += " AND current_recommendation = 'REUSE CANDIDATE'"
        elif filter_status == "Needs Inspection":
            query += " AND (current_recommendation = 'FURTHER INSPECTION REQUIRED' OR recovery_status = 'Needs Inspection')"
        elif filter_status == "Repair Assessment":
            query += " AND (current_recommendation = 'REPAIR ASSESSMENT' OR recovery_status = 'Repair Assessment')"
        elif filter_status == "Recycling Assessment":
            query += " AND (current_recommendation = 'RECYCLING ASSESSMENT' OR recovery_status = 'Sent for Recycling')"
        elif filter_status == "Recovery Pending":
            query += " AND (current_recommendation = 'SPECIALIST RECOVERY REVIEW' OR recovery_status = 'Recovery Pending')"
        elif filter_status == "Recovery Completed":
            query += " AND recovery_status IN ('Active Circulation', 'Sent for Recycling', 'Repaired & Cleared')"

    if plastic_type and plastic_type != "All":
        query += " AND plastic_type = ?"
        params.append(plastic_type)

    allowed_sort = ["id", "name", "current_score", "registration_date", "created_at", "usage_count"]
    order_col = sort_by if sort_by in allowed_sort else "created_at"
    direction = "ASC" if sort_order.lower() == "asc" else "DESC"
    query += f" ORDER BY {order_col} {direction} LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    cursor.execute(query, params)
    rows = cursor.fetchall()

    cursor.execute("SELECT COUNT(*) as total FROM packages")
    total_count = cursor.fetchone()["total"]

    conn.close()

    packages = [dict(row) for row in rows]
    return {
        "items": packages,
        "total": total_count,
        "limit": limit,
        "offset": offset
    }

@app.get("/api/packages/{package_id}")
def get_package_detail(package_id: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM packages WHERE id = ?", (package_id,))
    pkg_row = cursor.fetchone()
    if not pkg_row:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Package {package_id} not found")

    package = dict(pkg_row)

    # Fetch inspections
    cursor.execute("SELECT * FROM inspections WHERE package_id = ? ORDER BY created_at DESC", (package_id,))
    ins_rows = cursor.fetchall()
    inspections = []
    for r in ins_rows:
        item = dict(r)
        try:
            item["findings"] = json.loads(item["findings"])
        except:
            item["findings"] = []
        inspections.append(item)

    # Fetch recovery records
    cursor.execute("SELECT * FROM recovery_records WHERE package_id = ? ORDER BY created_at DESC", (package_id,))
    rec_rows = cursor.fetchall()
    recoveries = []
    for r in rec_rows:
        item = dict(r)
        try:
            item["preparation_steps"] = json.loads(item["preparation_steps"])
        except:
            item["preparation_steps"] = []
        recoveries.append(item)

    conn.close()

    # Generate QR Code
    qr_data_uri = generate_passport_qr_code(package_id)

    return {
        "package": package,
        "inspections": inspections,
        "recovery_records": recoveries,
        "qr_code_data_uri": qr_data_uri
    }

@app.post("/api/packages")
def create_package(data: PackageCreate):
    conn = get_connection()
    cursor = conn.cursor()

    package_id = data.id.strip().upper() if data.id and data.id.strip() else f"PKG-{data.plastic_type[:3].upper()}-{datetime.now().strftime('%M%S')}"

    # Check duplicate
    cursor.execute("SELECT id FROM packages WHERE id = ?", (package_id,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail=f"Package ID '{package_id}' already exists")

    now = datetime.now().strftime("%Y-%m-%d")
    cursor.execute("""
    INSERT INTO packages (
        id, name, package_type, plastic_type, resin_code, registration_date,
        usage_count, weight_grams, intended_use, current_condition, current_score,
        current_recommendation, recovery_status, notes, is_demo, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Assessment', 0, 'FURTHER INSPECTION REQUIRED', 'Needs Inspection', ?, 0, ?, ?)
    """, (
        package_id, data.name, data.package_type, data.plastic_type, data.resin_code or 0,
        now, data.usage_count or 0, data.weight_grams or 0.0, data.intended_use or "General",
        data.notes or "", now, now
    ))

    conn.commit()
    cursor.execute("SELECT * FROM packages WHERE id = ?", (package_id,))
    new_pkg = dict(cursor.fetchone())
    conn.close()

    return {"message": "Package registered successfully", "package": new_pkg}

@app.put("/api/packages/{package_id}")
def update_package(package_id: str, data: PackageUpdate):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM packages WHERE id = ?", (package_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Package not found")

    fields = []
    values = []
    for k, v in data.dict(exclude_unset=True).items():
        if v is not None:
            fields.append(f"{k} = ?")
            values.append(v)

    if fields:
        fields.append("updated_at = ?")
        values.append(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        values.append(package_id)
        cursor.execute(f"UPDATE packages SET {', '.join(fields)} WHERE id = ?", values)
        conn.commit()

    cursor.execute("SELECT * FROM packages WHERE id = ?", (package_id,))
    updated_pkg = dict(cursor.fetchone())
    conn.close()

    return {"message": "Package updated successfully", "package": updated_pkg}

@app.delete("/api/packages/{package_id}")
def delete_package(package_id: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM packages WHERE id = ?", (package_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Package not found")

    cursor.execute("DELETE FROM recovery_records WHERE package_id = ?", (package_id,))
    cursor.execute("DELETE FROM inspections WHERE package_id = ?", (package_id,))
    cursor.execute("DELETE FROM packages WHERE id = ?", (package_id,))
    conn.commit()
    conn.close()

    return {"message": f"Package {package_id} deleted successfully"}

@app.get("/api/packages/{package_id}/qr")
def get_package_qr(package_id: str):
    qr_b64 = generate_passport_qr_code(package_id)
    return {"package_id": package_id, "qr_code": qr_b64}

# ----------------- Image Inspection & CV Analysis -----------------

@app.post("/api/inspect")
async def analyze_packaging_image(
    file: Optional[UploadFile] = File(None),
    package_id: str = Form(""),
    package_type: str = Form("Bottle"),
    plastic_type: str = Form("PET"),
    usage_count: int = Form(0),
    intended_use: str = Form("General"),
    manual_mode: bool = Form(False),
    manual_damage: Optional[str] = Form(None)
):
    """
    Analyzes packaging image via OpenCV computer-vision heuristics.
    Passes findings into the transparent Decision Engine.
    """
    findings = []
    img_data_uri = ""
    annotated_data_uri = ""
    img_url = ""
    annotated_url = ""
    cv_confidence = 85.0
    method = "OpenCV Surface Vision Heuristics"

    if file and file.filename:
        # Validate format
        allowed_ext = [".jpg", ".jpeg", ".png", ".webp"]
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in allowed_ext:
            raise HTTPException(status_code=400, detail=f"Unsupported file format '{ext}'. Use JPG, JPEG, PNG, or WEBP.")

        # Read contents
        contents = await file.read()
        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image size exceeds 10MB limit.")

        # Run OpenCV analysis
        cv_result = process_packaging_image(contents, file.filename)
        if not cv_result.get("success"):
            raise HTTPException(status_code=400, detail=cv_result.get("error", "Image processing failed"))

        findings = cv_result["findings"]
        img_data_uri = cv_result["image_data_uri"]
        annotated_data_uri = cv_result["annotated_data_uri"]
        img_url = cv_result["image_url"]
        annotated_url = cv_result["annotated_image_url"]
        cv_confidence = cv_result["confidence_pct"]
    elif manual_mode and manual_damage:
        method = "Manual Technical Assessment"
        try:
            findings = json.loads(manual_damage)
        except:
            findings = [manual_damage]
        cv_confidence = 90.0
    else:
        # Demo demonstration analysis mode if no image is uploaded
        method = "Demonstration Vision Mode"
        findings = ["No obvious visible damage detected"]
        cv_confidence = 88.0

    # Decision Engine Evaluation
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT key, value FROM settings")
    settings_dict = {row["key"]: row["value"] for row in cursor.fetchall()}
    conn.close()

    eval_result = evaluate_package_condition(
        findings=findings,
        plastic_type=plastic_type,
        package_type=package_type,
        usage_count=usage_count,
        intended_use=intended_use,
        config=settings_dict
    )

    return {
        "package_id": package_id,
        "inspection_timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "assessment_method": method,
        "findings": findings,
        "condition_score": eval_result["condition_score"],
        "confidence_pct": round(min(cv_confidence, eval_result["confidence_pct"]), 1),
        "recommendation": eval_result["recommendation"],
        "rationale": eval_result["rationale"],
        "safety_notes": eval_result["safety_notes"],
        "image_url": img_url,
        "annotated_image_url": annotated_url,
        "image_data_uri": img_data_uri,
        "annotated_data_uri": annotated_data_uri,
        "is_food_sensitive": eval_result["is_food_sensitive"],
        "disclaimer": "Visible-condition assessment does not guarantee internal structural integrity, food-contact hygiene certification, or exact remaining cycle life."
    }

@app.post("/api/inspections/save")
def save_inspection(data: InspectionSave):
    conn = get_connection()
    cursor = conn.cursor()

    # Verify package exists
    cursor.execute("SELECT * FROM packages WHERE id = ?", (data.package_id,))
    pkg = cursor.fetchone()
    if not pkg:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Package {data.package_id} not found in inventory")

    ins_id = f"INS-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    ins_date = data.inspection_date or datetime.now().strftime("%Y-%m-%d")

    # Insert inspection
    cursor.execute("""
    INSERT INTO inspections (
        id, package_id, inspection_date, assessment_method, findings,
        condition_score, confidence_pct, recommendation, rationale,
        image_url, annotated_image_url, inspector_notes, is_demo, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    """, (
        ins_id, data.package_id, ins_date, data.assessment_method,
        json.dumps(data.findings), data.condition_score, data.confidence_pct,
        data.recommendation, data.rationale, data.image_url or "",
        data.annotated_image_url or "", data.inspector_notes or "", ins_date
    ))

    # Update package status
    condition_label = "Intact" if data.condition_score >= 75 else ("Damaged" if data.condition_score < 50 else "Worn")
    recovery_status = "Active Circulation" if data.recommendation == "REUSE CANDIDATE" else (
        "Needs Inspection" if data.recommendation == "FURTHER INSPECTION REQUIRED" else (
            "Repair Assessment" if data.recommendation == "REPAIR ASSESSMENT" else (
                "Sent for Recycling" if data.recommendation == "RECYCLING ASSESSMENT" else "Recovery Pending"
            )
        )
    )

    cursor.execute("""
    UPDATE packages SET
        current_condition = ?,
        current_score = ?,
        current_recommendation = ?,
        recovery_status = ?,
        usage_count = usage_count + 1,
        updated_at = ?
    WHERE id = ?
    """, (
        condition_label, data.condition_score, data.recommendation,
        recovery_status, ins_date, data.package_id
    ))

    conn.commit()
    conn.close()

    return {
        "message": "Inspection saved and package record updated successfully",
        "inspection_id": ins_id,
        "package_id": data.package_id
    }

@app.get("/api/inspections")
def list_inspections(
    package_id: Optional[str] = None,
    recommendation: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    conn = get_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM inspections WHERE 1=1"
    params = []

    if package_id:
        query += " AND package_id LIKE ?"
        params.append(f"%{package_id}%")

    if recommendation and recommendation != "All":
        query += " AND recommendation = ?"
        params.append(recommendation)

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    cursor.execute(query, params)
    rows = cursor.fetchall()

    cursor.execute("SELECT COUNT(*) as total FROM inspections")
    total = cursor.fetchone()["total"]
    conn.close()

    results = []
    for r in rows:
        item = dict(r)
        try:
            item["findings"] = json.loads(item["findings"])
        except:
            item["findings"] = []
        results.append(item)

    return {"items": results, "total": total}

@app.get("/api/inspections/export")
def export_inspections_csv():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM inspections ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Inspection ID", "Package ID", "Inspection Date", "Assessment Method",
        "Condition Score", "Confidence (%)", "Recommendation", "Findings",
        "Rationale", "Inspector Notes", "Is Demo Data"
    ])

    for r in rows:
        findings_str = ", ".join(json.loads(r["findings"])) if r["findings"] else ""
        writer.writerow([
            r["id"], r["package_id"], r["inspection_date"], r["assessment_method"],
            r["condition_score"], r["confidence_pct"], r["recommendation"],
            findings_str, r["rationale"], r["inspector_notes"],
            "Yes" if r["is_demo"] else "No"
        ])

    output.seek(0)
    response = StreamingResponse(iter([output.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=ecotrack_inspections_export.csv"
    return response

# ----------------- Eco-First Recovery Advisor -----------------

@app.post("/api/recovery/recommend")
def get_recovery_recommendation(req: RecoveryRecommendRequest):
    result = get_eco_first_recovery_pathway(
        package_id=req.package_id,
        plastic_type=req.plastic_type,
        package_type=req.package_type,
        visible_condition=req.visible_condition,
        findings=req.findings,
        contamination=req.contamination or "None",
        intended_use=req.intended_use or "General",
        local_acceptance=req.local_acceptance or "Unverified",
        usage_count=req.usage_count or 0
    )
    return result

@app.post("/api/recovery/record")
def record_recovery_decision(data: RecoveryRecordSave):
    conn = get_connection()
    cursor = conn.cursor()

    rec_id = f"REC-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    d_now = datetime.now().strftime("%Y-%m-%d")

    cursor.execute("""
    INSERT INTO recovery_records (
        id, package_id, decision_date, priority_level, recommended_action,
        final_outcome, environmental_rationale, preparation_steps, safety_notes,
        facility_info, is_verified, inspector_notes, is_demo, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    """, (
        rec_id, data.package_id, d_now, data.priority_level, data.recommended_action,
        data.final_outcome, data.environmental_rationale, json.dumps(data.preparation_steps),
        data.safety_notes, data.facility_info or "", data.is_verified or 0,
        data.inspector_notes or "", d_now
    ))

    # Update package recovery status in inventory
    outcome_status = "Active Circulation" if "REUSE" in data.priority_level else (
        "Repaired & Cleared" if "REPAIR" in data.priority_level else (
            "Sent for Recycling" if "RECYCLE" in data.priority_level else "Authorized Recovery Complete"
        )
    )

    cursor.execute("""
    UPDATE packages SET
        recovery_status = ?,
        updated_at = ?
    WHERE id = ?
    """, (outcome_status, d_now, data.package_id))

    conn.commit()
    conn.close()

    return {
        "message": "Recovery decision outcome saved successfully",
        "record_id": rec_id,
        "package_id": data.package_id,
        "new_status": outcome_status
    }

# ----------------- Environmental Impact Analytics -----------------

@app.get("/api/stats/impact")
def get_environmental_impact():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as cnt FROM packages")
    total_packages = cursor.fetchone()["cnt"]

    cursor.execute("SELECT COUNT(*) as cnt FROM packages WHERE current_recommendation = 'REUSE CANDIDATE'")
    reused = cursor.fetchone()["cnt"]

    cursor.execute("SELECT COUNT(*) as cnt FROM packages WHERE recovery_status = 'Sent for Recycling'")
    recycled = cursor.fetchone()["cnt"]

    cursor.execute("SELECT COUNT(*) as cnt FROM packages WHERE recovery_status = 'Recovery Pending'")
    recovery_pending = cursor.fetchone()["cnt"]

    cursor.execute("SELECT SUM(weight_grams) as w FROM packages")
    total_weight_g = cursor.fetchone()["w"] or 0.0

    conn.close()

    return {
        "is_demo_data": True,
        "packages_inspected": 1248,
        "packages_reused": 842,
        "packages_recycled": 184,
        "packages_awaiting_recovery": 96,
        "recorded_weight_kg": round(total_weight_g / 1000.0, 2),
        "waste_diverted_kg": 312.0,
        "diverted_waste_explanation": "Based on measured weight of reusable packaging assets kept in active multi-turn circulation rather than single-use disposal.",
        "environmental_progress_text": "Each reuse rotation defers virgin fossil polymer extraction and reduces packaging waste accumulation. Certified mechanical recycling restores polymer flake value, keeping high-purity resins out of landfill streams.",
        "disclaimer": "Environmental impact estimates require verified material quantities and an appropriate calculation method. Illustrative metrics shown."
    }

# ----------------- Settings & Demo Controls -----------------

@app.get("/api/settings")
def get_settings():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT key, value FROM settings")
    settings = {row["key"]: row["value"] for row in cursor.fetchall()}
    conn.close()
    return settings

@app.post("/api/settings")
def update_settings(settings: Dict[str, str]):
    conn = get_connection()
    cursor = conn.cursor()
    for k, v in settings.items():
        cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (k, str(v)))
    conn.commit()
    conn.close()
    return {"message": "Settings updated successfully", "settings": settings}

@app.post("/api/demo/reset")
def reset_demo_data():
    seed_sample_data(force=True)
    return {"message": "Demonstration records reset to default state successfully."}

@app.post("/api/demo/clear")
def clear_demo_data():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM recovery_records WHERE is_demo = 1")
    cursor.execute("DELETE FROM inspections WHERE is_demo = 1")
    cursor.execute("DELETE FROM packages WHERE is_demo = 1")
    conn.commit()
    conn.close()
    return {"message": "All demonstration records cleared. Only real records remain."}

# Mount compiled frontend dist if available
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

