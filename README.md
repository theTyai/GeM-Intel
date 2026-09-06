# GeM-Intel

**Advanced Price Intelligence & Procurement Audit Engine**  
Smart India Hackathon 2026 — Problem Statement SIH 1360  
Team Valeryon

---

## What is GeM-Intel?

GeM-Intel benchmarks prices on India's Government e-Marketplace (GeM) against Amazon, Flipkart, and IndiaMART in near real-time. It automatically matches products across platforms using semantic AI, normalizes prices to a true landed cost (GST + freight + AMC), and generates a tamper-proof audit certificate as GFR Rule 149 compliance evidence.

---

## Architecture

```
React (port 5173)
    │
    ▼
Node.js / Express (port 5000)
    │
    ├──► MongoDB (port 27017)
    │
    ├──► Python / FastAPI AI Service (port 8000)
    │         ├── Scraper (GeM parser + mock marketplaces)
    │         ├── Semantic Matcher (TF-IDF + Sentence-Transformers)
    │         ├── TCO Normalizer (GST + freight + AMC)
    │         └── Anomaly Detector (ARIMA/Prophet)
    │
    └──► PDF Service (port 5001)
              └── Puppeteer certificate generator
```

---

## Prerequisites

| Tool | Version | Install | 
|------|---------|---------|
| Node.js | 18+ | https://nodejs.org |
| Python | 3.10+ | https://python.org |
| MongoDB | 7.0+ | https://www.mongodb.com/try/download/community |
| Git | any | https://git-scm.com |

> **Windows users**: MongoDB can be installed as a Windows service. Alternatively use MongoDB Atlas (free tier) and update `MONGODB_URI` in your `.env`.

---

## Quick Start

### 1. Clone & configure environment

```bash
# From the GeM directory
cp .env.example .env
# Edit .env if needed (defaults work for local dev)
```

### 2. Start MongoDB

Make sure MongoDB is running on `localhost:27017`.

```bash
# Windows (if installed as service, it may already be running)
# Check: net start MongoDB
# Or use MongoDB Compass to connect to localhost:27017
```

### 3. Start the Backend

```bash
cd backend
npm install
npm run seed          # creates test users
npm run dev           # starts on port 5000
```

### 4. Start the AI Service

```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 5. Start the PDF Service

```bash
cd pdf-service
npm install
npm run dev           # starts on port 5001
```

### 6. Start the Frontend

```bash
cd frontend
npm install
npm run dev           # starts on port 5173
```

---

## Test Users (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Officer | officer@gem.gov.in | password123 |
| Auditor | auditor@gem.gov.in | password123 |
| Admin | admin@gem.gov.in | password123 |

---

## First Milestone — Comparison API

Test the core comparison endpoint directly:

```bash
# 1. Get a JWT token
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"officer@gem.gov.in","password":"password123"}'

# 2. Copy the token, then run a comparison
curl -X POST http://localhost:5000/api/v1/compare \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"gemUrl":"https://gem.gov.in/product/view?product_id=GEM-2024-HP-001","pinCode":"110001"}'
```

Expected response shape:
```json
{
  "gemProduct": { "title": "HP ProBook 440 G8", "price": 61000 },
  "matches": [...],
  "fairMarketValue": 55750,
  "variancePercent": 9.42,
  "status": "review_required"
}
```

---

## Project Structure

```
GeM/
├── backend/              # Node.js / Express API gateway (port 5000)
│   ├── src/
│   │   ├── config/       # DB connections
│   │   ├── middleware/   # JWT auth + RBAC
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API route handlers
│   │   ├── services/     # GeM URL parser
│   │   └── scripts/      # DB seed script
│   └── package.json
│
├── ai-service/           # Python / FastAPI intelligence core (port 8000)
│   ├── routers/          # FastAPI route handlers
│   ├── services/         # Scraper, Matcher, TCO, Anomaly
│   ├── data/             # Mock product catalogs + HSN/GST tables
│   ├── main.py
│   └── requirements.txt
│
├── pdf-service/          # Node.js / Puppeteer certificate generator (port 5001)
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── templates/
│   └── package.json
│
├── frontend/             # React / Vite dashboard (port 5173)
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── api/
│       └── context/
│
├── extension/            # Chrome Extension (Manifest V3)
│
├── .env.example          # Environment template
└── README.md
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/login` | Public | Get JWT token |
| POST | `/api/v1/auth/register` | Public | Create user (dev only) |
| POST | `/api/v1/compare` | Officer | Run a price comparison |
| GET | `/api/v1/compare/:id` | Officer | Get comparison result |
| GET | `/api/v1/products/:id` | Officer, Auditor | Get GeM product |
| GET | `/api/v1/comparisons` | Officer, Auditor | List comparisons |
| GET | `/api/v1/comparisons/:id` | Officer, Auditor | Get comparison detail |
| POST | `/api/v1/certificates/:comparisonId` | Officer | Generate audit certificate |
| GET | `/api/v1/certificates/:id` | Officer, Auditor | Download certificate |
| GET | `/api/v1/certificates/:id/verify` | Public | Verify certificate hash |
| GET | `/api/v1/anomalies` | Auditor, Admin | List flagged products |
| GET | `/api/v1/health` | Public | Health check |

---

## Mock Data vs Live Scraping

- By default `USE_MOCK_DATA=true` in `.env` — all marketplace data comes from `ai-service/data/*.json`
- Set `USE_MOCK_DATA=false` to enable real Playwright scrapers (requires DaaS API keys for anti-bot bypassing)
- The matching engine, TCO normalizer and anomaly detector work identically in both modes

---

## Roadmap

- [x] Phase 1: Foundation (project structure, env, README)
- [x] Phase 2: Backend (Express + MongoDB + JWT + all routes)
- [x] Phase 3: AI Service (scraper + matcher + TCO + anomaly)
- [ ] Phase 4: PDF Service (certificate generation + SHA-256 hash)
- [ ] Phase 5: Frontend (React dashboard + comparison UI)
- [ ] Phase 6: Chrome Extension
- [ ] Phase 7: Real scraping (Playwright + DaaS)
- [ ] Phase 8: BullMQ/Redis async queue (Stage B)
- [ ] Phase 9: Docker Compose deployment
