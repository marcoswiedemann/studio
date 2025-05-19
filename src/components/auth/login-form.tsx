
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
import { useSettings } from "@/contexts/settings-context"; 
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import Image from "next/image";

const formSchema = z.object({
  username: z.string().min(1, { message: "Usuário é obrigatório." }),
  password: z.string().min(1, { message: "Senha é obrigatória." }),
});

export function LoginForm() {
  const { login } = useAuth();
  const { themeSettings } = useSettings(); 
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const success = await login(values);
    if (success) {
      toast({ title: "Login bem-sucedido!", description: "Redirecionando para o painel." });
      router.push("/dashboard");
    } else {
      toast({
        title: "Falha no login",
        description: "Usuário ou senha inválidos.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4 h-[60px]">
            {themeSettings.logoLightModeUrl && (
              <Image
                src={themeSettings.logoLightModeUrl} 
                alt="Logo (Tema Claro)"
                width={120}
                height={60}
                style={{ objectFit: 'contain' }} 
                priority
                data-ai-hint="logo light"
                className="block dark:hidden"
              />
            )}
            {themeSettings.logoDarkModeUrl && (
              <Image
                src={themeSettings.logoDarkModeUrl} 
                alt="Logo (Tema Escuro)"
                width={120}
                height={60}
                style={{ objectFit: 'contain' }} 
                priority
                data-ai-hint="logo dark"
                className="hidden dark:block"
              />
            )}
          </div>
          <CardTitle className="text-3xl font-bold">{themeSettings.appName}</CardTitle>
          <CardDescription>Sistema de Agendamento da Prefeitura</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuário</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: admin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
