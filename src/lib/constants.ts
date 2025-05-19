
import type { ThemeSettings } from '@/types'; 
// We'll use Prisma's generated UserRole enum.
// import { UserRole as AppUserRole } from '@/types';
// export const USER_ROLES = {
//   ADMIN: 'Admin' as AppUserRole,
//   MAYOR: 'Prefeito' as AppUserRole,
//   VICE_MAYOR: 'Vice-prefeito' as AppUserRole,
//   VIEWER: 'Visualizador' as AppUserRole,
// } as const;

// Use Prisma's enum definition for consistency
export { UserRole as USER_ROLES } from '@prisma/client';


export const LOCAL_STORAGE_KEYS = {
  LOGGED_IN_USER: 'agendaGovUser', // This will store the user object from the API
  // USERS: 'agendaGovUsers', // Will be fetched from DB
  // APPOINTMENTS: 'agendaGovAppointments', // Will be fetched from DB
  THEME_SETTINGS: 'agendaGovThemeSettings', // Can remain in localStorage for now, or move to DB
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

// DEFAULT_USERS_CREDENTIALS will be replaced by a database seed.
// INITIAL_APPOINTMENTS will be replaced by database records.
// These are removed as they will no longer be the source of truth.
// You will need to seed your database. See prisma/seed.ts for an example.
