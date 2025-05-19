
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { UserTable } from "@/components/users/user-table";
import { UserForm, UserFormValues } from "@/components/users/user-form";
import type { User } from "@/types";
import { USER_ROLES, DEFAULT_USERS_CREDENTIALS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

export default function UsersPage() {
  const { user, allUsers, addUserInContext, updateUserInContext, deleteUserInContext } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (user) {
      if (user.role !== USER_ROLES.ADMIN) {
        toast({ title: "Acesso Negado", description: "Você não tem permissão para acessar esta página.", variant: "destructive" });
        router.replace("/dashboard");
      } else {
        setPageLoading(false);
      }
    } else if (!user && !useAuth().loading) { // if no user and auth context is not loading anymore
        router.replace("/"); // redirect to login if not authenticated
    }
  }, [user, router, toast, useAuth().loading]);


  const handleAddUser = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setIsFormOpen(true);
  };

  const handleDeleteUserPrompt = (userId: string) => {
    if (user?.id === userId) {
      toast({ title: "Ação Inválida", description: "Você não pode excluir sua própria conta.", variant: "destructive" });
      return;
    }
    const targetUser = allUsers.find(u => u.id === userId);
    if (targetUser?.role === USER_ROLES.ADMIN) {
        const adminCount = allUsers.filter(u => u.role === USER_ROLES.ADMIN).length;
        if (adminCount <= 1) {
            toast({ title: "Ação Inválida", description: "Não é possível excluir o único administrador.", variant: "destructive" });
            return;
        }
    }
    setUserToDelete(userId);
  };

  const handleFormSubmit = async (values: UserFormValues, userIdToUpdate?: string) => {
    setIsLoading(true);
    try {
      if (userIdToUpdate) { // Editing user
        const existingUser = allUsers.find(u => u.id === userIdToUpdate);
        if (!existingUser) throw new Error("Usuário não encontrado para edição.");
        
        const updatedUserData: User = {
          ...existingUser, // Spread existing user first to retain fields like id, username
          name: values.name,
          role: values.role,
          // Explicitly set canViewCalendarsOf from form values
          canViewCalendarsOf: values.role === USER_ROLES.VIEWER ? values.canViewCalendarsOf || [] : [],
        };
        
        updateUserInContext(updatedUserData);
        
        if (values.password) {
            const defaultUserIndex = DEFAULT_USERS_CREDENTIALS.findIndex(u => u.id === userIdToUpdate);
            if (defaultUserIndex !== -1) {
                DEFAULT_USERS_CREDENTIALS[defaultUserIndex].password = values.password;
            }
        }
        toast({ title: "Sucesso!", description: "Usuário atualizado." });

      } else { // Creating new user
        if (!values.password) { 
            toast({ title: "Erro", description: "Senha é obrigatória para novos usuários.", variant: "destructive" });
            setIsLoading(false);
            return;
        }
        const newUserId = `user-${Date.now()}`;
        const newUser: User = {
          id: newUserId,
          name: values.name,
          username: values.username,
          role: values.role,
          canViewCalendarsOf: values.role === USER_ROLES.VIEWER ? values.canViewCalendarsOf || [] : [],
        };
        addUserInContext(newUser);
        DEFAULT_USERS_CREDENTIALS.push({ ...newUser, password: values.password });
        toast({ title: "Sucesso!", description: "Usuário criado." });
      }
      setIsFormOpen(false);
      setEditingUser(null);
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Não foi possível salvar o usuário.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setIsLoading(true);
    try {
      deleteUserInContext(userToDelete);
      const userIndex = DEFAULT_USERS_CREDENTIALS.findIndex(u => u.id === userToDelete);
      if (userIndex > -1) DEFAULT_USERS_CREDENTIALS.splice(userIndex, 1);

      toast({ title: "Sucesso!", description: "Usuário excluído." });
      setUserToDelete(null);
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível excluir o usuário.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading || !user || user.role !== USER_ROLES.ADMIN) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.16))]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UserTable
        users={allUsers}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUserPrompt}
        onAddUser={handleAddUser}
      />

      <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingUser(null); }}>
        <DialogContent className="sm:max-w-[425px] md:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Atualize os detalhes do usuário." : "Preencha os detalhes para criar um novo usuário."}
            </DialogDescription>
          </DialogHeader>
          <UserForm
            onSubmit={handleFormSubmit}
            initialData={editingUser || undefined}
            onCancel={() => { setIsFormOpen(false); setEditingUser(null); }}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)} disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isLoading} className="bg-destructive hover:bg-destructive/90">
              {isLoading ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
