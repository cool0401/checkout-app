import { TextDecoder, TextEncoder } from 'node:util';
import '@testing-library/jest-dom';

if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder;
  globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;
}
