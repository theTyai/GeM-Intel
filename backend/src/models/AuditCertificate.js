const mongoose = require('mongoose');

const auditCertificateSchema = new mongoose.Schema({
  certificateNumber: {
    type: String,
    default: () => `GI-2026-${Math.floor(100000 + Math.random() * 900000)}`,
  },
  comparisonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comparison', required: true },
  procurementRef: { type: String },
  pdfUrl: String,
  contentHash: String,
  ledgerTxId: String,
  gfrRuleReference: { type: String, default: 'GFR 2017 — Rule 149 (Reasonableness of Rates)' },
  evidenceSnapshot: {
    gemProductTitle: String,
    gemLandedCost: Number,
    benchmarkMarketValue: Number,
    variancePercent: Number,
    riskClassification: String,
    marketSourcesCount: Number,
    capturedAt: { type: Date, default: Date.now },
  },
  issuedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issuedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AuditCertificate', auditCertificateSchema);
