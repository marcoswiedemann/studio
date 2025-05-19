
import type { ThemeSettings } from '@/types';
// Importar o enum UserRole do Prisma
import { UserRole as PrismaUserRoleEnum } from '@prisma/client';

// Exportar o enum como USER_ROLES para ser usado como valores (USER_ROLES.Admin)
export const USER_ROLES = PrismaUserRoleEnum;

// Se você precisar do tipo UserRole exportado daqui também (opcional, pois types/index.ts já o define)
// export type UserRole = PrismaUserRoleEnum;


export const LOCAL_STORAGE_KEYS = {
  LOGGED_IN_USER: 'agendaGovUser',
  // APPOINTMENTS: 'agendaGovAppointments', // Removido, dados virão do DB
  THEME_SETTINGS: 'agendaGovThemeSettings', // Configurações de tema ainda no localStorage por enquanto
};

export const DEFAULT_LOGO_URL = "https://pmsantoangelo.abase.com.br/site/Brasoes/120/cabecalho.png";

// As cores no DEFAULT_THEME_SETTINGS são HSL porque o globals.css usa HSL.
// O SettingsContext converterá hex para HSL ao aplicar.
// O schema Prisma para ThemeSettings armazenará cores como strings (HEX).
export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  appName: 'AgendaGov',
  colors: {
    background: "#ECEFF1",
    foreground: "#383A3D",
    card: "#FFFFFF",
    cardForeground: "#383A3D",
    popover: "#FFFFFF",
    popoverForeground: "#383A3D",
    primary: "#3F51B5",
    primaryForeground: "#FFFFFF",
    secondary: "#E0E5E9",
    secondaryForeground: "#383A3D",
    muted: "#E0E5E9",
    mutedForeground: "#696E75",
    accent: "#9575CD",
    accentForeground: "#FFFFFF",
    destructive: "#F44336",
    destructiveForegroundColor: "#FAFAFA",
    border: "#D3D7DB",
    input: "#D3D7DB",
    ring: "#3F51B5",
    sidebarBackground: "#2B303B",
    sidebarForeground: "#F9FAFC",
    sidebarPrimary: "#3F51B5",
    sidebarPrimaryForeground: "#FFFFFF",
    sidebarAccent: "#3C4352",
    sidebarAccentForeground: "#F9FAFC",
    sidebarBorder: "#1F2329",
    sidebarRing: "#3F51B5",
  },
  logoLightModeUrl: DEFAULT_LOGO_URL,
  logoDarkModeUrl: DEFAULT_LOGO_URL,
};

// DEFAULT_USERS_CREDENTIALS e INITIAL_APPOINTMENTS foram removidos.
// Os usuários e compromissos iniciais agora são gerenciados pelo script prisma/seed.ts.
// Os dados de tema (ThemeSettings) ainda são gerenciados via localStorage e SettingsContext,
// mas o schema Prisma para ThemeSettings foi criado para uma futura migração para o banco.
