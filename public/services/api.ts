export type UserRole = 'Admin' | 'Organizer' | 'Volunteer';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || '/api/v1';

export const api = {
  baseURL: API_BASE_URL,
  timeout: 10000,
};

export default api;
