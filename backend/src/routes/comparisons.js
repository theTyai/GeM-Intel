const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const Comparison = require('../models/Comparison');

const router = express.Router();

router.get('/', authenticate, authorize('officer', 'auditor'), async (req, res) => {
  const { status, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filter.createdAt.$lte = new Date(dateTo);
  }

  const comparisons = await Comparison.find(filter)
    .populate('gemProductId', 'title brand')
    .populate('requestedBy', 'name department')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Comparison.countDocuments(filter);

  res.json({
    data: comparisons,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  });
});

router.get('/:id', authenticate, authorize('officer', 'auditor'), async (req, res) => {
  const comparison = await Comparison.findById(req.params.id)
    .populate('gemProductId')
    .populate('requestedBy', 'name department email');
  if (!comparison) {
    return res.status(404).json({ error: 'Comparison not found' });
  }
  res.json(comparison);
});

module.exports = router;
