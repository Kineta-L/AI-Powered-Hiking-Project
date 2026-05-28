// API base URL - uses relative path in dev (via Vite proxy), absolute in production
export const API_URL = import.meta.env.VITE_API_URL || '';
export const apiFetch = (path: string, options?: RequestInit) =>
  fetch(API_URL + path, options);
