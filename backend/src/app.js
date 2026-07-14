const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const appConfig = require('./shared/config/app.config');
const errorHandler = require('./shared/middleware/errorHandler.middleware');
const { API } = require('./shared/constants');

const app = express();

// ─── Security & Utility Middleware ─────────────────────────
// Set security HTTP headers
app.use(helmet());

// Enable CORS based on config
app.use(cors({
  origin: appConfig.corsOrigin,
  credentials: true,
}));

// Parse JSON request bodies
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── API Routes (Registered here as modules are built) ───────
app.use(`${API.PREFIX}/auth`, require('./modules/auth/auth.routes'));
app.use(`${API.PREFIX}/users`, require('./modules/users/users.routes'));
app.use(`${API.PREFIX}/complaints`, require('./modules/complaints/complaints.routes'));
app.use(`${API.PREFIX}/billing`, require('./modules/billing/billing.routes'));
// etc.

// ─── Health Check ──────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', env: appConfig.env });
});

// ─── 404 Handler ───────────────────────────────────────────
app.use((req, res, next) => {
  const { NotFoundError } = require('./shared/errors');
  next(new NotFoundError(`Route ${req.originalUrl}`));
});

// ─── Global Error Handler ──────────────────────────────────
app.use(errorHandler);

module.exports = app;
