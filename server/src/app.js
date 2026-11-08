const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const { rateLimit } = require('express-rate-limit');
const { config } = require('./config');
const { getDb } = require('./db');
const tasksRouter = require('./routes/tasks');
const authRouter = require('./routes/auth');
const { requireAuth } = require('./authMiddleware');
const { notFoundHandler, errorHandler } = require('./errorHandler');

const JSON_BODY_LIMIT = '10kb';

function createApp({
  authRateLimitMax = config.authRateLimitMax,
  authRateLimitWindowMs = config.authRateLimitWindowMs,
} = {}) {
  const app = express();

  app.use(pinoHttp({ level: config.logLevel }));
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins }));
  app.use(express.json({ limit: JSON_BODY_LIMIT }));

  app.get('/api/health', (req, res) => {
    try {
      getDb().prepare('SELECT 1').get();
      res.status(200).json({ status: 'ok' });
    } catch (err) {
      req.log.error({ err }, 'Health check failed');
      res.status(503).json({ status: 'error' });
    }
  });

  const authLimiter = rateLimit({
    windowMs: authRateLimitWindowMs,
    limit: authRateLimitMax,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many attempts, please try again later' },
  });

  app.use('/api/auth', authLimiter, authRouter);
  app.use('/api/tasks', requireAuth, tasksRouter);

  app.use('/api', notFoundHandler);
  app.use(errorHandler);

  return app;
}

const app = createApp();
app.createApp = createApp;

module.exports = app;
