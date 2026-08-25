const STORAGE_KEY = 'checkout-state-v1';

export function loadPersistedCheckout<T>(): T | undefined {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

export function savePersistedCheckout<T>(state: T): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage can be unavailable (private mode, quota) — checkout still
    // works in-memory for the current tab, it just won't survive a refresh.
  }
}

export function clearPersistedCheckout(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // see savePersistedCheckout
  }
}
