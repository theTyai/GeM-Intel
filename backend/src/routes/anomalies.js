const express = require('express');
const Comparison = require('../models/Comparison');

const router = express.Router();

router.get('/', async (req, res) => {
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
    .sort({ createdAt: -1 });

  res.json(anomalies);
});

module.exports = router;

