const mongoose = require('mongoose');

const gemProductSchema = new mongoose.Schema({
  gemUrl: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  brand: { type: String },
  category: { type: String },
  specifications: { type: mongoose.Schema.Types.Mixed, default: {} },
  price: Number,
  priceHistory: [
    {
      price: Number,
      scrapedAt: Date,
    },
  ],
  lastScrapedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('GemProduct', gemProductSchema);
