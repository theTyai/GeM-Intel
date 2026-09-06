const mongoose = require('mongoose');

const matchItemSchema = new mongoose.Schema({
  platform: String,
  matchedTitle: String,
  matchedListingUrl: String,
  similarityScore: Number,
  basePrice: Number,
  gst: Number,
  freight: Number,
  amc: Number,
  landedCost: Number,
  explainability: {
    overallConfidence: Number,
    confidenceLevel: String,
    brandMatch: String,
    modelMatch: String,
    processorMatch: String,
    ramMatch: String,
    storageMatch: String,
    warrantyMatch: String,
  },
  provenance: {
    source: String,
    capturedAt: String,
    evidenceStatus: String,
    seller: String,
    listingUrl: String,
  },
});

const comparisonSchema = new mongoose.Schema({
  procurementRef: { type: String, default: () => `PR-2026-${Math.floor(1000 + Math.random() * 9000)}` },
  gemProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'GemProduct', required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pinCode: { type: String, required: true },
  matches: [matchItemSchema],
  benchmarkMarketValue: Number,
  fairMarketValue: Number, // backwards-compatible alias
  variancePercent: Number,
  status: {
    type: String,
    enum: [
      'benchmark_aligned',
      'review_recommended',
      'high_risk_variance',
      'compliant',
      'review_required',
      'non_compliant',
    ],
    default: 'benchmark_aligned',
  },
  riskAssessment: {
    classification: String,
    guidance: String,
    evidenceConfidence: String,
    independentSourcesCount: Number,
    primaryRiskDrivers: [String],
  },
  anomalyFlags: [String],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Comparison', comparisonSchema);
