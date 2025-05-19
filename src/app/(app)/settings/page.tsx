
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/auth-context";
import { useSettings } from "@/contexts/settings-context";
import type { ThemeSettings, ThemeColors } from "@/types";
import { USER_ROLES, DEFAULT_THEME_SETTINGS, DEFAULT_MAIN_LOGO_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Palette, Image as ImageIcon, Save, RotateCcw, Trash2 } from "lucide-react";
import Image from "next/image";

const hexColorSchema = z.string().regex(
  /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/,
  "Formato hexadecimal inválido. Ex: #RRGGBB ou #RGB"
).transform(val => val.toUpperCase());

const themeColorsSchema = z.object({
  background: hexColorSchema,
  foreground: hexColorSchema,
  card: hexColorSchema,
  cardForeground: hexColorSchema,
  popover: hexColorSchema,
  popoverForeground: hexColorSchema,
  primary: hexColorSchema,
  primaryForeground: hexColorSchema,
  secondary: hexColorSchema,
  secondaryForeground: hexColorSchema,
  muted: hexColorSchema,
  mutedForeground: hexColorSchema,
  accent: hexColorSchema,
  accentForeground: hexColorSchema,
  destructive: hexColorSchema,
  destructiveForeground: hexColorSchema,
  border: hexColorSchema,
  input: hexColorSchema,
  ring: hexColorSchema,
  sidebarBackground: hexColorSchema,
  sidebarForeground: hexColorSchema,
  sidebarPrimary: hexColorSchema,
  sidebarPrimaryForeground: hexColorSchema,
  sidebarAccent: hexColorSchema,
  sidebarAccentForeground: hexColorSchema,
  sidebarBorder: hexColorSchema,
  sidebarRing: hexColorSchema,
});

const settingsFormSchema = z.object({
  colors: themeColorsSchema,
  mainLogoUrl: z.string().optional(), // Will store Data URI, default remote URL, or be empty
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
  const { themeSettings, setThemeSettings, resetThemeSettings: resetContextThemeSettings } = useSettings();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      colors: themeSettings.colors,
      mainLogoUrl: themeSettings.mainLogoUrl || '',
    },
  });

  const [logoPreview, setLogoPreview] = useState<string>(form.getValues("mainLogoUrl") || DEFAULT_MAIN_LOGO_URL);

  useEffect(() => {
    if (user) {
      if (user.role !== USER_ROLES.ADMIN) {
        toast({ title: "Acesso Negado", description: "Você não tem permissão para acessar esta página.", variant: "destructive" });
        router.replace("/dashboard");
      } else {
        setPageLoading(false);
      }
    } else if (!authLoading && !user) {
        router.replace("/");
    }
  }, [user, authLoading, router, toast]);

  useEffect(() => {
    // Sync form and preview when themeSettings from context change (e.g., after save/reset)
    form.reset({
      colors: themeSettings.colors,
      mainLogoUrl: themeSettings.mainLogoUrl || '',
    });
    setLogoPreview(themeSettings.mainLogoUrl || DEFAULT_MAIN_LOGO_URL);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeSettings]); // form.reset is stable from react-hook-form

  const onSubmit = (data: SettingsFormValues) => {
    setIsLoading(true);
    const settingsToSave: ThemeSettings = {
      colors: data.colors,
      mainLogoUrl: data.mainLogoUrl || DEFAULT_MAIN_LOGO_URL, // Fallback to default if empty
    };
    setThemeSettings(settingsToSave);
    toast({ title: "Configurações Salvas!", description: "As novas configurações foram aplicadas." });
    setIsLoading(false);
  };

  const handleReset = () => {
    setIsLoading(true);
    resetContextThemeSettings(); // This will trigger the useEffect above to reset form and preview
    toast({ title: "Configurações Restauradas!", description: "As configurações padrão foram restauradas." });
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
    setIsLoading(false);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "image/png") {
        toast({ variant: "destructive", title: "Erro de Upload", description: "Por favor, envie um arquivo PNG." });
        if (fileInputRef.current) fileInputRef.current.value = ""; // Clear invalid file
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit for base64
        toast({ variant: "destructive", title: "Erro de Upload", description: "Arquivo muito grande. Limite de 2MB." });
        if (fileInputRef.current) fileInputRef.current.value = ""; // Clear invalid file
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        form.setValue("mainLogoUrl", dataUrl, { shouldValidate: true });
        setLogoPreview(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseDefaultLogo = () => {
    form.setValue("mainLogoUrl", DEFAULT_MAIN_LOGO_URL, { shouldValidate: true });
    setLogoPreview(DEFAULT_MAIN_LOGO_URL);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
  };
  
  const handleClearLogo = () => {
    form.setValue("mainLogoUrl", "", { shouldValidate: true }); // Set to empty string
    setLogoPreview(DEFAULT_MAIN_LOGO_URL); // Preview shows default when cleared
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast({ title: "Logo Removido", description: "O logo customizado foi removido. O sistema usará o logo padrão se nenhum novo for salvo." });
  };


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
            <div className="flex items-center gap-2">
              <Input placeholder="Ex: #3F51B5" {...field} className="flex-grow" />
              <div className="w-8 h-8 rounded border" style={{ backgroundColor: field.value }}></div>
            </div>
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
                Personalize as cores (formato hexadecimal, ex: #FF0000) e o logo (PNG) do sistema.
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
                 <FormItem>
                    <FormLabel className="flex items-center"><ImageIcon className="mr-2 h-4 w-4" /> Logo Principal (Arquivo PNG)</FormLabel>
                    <FormControl>
                      <Input 
                        type="file"
                        accept="image/png"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="cursor-pointer"
                      />
                    </FormControl>
                    <FormDescription>
                      Envie um arquivo PNG para o logo. Máximo de 2MB.
                    </FormDescription>
                     <div className="flex gap-2 mt-2">
                        <Button type="button" variant="outline" size="sm" onClick={handleUseDefaultLogo}>
                            Usar Logo Padrão
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={handleClearLogo} className="text-destructive hover:text-destructive border-destructive/50 hover:border-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Remover Logo Atual
                        </Button>
                    </div>
                    <FormMessage /> {/* This is for the form.setValue related to mainLogoUrl if needed elsewhere, not directly for file input errors handled by toast */}
                  </FormItem>
                
                {logoPreview && (
                  <div className="mt-4 p-4 border rounded-md bg-muted/50 flex justify-center items-center max-w-xs min-h-[80px]">
                    <Image
                        src={logoPreview} // Can be Data URL or remote URL
                        alt="Preview do Logo"
                        width={120}
                        height={60}
                        style={{ objectFit: 'contain', maxHeight: '60px' }}
                        data-ai-hint="logo preview"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.alt = "Falha ao carregar preview do logo";
                            target.style.display = 'none';
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
