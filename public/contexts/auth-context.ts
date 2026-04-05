import { createContext } from 'react';
import type { AuthUser, UserRole } from '../services/api';

export type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: UserRole;
  }) => Promise<void>;
  updateProfile: (payload: { fullName: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
