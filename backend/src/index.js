require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes     = require('./routes/auth');
const incidentRoutes = require('./routes/incidents');
const userRoutes     = require('./routes/users');
const statsRoutes    = require('./routes/stats');
const aiProxyRoutes  = require('./routes/aiProxy');
const { errorHandler } = require('./middleware/errorHandler');
const { auditLogger }  = require('./middleware/audit');

const app = express();

// ── Security ────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));

// ── Performance ─────────────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Static Files ────────────────────────────────────────────────────────
const fs = require('fs');
const path = require('path');
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// ── Logging ─────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// ── Rate limiting ────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// ── Health check ─────────────────────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({ status: 'healthy', service: 'IMS Core Backend', timestamp: new Date() })
);

// ── Audit middleware ─────────────────────────────────────────────────────
app.use('/api/v1', auditLogger);

// ── Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1/auth',      authRoutes);
app.use('/api/v1/incidents', incidentRoutes);
app.use('/api/v1/users',     userRoutes);
app.use('/api/v1/stats',     statsRoutes);
app.use('/api/v1/ai',        aiProxyRoutes);

// ── 404 ──────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Global error handler ─────────────────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 IMS Backend running on port ${PORT} [${process.env.NODE_ENV}]`));

module.exports = app;
