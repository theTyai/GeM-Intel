# 🏛️ GeM-Intel — Production-Grade GovTech Architecture, User Journey & System Guide

**Smart India Hackathon 2026 | Problem Statement: SIH 1360**  
**Product Title:** GeM-Intel — AI-Powered Procurement Intelligence & Auditability Platform  
**Team:** Team Valeryon  
**Document Type:** Enterprise Architecture, Human Governance Workflow & Technical Specification  

---

## 📑 Table of Contents
1. [Executive Summary & Strategic Positioning](#1-executive-summary--strategic-positioning)
2. [The Six Core Product Pillars](#2-the-six-core-product-pillars)
3. [Enterprise System Architecture](#3-enterprise-system-architecture)
4. [Human-in-the-Loop Governance & End-to-End Workflow](#4-human-in-the-loop-governance--end-to-end-workflow)
5. [Role-Based Access Control (RBAC) Matrix](#5-role-based-access-control-rbac-matrix)
6. [Detailed Page-by-Page Breakdown & Interface Specifications](#6-detailed-page-by-page-breakdown--interface-specifications)
   - [6.1 Official Sign-In Gateway (`/login`)](#61-official-sign-in-gateway-login)
   - [6.2 Procurement Price Assessment Workspace (`/` or `/compare`)](#62-procurement-price-assessment-workspace--or-compare)
   - [6.3 Procurement Evidence Logs (`/comparisons`)](#63-procurement-evidence-logs-comparisons)
   - [6.4 Procurement Risk & Market Intelligence Hub (`/anomalies`)](#64-procurement-risk--market-intelligence-hub-anomalies)
   - [6.5 Public Evidence Verification Portal (`/verify`)](#65-public-evidence-verification-portal-verify)
   - [6.6 Official GFR 149 Evidence Package Modal & PDF](#66-official-gfr-149-evidence-package-modal--pdf)
7. [Explainable AI Layer (XAI) & Evidence Provenance](#7-explainable-ai-layer-xai--evidence-provenance)
8. [The 5-Tier Procurement Intelligence Pipeline](#8-the-5-tier-procurement-intelligence-pipeline)
9. [Chrome Browser Extension Integration (Manifest V3)](#9-chrome-browser-extension-integration-manifest-v3)
10. [Quick-Start & Deployment Guide](#10-quick-start--deployment-guide)

---

## 1. Executive Summary & Strategic Positioning

### 1.1 Product Definition
**GeM-Intel** is an **AI-assisted procurement intelligence and auditability platform** designed to help public procurement officers establish defensible evidence of price reasonableness under **Rule 149 of the General Financial Rules (GFR), 2017**.

Rather than serving as a basic comparison search tool, GeM-Intel functions as an **enterprise decision-support platform**:
- It evaluates cross-market Total Cost of Ownership (TCO) delivered prices across open e-marketplaces (Amazon, Flipkart, IndiaMART).
- It resolves hardware and specification identities using deep NLP models.
- It detects statistical pricing risk and cartelization boundaries using ARIMA time-series models.
- It generates an immutable, **SHA-256 cryptographically anchored Evidence Package** attached to a **Tamper-Evident Audit Ledger**.

---

## 2. The Six Core Product Pillars

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       THE 6 CORE PRODUCT PILLARS                            │
├──────────────────────────┬──────────────────────────────────────────────────┤
│ 01 — Price Intelligence  │ Cross-market benchmarking & delivered TCO        │
│                          │ normalization (GST slabs + PIN freight + AMC).   │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 02 — Product Intelligence│ AI-powered product identity resolution & hard-   │
│                          │ attribute specification matching.                │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 03 — Risk Intelligence   │ Benchmark Market Value (BMV) variance, ARIMA     │
│                          │ time-series boundaries & procurement risk signals│
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 04 — Evidence            │ Timestamped, traceable market evidence snapshots │
│      Intelligence        │ with verified provenance.                        │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 05 — Auditability        │ Cryptographically verifiable GFR 149 compliance  │
│                          │ certificates anchored to an audit ledger.        │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 06 — Human Governance    │ AI assists, recommends, and explains; authorized │
│                          │ procurement officers make final decisions.       │
└──────────────────────────┴──────────────────────────────────────────────────┘
```

---

## 3. Enterprise System Architecture

```
                    ┌──────────────────────────────┐
                    │       GOVERNMENT USERS       │
                    │                              │
                    │ Officer │ Auditor │ Admin    │
                    └──────────────┬───────────────┘
                                   │
                         Web Dashboard / Extension
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │       API GATEWAY             │
                    │ Auth │ RBAC │ Rate Limiting  │
                    │ Audit Logging │ Validation   │
                    └──────────────┬───────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              ▼                    ▼                    ▼
       Procurement           Intelligence          Evidence
          Engine                Engine               Engine
              │                    │                    │
       ┌──────┴──────┐      ┌──────┴──────┐      ┌──────┴──────┐
       │ GeM Parser  │      │ NLP Matcher │      │ Certificate │
       │ Product     │      │ TCO Engine  │      │ SHA-256     │
       │ Extraction  │      │ Anomaly/Risk│      │ QR Verify   │
       └─────────────┘      │ Detection   │      │ Audit Ledger│
                            └─────────────┘      └─────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │       DATA PLATFORM          │
                    │                              │
                    │ MongoDB │ Price History      │
                    │ Evidence Store │ Audit Logs  │
                    └──────────────────────────────┘
```

---

## 4. Human-in-the-Loop Governance & End-to-End Workflow

GeM-Intel enforces an institutional decision-support workflow where AI provides transparent recommendations while the human officer retains statutory authority:

```
                PROCUREMENT REQUEST
                        │
                        ▼
               PRODUCT IDENTIFICATION
                        │
                        ▼
              MARKET EVIDENCE COLLECTION
                        │
                        ▼
             PRODUCT MATCHING ENGINE
                        │
                        ▼
              TCO NORMALIZATION ENGINE
                        │
                        ▼
              ┌─────────────────────┐
              │ MARKET BENCHMARKING │
              └──────────┬──────────┘
                         │
             ┌───────────┴───────────┐
             ▼                       ▼
       PRICE VARIANCE          ANOMALY/RISK
             │                       │
             └───────────┬───────────┘
                         ▼
                EXPLAINABLE VERDICT
                         │
                         ▼
              OFFICER REVIEW / ACTION
                         │
                         ▼
                EVIDENCE SNAPSHOT
                         │
                         ▼
                 SHA-256 HASH
                         │
                         ▼
             GFR 149 CERTIFICATE
                         │
                         ▼
               PUBLIC VERIFICATION
```

---

## 5. Role-Based Access Control (RBAC) Matrix

| Capability / Resource | Procurement Officer | CAG Auditor | GeM Admin | Public / Guest |
|---|:---:|:---:|:---:|:---:|
| Run Real-Time Price Assessments (`/`) | ✅ | ❌ | ✅ | ❌ |
| Generate GFR 149 Evidence Packages | ✅ | ❌ | ✅ | ❌ |
| View Department Evidence Logs (`/comparisons`) | ✅ (Own Dept) | ✅ (All Depts) | ✅ | ❌ |
| Access Risk & Market Intelligence (`/anomalies`) | ❌ | ✅ | ✅ | ❌ |
| Public Certificate Verification (`/verify`) | ✅ | ✅ | ✅ | ✅ |
| Export Scrutiny Reports & Audit Trails | ❌ | ✅ | ✅ | ❌ |

---

## 6. Detailed Page-by-Page Breakdown & Interface Specifications

### 6.1 Official Sign-In Gateway (`/login`)
- **Purpose**: Authenticates government officials and issues role-scoped JWT tokens.
- **Key Features**:
  - Secure credential validation with department attribution.
  - **One-Click Demo Account Switcher** (`Officer - Min. of Finance`, `Auditor - CAG Office`, `Admin - GeM Administration`).
  - GFR 2017 statutory compliance badge.

---

### 6.2 Procurement Price Assessment Workspace (`/` or `/compare`)
- **Purpose**: Interactive decision-support console for evaluating live GeM product quotations.
- **Key Features**:
  1. **Quotation Input**: GeM Listing URL + Delivery PIN Code (enables localized freight calculation) + 4 Quick Demo Samples (HP ProBook, Dell Vostro, Lenovo ThinkPad, Canon PIXMA).
  2. **Executive Verdict Header**:
     - **Status Classifications**:
       - 🟢 **`Benchmark Aligned (≤5%)`**: Price verified reasonable under Rule 149.
       - 🟡 **`Review Recommended (5–20%)`**: Potential GFR 149 justification required.
       - 🔴 **`High-Risk Variance (>20%)`**: Significant price deviation; mandatory justification.
     - **Metrics**: GeM Landed Price, Benchmark Market Value (BMV), and Variance %.
  3. **Explainable AI Score Card ("Why This Result?")**:
     - Product Identity Resolution breakdown (Brand, Model, Processor, RAM, Storage, Warranty).
     - BMV Calculation explanation with identified Primary Risk Drivers.
     - Evidence Confidence Rating (`HIGH` / `MEDIUM`).
  4. **Multi-Source TCO Comparison Matrix**:
     - Side-by-side delivered cost breakdown across GeM, Amazon, Flipkart, and IndiaMART.
     - Line items: Base Price, GST (18%), Regional Freight, AMC Normalization, Delivered TCO.
     - Provenance timestamps for every market listing.
  5. **Delivered Landed Cost Visualizer**:
     - Recharts bar chart with Benchmark Market Value (BMV) reference line.
  6. **Evidence Package Action**: One-click generation of the GFR 149 Compliance Certificate.

---

### 6.3 Procurement Evidence Logs (`/comparisons`)
- **Purpose**: Searchable, filterable repository of all institutional price evaluations.
- **Key Features**:
  - Filter tabs: **All Logs**, **Aligned (≤5%)**, **Review Recommended**, **High-Risk Variance**.
  - Columns: Timestamp, GeM Product, Procuring Officer & Department, Benchmark Market Value (BMV), Price Variance %, Risk Status.
  - Instant modal inspection of the anchored Evidence Package for any record.

---

### 6.4 Procurement Risk & Market Intelligence Hub (`/anomalies`)
- **Purpose**: Specialized scrutiny console for CAG auditors and internal vigilance teams.
- **Key Features**:
  - Executive Risk KPIs: Total Flagged Cases, High-Risk Divergences (>20%), Under-Scrutiny Queue.
  - Specific **Algorithmic Risk Triggers** (e.g. *"Price ₹61,000 exceeds ARIMA time-series upper bound ₹57,231.73"*).
  - Metrics Grid: GeM Price vs BMV vs Market Spread vs Delivery Location.
  - One-click access to inspect full cryptographic evidence.

---

### 6.5 Public Evidence Verification Portal (`/verify`)
- **Purpose**: Public, unauthenticated verification tool for third-party auditors, vigilance officers, or citizens.
- **Key Features**:
  - Search by **Certificate Number** (e.g. `GI-2026-000182`) or Record ID.
  - Displays recalculation of the **SHA-256 Canonical Content Hash**.
  - Confirms record integrity on the **Tamper-Evident Audit Ledger** (`LEDGER-XXXXXX`).
  - Displays the original Evidence Snapshot captured at the moment of procurement.

---

### 6.6 Official GFR 149 Evidence Package Modal & PDF
- **Purpose**: Official, printable documentary evidence for physical and e-office procurement files.
- **Key Features**:
  - Official Government of India & GeM emblem header.
  - Certificate ID (`GI-2026-XXXXXX`) and Procurement Reference (`PR-2026-XXXX`).
  - Officer Name, Department, Evaluation Timestamp, and PIN code.
  - Compliance Determination & BMV Summary Box.
  - Market Evidence Table with provenance status.
  - SHA-256 Evidence Hash, Tamper-Evident Ledger Reference, and QR Code.
  - Dedicated **"Print GFR 149 Certificate"** action formatted for standard A4 government filings.

---

## 7. Explainable AI Layer (XAI) & Evidence Provenance

### 7.1 Product Match Explainability
Rather than presenting an uninterpretable score, the system provides component-level match transparency:

```
PRODUCT MATCH CONFIDENCE: 94.7% (HIGH)
├── Brand Identity      ✓ Exact (HP)
├── Model Series        ✓ Exact Series (ProBook 440 G8)
├── Processor / SoC     ✓ Match (Intel Core i5)
├── System Memory       ✓ Match (8 GB RAM)
├── Storage Specs       ✓ Match (512 GB SSD)
└── Warranty Term       ✓ Standard 1-Year
```

### 7.2 Benchmark Market Value (BMV) Formulation
$$\text{BMV} = \operatorname{Median}\left(\text{LandedCost}_{\text{Amazon}}, \text{LandedCost}_{\text{Flipkart}}, \text{LandedCost}_{\text{IndiaMART}}\right)$$

$$\text{Variance \%} = \left(\frac{\text{GeM Landed Price} - \text{BMV}}{\text{BMV}}\right) \times 100$$

### 7.3 Evidence Provenance Tracking
Every price input maintains full audit metadata:
- **Source**: Amazon India / Flipkart / IndiaMART
- **Captured At**: `06 Sep 2026, 14:02:18 IST`
- **Delivered TCO**: Base Price + GST (18%) + Freight(PIN) + AMC
- **Status**: Captured, Timestamped & Cryptographically Anchored

---

## 8. The 5-Tier Procurement Intelligence Pipeline

```
[1. GeM Extraction]
  │ Extract title, brand, category, specs (RAM, CPU, SSD), listed price & commercial terms.
  ▼
[2. Candidate Retrieval]
  │ Fast TF-IDF / BM25 index search filters marketplace catalogs to top candidates.
  ▼
[3. Semantic Re-Ranking & Spec Cross-Check]
  │ • Sentence-Transformers (all-MiniLM-L6-v2) computes semantic similarity S_text
  │ • Regex extracts hard attributes (RAM, Storage, Processor)
  │ • Formula: S_final = S_text + (MatchBonus × 0.15) - (MismatchPenalty × 0.35)
  ▼
[4. TCO Landed Cost Normalization]
  │ • LandedCost = BasePrice + GST(18%) + Freight(PIN) + AMC
  │ • BMV = Median(LandedCost_Amazon, LandedCost_Flipkart, LandedCost_IndiaMART)
  │ • Risk Class: Benchmark Aligned (≤5%) | Review Recommended (5-20%) | High Risk (>20%)
  ▼
[5. Risk Analysis & Tamper-Evident Ledger Anchoring]
  │ • ARIMA time-series model checks statistical boundary breaches
  │ • SHA-256 Hash computed across canonical evidence snapshot payload
  │ • Anchored to Tamper-Evident Audit Ledger (LEDGER-XXXXXX)
```

---

## 9. Chrome Browser Extension Integration (Manifest V3)

The extension embeds GeM-Intel directly into `gem.gov.in`:
1. **Auto-Detection**: Content script detects when an officer views any product page.
2. **Floating Action Button**: Injects an official *"🏛️ GeM-Intel — Audit Market Price"* floating button.
3. **Instant Audit**: Clicking the button opens the pre-filled price assessment console in a single click.

---

## 10. Quick-Start & Deployment Guide

### Single-Click Startup (Windows)
Double-click:
```bat
d:\WorkSpace\GeM\start-all.bat
```

### Manual Service Execution
```bash
# Terminal 1 — Python AI Core
cd d:\WorkSpace\GeM\ai-service
python -m uvicorn main:app --reload --port 8000

# Terminal 2 — Node.js Gateway
cd d:\WorkSpace\GeM\backend
node src/index.js

# Terminal 3 — React Dashboard
cd d:\WorkSpace\GeM\frontend
npm run dev
```

### Access URLs
- **Web Dashboard**: `http://localhost:5173`
- **Backend Gateway**: `http://localhost:5000/api/v1`
- **AI Core Docs**: `http://localhost:8000/docs`
- **Cloud Database**: MongoDB Atlas Cluster
