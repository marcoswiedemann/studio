
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User, UserRole } from "@/types";
import { USER_ROLES } from "@/lib/constants";

const userFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  username: z.string().min(3, "Usuário deve ter pelo menos 3 caracteres."),
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.MAYOR, USER_ROLES.VICE_MAYOR], {
    required_error: "Função é obrigatória."
  }),
  password: z.string().optional(), // Optional for edit, required for create if not set
});

export type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  onSubmit: (values: UserFormValues, userId?: string) => void;
  initialData?: User;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function UserForm({ onSubmit, initialData, onCancel, isLoading }: UserFormProps) {
  const formSchemaWithConditionalPassword = userFormSchema.refine(data => {
    // Password is required if it's a new user (no initialData) AND password field is empty
    if (!initialData && !data.password) return false;
    // If it's an existing user OR password field is filled, validation passes for this rule
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
      password: "", // Password field is always empty initially for security
    },
  });

  const handleSubmit = (values: UserFormValues) => {
    onSubmit(values, initialData?.id);
  };

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
