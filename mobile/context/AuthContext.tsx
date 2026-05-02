import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import API from '@/app/services/api';

interface User {
  ShopID: string;
  OwnerName: string;
  Email: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = useCallback(async (userData: User, token: string) => {
    setUser(userData);
    setToken(token);
    await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
    await SecureStore.setItemAsync('auth_token', token);
  }, []);

  const loginWithToken = useCallback(
    async (token: string) => {
      try {
        await SecureStore.setItemAsync('auth_token', token);
        const response = await API.get('/auth/user');
        await login(response.data, token);
      } catch (error) {
        setUser(null);
        setToken(null);
        await SecureStore.deleteItemAsync('user_data');
        await SecureStore.deleteItemAsync('auth_token');
        throw error;
      }
    },
    [login]
  );

  const loadStorageData = useCallback(async () => {
    try {
      const savedToken = await SecureStore.getItemAsync('auth_token');
      const userDataSerialized = await SecureStore.getItemAsync('user_data');

      // If we have a token but no user data, fetch user data from server
      if (savedToken && !userDataSerialized) {
        try {
          await loginWithToken(savedToken);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          // Token might be invalid, clear it
          await SecureStore.deleteItemAsync('auth_token');
          await SecureStore.deleteItemAsync('user_data');
          setUser(null);
          setToken(null);
        }
      } else if (savedToken && userDataSerialized) {
        // Both token and user data exist
        setUser(JSON.parse(userDataSerialized));
        setToken(savedToken);
      }
    } catch (error) {
      console.error('Failed to load auth data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loginWithToken]);

  useEffect(() => {
    loadStorageData();
  }, [loadStorageData]);

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    await SecureStore.deleteItemAsync('user_data');
    await SecureStore.deleteItemAsync('auth_token');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, loginWithToken, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
