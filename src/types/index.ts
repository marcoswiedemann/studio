
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
  isShared?: boolean; // Added for sharing between Mayor and Vice-Mayor
  createdAt: string; // ISO string
}

export interface Credentials {
  username: string;
  password?: string; // Optional for cases where password is not needed
}

