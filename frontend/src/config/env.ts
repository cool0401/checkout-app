/**
 * Only file allowed to read `import.meta.env` — Jest cannot parse that syntax,
 * so jest.config.cjs maps every import of this module to ./env.jest.ts instead.
 */
export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
export const WOMPI_PUBLIC_KEY: string = import.meta.env.VITE_WOMPI_PUBLIC_KEY ?? '';
export const WOMPI_API_URL: string =
  import.meta.env.VITE_WOMPI_API_URL ?? 'https://api-sandbox.co.uat.wompi.dev/v1';
