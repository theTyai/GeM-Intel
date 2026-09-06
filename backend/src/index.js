require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Import routes
const compareRoutes = require('./routes/compare');
const productsRoutes = require('./routes/products');
const comparisonsRoutes = require('./routes/comparisons');
const certificatesRoutes = require('./routes/certificates');
const anomaliesRoutes = require('./routes/anomalies');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
const allowedOrigins = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, 'http://localhost:5173', 'chrome-extension://*'] : '*';
app.use(cors({ origin: allowedOrigins }));
app.use(morgan('dev'));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Mount Routes
const apiRouter = express.Router();

apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'gem-intel-backend' });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/compare', compareRoutes);
apiRouter.use('/products', productsRoutes);
apiRouter.use('/comparisons', comparisonsRoutes);
apiRouter.use('/certificates', certificatesRoutes);
apiRouter.use('/anomalies', anomaliesRoutes);

app.use('/api/v1', apiRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
