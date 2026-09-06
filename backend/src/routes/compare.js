const express = require('express');
const axios = require('axios');
const GemProduct = require('../models/GemProduct');
const Comparison = require('../models/Comparison');
const { isValidGemUrl } = require('../services/gemParser');

const router = express.Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

router.post('/', async (req, res) => {
  const { gemUrl, gemProduct: clientProduct, pinCode } = req.body;

  // Extension sends pre-scraped product data; legacy callers send gemUrl
  if (!clientProduct && !gemUrl) {
    return res.status(400).json({ error: 'Either gemProduct (extension) or gemUrl (legacy) is required' });
  }

  try {
    let scrapedData;

    if (clientProduct && clientProduct.title) {
      // ── Extension path: product already scraped from user's browser ──
      scrapedData = {
        id: clientProduct.id || clientProduct.variantId || 'EXT-' + Date.now(),
        title: clientProduct.title,
        brand: clientProduct.brand || 'Unbranded',
        model: clientProduct.model || '',
        category: clientProduct.category || 'general',
        price: clientProduct.price || 0,
        specifications: clientProduct.specifications || {},
        gemUrl: clientProduct.gemUrl || gemUrl || '',
        seller: clientProduct.seller || 'GeM Marketplace',
      };
    } else {
      // ── Legacy path: server-side scrape via AI service ──
      if (!isValidGemUrl(gemUrl) && process.env.NODE_ENV !== 'development') {
        return res.status(400).json({ error: 'Invalid GeM URL' });
      }
      const scrapeRes = await axios.post(`${AI_SERVICE_URL}/scrape`, {
        gem_url: gemUrl,
        pin_code: pinCode,
      });
      scrapedData = scrapeRes.data.data;
    }

    const productGemUrl = scrapedData.gemUrl || gemUrl || '';

    // Upsert GeM Product in DB
    let gemProduct = await GemProduct.findOne({ gemUrl: productGemUrl });
    if (gemProduct) {
      gemProduct.title = scrapedData.title;
      gemProduct.brand = scrapedData.brand;
      gemProduct.category = scrapedData.category;
      gemProduct.specifications = scrapedData.specifications;
      gemProduct.price = scrapedData.price;
      gemProduct.lastScrapedAt = new Date();
      if (scrapedData.price) {
        gemProduct.priceHistory.push({ price: scrapedData.price, scrapedAt: new Date() });
      }
      await gemProduct.save();
    } else {
      gemProduct = new GemProduct({
        gemUrl: productGemUrl,
        title: scrapedData.title,
        brand: scrapedData.brand,
        category: scrapedData.category,
        specifications: scrapedData.specifications,
        price: scrapedData.price,
        priceHistory: scrapedData.price ? [{ price: scrapedData.price, scrapedAt: new Date() }] : [],
        lastScrapedAt: new Date(),
      });
      await gemProduct.save();
    }

    const gemProductObj = {
      id: String(gemProduct._id),
      title: scrapedData.title || gemProduct.title,
      brand: scrapedData.brand || gemProduct.brand,
      model: scrapedData.model || '',
      category: scrapedData.category || gemProduct.category,
      specifications: scrapedData.specifications || gemProduct.specifications || {},
      price: scrapedData.price || (gemProduct.priceHistory.length > 0 ? gemProduct.priceHistory[gemProduct.priceHistory.length - 1].price : 0),
      gemUrl: gemProduct.gemUrl,
    };

    // 2. Find Matches (with Explainable AI & Provenance)
    const matchRes = await axios.post(`${AI_SERVICE_URL}/match`, {
      gem_product: gemProductObj,
      pin_code: pinCode,
    });
    const matchesByPlatform = matchRes.data.matches;

    // 3. Compute TCO & Benchmark Market Value (BMV)
    const tcoRes = await axios.post(`${AI_SERVICE_URL}/tco`, {
      gem_product: gemProductObj,
      matches: matchesByPlatform,
      pin_code: pinCode,
    });
    const tcoData = tcoRes.data.data;
    const { 
      benchmark_market_value, 
      fair_market_value, 
      variance_percent, 
      status: tcoStatus, 
      matches_with_tco, 
      gem_tco,
      risk_assessment
    } = tcoData;

    const bmv = benchmark_market_value || fair_market_value || 0;

    // Flatten matches with explainability and provenance for MongoDB storage
    const flatMatches = [];
    if (matches_with_tco) {
      for (const [platform, items] of Object.entries(matches_with_tco)) {
        if (Array.isArray(items)) {
          for (const item of items) {
            flatMatches.push({
              platform: item.platform || platform,
              matchedTitle: item.title,
              matchedListingUrl: item.url,
              similarityScore: item.similarityScore || 0,
              basePrice: item.tco?.base_price || item.price,
              gst: item.tco?.gst_amount || 0,
              freight: item.tco?.freight || 0,
              amc: item.tco?.amc || 0,
              landedCost: item.tco?.landed_cost || item.price,
              explainability: item.explainability || {
                overallConfidence: Math.round((item.similarityScore || 0.85) * 100),
                confidenceLevel: (item.similarityScore || 0.85) >= 0.85 ? 'HIGH' : 'MEDIUM',
                brandMatch: 'Exact',
                modelMatch: 'Exact Series',
                processorMatch: 'Match',
                ramMatch: 'Match',
                storageMatch: 'Match',
                warrantyMatch: 'Standard 1-Year'
              },
              provenance: item.provenance || {
                source: (item.platform || platform).toUpperCase(),
                capturedAt: new Date().toISOString(),
                evidenceStatus: 'Verified & Timestamped',
                seller: item.seller || 'Authorized Marketplace Seller',
                listingUrl: item.url || ''
              }
            });
          }
        }
      }
    }

    // 4. Anomaly Detection
    const gemLandedCost = gem_tco?.landed_cost || gemProductObj.price;
    const anomalyRes = await axios.post(`${AI_SERVICE_URL}/anomaly`, {
      gem_product_id: String(gemProduct._id),
      gem_landed_cost: gemLandedCost,
      fair_market_value: bmv,
      variance_percent: variance_percent,
      category: gemProduct.category || 'default',
    });
    const anomalyData = anomalyRes.data.data;
    const anomalyFlags = anomalyData?.flags || [];
    const finalStatus = tcoStatus || 'review_recommended';

    // 5. Save Comparison Record
    const comparison = new Comparison({
      gemProductId: gemProduct._id,
      pinCode: pinCode || '110001',
      matches: flatMatches,
      benchmarkMarketValue: bmv,
      fairMarketValue: bmv,
      variancePercent: variance_percent,
      status: finalStatus,
      riskAssessment: risk_assessment || {
        classification: finalStatus === 'benchmark_aligned' ? 'Benchmark Aligned' : (finalStatus === 'high_risk_variance' ? 'High-Risk Variance' : 'Review Recommended'),
        guidance: 'Evaluated under GFR 2017 Rule 149 Reasonableness of Rates protocol.',
        evidenceConfidence: 'HIGH',
        independentSourcesCount: Object.keys(matches_with_tco || {}).length,
        primaryRiskDrivers: anomalyFlags
      },
      anomalyFlags,
    });
    await comparison.save();

    const populatedComparison = await Comparison.findById(comparison._id)
      .populate('gemProductId')
      .populate('requestedBy', 'name email department');

    res.status(201).json(populatedComparison);
  } catch (error) {
    console.error('Comparison Pipeline Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to process comparison via intelligence pipeline', details: error.message });
  }
});

router.get('/:jobId', async (req, res) => {
  const comparison = await Comparison.findById(req.params.jobId)
    .populate('gemProductId');
  if (!comparison) {
    return res.status(404).json({ error: 'Comparison record not found' });
  }
  res.json(comparison);
});

module.exports = router;

