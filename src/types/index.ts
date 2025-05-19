
// Prisma enum for UserRole will be used directly, so we can simplify this.
// export type UserRole = 'Admin' | 'Prefeito' | 'Vice-prefeito' | 'Visualizador';
// We will use Prisma's generated UserRole enum.
import type { UserRole as PrismaUserRole } from '@prisma/client';
export type UserRole = PrismaUserRole;


export interface User {
  id: string;
  username: string;
  name: string;
  password?: string; // For client-side forms; will not be sent from API unless explicitly needed for update
  role: UserRole;
  canViewCalendarsOf?: string[]; // User IDs whose calendars this user can view
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Appointment {
  id: string;
  title: string;
  date: string | Date; // Allow Date for form, string for storage/API
  time: string; // HH:mm format
  assignedToId: string; 
  assignedTo?: User; // For displaying name
  location?: string;
  notes?: string;
  contactPerson?: string;
  participants?: string;
  isShared?: boolean;
  isCompleted?: boolean;
  createdAt: string | Date; 
  createdById: string; 
  createdBy?: User; // For displaying name
  updatedAt?: string | Date; 
  updatedById?: string;
  updatedBy?: User; // For displaying name
}

export interface Credentials {
  username: string;
  password?: string; 
}

export interface ThemeColors {
  background: string; 
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  sidebarBackground: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
}

export interface ThemeSettings {
  id?: string; // Will come from DB
  userId?: string; // Will come from DB
  appName: string;
  colors: ThemeColors;
  logoLightModeUrl: string; 
  logoDarkModeUrl: string;  
}
