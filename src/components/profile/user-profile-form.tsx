
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/types";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const profileFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  username: z.string().min(1, "Usuário é obrigatório."),
  // Optional: Add password change fields if needed
  // currentPassword: z.string().optional(),
  // newPassword: z.string().optional(),
  // confirmPassword: z.string().optional(),
});
// .refine(data => {
//   if (data.newPassword && !data.currentPassword) {
//     return false; // Current password needed if new password is set
//   }
//   if (data.newPassword && data.newPassword !== data.confirmPassword) {
//     return false; // Passwords must match
//   }
//   return true;
// }, {
//   message: "Senhas não conferem ou senha atual ausente.",
//   path: ["confirmPassword"], // Or a general path
// });


type ProfileFormValues = z.infer<typeof profileFormSchema>;

function getInitials(name: string) {
  const names = name.split(' ');
  let initials = names[0].substring(0, 1).toUpperCase();
  if (names.length > 1) {
    initials += names[names.length - 1].substring(0, 1).toUpperCase();
  }
  return initials;
}


export function UserProfileForm() {
  const { user, updateUserInContext } = useAuth(); // Assuming updateUserInContext updates the user list in AuthContext/localStorage
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      username: user?.username || "",
    },
  });
  
  // Reset form if user changes
  useState(() => {
    if (user) {
      form.reset({
        name: user.name,
        username: user.username,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, form.reset]);


  async function onSubmit(values: ProfileFormValues) {
    if (!user) return;
    setIsLoading(true);
    
    // Here you would typically make an API call to update the user.
    // For this mock, we'll update it in the AuthContext/localStorage.
    const updatedUser: User = {
      ...user,
      name: values.name,
      username: values.username, // Note: Changing username might have auth implications in a real system
    };

    try {
      updateUserInContext(updatedUser); // This function needs to be implemented in AuthContext
      toast({ title: "Perfil atualizado!", description: "Suas informações foram salvas." });
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível atualizar o perfil.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  if (!user) return <p>Usuário não encontrado.</p>;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <div className="flex flex-col items-center space-y-4 mb-6">
            <Avatar className="h-24 w-24">
                 <AvatarImage src={`https://placehold.co/96x96.png?text=${getInitials(user.name)}`} alt={user.name} data-ai-hint="profile avatar"/>
                <AvatarFallback className="text-3xl">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <CardDescription>Gerencie suas informações de perfil.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de Usuário</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome de usuário" {...field} disabled /> 
                    {/* Usually username is not editable or has special handling */}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Função</FormLabel>
              <Input value={user.role} disabled />
            </FormItem>
            
            {/* Add password change fields here if desired */}
            {/* 
            <FormField name="currentPassword" ... />
            <FormField name="newPassword" ... />
            <FormField name="confirmPassword" ... />
            */}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
