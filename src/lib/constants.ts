
import type { ThemeSettings } from '@/types';
// Importar o enum UserRole do Prisma
import { UserRole as PrismaUserRoleEnum } from '@prisma/client';

// Exportar o enum como USER_ROLES para ser usado como valores (USER_ROLES.Admin)
export const USER_ROLES = PrismaUserRoleEnum;

// Se você precisar do tipo UserRole exportado daqui também (opcional, pois types/index.ts já o define)
// export type UserRole = PrismaUserRoleEnum;


export const LOCAL_STORAGE_KEYS = {
  LOGGED_IN_USER: 'agendaGovUser',
  // APPOINTMENTS: 'agendaGovAppointments', // Agora é gerenciado pelo estado do contexto, não mais localStorage direto
  THEME_SETTINGS: 'agendaGovThemeSettings',
};

export const DEFAULT_LOGO_URL = "https://pmsantoangelo.abase.com.br/site/Brasoes/120/cabecalho.png";

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
    destructiveForeground: "#FAFAFA",
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

// INITIAL_APPOINTMENTS foi removido pois os dados agora vêm do seed do Prisma.
// Se precisar de dados mock para testes sem DB, podem ser adicionados aqui,
// mas o AppointmentContext não os usa mais diretamente para inicialização.
