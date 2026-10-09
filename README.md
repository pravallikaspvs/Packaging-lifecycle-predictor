# EcoTrack AI — Smart Reusable Packaging Life Predictor
### Featuring the **Eco-First Plastic Recovery Advisor**

---

## 🌿 Executive Summary

**EcoTrack AI** is a modern sustainability SaaS application built for environmental technology evaluations, hackathons, and industrial returnable packaging fleet operators. 

The application implements a transparent, closed-loop circular packaging pipeline:
1. **Smart Inspection**: OpenCV-assisted computer-vision surface defect detection (cracks, deformation, abrasions, UV discoloration) with a manual audit fallback.
2. **Reuse Verification & Digital Passport**: Smart QR-enabled passports and audit timelines tracking package wear across multi-turn rotations.
3. **Eco-First Recovery Advisor**: A rule-based 5-priority circular hierarchy (`ASSESS → REUSE → REPAIR → RECYCLE → AUTHORIZED RECOVERY`) preventing premature disposal and avoiding virgin polymer replacement emissions.

---

## 🎨 Color Palette & Visual Identity

- **Primary Forest Green**: `#14532D` (Sidebar, primary headings, key buttons)
- **Secondary Green**: `#166534` (Card accents, sub-sections)
- **Emerald Green**: `#10B981` (Positive indicators, success states, reuse badges)
- **Mint Green**: `#D1FAE5` (Selected items, active highlights)
- **Light Mint Background**: `#F0FDF4` (Main dashboard surface)
- **Warning Amber**: `#F59E0B` (Requires inspection / pending technical review)
- **Danger Red**: `#DC2626` (Severe fracture damage, hazardous residue warnings)
- **Information Blue**: `#2563EB` (Repair assessments, neutral analytics)

---

## 🛠️ Architecture & Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 19 + Vite + TypeScript | High-performance Single Page Application (SPA) |
| **Styling** | Tailwind CSS + Inter Typography | Custom palette, soft shadows, rounded 14-16px cards |
| **Icons & Charts** | Lucide React + Recharts | Responsive interactive donut, bar, area charts |
| **Backend API** | Python 3.12 + FastAPI + Uvicorn | Asynchronous REST API endpoints & request validation |
| **Database** | SQLite (`backend/ecotrack.db`) | Relational persistence for packages, audits, & recoveries |
| **Image Analysis** | OpenCV (`cv2`) + NumPy | Surface contour, Canny edge, denting, & color variance |
| **Passport QR Codes** | Python `qrcode` + PIL | Valid scannable data URLs pointing to active package passports |

---

## 🚀 Quickstart & Setup Instructions

### 1. Start the Backend API (FastAPI)
```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*The backend automatically initializes the SQLite schema, seeds showcase demonstration packages, and runs on `http://127.0.0.1:8000`.*

### 2. Start the Frontend (Vite Dev Server)
```bash
cd frontend
npm run dev
```
*Open `http://localhost:5173/` in your browser. All API requests are proxied automatically to `http://127.0.0.1:8000`.*

### 3. Alternative: Single-Port Production Mode
You can also run the built production frontend directly through FastAPI on a single port:
```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```
*Navigate directly to `http://127.0.0.1:8000/` to access the full application.*

---

## 🔍 Key Modules & Feature Guide

### 1. Executive Overview Dashboard
- **Welcome Section**: Plastic Packaging Intelligence overview with quick inspection shortcuts.
- **6 Interactive Summary Metric Cards**: 
  - *Total Packages* (1,248)
  - *Suitable for Reuse* (842)
  - *Needs Inspection* (126)
  - *Sent for Recycling* (184)
  - *Recovery Pending* (96)
  - *Waste Diverted* (312 kg)
  *(All initial figures are clearly identified with `DEMO DATA` badges).*
- **4 Recharts Visualizations**:
  - Donut Chart: Packaging Lifecycle Distribution
  - Bar Chart: Monthly Packaging Outcomes (6-month trend)
  - Horizontal Bar Chart: Material Distribution across SPI resin codes
  - Progress Gauge: Packaging Pipeline Verification

### 2. AI Packaging Inspection Workspace
- **Dual-Mode Intake**: Upload packaging photographs (JPG, PNG, WEBP up to 10MB) or utilize the manual technical assessment form.
- **OpenCV Analysis**:
  - Canny edge detection for structural fractures & cracks.
  - Contour asymmetry & solidity calculations for sidewall dents/deformation.
  - HSV color variance for UV clouding or chemical staining.
- **Defect Annotation Overlay**: Toggle between the raw photograph and annotated bounding boxes highlighting detected anomalies.
- **Condition Score (0-100)**: Transparent calculation with confidence ratings and inspection audit notes.
- **Save & Forward**: Commit inspections directly to SQLite and forward results to the Eco-First Recovery Advisor.

### 3. Eco-First Plastic Recovery Advisor (Core Feature)
Applies the 5-Priority Circular Decision Hierarchy:
1. **Priority 1: REUSE**: Clean, sanitize, and return to service to eliminate virgin resin replacement emissions.
2. **Priority 2: REPAIR**: Non-food container reconditioning (closure/gasket replacement, plastic welding) without compromising safety.
3. **Priority 3: RECYCLE**: Verifies resin type, cleanliness, and checks local facility acceptance before routing to mechanical flaking.
4. **Priority 4: AUTHORIZED RECOVERY**: Routes hazardous chemical containers or unaccepted polymers to certified industrial aggregators.
5. **Priority 5: RESPONSIBLE DISPOSAL GUIDANCE**: Discourages open burning, dumping, and incompatible plastic blending.
- **Example Demonstration**: Inputting a visibly cracked PET bottle automatically outputs:
  > *"REUSE NOT RECOMMENDED WITHOUT FURTHER ASSESSMENT"*
  > *"NEXT STEP: Check local PET recycling acceptance."*
  > *"WHY: The package has visible damage. Its suitability for reuse cannot be confirmed from appearance alone."*

### 4. Smart Reuse Passport
- Digital certificate for every registered container asset.
- Scannable, dynamically generated QR code pointing directly to `/?view=passport&id={package_id}`.
- Complete chronological audit log of all historical inspections, condition scores, and recovery outcomes.
- Downloadable QR PNG and print-ready asset labels.

### 5. Package Inventory
- Tabular catalog with instant search, multi-factor filtering, and column sorting.
- Modal forms to **Register New Packaging**, **Edit Existing Records**, and **Delete Assets** with safety confirmations.

### 6. Polymer Recycling Guide
- Educational reference for SPI codes 1 through 7 (PET, HDPE, PVC, LDPE, PP, PS, and Other).
- Explicit municipal reminder: *"Check with your local municipal waste-management service or authorized recycler."*

### 7. Environmental Impact & History
- Measured tare weights and monthly diversion graphs.
- Full inspection history table with a working **Export to CSV** feature.
- Settings page to customize engine penalty thresholds and reset or clear demonstration data.

---

## ⚖️ Transparent AI & Engineering Disclaimers

1. **Surface Inspection vs. Certified Lab Testing**:
   Computer vision assesses external physical condition (cracks, dents, scratches, clouding). It does not certify molecular fatigue, food-contact microbiological sterility, or pressure-rated burst strength.
2. **No Fabricated Savings**:
   EcoTrack AI strictly reports measured tare weights and tracked rotation cycles without generating fabricated carbon or water savings claims.
3. **Demonstration Baseline**:
   All initial figures (e.g. 1,248 packages) are explicitly marked as demonstration benchmark data.
