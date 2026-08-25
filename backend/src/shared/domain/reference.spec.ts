import { generateReference } from './reference';

describe('generateReference', () => {
  it('starts with the given prefix', () => {
    expect(generateReference('TXN')).toMatch(/^TXN-/);
  });

  it('defaults to the CHK prefix', () => {
    expect(generateReference()).toMatch(/^CHK-/);
  });

  it('generates unique references on subsequent calls', () => {
    const first = generateReference();
    const second = generateReference();
    expect(first).not.toBe(second);
  });
});
