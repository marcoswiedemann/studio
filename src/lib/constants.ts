
import type { User, Credentials, Appointment, ThemeSettings } from '@/types'; 

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

export const DEFAULT_LOGO_URL = "https://pmsantoangelo.abase.com.br/site/Brasoes/120/cabecalho.png";

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  appName: 'AgendaGov', // Added default appName
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
    canViewCalendarsOf: ['user-prefeito'], 
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
