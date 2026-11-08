require('dotenv').config({ quiet: true });

const DEV_JWT_SECRET = 'dev-secret-do-not-use-in-production';
const MIN_JWT_SECRET_LENGTH = 32;

class ConfigError extends Error {}

function parseList(value, fallback) {
  if (!value) {
    return fallback;
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parsePositiveInt(value, fallback, name) {
  if (value === undefined || value === '') {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ConfigError(`${name} must be a positive integer`);
  }
  return parsed;
}

// Builds the app configuration from an env object. In production a missing or weak
// JWT_SECRET is fatal, so the server refuses to start instead of signing forgeable tokens.
function loadConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';
  const isTest = nodeEnv === 'test';

  const jwtSecret = env.JWT_SECRET;
  if (isProduction) {
    if (!jwtSecret) {
      throw new ConfigError('JWT_SECRET must be set in production');
    }
    if (jwtSecret.length < MIN_JWT_SECRET_LENGTH || jwtSecret === DEV_JWT_SECRET) {
      throw new ConfigError(`JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters in production`);
    }
  }

  return {
    nodeEnv,
    isProduction,
    isTest,
    port: parsePositiveInt(env.PORT, 4000, 'PORT'),
    jwtSecret: jwtSecret || DEV_JWT_SECRET,
    corsOrigins: parseList(env.CORS_ORIGIN, ['http://localhost:5173']),
    authRateLimitMax: parsePositiveInt(env.AUTH_RATE_LIMIT_MAX, isTest ? 1000 : 10, 'AUTH_RATE_LIMIT_MAX'),
    authRateLimitWindowMs: parsePositiveInt(env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000, 'AUTH_RATE_LIMIT_WINDOW_MS'),
    logLevel: env.LOG_LEVEL || (isTest ? 'silent' : 'info'),
  };
}

const config = loadConfig();

module.exports = { config, loadConfig, ConfigError, DEV_JWT_SECRET, MIN_JWT_SECRET_LENGTH };
