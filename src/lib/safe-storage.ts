/**
 * localStorage that never throws (private mode, blocked storage, SSR).
 * The site works fully without it.
 */
export const safeStorage = {
  get(key: string): string | null {
    try {
      return typeof window === "undefined"
        ? null
        : window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Storage unavailable: preference simply isn't remembered.
    }
  },
};

export const STORAGE_KEYS = {
  precision: "btutotons:precision",
} as const;
