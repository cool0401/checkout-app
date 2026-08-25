import configuration from './configuration';

describe('configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('falls back to sensible defaults when no env vars are set', () => {
    delete process.env.PORT;
    delete process.env.CORS_ORIGIN;
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.DB_USERNAME;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_NAME;
    delete process.env.BASE_FEE_IN_CENTS;
    delete process.env.DELIVERY_FEE_IN_CENTS;
    delete process.env.CURRENCY;
    delete process.env.WOMPI_API_URL;
    delete process.env.WOMPI_PRIVATE_KEY;
    delete process.env.WOMPI_INTEGRITY_SECRET;
    delete process.env.WOMPI_POLL_ATTEMPTS;
    delete process.env.WOMPI_POLL_DELAY_MS;

    const config = configuration();

    expect(config.port).toBe(3000);
    expect(config.corsOrigin).toBe('http://localhost:5173');
    expect(config.database).toEqual({ host: 'localhost', port: 5432, username: 'postgres', password: 'postgres', name: 'checkout' });
    expect(config.fees).toEqual({ baseFeeInCents: 500000, deliveryFeeInCents: 800000, currency: 'COP' });
    expect(config.wompi).toEqual({
      apiUrl: 'https://api-sandbox.co.uat.wompi.dev/v1',
      privateKey: '',
      integritySecret: '',
      pollAttempts: 10,
      pollDelayMs: 1500,
    });
  });

  it('reads every value from the environment when provided', () => {
    process.env.PORT = '8080';
    process.env.CORS_ORIGIN = 'https://app.example.com';
    process.env.DB_HOST = 'db.internal';
    process.env.DB_PORT = '6543';
    process.env.DB_USERNAME = 'app';
    process.env.DB_PASSWORD = 'secret';
    process.env.DB_NAME = 'appdb';
    process.env.BASE_FEE_IN_CENTS = '1000';
    process.env.DELIVERY_FEE_IN_CENTS = '2000';
    process.env.CURRENCY = 'USD';
    process.env.WOMPI_API_URL = 'https://api.wompi.example/v1';
    process.env.WOMPI_PRIVATE_KEY = 'prv_live';
    process.env.WOMPI_INTEGRITY_SECRET = 'integrity';
    process.env.WOMPI_POLL_ATTEMPTS = '3';
    process.env.WOMPI_POLL_DELAY_MS = '250';

    const config = configuration();

    expect(config.port).toBe(8080);
    expect(config.corsOrigin).toBe('https://app.example.com');
    expect(config.database).toEqual({ host: 'db.internal', port: 6543, username: 'app', password: 'secret', name: 'appdb' });
    expect(config.fees).toEqual({ baseFeeInCents: 1000, deliveryFeeInCents: 2000, currency: 'USD' });
    expect(config.wompi).toEqual({
      apiUrl: 'https://api.wompi.example/v1',
      privateKey: 'prv_live',
      integritySecret: 'integrity',
      pollAttempts: 3,
      pollDelayMs: 250,
    });
  });
});
