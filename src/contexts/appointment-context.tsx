
"use client";

import type { Appointment, User, UserRole } from '@/types';
import { LOCAL_STORAGE_KEYS, INITIAL_APPOINTMENTS, USER_ROLES } from '@/lib/constants';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useAuth } from '@/contexts/auth-context';
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO, addWeeks, subWeeks, isSameDay, isAfter, isBefore, subDays } from 'date-fns';

interface AppointmentContextType {
  appointments: Appointment[];
  getAppointmentsForUser: (userId: string, role: UserRole, canViewUserIds?: string[], viewDate?: Date, viewType?: 'day' | 'week' | 'month') => Appointment[];
  addAppointment: (appointmentData: Omit<Appointment, 'id' | 'createdAt'>) => void;
  updateAppointment: (appointmentId: string, updates: Partial<Omit<Appointment, 'id' | 'createdAt'>>) => void;
  deleteAppointment: (appointmentId: string) => void;
  getWeeklyAppointmentCount: (user: User | null) => number;
  getUpcomingAppointments: (user: User | null, limit?: number) => Appointment[];
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

function initializeAppointmentsSeedData() {
  return INITIAL_APPOINTMENTS.map((appt, index) => ({
    ...appt,
    id: `appt-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  }));
}

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const memoizedInitialSeedData = useMemo(() => initializeAppointmentsSeedData(), []);

  const [appointments, setAppointments] = useLocalStorage<Appointment[]>(
    LOCAL_STORAGE_KEYS.APPOINTMENTS,
    memoizedInitialSeedData
  );
  const { user: loggedInUser, allUsers } = useAuth(); 

  const getAppointmentsForUser = useCallback((
    currentUserId: string,
    role: UserRole,
    canViewUserIds: string[] = [],
    viewDate: Date = new Date(),
    viewType: 'day' | 'week' | 'month' = 'month'
  ): Appointment[] => {
    let filteredAppointments: Appointment[] = [];

    const mayor = allUsers.find(u => u.role === USER_ROLES.MAYOR);
    const viceMayor = allUsers.find(u => u.role === USER_ROLES.VICE_MAYOR);

    if (role === USER_ROLES.ADMIN) {
      filteredAppointments = appointments;
    } else if (role === USER_ROLES.MAYOR) {
      filteredAppointments = appointments.filter(appt =>
        appt.assignedTo === currentUserId ||
        (appt.isShared && viceMayor && appt.assignedTo === viceMayor.id)
      );
    } else if (role === USER_ROLES.VICE_MAYOR) {
      filteredAppointments = appointments.filter(appt =>
        appt.assignedTo === currentUserId ||
        (appt.isShared && mayor && appt.assignedTo === mayor.id)
      );
    } else if (role === USER_ROLES.VIEWER) {
      if (!canViewUserIds || canViewUserIds.length === 0) {
        return []; // Viewer with no assigned calendars sees nothing
      }
      
      const appointmentsSet = new Set<Appointment>();

      for (const viewableUserId of canViewUserIds) {
        const viewableUser = allUsers.find(u => u.id === viewableUserId);
        if (!viewableUser) continue;

        // Add appointments directly assigned to the viewableUser
        appointments.filter(appt => appt.assignedTo === viewableUserId)
          .forEach(appt => appointmentsSet.add(appt));

        // If viewing Mayor's calendar, also add Vice-Mayor's shared appointments
        if (viewableUser.role === USER_ROLES.MAYOR && viceMayor) {
          appointments.filter(appt => appt.assignedTo === viceMayor.id && appt.isShared)
            .forEach(appt => appointmentsSet.add(appt));
        }

        // If viewing Vice-Mayor's calendar, also add Mayor's shared appointments
        if (viewableUser.role === USER_ROLES.VICE_MAYOR && mayor) {
          appointments.filter(appt => appt.assignedTo === mayor.id && appt.isShared)
            .forEach(appt => appointmentsSet.add(appt));
        }
      }
      filteredAppointments = Array.from(appointmentsSet);
    }


    const start = viewType === 'day' ? viewDate : startOfWeek(viewDate, { weekStartsOn: 1 });
    const end = viewType === 'day' ? viewDate : endOfWeek(viewDate, { weekStartsOn: 1 });

    let dateFilteredAppointments: Appointment[];
    if (viewType === 'day') {
      dateFilteredAppointments = filteredAppointments.filter(appt => isSameDay(parseISO(appt.date), start));
    } else if (viewType === 'week') {
       dateFilteredAppointments = filteredAppointments.filter(appt => isWithinInterval(parseISO(appt.date), { start, end }));
    } else { // month view
     dateFilteredAppointments = filteredAppointments.filter(appt => parseISO(appt.date).getMonth() === viewDate.getMonth() && parseISO(appt.date).getFullYear() === viewDate.getFullYear());
    }

    return dateFilteredAppointments.sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime() || a.time.localeCompare(b.time));

  }, [appointments, allUsers]);

  const addAppointment = useCallback((appointmentData: Omit<Appointment, 'id' | 'createdAt'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: `appt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      isShared: appointmentData.isShared || false, 
    };
    setAppointments(prev => [...prev, newAppointment]);
  }, [setAppointments]);

  const updateAppointment = useCallback((appointmentId: string, updates: Partial<Omit<Appointment, 'id' | 'createdAt'>>) => {
    setAppointments(prev => prev.map(appt => appt.id === appointmentId ? { ...appt, ...updates, isShared: updates.isShared || false } : appt));
  }, [setAppointments]);

  const deleteAppointment = useCallback((appointmentId: string) => {
    setAppointments(prev => prev.filter(appt => appt.id !== appointmentId));
  }, [setAppointments]);

  const getWeeklyAppointmentCount = useCallback((currentUser: User | null, targetDate: Date = new Date()): number => {
    if (!currentUser) return 0;
    // Pass relevant parts of user, or the full user object
    let userAppointments = getAppointmentsForUser(currentUser.id, currentUser.role, currentUser.canViewCalendarsOf || [], targetDate, 'week');
    return userAppointments.length;
  }, [getAppointmentsForUser]);

  const getUpcomingAppointments = useCallback((currentUser: User | null, limit: number = 5): Appointment[] => {
    if (!currentUser) return [];
    const today = new Date();

    // Pass relevant parts of user, or the full user object
    const allRelevantAppointments = getAppointmentsForUser(currentUser.id, currentUser.role, currentUser.canViewCalendarsOf || [], today, 'month');

    return allRelevantAppointments
      .filter(appt => isAfter(parseISO(appt.date), subDays(today,1))) 
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime() || a.time.localeCompare(b.time))
      .slice(0, limit);
  }, [getAppointmentsForUser]);


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

