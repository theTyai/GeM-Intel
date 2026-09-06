const express = require('express');
const router = express.Router();
const { generateCertificate, computeContentHash } = require('../services/pdfGenerator');

/**
 * POST /generate
 * Body: comparison data from backend
 * Returns: { pdfUrl, contentHash, ledgerTxId }
 */
router.post('/', async (req, res, next) => {
  try {
    const data = req.body;

    if (!data.comparisonId) {
      return res.status(400).json({ error: 'comparisonId is required' });
    }

    const result = await generateCertificate(data);

    res.json({
      success: true,
      pdfUrl: result.pdfUrl,
      contentHash: result.contentHash,
      ledgerTxId: result.ledgerTxId,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /verify
 * Verifies a certificate's content hash without needing the PDF file.
 * Body: { contentData: object, expectedHash: string }
 */
router.post('/verify', (req, res) => {
  const { contentData, expectedHash } = req.body;
  if (!contentData || !expectedHash) {
    return res.status(400).json({ error: 'contentData and expectedHash required' });
  }
  const computedHash = computeContentHash(contentData);
  res.json({
    isValid: computedHash === expectedHash,
    computedHash,
    expectedHash,
  });
});

module.exports = router;
