import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('govToken'));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('govUser') || 'null'); } catch { return null; }
  });

  const login = useCallback((tok, usr) => {
    localStorage.setItem('govToken', tok);
    localStorage.setItem('govUser', JSON.stringify(usr));
    setToken(tok);
    setUser(usr);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('govToken');
    localStorage.removeItem('govUser');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
