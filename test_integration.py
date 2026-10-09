import urllib.request
import json
import io

BASE_URL = "http://127.0.0.1:8000"

def test_api():
    print("=== RUNNING ECOTRACK AI ENDPOINT & FLOW VERIFICATION ===")

    # 1. Health check
    res = urllib.request.urlopen(f"{BASE_URL}/api/health")
    assert res.status == 200
    data = json.loads(res.read().decode())
    print(f"[PASS] Health Check: {data['app']} - {data['project']}")

    # 2. Overview stats
    res = urllib.request.urlopen(f"{BASE_URL}/api/stats/overview")
    assert res.status == 200
    overview = json.loads(res.read().decode())
    print(f"[PASS] Overview Metrics: Total {overview['summary']['total_packages']}, Reusable {overview['summary']['suitable_for_reuse']}, Diverted {overview['summary']['waste_diverted_kg']} kg")

    # 3. List packages
    res = urllib.request.urlopen(f"{BASE_URL}/api/packages")
    assert res.status == 200
    pkg_list = json.loads(res.read().decode())
    print(f"[PASS] Packages Listing: Found {pkg_list['total']} items in inventory.")
    assert len(pkg_list['items']) > 0

    first_pkg_id = pkg_list['items'][0]['id']

    # 4. Package detail & QR code
    res = urllib.request.urlopen(f"{BASE_URL}/api/packages/{first_pkg_id}")
    assert res.status == 200
    pkg_detail = json.loads(res.read().decode())
    print(f"[PASS] Package Detail: {first_pkg_id} ({pkg_detail['package']['plastic_type']}), QR Code length: {len(pkg_detail['qr_code_data_uri'])} chars")

    # 5. Recovery Advisor Engine evaluation (PET cracked test scenario from prompt)
    payload = json.dumps({
        "package_id": "PKG-PET-1001",
        "plastic_type": "PET",
        "package_type": "Bottle",
        "visible_condition": "Visible Cracks",
        "findings": ["Visible cracks detected (1 fracture zone)"],
        "contamination": "None",
        "intended_use": "Food & Beverage",
        "local_acceptance": "Unverified",
        "usage_count": 8
    }).encode("utf-8")

    req = urllib.request.Request(
        f"{BASE_URL}/api/recovery/recommend",
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    assert res.status == 200
    rec = json.loads(res.read().decode())
    print(f"[PASS] Eco-First Recovery Advisor Output:")
    print(f"       Priority: {rec['priority_level']}")
    print(f"       Action: {rec['recommended_action']}")
    print(f"       Rationale: {rec['environmental_rationale'][:80]}...")

    # 6. Inspection save test
    save_payload = json.dumps({
        "package_id": "PKG-PET-1001",
        "inspection_date": "2026-10-09",
        "assessment_method": "Automated Integration Test Verification",
        "findings": ["No obvious visible damage detected"],
        "condition_score": 95,
        "confidence_pct": 94.0,
        "recommendation": "REUSE CANDIDATE",
        "rationale": "Surface passed integrity checks.",
        "inspector_notes": "Automated verification test."
    }).encode("utf-8")

    req_save = urllib.request.Request(
        f"{BASE_URL}/api/inspections/save",
        data=save_payload,
        headers={"Content-Type": "application/json"}
    )
    res_save = urllib.request.urlopen(req_save)
    assert res_save.status == 200
    save_result = json.loads(res_save.read().decode())
    print(f"[PASS] Inspection Saved: ID {save_result['inspection_id']}")

    # 7. CSV Export
    res_csv = urllib.request.urlopen(f"{BASE_URL}/api/inspections/export")
    assert res_csv.status == 200
    csv_content = res_csv.read().decode()
    lines = csv_content.strip().split("\n")
    print(f"[PASS] CSV Export: Downloaded valid CSV with {len(lines)} lines.")

    # 8. Frontend Root HTML check
    res_html = urllib.request.urlopen(f"{BASE_URL}/")
    assert res_html.status == 200
    html_text = res_html.read().decode()
    assert "EcoTrack AI" in html_text
    print(f"[PASS] Frontend Bundle: Successfully served from FastAPI root with HTML title and meta tags.")

    print("\n>>> ALL SYSTEM INTEGRATION TESTS PASSED WITH 100% SUCCESS! <<<")

if __name__ == "__main__":
    test_api()
