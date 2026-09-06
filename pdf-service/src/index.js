require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const certificateRoutes = require('./routes/certificate');

const app = express();
const PORT = process.env.PDF_PORT || 5001;

app.use(cors({ origin: ['http://localhost:5000', 'http://localhost:5173'] }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// Serve generated PDFs statically
app.use('/pdfs', express.static('generated'));

app.use('/generate', certificateRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'gem-intel-pdf-service', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('[PDF Service Error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal PDF service error' });
});

app.listen(PORT, () => {
  console.log(`[PDF Service] Running on http://localhost:${PORT}`);
});
