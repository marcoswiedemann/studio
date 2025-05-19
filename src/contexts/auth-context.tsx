
"use client";

import type { User, Credentials } from '@/types';
import { DEFAULT_USERS_CREDENTIALS, LOCAL_STORAGE_KEYS } from '@/lib/constants';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AuthContextType {
  user: User | null;
  login: (credentials: Credentials) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  allUsers: User[];
  updateUserInContext: (updatedUser: User) => void;
  addUserInContext: (newUser: User) => void;
  deleteUserInContext: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useLocalStorage<User | null>(LOCAL_STORAGE_KEYS.LOGGED_IN_USER, null);
  const [allUsers, setAllUsers] = useLocalStorage<User[]>(LOCAL_STORAGE_KEYS.USERS, 
    DEFAULT_USERS_CREDENTIALS.map(({ password, ...userWithoutPassword }) => userWithoutPassword) // Store users without passwords
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(false);
  }, [user]);

  const login = useCallback(async (credentials: Credentials): Promise<boolean> => {
    setLoading(true);
    const foundUser = DEFAULT_USERS_CREDENTIALS.find(
      u => u.username === credentials.username && u.password === credentials.password
    );

    if (foundUser) {
      const { password, ...userToStore } = foundUser; // Don't store password in 'user' state
      setUser(userToStore);
      // Ensure allUsers list is initialized if empty
      if (allUsers.length === 0) {
        setAllUsers(DEFAULT_USERS_CREDENTIALS.map(({ password, ...u }) => u));
      }
      setLoading(false);
      return true;
    }
    setUser(null);
    setLoading(false);
    return false;
  }, [setUser, setLoading, allUsers, setAllUsers]);

  const logout = useCallback(() => {
    setUser(null);
    router.push('/');
  }, [setUser, router]);

  const updateUserInContext = (updatedUser: User) => {
    setAllUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (user?.id === updatedUser.id) {
      setUser(updatedUser);
    }
  };

  const addUserInContext = (newUser: User) => {
    setAllUsers(prevUsers => [...prevUsers, newUser]);
  };

  const deleteUserInContext = (userId: string) => {
    setAllUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
  };


  return (
    <AuthContext.Provider value={{ user, login, logout, loading, allUsers, updateUserInContext, addUserInContext, deleteUserInContext }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
