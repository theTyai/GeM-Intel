const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const GemProduct = require('../models/GemProduct');

const router = express.Router();

router.get('/:id', authenticate, authorize('officer', 'auditor'), async (req, res) => {
  const product = await GemProduct.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

module.exports = router;
