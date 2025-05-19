
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
  allUsers: User[]; // Será populado via API no futuro
  setAllUsers: React.Dispatch<React.SetStateAction<User[]>>; // Para permitir atualização via API
  updateUserInContext: (updatedUser: User) => void; // Será refatorado para API
  addUserInContext: (newUser: User) => void; // Será refatorado para API
  deleteUserInContext: (userId: string) => void; // Será refatorado para API
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useLocalStorage<User | null>(LOCAL_STORAGE_KEYS.LOGGED_IN_USER, null);
  
  // allUsers será gerenciado via API no futuro. Por enquanto, pode ser inicializado vazio.
  const [allUsers, setAllUsers] = useState<User[]>([]); 
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificação inicial de carregamento
    if (user) {
      // Opcionalmente, revalidar sessão com backend aqui
    }
    setLoading(false);
  }, [user]);

  // TODO: No futuro, buscar allUsers de um endpoint da API quando o app carregar
  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     setLoading(true);
  //     try {
  //       const response = await fetch('/api/users'); 
  //       if (response.ok) {
  //         const data = await response.json();
  //         setAllUsers(data.users);
  //       }
  //     } catch (error) {
  //       console.error("Failed to fetch users:", error);
  //     }
  //     setLoading(false);
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
        setUser(null); // Garante que o usuário seja nulo em caso de falha
        setLoading(false);
        throw new Error(data.message || 'Falha no login.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setUser(null); // Garante que o usuário seja nulo em caso de erro
      setLoading(false);
      if (error instanceof Error) {
          throw error;
      }
      throw new Error('Erro de conexão ou resposta inesperada.');
    }
  }, [setUser, setLoading]); // Removido router das dependências, pois o redirecionamento é feito no componente de login

  const logout = useCallback(() => {
    setUser(null);
    // Opcionalmente, chamar um endpoint da API para invalidar sessão/token no servidor
    router.push('/');
  }, [setUser, router]);

  // Estas funções precisarão ser refatoradas para fazer chamadas API para um backend
  // que interage com o Prisma para modificar dados de usuário no banco.
  // Por enquanto, elas afetarão apenas o estado local `allUsers` se ele estiver populado.
  const updateUserInContext = (updatedUser: User) => {
    // TODO: Substituir por chamada API: PUT /api/users/{userId}
    // Exemplo: setAllUsers(prevUsers => prevUsers.map(u => (u.id === updatedUser.id ? updatedUser : u)));
    if (user?.id === updatedUser.id) {
      setUser(updatedUser); // Atualiza o usuário logado se for o mesmo
    }
    console.warn("updateUserInContext está usando estado local. Necessita integração com API.");
  };

  const addUserInContext = (newUser: User) => {
    // TODO: Substituir por chamada API: POST /api/users
    // A API deve lidar com hashing de senha antes de salvar no BD
    // Exemplo: setAllUsers(prevUsers => [...prevUsers, newUser]);
    console.warn("addUserInContext está usando estado local. Necessita integração com API.");
  };

  const deleteUserInContext = (userId: string) => {
    // TODO: Substituir por chamada API: DELETE /api/users/{userId}
    // Exemplo: setAllUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
    console.warn("deleteUserInContext está usando estado local. Necessita integração com API.");
  };


  return (
    <AuthContext.Provider value={{ user, login, logout, loading, allUsers, setAllUsers, updateUserInContext, addUserInContext, deleteUserInContext }}>
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
