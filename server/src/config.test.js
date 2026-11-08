const { loadConfig, ConfigError, DEV_JWT_SECRET } = require('./config');

const STRONG_SECRET = 'x'.repeat(32);

describe('loadConfig', () => {
  test('falls back to development defaults', () => {
    const config = loadConfig({});
    expect(config).toMatchObject({
      nodeEnv: 'development',
      isProduction: false,
      port: 4000,
      jwtSecret: DEV_JWT_SECRET,
      corsOrigins: ['http://localhost:5173'],
      authRateLimitMax: 10,
    });
  });

  test('parses a comma-separated CORS_ORIGIN list', () => {
    const config = loadConfig({ CORS_ORIGIN: 'https://a.com, https://b.com ,' });
    expect(config.corsOrigins).toEqual(['https://a.com', 'https://b.com']);
  });

  test('refuses to load in production without JWT_SECRET', () => {
    expect(() => loadConfig({ NODE_ENV: 'production' })).toThrow(ConfigError);
  });

  test('refuses a short or default JWT_SECRET in production', () => {
    expect(() => loadConfig({ NODE_ENV: 'production', JWT_SECRET: 'short' })).toThrow(ConfigError);
    expect(() => loadConfig({ NODE_ENV: 'production', JWT_SECRET: DEV_JWT_SECRET })).toThrow(
      ConfigError,
    );
  });

  test('accepts a strong JWT_SECRET in production', () => {
    const config = loadConfig({ NODE_ENV: 'production', JWT_SECRET: STRONG_SECRET });
    expect(config.isProduction).toBe(true);
    expect(config.jwtSecret).toBe(STRONG_SECRET);
  });

  test('rejects non-numeric numeric settings', () => {
    expect(() => loadConfig({ PORT: 'abc' })).toThrow(ConfigError);
    expect(() => loadConfig({ AUTH_RATE_LIMIT_MAX: '0' })).toThrow(ConfigError);
  });
});
