import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  API_UNAUTHORIZED_EVENT,
  authService,
  getApiErrorMessage,
  type AuthUser,
  type UserRole,
} from '../services/api';
import { AuthContext, type AuthContextValue } from './auth-context';

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const response = await authService.me();
      setUser(response.data.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      await refreshSession();
      setIsLoading(false);
    };

    void bootstrap();
  }, [refreshSession]);

  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener(API_UNAUTHORIZED_EVENT, onUnauthorized);
    return () => {
      window.removeEventListener(API_UNAUTHORIZED_EVENT, onUnauthorized);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    setUser(response.data.user);
  }, []);

  const register = useCallback(
    async (payload: { email: string; password: string; fullName: string; phone?: string; role?: UserRole }) => {
      const response = await authService.register(payload);
      setUser(response.data.user);
    },
    [],
  );

  const updateProfile = useCallback(async (payload: { fullName: string; phone?: string }) => {
    const response = await authService.updateProfile({
      fullName: payload.fullName,
      phone: payload.phone || null,
    });
    setUser(response.data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Dang xuat that bai.'));
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      updateProfile,
      logout,
      refreshSession,
    }),
    [isLoading, login, logout, refreshSession, register, updateProfile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
