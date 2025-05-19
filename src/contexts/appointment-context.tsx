
"use client";

import type { Appointment, UserRole } from '@/types';
import { LOCAL_STORAGE_KEYS, INITIAL_APPOINTMENTS, USER_ROLES } from '@/lib/constants';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useAuth } from '@/contexts/auth-context';
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO, addWeeks, subWeeks, isSameDay, isAfter, isBefore } from 'date-fns';

interface AppointmentContextType {
  appointments: Appointment[];
  getAppointmentsForUser: (userId: string, role: UserRole, viewDate?: Date, viewType?: 'day' | 'week' | 'month') => Appointment[];
  addAppointment: (appointmentData: Omit<Appointment, 'id' | 'createdAt'>) => void;
  updateAppointment: (appointmentId: string, updates: Partial<Omit<Appointment, 'id' | 'createdAt'>>) => void;
  deleteAppointment: (appointmentId: string) => void;
  getWeeklyAppointmentCount: (userId: string, role: UserRole, targetDate?: Date) => number;
  getUpcomingAppointments: (userId: string, role: UserRole, limit?: number) => Appointment[];
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

function initializeAppointments() {
  const existingAppointments = typeof window !== 'undefined' ? window.localStorage.getItem(LOCAL_STORAGE_KEYS.APPOINTMENTS) : null;
  if (existingAppointments) {
    return JSON.parse(existingAppointments);
  }
  const initialData = INITIAL_APPOINTMENTS.map((appt, index) => ({
    ...appt,
    id: `appt-${Date.now()}-${index}`,
    createdAt: new Date().toISOString(),
  }));
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LOCAL_STORAGE_KEYS.APPOINTMENTS, JSON.stringify(initialData));
  }
  return initialData;
}


export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>(
    LOCAL_STORAGE_KEYS.APPOINTMENTS,
    [] // Initial empty, will be populated by initializeAppointments if effect runs
  );
  const { user } = useAuth();

  // Effect to initialize appointments if localStorage is empty
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAppointments = window.localStorage.getItem(LOCAL_STORAGE_KEYS.APPOINTMENTS);
      if (!storedAppointments || JSON.parse(storedAppointments).length === 0) {
        const initialData = INITIAL_APPOINTMENTS.map((appt, index) => ({
          ...appt,
          id: `appt-${Date.now()}-${index}`,
          createdAt: new Date().toISOString(),
        }));
        setAppointments(initialData);
      } else if (appointments.length === 0 && storedAppointments) {
         // Sync state if useLocalStorage initializes late
        setAppointments(JSON.parse(storedAppointments));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount


  const getAppointmentsForUser = useCallback((currentUserId: string, role: UserRole, viewDate: Date = new Date(), viewType: 'day' | 'week' | 'month' = 'month'): Appointment[] => {
    let filteredAppointments = appointments;

    if (role === USER_ROLES.MAYOR || role === USER_ROLES.VICE_MAYOR) {
      filteredAppointments = appointments.filter(appt => appt.assignedTo === currentUserId);
    }
    // Admin sees all appointments, so no user filtering needed here for Admin.

    const start = viewType === 'day' ? viewDate : startOfWeek(viewDate, { weekStartsOn: 1 });
    const end = viewType === 'day' ? viewDate : endOfWeek(viewDate, { weekStartsOn: 1 });
    
    if (viewType === 'day') {
      return filteredAppointments.filter(appt => isSameDay(parseISO(appt.date), start)).sort((a, b) => a.time.localeCompare(b.time));
    } else if (viewType === 'week') {
       return filteredAppointments.filter(appt => isWithinInterval(parseISO(appt.date), { start, end })).sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime() || a.time.localeCompare(b.time));
    }
    // For 'month' view, typically you'd filter by month, but for a list, we might show all future or all for the month of viewDate.
    // For simplicity of a list rather than grid, let's filter for the month of viewDate.
     return filteredAppointments.filter(appt => parseISO(appt.date).getMonth() === viewDate.getMonth() && parseISO(appt.date).getFullYear() === viewDate.getFullYear())
      .sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime() || a.time.localeCompare(b.time));

  }, [appointments]);

  const addAppointment = useCallback((appointmentData: Omit<Appointment, 'id' | 'createdAt'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: `appt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    setAppointments(prev => [...prev, newAppointment]);
  }, [setAppointments]);

  const updateAppointment = useCallback((appointmentId: string, updates: Partial<Omit<Appointment, 'id' | 'createdAt'>>) => {
    setAppointments(prev => prev.map(appt => appt.id === appointmentId ? { ...appt, ...updates } : appt));
  }, [setAppointments]);

  const deleteAppointment = useCallback((appointmentId: string) => {
    setAppointments(prev => prev.filter(appt => appt.id !== appointmentId));
  }, [setAppointments]);

  const getWeeklyAppointmentCount = useCallback((currentUserId: string, role: UserRole, targetDate: Date = new Date()): number => {
    const start = startOfWeek(targetDate, { weekStartsOn: 1 });
    const end = endOfWeek(targetDate, { weekStartsOn: 1 });
    
    let userAppointments = appointments;
    if (role === USER_ROLES.MAYOR || role === USER_ROLES.VICE_MAYOR) {
        userAppointments = appointments.filter(appt => appt.assignedTo === currentUserId);
    }
    
    return userAppointments.filter(appt => isWithinInterval(parseISO(appt.date), { start, end })).length;
  }, [appointments]);

  const getUpcomingAppointments = useCallback((currentUserId: string, role: UserRole, limit: number = 5): Appointment[] => {
    const today = new Date();
    let userAppointments = appointments;

    if (role === USER_ROLES.MAYOR || role === USER_ROLES.VICE_MAYOR) {
        userAppointments = appointments.filter(appt => appt.assignedTo === currentUserId);
    }
    
    return userAppointments
      .filter(appt => isAfter(parseISO(appt.date), subWeeks(today,1))) // Show appointments from last week onwards to catch recent/today's
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime() || a.time.localeCompare(b.time))
      .slice(0, limit);
  }, [appointments]);


  const contextValue = useMemo(() => ({
    appointments,
    getAppointmentsForUser,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getWeeklyAppointmentCount,
    getUpcomingAppointments,
  }), [appointments, getAppointmentsForUser, addAppointment, updateAppointment, deleteAppointment, getWeeklyAppointmentCount, getUpcomingAppointments]);


  return (
    <AppointmentContext.Provider value={contextValue}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = (): AppointmentContextType => {
  const context = useContext(AppointmentContext);
  if (context === undefined) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};
