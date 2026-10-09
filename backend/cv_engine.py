import cv2
import numpy as np
import base64
import os
import uuid
from typing import Tuple, List, Dict, Any

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def process_packaging_image(
    image_bytes: bytes,
    filename: str,
    demo_mode: bool = False
) -> Dict[str, Any]:
    """
    OpenCV computer-vision surface inspection engine.
    Analyzes visible contours, edge densities, deformities, and discoloration.
    Renders annotated defect visualization.
    """
    # Decode image
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        return {
            "error": "Failed to decode image. Supported formats: JPG, JPEG, PNG, WEBP.",
            "success": False
        }

    h, w, c = img.shape
    findings = []
    annotated = img.copy()

    # 1. Blur check (Laplacian variance)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

    if laplacian_var < 18.0:
        findings.append("Low image sharpness / unable to verify micro-fractures")
        confidence = 55.0
    else:
        confidence = 88.0

    # 2. Edge / Crack detection (Canny + morphological filtering)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 60, 160)

    # Find high-density edge clusters that indicate cracks rather than smooth container outlines
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    dilated_edges = cv2.dilate(edges, kernel, iterations=1)
    contours, _ = cv2.findContours(dilated_edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    crack_count = 0
    scratch_count = 0

    for cnt in contours:
        area = cv2.contourArea(cnt)
        peri = cv2.arcLength(cnt, True)
        if peri == 0:
            continue
        circularity = 4 * np.pi * (area / (peri * peri))
        x, y, cw, ch = cv2.boundingRect(cnt)

        # Long thin contours with high aspect ratio or low circularity
        aspect = max(cw, ch) / (min(cw, ch) + 1e-5)

        # Exclude outer frame boundary
        if x <= 5 or y <= 5 or (x + cw >= w - 5) or (y + ch >= h - 5):
            continue

        if area > 120 and aspect > 3.5 and circularity < 0.18:
            crack_count += 1
            # Draw red bounding box for potential crack
            cv2.rectangle(annotated, (x - 2, y - 2), (x + cw + 2, y + ch + 2), (0, 0, 220), 2)
            cv2.putText(annotated, "Crack/Fracture", (x, max(15, y - 6)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 220), 1, cv2.LINE_AA)
        elif area > 40 and aspect > 2.0 and circularity < 0.35:
            scratch_count += 1
            if scratch_count <= 4:
                # Draw amber box for scratches
                cv2.rectangle(annotated, (x, y), (x + cw, y + ch), (0, 165, 245), 1)

    if crack_count > 0:
        findings.append(f"Visible cracks detected ({crack_count} fracture zone{'s' if crack_count > 1 else ''})")
    elif scratch_count > 2:
        findings.append(f"Surface scratches detected ({min(scratch_count, 12)} abrasion marks)")

    # 3. Geometric Deformation / Asymmetry analysis
    # Find the main container contour
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    container_contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    deformation_found = False
    if container_contours:
        largest_cnt = max(container_contours, key=cv2.contourArea)
        area = cv2.contourArea(largest_cnt)
        if area > (w * h * 0.15):
            hull = cv2.convexHull(largest_cnt)
            hull_area = cv2.contourArea(hull)
            solidity = float(area) / hull_area if hull_area > 0 else 1.0

            # Low solidity in expected smooth containers often signifies a dent or crushed sidewall
            if solidity < 0.82:
                deformation_found = True
                findings.append("Geometric deformation / sidewall denting detected")
                x, y, cw, ch = cv2.boundingRect(largest_cnt)
                cv2.rectangle(annotated, (x, y), (x + cw, y + ch), (0, 140, 255), 2)
                cv2.putText(annotated, "Deformation Defect", (x + 8, y + 24),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 140, 255), 2, cv2.LINE_AA)

    # 4. Discoloration / UV degradation check
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    h_channel, s_channel, v_channel = cv2.split(hsv)
    std_s = np.std(s_channel)
    mean_v = np.mean(v_channel)

    if std_s > 48.0 and not deformation_found and crack_count == 0:
        findings.append("Discoloration / uneven surface staining observed")
    
    if len(findings) == 0:
        findings.append("No obvious visible damage detected")
        # Draw green indicator border
        cv2.rectangle(annotated, (12, 12), (w - 12, h - 12), (34, 197, 94), 2)
        cv2.putText(annotated, "Visual Surface: Normal", (24, 36),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (34, 197, 94), 2, cv2.LINE_AA)

    # Save original and annotated files
    file_id = str(uuid.uuid4())[:8]
    orig_filename = f"img_{file_id}_orig.jpg"
    annot_filename = f"img_{file_id}_annot.jpg"

    orig_path = os.path.join(UPLOAD_DIR, orig_filename)
    annot_path = os.path.join(UPLOAD_DIR, annot_filename)

    cv2.imwrite(orig_path, img)
    cv2.imwrite(annot_path, annotated)

    # Generate data URI for direct frontend preview
    _, buffer = cv2.imencode('.jpg', annotated)
    annotated_b64 = f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"

    _, orig_buffer = cv2.imencode('.jpg', img)
    orig_b64 = f"data:image/jpeg;base64,{base64.b64encode(orig_buffer).decode('utf-8')}"

    return {
        "success": True,
        "findings": findings,
        "crack_count": crack_count,
        "scratch_count": scratch_count,
        "deformation_detected": deformation_found,
        "sharpness_score": round(laplacian_var, 1),
        "confidence_pct": confidence,
        "image_url": f"/uploads/{orig_filename}",
        "annotated_image_url": f"/uploads/{annot_filename}",
        "image_data_uri": orig_b64,
        "annotated_data_uri": annotated_b64,
        "analysis_method": "OpenCV Surface Vision Heuristics (Visible-Condition Assessment)",
        "disclaimer": "Visible-condition assessment does not guarantee internal structural integrity, food-contact hygiene certification, or exact remaining cycle life."
    }
