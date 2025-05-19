
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/auth-context";
import { useSettings } from "@/contexts/settings-context";
import type { ThemeSettings, ThemeColors } from "@/types";
import { USER_ROLES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Palette, Image as ImageIcon, Save, RotateCcw } from "lucide-react";
import Image from "next/image";

const hslStringSchema = z.string().regex(
  /^\s*\d{1,3}(\s+\d{1,3}%\s+\d{1,3}%|\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%)\s*$/,
  "Formato HSL inválido. Ex: 210 40% 96% ou 210, 40%, 96%"
).transform(val => val.trim().replace(/\s*,\s*/g, ' ')); // Normalize to space separation

const themeColorsSchema = z.object({
  background: hslStringSchema,
  foreground: hslStringSchema,
  card: hslStringSchema,
  cardForeground: hslStringSchema,
  popover: hslStringSchema,
  popoverForeground: hslStringSchema,
  primary: hslStringSchema,
  primaryForeground: hslStringSchema,
  secondary: hslStringSchema,
  secondaryForeground: hslStringSchema,
  muted: hslStringSchema,
  mutedForeground: hslStringSchema,
  accent: hslStringSchema,
  accentForeground: hslStringSchema,
  destructive: hslStringSchema,
  destructiveForeground: hslStringSchema,
  border: hslStringSchema,
  input: hslStringSchema,
  ring: hslStringSchema,
  sidebarBackground: hslStringSchema,
  sidebarForeground: hslStringSchema,
  sidebarPrimary: hslStringSchema,
  sidebarPrimaryForeground: hslStringSchema,
  sidebarAccent: hslStringSchema,
  sidebarAccentForeground: hslStringSchema,
  sidebarBorder: hslStringSchema,
  sidebarRing: hslStringSchema,
});

const settingsFormSchema = z.object({
  colors: themeColorsSchema,
  mainLogoUrl: z.string().url({ message: "URL do logo inválida." }).or(z.literal("").transform(() => "")),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const mainColorKeys: Array<keyof ThemeColors> = [
  'background', 'foreground', 'primary', 'primaryForeground', 'accent', 'accentForeground',
  'secondary', 'secondaryForeground', 'muted', 'mutedForeground',
  'card', 'cardForeground', 'popover', 'popoverForeground',
  'destructive', 'destructiveForeground', 'border', 'input', 'ring'
];

const sidebarColorKeys: Array<keyof ThemeColors> = [
  'sidebarBackground', 'sidebarForeground', 'sidebarPrimary', 'sidebarPrimaryForeground',
  'sidebarAccent', 'sidebarAccentForeground', 'sidebarBorder', 'sidebarRing'
];

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { themeSettings, setThemeSettings, resetThemeSettings } = useSettings();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [logoPreview, setLogoPreview] = useState(themeSettings.mainLogoUrl);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: themeSettings,
  });

  useEffect(() => {
    if (user) {
      if (user.role !== USER_ROLES.ADMIN) {
        toast({ title: "Acesso Negado", description: "Você não tem permissão para acessar esta página.", variant: "destructive" });
        router.replace("/dashboard");
      } else {
        setPageLoading(false);
      }
    } else if (!authLoading && !user) { // check !user as well
        router.replace("/");
    }
  }, [user, authLoading, router, toast]);

  useEffect(() => {
    form.reset(themeSettings);
    setLogoPreview(themeSettings.mainLogoUrl);
  }, [themeSettings, form]);

  const onSubmit = (data: SettingsFormValues) => {
    setIsLoading(true);
    setThemeSettings(data);
    toast({ title: "Configurações Salvas!", description: "As novas configurações foram aplicadas." });
    setIsLoading(false);
  };

  const handleReset = () => {
    setIsLoading(true);
    resetThemeSettings();
    toast({ title: "Configurações Restauradas!", description: "As configurações padrão foram restauradas." });
    setIsLoading(false);
  };
  
  const currentLogoUrl = form.watch("mainLogoUrl");
  useEffect(() => {
    setLogoPreview(currentLogoUrl);
  }, [currentLogoUrl]);


  if (pageLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.16))]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  if (!user || user.role !== USER_ROLES.ADMIN) {
    return null;
  }

  const renderColorInput = (name: keyof ThemeColors, label: string) => (
    <FormField
      control={form.control}
      key={name}
      name={`colors.${name}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input placeholder="Ex: 210 40% 96%" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Palette className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Configurações de Aparência</CardTitle>
              <CardDescription>
                Personalize as cores e o logo do sistema. As cores devem ser informadas no formato HSL (Ex: 210 40% 96% ou 210, 40%, 96%).
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-3 border-b pb-2">Cores Principais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mainColorKeys.map(key => renderColorInput(key, key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')))}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3 pt-4 border-b pb-2">Cores da Sidebar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sidebarColorKeys.map(key => renderColorInput(key, key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')))}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3 pt-4 border-b pb-2">Logo do Sistema</h3>
                 <FormField
                  control={form.control}
                  name="mainLogoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><ImageIcon className="mr-2 h-4 w-4" /> URL do Logo Principal</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/logo.png" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            setLogoPreview(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        O logo aparecerá na tela de login, sidebar e agenda pública. Certifique-se que o domínio da URL do logo está permitido nas configurações do Next.js (next.config.ts).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {logoPreview && (
                  <div className="mt-4 p-4 border rounded-md bg-muted/50 flex justify-center items-center max-w-xs min-h-[80px]">
                    <Image
                        key={logoPreview} // Add key to force re-render on URL change for preview
                        src={logoPreview}
                        alt="Preview do Logo"
                        width={120}
                        height={60}
                        style={{ objectFit: 'contain', maxHeight: '60px' }}
                        data-ai-hint="logo preview"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.alt = "Falha ao carregar preview do logo";
                            target.style.display = 'none'; // Hide broken image
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.logo-error-message')) {
                                const errorMsg = document.createElement('p');
                                errorMsg.textContent = 'Falha ao carregar preview do logo.';
                                errorMsg.className = 'text-destructive text-sm logo-error-message';
                                parent.appendChild(errorMsg);
                            }
                        }}
                        onLoad={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'block';
                             const parent = target.parentElement;
                             if (parent) {
                                const errorMsg = parent.querySelector('.logo-error-message');
                                if (errorMsg) parent.removeChild(errorMsg);
                             }
                        }}
                    />
                  </div>
                )}
              </section>
            </CardContent>
            <CardFooter className="border-t pt-6 flex flex-col sm:flex-row justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleReset} disabled={isLoading} className="w-full sm:w-auto">
                <RotateCcw className="mr-2 h-4 w-4" />
                Restaurar Padrões
              </Button>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Salvar Configurações
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
