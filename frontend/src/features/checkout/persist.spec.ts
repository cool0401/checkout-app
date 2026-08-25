import { clearPersistedCheckout, loadPersistedCheckout, savePersistedCheckout } from './persist';

describe('checkout persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns undefined when nothing is stored', () => {
    expect(loadPersistedCheckout()).toBeUndefined();
  });

  it('round-trips a saved state', () => {
    savePersistedCheckout({ step: 'summary', quantity: 2 });
    expect(loadPersistedCheckout()).toEqual({ step: 'summary', quantity: 2 });
  });

  it('clears the stored state', () => {
    savePersistedCheckout({ step: 'summary' });
    clearPersistedCheckout();
    expect(loadPersistedCheckout()).toBeUndefined();
  });

  it('returns undefined when the stored value is not valid JSON', () => {
    window.localStorage.setItem('checkout-state-v1', '{not-json');
    expect(loadPersistedCheckout()).toBeUndefined();
  });

  it('does not throw when localStorage.getItem fails', () => {
    const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(loadPersistedCheckout()).toBeUndefined();
    spy.mockRestore();
  });

  it('does not throw when localStorage.setItem fails', () => {
    const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    expect(() => savePersistedCheckout({ step: 'summary' })).not.toThrow();
    spy.mockRestore();
  });

  it('does not throw when localStorage.removeItem fails', () => {
    const spy = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => clearPersistedCheckout()).not.toThrow();
    spy.mockRestore();
  });
});
