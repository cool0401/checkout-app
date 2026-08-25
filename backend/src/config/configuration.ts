export interface AppConfig {
  port: number;
  corsOrigin: string;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
  };
  fees: {
    baseFeeInCents: number;
    deliveryFeeInCents: number;
    currency: string;
  };
  wompi: {
    apiUrl: string;
    privateKey: string;
    integritySecret: string;
    pollAttempts: number;
    pollDelayMs: number;
  };
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    name: process.env.DB_NAME ?? 'checkout',
  },
  fees: {
    baseFeeInCents: parseInt(process.env.BASE_FEE_IN_CENTS ?? '500000', 10),
    deliveryFeeInCents: parseInt(process.env.DELIVERY_FEE_IN_CENTS ?? '800000', 10),
    currency: process.env.CURRENCY ?? 'COP',
  },
  wompi: {
    apiUrl: process.env.WOMPI_API_URL ?? 'https://api-sandbox.co.uat.wompi.dev/v1',
    privateKey: process.env.WOMPI_PRIVATE_KEY ?? '',
    integritySecret: process.env.WOMPI_INTEGRITY_SECRET ?? '',
    pollAttempts: parseInt(process.env.WOMPI_POLL_ATTEMPTS ?? '10', 10),
    pollDelayMs: parseInt(process.env.WOMPI_POLL_DELAY_MS ?? '1500', 10),
  },
});
