// API base URL - uses relative path in dev, absolute URL in production.
export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const apiFetch = (path: string, options?: RequestInit) =>
  fetch(API_URL + path, options);
