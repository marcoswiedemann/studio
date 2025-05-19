
import type { User, Credentials, Appointment, ThemeSettings } from '@/types'; // Added Appointment type & ThemeSettings

export const USER_ROLES = {
  ADMIN: 'Admin',
  MAYOR: 'Prefeito',
  VICE_MAYOR: 'Vice-prefeito',
  VIEWER: 'Visualizador',
} as const;

export const LOCAL_STORAGE_KEYS = {
  LOGGED_IN_USER: 'agendaGovUser',
  USERS: 'agendaGovUsers',
  APPOINTMENTS: 'agendaGovAppointments',
  THEME_SETTINGS: 'agendaGovThemeSettings',
};

export const DEFAULT_MAIN_LOGO_URL = "https://pmsantoangelo.abase.com.br/site/Brasoes/120/cabecalho.png";

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  colors: {
    background: "#ECEFF1", // hsl(206 23% 94%)
    foreground: "#383A3D", // hsl(210 10% 23%)
    card: "#FFFFFF",       // hsl(0 0% 100%)
    cardForeground: "#383A3D", // hsl(210 10% 23%)
    popover: "#FFFFFF",      // hsl(0 0% 100%)
    popoverForeground: "#383A3D", // hsl(210 10% 23%)
    primary: "#3F51B5",      // hsl(231 48% 48%)
    primaryForeground: "#FFFFFF", // hsl(0 0% 100%)
    secondary: "#E0E5E9",    // hsl(210 16% 90%)
    secondaryForeground: "#383A3D", // hsl(210 10% 23%)
    muted: "#E0E5E9",        // hsl(210 16% 90%)
    mutedForeground: "#696E75", // hsl(210 10% 45%)
    accent: "#9575CD",       // hsl(261 44% 70%)
    accentForeground: "#FFFFFF", // hsl(0 0% 100%)
    destructive: "#F44336",  // hsl(0 84.2% 60.2%)
    destructiveForeground: "#FAFAFA", // hsl(0 0% 98%)
    border: "#D3D7DB",       // hsl(210 10% 85%)
    input: "#D3D7DB",        // hsl(210 10% 85%)
    ring: "#3F51B5",         // hsl(231 48% 48%)
    // Sidebar defaults (converted to hex)
    sidebarBackground: "#2B303B",       // hsl(220 15% 20%)
    sidebarForeground: "#F9FAFC",       // hsl(210 40% 98%)
    sidebarPrimary: "#3F51B5",          // hsl(231 48% 48%)
    sidebarPrimaryForeground: "#FFFFFF", // hsl(0 0% 100%)
    sidebarAccent: "#3C4352",           // hsl(220 15% 28%)
    sidebarAccentForeground: "#F9FAFC",  // hsl(210 40% 98%)
    sidebarBorder: "#1F2329",           // hsl(220 15% 15%)
    sidebarRing: "#3F51B5",             // hsl(231 48% 48%)
  },
  mainLogoUrl: DEFAULT_MAIN_LOGO_URL,
};


export const DEFAULT_USERS_CREDENTIALS: Array<User & { password?: string }> = [
  { id: 'user-admin', username: 'admin', password: 'crm123', name: 'Administrador', role: USER_ROLES.ADMIN },
  { id: 'user-prefeito', username: 'prefeito', password: 'crm123', name: 'Prefeito João Silva', role: USER_ROLES.MAYOR },
  { id: 'user-vice', username: 'vice', password: 'crm123', name: 'Vice-Prefeita Maria Costa', role: USER_ROLES.VICE_MAYOR },
  {
    id: 'user-viewer',
    username: 'viewer',
    password: 'crm123',
    name: 'Assessor de Gabinete',
    role: USER_ROLES.VIEWER,
    canViewCalendarsOf: ['user-prefeito'], // Example: can view Prefeito's calendar
  },
];

export const INITIAL_APPOINTMENTS: Omit<Appointment, 'id' | 'createdAt'>[] = [
  {
    title: 'Reunião de Planejamento Semanal (Prefeito)',
    date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
    time: '10:00',
    assignedTo: 'user-prefeito',
    location: 'Gabinete do Prefeito',
    notes: 'Discutir metas da semana.',
    contactPerson: 'Secretária Ana - (XX) XXXX-XXXX',
    participants: 'Prefeito, Chefe de Gabinete',
    isShared: true,
  },
  {
    title: 'Alinhamento com Secretariado (Prefeito)',
    date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0],
    time: '14:30',
    assignedTo: 'user-prefeito',
    location: 'Sala de Reuniões Principal',
    notes: 'Revisar progresso dos projetos.',
    contactPerson: 'Chefe de Gabinete - (XX) YYYY-YYYY',
    participants: 'Prefeito, Todos os Secretários',
    isShared: false,
  },
  {
    title: 'Visita à Obra Pública X (Vice)',
    date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0],
    time: '09:00',
    assignedTo: 'user-vice',
    location: 'Local da Obra X',
    notes: 'Acompanhar andamento.',
    contactPerson: 'Engenheiro Responsável - (XX) ZZZZ-ZZZZ',
    participants: 'Vice-Prefeito, Secretário de Obras',
    isShared: true,
  },
  {
    title: 'Reunião Orçamentária (Admin)',
    date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
    time: '11:00',
    assignedTo: 'user-admin', 
    location: 'Sala da Administração',
    notes: 'Definir prioridades orçamentárias.',
    contactPerson: 'Diretor Financeiro',
    participants: 'Admin, Diretor Financeiro, Contador',
    isShared: false,
  },
  {
    title: 'Café com Lideranças Comunitárias (Vice)',
    date: new Date(new Date().setDate(new Date().getDate() + 4)).toISOString().split('T')[0],
    time: '08:30',
    assignedTo: 'user-vice',
    location: 'Centro Comunitário Central',
    notes: 'Ouvir demandas da comunidade.',
    contactPerson: 'Líder Comunitário - (XX) AAAA-AAAA',
    participants: 'Vice-Prefeita, Assessores',
    isShared: false,
  }
];
