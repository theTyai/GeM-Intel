const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const Comparison = require('../models/Comparison');

const router = express.Router();

router.get('/', authenticate, authorize('auditor', 'admin'), async (req, res) => {
  const anomalies = await Comparison.find({
    status: {
      $in: [
        'review_recommended',
        'high_risk_variance',
        'review_required',
        'non_compliant',
      ],
    },
  })
    .populate('gemProductId')
    .populate('requestedBy', 'name department email')
    .sort({ createdAt: -1 });

  res.json(anomalies);
});

module.exports = router;
