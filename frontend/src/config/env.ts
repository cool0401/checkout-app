// jest can't parse import.meta.env, so jest.config.cjs maps this file to env.jest.ts
export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
export const WOMPI_PUBLIC_KEY: string = import.meta.env.VITE_WOMPI_PUBLIC_KEY ?? '';
export const WOMPI_API_URL: string =
  import.meta.env.VITE_WOMPI_API_URL ?? 'https://api-sandbox.co.uat.wompi.dev/v1';
