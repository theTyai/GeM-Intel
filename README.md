# 🏛️ GeM-Intel — AI-Powered Procurement Intelligence & Auditability Platform

**Smart India Hackathon 2026 | Problem Statement: SIH 1360**  
**Team Valeryon**

> **An evidence-driven decision-support system for establishing price reasonableness, detecting procurement risk, and generating independently verifiable audit evidence under GFR 2017 Rule 149.**

---

## 🏛️ The Six Core Product Pillars

1. **01 — Price Intelligence**: Cross-market benchmarking and delivered Total Cost of Ownership (TCO) normalization (GST + PIN-code freight + AMC).
2. **02 — Product Intelligence**: AI-powered product identity resolution and hard-attribute specification cross-checking.
3. **03 — Risk Intelligence**: Benchmark Market Value (BMV) variance, ARIMA time-series boundaries, and procurement risk signals.
4. **04 — Evidence Intelligence**: Timestamped, traceable market evidence snapshots with verified provenance.
5. **05 — Auditability**: Cryptographically verifiable procurement certificates anchored with SHA-256 hashes to a tamper-evident audit ledger.
6. **06 — Human Governance**: AI assists, recommends, and explains; authorized procurement officers retain final statutory decision authority.

---

## 🏗️ Architecture Overview

```text
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

## ⚡ Quick Start

### 1. Launch All Services (One-Click on Windows)
Double click:
```bat
d:\WorkSpace\GeM\start-all.bat
```

### 2. Manual Startup
```bash
# Terminal 1 — AI Intelligence Core (Port 8000)
cd ai-service
python -m uvicorn main:app --reload --port 8000

# Terminal 2 — Backend API Gateway (Port 5000)
cd backend
node src/index.js

# Terminal 3 — Frontend Dashboard (Port 5173)
cd frontend
npm run dev
```

---

## 🔑 Demo Government User Accounts

| Role | Email | Password | Department | Access Level |
|---|---|---|---|---|
| **Procurement Officer** | `officer@gem.gov.in` | `password123` | Ministry of Finance | Benchmark Quotations, Generate GFR 149 Certificates |
| **Government Auditor** | `auditor@gem.gov.in` | `password123` | CAG Office | Risk & Market Intelligence Hub, Audit Logs |
| **GeM Administrator** | `admin@gem.gov.in` | `password123` | GeM Administration | Full System Diagnostics & Monitoring |

---

## 📄 Documentation

- Comprehensive Guide: [`SYSTEM_OVERVIEW_AND_USER_FLOW.md`](SYSTEM_OVERVIEW_AND_USER_FLOW.md)
- Walkthrough: [`walkthrough.md`](walkthrough.md)
