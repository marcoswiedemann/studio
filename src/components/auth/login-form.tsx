
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
import { useSettings } from "@/contexts/settings-context"; // Add this
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
  const { themeSettings } = useSettings(); // Get themeSettings
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  // const logoUrl = "https://pmsantoangelo.abase.com.br/site/Brasoes/120/cabecalho.png"; // Remove this

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
          <div className="flex justify-center items-center mb-4 h-[60px]"> {/* Added fixed height for container */}
            {themeSettings.mainLogoUrl && (
              <Image
                src={themeSettings.mainLogoUrl} // Use themeSettings.mainLogoUrl
                alt="Logo Prefeitura Santo Ângelo"
                width={120}
                height={60}
                style={{ objectFit: 'contain' }} // Ensure logo scales nicely
                priority
                data-ai-hint="logo prefeitura"
              />
            )}
          </div>
          <CardTitle className="text-3xl font-bold">AgendaGov</CardTitle>
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
