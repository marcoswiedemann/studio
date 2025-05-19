import type { User, Credentials } from '@/types';

export const USER_ROLES = {
  ADMIN: 'Admin',
  MAYOR: 'Prefeito',
  VICE_MAYOR: 'Vice-prefeito',
} as const;

export const LOCAL_STORAGE_KEYS = {
  LOGGED_IN_USER: 'agendaGovUser',
  USERS: 'agendaGovUsers',
  APPOINTMENTS: 'agendaGovAppointments',
};

export const DEFAULT_USERS_CREDENTIALS: Array<User & { password?: string }> = [
  { id: 'user-admin', username: 'admin', password: 'crm123', name: 'Administrador', role: USER_ROLES.ADMIN },
  { id: 'user-prefeito', username: 'prefeito', password: 'crm123', name: 'Prefeito', role: USER_ROLES.MAYOR },
  { id: 'user-vice', username: 'vice', password: 'crm123', name: 'Vice-Prefeito', role: USER_ROLES.VICE_MAYOR },
];

export const INITIAL_APPOINTMENTS: Omit<Appointment, 'id' | 'createdAt'>[] = [
  {
    title: 'Reunião de Planejamento Semanal',
    date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
    time: '10:00',
    assignedTo: 'user-prefeito',
    location: 'Gabinete do Prefeito',
    notes: 'Discutir metas da semana.',
  },
  {
    title: 'Alinhamento com Secretariado',
    date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0],
    time: '14:30',
    assignedTo: 'user-prefeito',
    location: 'Sala de Reuniões Principal',
    notes: 'Revisar progresso dos projetos.',
  },
  {
    title: 'Visita à Obra Pública X',
    date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0],
    time: '09:00',
    assignedTo: 'user-vice',
    location: 'Local da Obra X',
    notes: 'Acompanhar andamento.',
  },
  {
    title: 'Reunião Orçamentária',
    date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
    time: '11:00',
    assignedTo: 'user-admin',
    location: 'Sala da Administração',
    notes: 'Definir prioridades orçamentárias.',
  },
];
