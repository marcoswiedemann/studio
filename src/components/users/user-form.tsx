
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User, UserRole } from "@/types";
import { USER_ROLES } from "@/lib/constants";
import { useAuth } from "@/contexts/auth-context";
import React, { useEffect } from "react";

const userFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  username: z.string().min(3, "Usuário deve ter pelo menos 3 caracteres."),
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.MAYOR, USER_ROLES.VICE_MAYOR, USER_ROLES.VIEWER], {
    required_error: "Função é obrigatória."
  }),
  password: z.string().optional(),
  canViewCalendarsOf: z.array(z.string()).optional(),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  onSubmit: (values: UserFormValues, userId?: string) => void;
  initialData?: User;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function UserForm({ onSubmit, initialData, onCancel, isLoading }: UserFormProps) {
  const { allUsers } = useAuth();

  const formSchemaWithConditionalPassword = userFormSchema.refine(data => {
    if (!initialData && !data.password) return false;
    return true;
  }, {
    message: "Senha é obrigatória para novos usuários.",
    path: ["password"],
  });

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchemaWithConditionalPassword),
    defaultValues: {
      name: initialData?.name || "",
      username: initialData?.username || "",
      role: initialData?.role || USER_ROLES.VICE_MAYOR,
      password: "",
      canViewCalendarsOf: initialData?.canViewCalendarsOf || [],
    },
  });

  const watchedRole = form.watch("role");

  useEffect(() => {
    if (watchedRole !== USER_ROLES.VIEWER) {
      form.setValue("canViewCalendarsOf", []);
    }
  }, [watchedRole, form.setValue]);

  const handleSubmit = (values: UserFormValues) => {
     const finalValues = {
      ...values,
      canViewCalendarsOf: watchedRole === USER_ROLES.VIEWER ? values.canViewCalendarsOf : [],
    };
    onSubmit(finalValues, initialData?.id);
  };

  const usersAvailableForViewing = allUsers.filter(
    u => u.id !== initialData?.id && u.role !== USER_ROLES.ADMIN && u.role !== USER_ROLES.VIEWER
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder="Nome do usuário" {...field} />
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
                <Input placeholder="Login do usuário" {...field} disabled={!!initialData} />
              </FormControl>
              {initialData && <FormMessage>Nome de usuário não pode ser alterado.</FormMessage>}
              {!initialData && <FormMessage />}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Função</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(USER_ROLES).map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{initialData ? "Nova Senha (Opcional)" : "Senha"}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Deixe em branco para não alterar (se editando)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchedRole === USER_ROLES.VIEWER && (
          <FormItem>
            <FormLabel>Pode visualizar agendas de:</FormLabel>
            <FormDescription>Selecione os usuários cujas agendas este visualizador poderá acessar.</FormDescription>
             <FormField
                control={form.control}
                name="canViewCalendarsOf"
                render={() => (
                    <div className="space-y-2 mt-2 p-3 border rounded-md max-h-48 overflow-y-auto">
                    {usersAvailableForViewing.length === 0 && <p className="text-sm text-muted-foreground">Nenhum usuário disponível para visualização.</p>}
                    {usersAvailableForViewing.map((u) => (
                        <FormField
                        key={u.id}
                        control={form.control}
                        name="canViewCalendarsOf"
                        render={({ field }) => {
                            return (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 py-1">
                                <FormControl>
                                <Checkbox
                                    checked={field.value?.includes(u.id)}
                                    onCheckedChange={(checked) => {
                                    const currentSelection = field.value || [];
                                    return checked
                                        ? field.onChange([...currentSelection, u.id])
                                        : field.onChange(
                                            currentSelection.filter(
                                            (value) => value !== u.id
                                            )
                                        );
                                    }}
                                />
                                </FormControl>
                                <FormLabel className="font-normal text-sm">
                                {u.name} ({u.role})
                                </FormLabel>
                            </FormItem>
                            );
                        }}
                        />
                    ))}
                    </div>
                )}
                />
            <FormMessage />
          </FormItem>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancelar</Button>}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (initialData ? "Salvando..." : "Criando...") : (initialData ? "Salvar Usuário" : "Criar Usuário")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
