
"use client";

import type { User, Credentials } from '@/types';
import { LOCAL_STORAGE_KEYS } from '@/lib/constants';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AuthContextType {
  user: User | null;
  login: (credentials: Credentials) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  allUsers: User[]; // This will need to be fetched from DB later
  updateUserInContext: (updatedUser: User) => void; // Will be refactored for API
  addUserInContext: (newUser: User) => void; // Will be refactored for API
  deleteUserInContext: (userId: string) => void; // Will be refactored for API
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useLocalStorage<User | null>(LOCAL_STORAGE_KEYS.LOGGED_IN_USER, null);
  
  // TODO: Fetch allUsers from the database instead of localStorage or constants
  const [allUsers, setAllUsers] = useState<User[]>([]); 
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Initial load check
    if (user) {
      // Optionally re-validate session with backend here
    }
    setLoading(false);
  }, [user]);

  // TODO: Fetch allUsers from an API endpoint when the app loads or context initializes
  // For now, this will be empty and needs to be populated from the DB for UserForm dropdowns etc.
  // Example:
  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       const response = await fetch('/api/users'); // Assuming you create this endpoint
  //       if (response.ok) {
  //         const data = await response.json();
  //         setAllUsers(data.users);
  //       }
  //     } catch (error) {
  //       console.error("Failed to fetch users:", error);
  //     }
  //   };
  //   fetchUsers();
  // }, []);


  const login = useCallback(async (credentials: Credentials): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setLoading(false);
        return true;
      } else {
        setUser(null);
        setLoading(false);
        // Use message from API if available, otherwise a generic one
        throw new Error(data.message || 'Falha no login.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setUser(null);
      setLoading(false);
      // Rethrow or handle appropriately for toast message
      if (error instanceof Error) {
          throw error;
      }
      throw new Error('Erro de conexão ou resposta inesperada.');
    }
  }, [setUser, setLoading]);

  const logout = useCallback(() => {
    setUser(null);
    // Optionally call an API endpoint to invalidate session/token on server
    router.push('/');
  }, [setUser, router]);

  // These functions will need to be refactored to make API calls to a backend
  // that interacts with Prisma to modify user data in the database.
  // For now, they will only affect the local `allUsers` state if it's populated.
  const updateUserInContext = (updatedUser: User) => {
    // TODO: Replace with API call: PUT /api/users/{userId}
    setAllUsers(prevUsers => prevUsers.map(u => (u.id === updatedUser.id ? updatedUser : u)));
    if (user?.id === updatedUser.id) {
      setUser(updatedUser);
    }
    console.warn("updateUserInContext is using local state. Needs API integration.");
  };

  const addUserInContext = (newUser: User) => {
    // TODO: Replace with API call: POST /api/users
    // The API should handle password hashing before saving to DB
    setAllUsers(prevUsers => [...prevUsers, newUser]);
    console.warn("addUserInContext is using local state. Needs API integration.");
  };

  const deleteUserInContext = (userId: string) => {
    // TODO: Replace with API call: DELETE /api/users/{userId}
    setAllUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
    console.warn("deleteUserInContext is using local state. Needs API integration.");
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
