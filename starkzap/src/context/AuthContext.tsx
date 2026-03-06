import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  email: string;
  walletAddress: string | null;
}

interface AuthContextType {
  auth: AuthState;
  setEmail: (email: string) => void;
  setWalletAddress: (address: string) => void;
  login: () => void;
  logout: () => void;
}

const defaultAuth: AuthState = {
  isAuthenticated: false,
  email: '',
  walletAddress: null,
};

const AuthContext = createContext<AuthContextType>({
  auth: defaultAuth,
  setEmail: () => {},
  setWalletAddress: () => {},
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>(defaultAuth);

  const setEmail = useCallback(
    (email: string) => setAuth((prev) => ({ ...prev, email })),
    []
  );

  const setWalletAddress = useCallback(
    (walletAddress: string) => setAuth((prev) => ({ ...prev, walletAddress })),
    []
  );

  const login = useCallback(
    () => setAuth((prev) => ({ ...prev, isAuthenticated: true })),
    []
  );

  const logout = useCallback(() => setAuth(defaultAuth), []);

  const value = useMemo(
    () => ({ auth, setEmail, setWalletAddress, login, logout }),
    [auth, setEmail, setWalletAddress, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
