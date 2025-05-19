
// Importar o tipo UserRole diretamente do Prisma Client
import type { UserRole as PrismaUserRole, Appointment as PrismaAppointment, User as PrismaUser } from '@prisma/client';

// Usar o tipo UserRole do Prisma diretamente
export type UserRole = PrismaUserRole;

export interface User {
  id: string;
  username: string;
  name: string;
  password?: string; // Opcional no frontend, obrigatório no backend/seed
  role: UserRole;
  canViewCalendarsOf?: string[];
  createdAt?: string | Date; // Prisma usa Date, string para API
  updatedAt?: string | Date; // Prisma usa Date, string para API
}

// Interface para Appointment no frontend, pode ser ligeiramente diferente do modelo Prisma
// se precisarmos de campos formatados ou adicionais no cliente.
export interface Appointment {
  id: string;
  title: string;
  date: string | Date; // Prisma usa DateTime, string para API/forms
  time: string;
  assignedToId: string;
  assignedTo?: User; // Relacionamento opcional no cliente
  location?: string | null; // Prisma pode ter null
  notes?: string | null;
  contactPerson?: string | null;
  participants?: string | null;
  isShared?: boolean;
  isCompleted?: boolean;
  createdAt: string | Date; // Prisma usa DateTime
  createdById: string;
  createdBy?: User; // Relacionamento opcional no cliente
  updatedAt?: string | Date | null; // Prisma usa DateTime
  updatedById?: string | null;
  updatedBy?: User | null; // Relacionamento opcional no cliente
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
  id?: string; // Adicionado para corresponder ao modelo Prisma
  userId?: string; // Se as configurações forem por usuário no DB
  appName: string;
  colors: ThemeColors; // Este campo será mapeado para os campos de cor individuais no Prisma
  logoLightModeUrl: string;
  logoDarkModeUrl: string;
}
