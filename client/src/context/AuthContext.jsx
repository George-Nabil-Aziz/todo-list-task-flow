import { createContext, useContext, useState, useCallback } from 'react';
import { getToken, setToken, clearToken, getUsername, setUsername, clearUsername } from '../auth/tokenStorage.js';
import * as authApi from '../api/authApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken());
  const [username, setUsernameState] = useState(() => getUsername());

  const login = useCallback(async (email, password) => {
    const { token: newToken, user } = await authApi.login(email, password);
    setToken(newToken);
    setTokenState(newToken);
    setUsername(user.username);
    setUsernameState(user.username);
  }, []);

  const register = useCallback(async (email, password, username) => {
    const { token: newToken, user } = await authApi.register(email, password, username);
    setToken(newToken);
    setTokenState(newToken);
    setUsername(user.username);
    setUsernameState(user.username);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    clearUsername();
    setTokenState(null);
    setUsernameState(null);
  }, []);

  const value = { isAuthenticated: Boolean(token), username, login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
