import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User, token: string) => {
    setUser(userData);
    setToken(token);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('profile_username');
    localStorage.removeItem('profile_role');
    localStorage.removeItem('profile_bio');
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('auth_user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout,
      updateUser, 
      isAuthenticated: !!token,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
