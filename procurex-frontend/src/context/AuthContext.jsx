import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { loginUser, registerUser } from "../api/auth";
import { getCurrentUser } from "../api/users";
import { getStoredToken, setStoredToken } from "../api/axiosClient";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(null);
  // `initializing` covers the one-time "do we have a valid session?" check
  // on app load, so protected routes don't flash a login redirect.
  const [initializing, setInitializing] = useState(true);
  const [authError, setAuthError] = useState(null);

  const loadCurrentUser = useCallback(async () => {
    try {
      const me = await getCurrentUser();
      setUser(me);
      return me;
    } catch (err) {
      // Token is invalid/expired — reset the session.
      setStoredToken(null);
      setToken(null);
      setUser(null);
      throw err;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!token) {
        setInitializing(false);
        return;
      }
      try {
        await loadCurrentUser();
      } catch {
        // Silently fall through to logged-out state.
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
    // Only run on mount / when token identity actually changes via login.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (credentials) => {
    setAuthError(null);
    const data = await loginUser(credentials);
    setStoredToken(data.access_token);
    setToken(data.access_token);
    const me = await loadCurrentUser();
    return me;
  }, [loadCurrentUser]);

  const register = useCallback(async (payload) => {
    setAuthError(null);
    return registerUser(payload);
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      initializing,
      authError,
      setAuthError,
      login,
      register,
      logout,
      refreshUser: loadCurrentUser,
    }),
    [token, user, initializing, authError, login, register, logout, loadCurrentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
