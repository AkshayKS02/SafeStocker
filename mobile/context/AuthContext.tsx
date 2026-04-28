import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData() {
    try {
      const userDataSerialized = await SecureStore.getItemAsync('user_data');
      if (userDataSerialized) {
        setUser(JSON.parse(userDataSerialized));
      }
    } catch (error) {
      console.error('Failed to load auth data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const login = async (userData: User, token: string) => {
    setUser(userData);
    await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
    await SecureStore.setItemAsync('auth_token', token);
  };

  const logout = async () => {
    setUser(null);
    await SecureStore.deleteItemAsync('user_data');
    await SecureStore.deleteItemAsync('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};