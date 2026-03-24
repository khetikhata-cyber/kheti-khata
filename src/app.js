require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const appConfig = require('./config/app');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');
const { apiLimiter } = require('./middlewares/rateLimiter');
const { seedSystemCategories } = require('./services/category.service');

// Route imports
const authRoutes = require('./routes/auth.routes');
const fieldRoutes = require('./routes/field.routes');
const cropRoutes = require('./routes/crop.routes');
const expenseRoutes = require('./routes/expense.routes');
const categoryRoutes = require('./routes/category.routes');
const loanRoutes = require('./routes/loan.routes');
const dealerRoutes = require('./routes/dealer.routes');
const settlementRoutes = require('./routes/settlement.routes');
const syncRoutes = require('./routes/sync.routes');
const bataidaarRoutes = require('./routes/bataidaar.routes');
const productionRoutes = require('./routes/production.routes');
const saleRoutes = require('./routes/sale.routes');
const trashRoutes = require('./routes/trash.routes');

const app = express();

// ─── Security Middleware ────────────────────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || appConfig.cors.allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// ─── Request Parsing ────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ────────────────────────────────────────────────────────────────
if (appConfig.nodeEnv !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.info(msg.trim()) },
    })
  );
}

// ─── Rate Limiting ──────────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Krishi Khata API is running',
    environment: appConfig.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ─────────────────────────────────────────────────────────────
const API = '/api/v1';

app.use(`${API}/auth`, authRoutes);
app.use(`${API}/fields`, fieldRoutes);
app.use(`${API}/crops`, cropRoutes);
app.use(`${API}/expenses`, expenseRoutes);
app.use(`${API}/categories`, categoryRoutes);
app.use(`${API}/loans`, loanRoutes);
app.use(`${API}/dealers`, dealerRoutes);
app.use(`${API}/settlements`, settlementRoutes);
app.use(`${API}/sync`, syncRoutes);
app.use(`${API}/bataidaars`, bataidaarRoutes);
app.use(`${API}/productions`, productionRoutes);
app.use(`${API}/sales`, saleRoutes);
app.use(`${API}/trash`, trashRoutes);

app.use(`${API}/status`, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
  });
});

// ─── 404 & Error Handlers ───────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();

    // Seed system expense categories on startup
    await seedSystemCategories();

    app.listen(appConfig.port, () => {
      logger.info(`✅ Server running on port ${appConfig.port} [${appConfig.nodeEnv}]`);
      logger.info(`📡 API base: http://localhost:${appConfig.port}${API}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

startServer();

module.exports = app;
