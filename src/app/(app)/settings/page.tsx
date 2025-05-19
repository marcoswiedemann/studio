
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/auth-context";
import { useSettings } from "@/contexts/settings-context";
import type { ThemeSettings, ThemeColors } from "@/types";
import { USER_ROLES, DEFAULT_THEME_SETTINGS, DEFAULT_LOGO_URL } from "@/lib/constants";
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
  logoLightModeUrl: z.string().optional(), 
  logoDarkModeUrl: z.string().optional(),
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

function getPortugueseLabel(key: string): string {
  const translations: { [key: string]: string } = {
    background: "Fundo",
    foreground: "Texto Principal",
    primary: "Primária",
    primaryForeground: "Texto Primário",
    accent: "Destaque",
    accentForeground: "Texto de Destaque",
    secondary: "Secundária",
    secondaryForeground: "Texto Secundário",
    muted: "Suave",
    mutedForeground: "Texto Suave",
    card: "Cartão (Fundo)",
    cardForeground: "Cartão (Texto)",
    popover: "Popover (Fundo)",
    popoverForeground: "Popover (Texto)",
    destructive: "Destrutiva",
    destructiveForeground: "Texto Destrutivo",
    border: "Borda",
    input: "Entrada (Input)",
    ring: "Anel (Foco)",
    sidebarBackground: "Sidebar (Fundo)",
    sidebarForeground: "Sidebar (Texto)",
    sidebarPrimary: "Sidebar (Primária)",
    sidebarPrimaryForeground: "Sidebar (Texto Primário)",
    sidebarAccent: "Sidebar (Destaque)",
    sidebarAccentForeground: "Sidebar (Texto de Destaque)",
    sidebarBorder: "Sidebar (Borda)",
    sidebarRing: "Sidebar (Anel de Foco)",
  };
  return translations[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
}


export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { themeSettings, setThemeSettings, resetThemeSettings: resetContextThemeSettings } = useSettings();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  
  const fileInputLightRef = useRef<HTMLInputElement>(null);
  const fileInputDarkRef = useRef<HTMLInputElement>(null);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      colors: themeSettings.colors,
      logoLightModeUrl: themeSettings.logoLightModeUrl || '',
      logoDarkModeUrl: themeSettings.logoDarkModeUrl || '',
    },
  });

  const [logoLightPreview, setLogoLightPreview] = useState<string>(form.getValues("logoLightModeUrl") || DEFAULT_LOGO_URL);
  const [logoDarkPreview, setLogoDarkPreview] = useState<string>(form.getValues("logoDarkModeUrl") || DEFAULT_LOGO_URL);

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
    form.reset({
      colors: themeSettings.colors,
      logoLightModeUrl: themeSettings.logoLightModeUrl || '',
      logoDarkModeUrl: themeSettings.logoDarkModeUrl || '',
    });
    setLogoLightPreview(themeSettings.logoLightModeUrl || DEFAULT_LOGO_URL);
    setLogoDarkPreview(themeSettings.logoDarkModeUrl || DEFAULT_LOGO_URL);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeSettings]);

  const onSubmit = (data: SettingsFormValues) => {
    setIsLoading(true);
    const settingsToSave: ThemeSettings = {
      colors: data.colors,
      logoLightModeUrl: data.logoLightModeUrl || DEFAULT_LOGO_URL,
      logoDarkModeUrl: data.logoDarkModeUrl || DEFAULT_LOGO_URL,
    };
    setThemeSettings(settingsToSave);
    toast({ title: "Configurações Salvas!", description: "As novas configurações foram aplicadas." });
    setIsLoading(false);
  };

  const handleReset = () => {
    setIsLoading(true);
    resetContextThemeSettings(); // This will also trigger the useEffect above to reset form and previews
    if (fileInputLightRef.current) fileInputLightRef.current.value = "";
    if (fileInputDarkRef.current) fileInputDarkRef.current.value = "";
    toast({ title: "Configurações Restauradas!", description: "As configurações padrão foram restauradas." });
    setIsLoading(false);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, logoType: 'light' | 'dark') => {
    const file = event.target.files?.[0];
    const fileInputRef = logoType === 'light' ? fileInputLightRef : fileInputDarkRef;

    if (file) {
      if (file.type !== "image/png") {
        toast({ variant: "destructive", title: "Erro de Upload", description: "Por favor, envie um arquivo PNG." });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({ variant: "destructive", title: "Erro de Upload", description: "Arquivo muito grande. Limite de 2MB." });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        if (logoType === 'light') {
          form.setValue("logoLightModeUrl", dataUrl, { shouldValidate: true });
          setLogoLightPreview(dataUrl);
        } else {
          form.setValue("logoDarkModeUrl", dataUrl, { shouldValidate: true });
          setLogoDarkPreview(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseDefaultLogo = (logoType: 'light' | 'dark') => {
    const fileInputRef = logoType === 'light' ? fileInputLightRef : fileInputDarkRef;
    if (logoType === 'light') {
      form.setValue("logoLightModeUrl", DEFAULT_LOGO_URL, { shouldValidate: true });
      setLogoLightPreview(DEFAULT_LOGO_URL);
    } else {
      form.setValue("logoDarkModeUrl", DEFAULT_LOGO_URL, { shouldValidate: true });
      setLogoDarkPreview(DEFAULT_LOGO_URL);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const handleClearLogo = (logoType: 'light' | 'dark') => {
    const fileInputRef = logoType === 'light' ? fileInputLightRef : fileInputDarkRef;
    if (logoType === 'light') {
      form.setValue("logoLightModeUrl", "", { shouldValidate: true });
      setLogoLightPreview(DEFAULT_LOGO_URL); // Preview shows default if current logo is cleared
    } else {
      form.setValue("logoDarkModeUrl", "", { shouldValidate: true });
      setLogoDarkPreview(DEFAULT_LOGO_URL);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast({ title: "Logo Removido", description: `O logo customizado para tema ${logoType === 'light' ? 'claro' : 'escuro'} foi removido.` });
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
              <Input 
                placeholder="Ex: #3F51B5" 
                {...field} 
                value={field.value || ''}
                onChange={(e) => {
                  let value = e.target.value.toUpperCase();
                  if (!value.startsWith('#')) {
                    value = '#' + value;
                  }
                  if (/^#?[0-9A-F]*$/i.test(value) && value.length <= 7) {
                    field.onChange(value);
                  } else if (value === '#') {
                     field.onChange(value); 
                  }
                }}
                className="flex-grow"
              />
              <input
                type="color"
                value={field.value && /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(field.value) ? field.value : '#FFFFFF'}
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                className="w-10 h-10 p-0 border-none rounded cursor-pointer flex-shrink-0"
                style={{ appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }}
              />
              <div 
                className="w-8 h-8 rounded border flex-shrink-0" 
                style={{ backgroundColor: field.value && /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(field.value) ? field.value : 'transparent' }}
              ></div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
  
  const renderLogoSection = (logoType: 'light' | 'dark', label: string, description: string, fileInputRef: React.RefObject<HTMLInputElement>, previewSrc: string, dataAiHint: string) => (
    <section className="mt-6 pt-6 border-t">
      <h3 className="text-lg font-semibold mb-3 border-b pb-2">{label}</h3>
      <FormItem>
        <FormLabel className="flex items-center"><ImageIcon className="mr-2 h-4 w-4" /> Logo (Arquivo PNG)</FormLabel>
        <FormControl>
          <Input 
            type="file"
            accept="image/png"
            ref={fileInputRef}
            onChange={(e) => handleFileChange(e, logoType)}
            className="cursor-pointer"
          />
        </FormControl>
        <FormDescription>
          {description} Máximo de 2MB.
        </FormDescription>
        <div className="flex gap-2 mt-2">
          <Button type="button" variant="outline" size="sm" onClick={() => handleUseDefaultLogo(logoType)}>
            Usar Logo Padrão
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => handleClearLogo(logoType)} className="text-destructive hover:text-destructive border-destructive/50 hover:border-destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Remover Logo Atual
          </Button>
        </div>
        <FormMessage />
      </FormItem>
      
      {previewSrc && (
        <div className={`mt-4 p-4 border rounded-md ${logoType === 'dark' ? 'bg-gray-800' : 'bg-muted/50'} flex justify-center items-center max-w-xs min-h-[80px]`}>
          <Image
            src={previewSrc}
            alt={`Preview do Logo para tema ${logoType === 'light' ? 'claro' : 'escuro'}`}
            width={120}
            height={60}
            style={{ objectFit: 'contain', maxHeight: '60px' }}
            data-ai-hint={dataAiHint}
            onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.alt = `Falha ao carregar preview do logo (${logoType})`;
                target.style.display = 'none'; 
                const parent = target.parentElement;
                if (parent && !parent.querySelector(`.logo-error-message-${logoType}`)) {
                    const errorMsg = document.createElement('p');
                    errorMsg.textContent = 'Falha ao carregar preview. Verifique a URL ou o arquivo.';
                    errorMsg.className = `text-destructive text-sm logo-error-message-${logoType}`;
                    parent.appendChild(errorMsg);
                }
            }}
            onLoad={(e) => { 
                const target = e.target as HTMLImageElement;
                target.style.display = 'block';
                 const parent = target.parentElement;
                 if (parent) {
                    const errorMsg = parent.querySelector(`.logo-error-message-${logoType}`);
                    if (errorMsg) parent.removeChild(errorMsg);
                 }
            }}
          />
        </div>
      )}
    </section>
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
                Personalize as cores (formato hexadecimal) e os logos (PNG) do sistema.
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
                  {mainColorKeys.map(key => renderColorInput(key, getPortugueseLabel(key)))}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3 pt-4 border-b pb-2">Cores da Sidebar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sidebarColorKeys.map(key => renderColorInput(key, getPortugueseLabel(key)))}
                </div>
              </section>
              
              {renderLogoSection(
                'light', 
                'Logo para Tema Claro', 
                'Idealmente um logo escuro para fundos claros.', 
                fileInputLightRef, 
                logoLightPreview,
                "logo light"
              )}
              
              {renderLogoSection(
                'dark', 
                'Logo para Tema Escuro', 
                'Idealmente um logo claro para fundos escuros.', 
                fileInputDarkRef, 
                logoDarkPreview,
                "logo dark"
              )}

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
