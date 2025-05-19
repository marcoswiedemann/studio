
export type UserRole = 'Admin' | 'Prefeito' | 'Vice-prefeito' | 'Visualizador';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  canViewCalendarsOf?: string[]; // User IDs whose calendars this user can view
}

export interface Appointment {
  id: string;
  title: string;
  date: string; // ISO string for date
  time: string; // HH:mm format
  assignedTo: string; // User ID
  location?: string;
  notes?: string;
  contactPerson?: string;
  participants?: string;
  isShared?: boolean;
  isCompleted?: boolean; // Added for appointment status
  createdAt: string; // ISO string
}

export interface Credentials {
  username: string;
  password?: string; // Optional for cases where password is not needed
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
  // Sidebar specific colors
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
  appName: string;
  colors: ThemeColors;
  logoLightModeUrl: string; 
  logoDarkModeUrl: string;  
}

