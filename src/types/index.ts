
export type UserRole = 'Admin' | 'Prefeito' | 'Vice-prefeito';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  // Password should not be stored in the User object in a real app
  // For this mock, it's handled separately or implied by initial data
}

export interface Appointment {
  id: string;
  title: string;
  date: string; // ISO string for date
  time: string; // HH:mm format
  assignedTo: string; // User ID
  location?: string;
  notes?: string;
  createdAt: string; // ISO string
}

export interface Credentials {
  username: string;
  password?: string; // Optional for cases where password is not needed
}
