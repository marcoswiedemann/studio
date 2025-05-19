
"use client";

import type { User, Credentials } from '@/types';
import { DEFAULT_USERS_CREDENTIALS, LOCAL_STORAGE_KEYS, USER_ROLES } from '@/lib/constants';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

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
  
  const initialAllUsers = useMemo(() => 
    DEFAULT_USERS_CREDENTIALS.map(({ password, ...userWithoutPassword }) => userWithoutPassword), 
    []
  );
  const [allUsers, setAllUsers] = useLocalStorage<User[]>(
    LOCAL_STORAGE_KEYS.USERS, 
    initialAllUsers
  );

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(false);
  }, [user]);

  const login = useCallback(async (credentials: Credentials): Promise<boolean> => {
    setLoading(true);
    // Use DEFAULT_USERS_CREDENTIALS for authentication source of truth regarding passwords
    const foundDefaultUser = DEFAULT_USERS_CREDENTIALS.find(
      u => u.username === credentials.username && u.password === credentials.password
    );

    if (foundDefaultUser) {
      // Find the corresponding user in allUsers (which doesn't have password)
      // to ensure we use the potentially updated user data (name, role, canViewCalendarsOf) from localStorage
      let userToStore = allUsers.find(u => u.id === foundDefaultUser.id);
      
      if (!userToStore) { // Should not happen if allUsers is synced, but as a fallback
        const { password, ...restOfFoundDefaultUser } = foundDefaultUser;
        userToStore = restOfFoundDefaultUser;
      }
      
      setUser(userToStore);
      
      // Ensure allUsers list is initialized/synced if empty.
      if (allUsers.length === 0) {
        setAllUsers(initialAllUsers);
      }
      setLoading(false);
      return true;
    }
    setUser(null);
    setLoading(false);
    return false;
  }, [setUser, setLoading, allUsers, setAllUsers, initialAllUsers]);

  const logout = useCallback(() => {
    setUser(null);
    router.push('/');
  }, [setUser, router]);

  const updateUserInContext = (updatedUser: User) => {
    // Update the user in the allUsers list (persisted in localStorage)
    setAllUsers(prevUsers => prevUsers.map(u => (u.id === updatedUser.id ? updatedUser : u)));
    // If the updated user is the currently logged-in user, update their state as well
    if (user?.id === updatedUser.id) {
      setUser(updatedUser);
    }
    // Password management is now handled directly in UsersPage.tsx for DEFAULT_USERS_CREDENTIALS
  };

  const addUserInContext = (newUser: User) => {
    setAllUsers(prevUsers => [...prevUsers, newUser]);
    // Adding to DEFAULT_USERS_CREDENTIALS (including password) is handled in UsersPage.tsx
  };

  const deleteUserInContext = (userId: string) => {
    setAllUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
     // Remove from mock credentials (hack for mock login)
    const userIndex = DEFAULT_USERS_CREDENTIALS.findIndex(u => u.id === userId);
    if (userIndex > -1) DEFAULT_USERS_CREDENTIALS.splice(userIndex, 1);
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
