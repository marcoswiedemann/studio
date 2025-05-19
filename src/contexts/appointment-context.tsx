
"use client";

import type { Appointment, User, UserRole } from '@/types';
// Removed LOCAL_STORAGE_KEYS and INITIAL_APPOINTMENTS from this import
import { USER_ROLES } from '@/lib/constants';
// Removed useLocalStorage import
import { useAuth } from '@/contexts/auth-context';
import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO, isSameDay, isAfter, subDays } from 'date-fns';

interface AppointmentContextType {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>; // Add setter for eventual API load
  getAppointmentsForUser: (userId: string, role: UserRole, canViewUserIds?: string[], viewDate?: Date, viewType?: 'day' | 'week' | 'month') => Appointment[];
  addAppointment: (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'assignedToId' | 'createdById' | 'updatedById'> & { assignedToId: string; createdById: string; }) => void;
  updateAppointment: (appointmentId: string, updates: Partial<Omit<Appointment, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'assignedToId' | 'createdById' | 'updatedById'>> & { updatedById: string; }) => void;
  deleteAppointment: (appointmentId: string) => void;
  getWeeklyAppointmentCount: (user: User | null) => number;
  getUpcomingAppointments: (user: User | null, limit?: number) => Appointment[];
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

// Removed initializeAppointmentsSeedData function as INITIAL_APPOINTMENTS is no longer used here

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize appointments with an empty array. Data will be fetched from API later.
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const { user: loggedInUser, allUsers } = useAuth();

  // TODO: useEffect to fetch appointments from API when context mounts / user changes

  const getAppointmentsForUser = useCallback((
    currentUserId: string,
    role: UserRole,
    canViewUserIds: string[] = [],
    viewDate: Date = new Date(),
    viewType: 'day' | 'week' | 'month' = 'month'
  ): Appointment[] => {
    let relevantAppointments: Appointment[] = [];

    const mayor = allUsers.find(u => u.role === USER_ROLES.Prefeito);
    const viceMayor = allUsers.find(u => u.role === USER_ROLES.Vice_prefeito);

    if (role === USER_ROLES.Admin) {
      relevantAppointments = appointments;
    } else if (role === USER_ROLES.Prefeito) {
      relevantAppointments = appointments.filter(appt =>
        appt.assignedToId === currentUserId ||
        (appt.isShared && viceMayor && appt.assignedToId === viceMayor.id)
      );
    } else if (role === USER_ROLES.Vice_prefeito) {
      relevantAppointments = appointments.filter(appt =>
        appt.assignedToId === currentUserId ||
        (appt.isShared && mayor && appt.assignedToId === mayor.id)
      );
    } else if (role === USER_ROLES.Visualizador) {
        if (!canViewUserIds || canViewUserIds.length === 0) {
            return [];
        }
        const appointmentsSet = new Set<Appointment>();
        for (const viewableUserId of canViewUserIds) {
            const viewableUser = allUsers.find(u => u.id === viewableUserId);
            if (!viewableUser) continue;

            appointments.filter(appt => appt.assignedToId === viewableUserId)
            .forEach(appt => appointmentsSet.add(appt));

            if (viewableUser.role === USER_ROLES.Prefeito && viceMayor) {
            appointments.filter(appt => appt.assignedToId === viceMayor.id && appt.isShared)
                .forEach(appt => appointmentsSet.add(appt));
            }

            if (viewableUser.role === USER_ROLES.Vice_prefeito && mayor) {
            appointments.filter(appt => appt.assignedToId === mayor.id && appt.isShared)
                .forEach(appt => appointmentsSet.add(appt));
            }
        }
        relevantAppointments = Array.from(appointmentsSet);
    }


    const start = viewType === 'day' ? viewDate : startOfWeek(viewDate, { weekStartsOn: 1 });
    const end = viewType === 'day' ? viewDate : endOfWeek(viewDate, { weekStartsOn: 1 });

    let dateFilteredAppointments: Appointment[];
    if (viewType === 'day') {
      dateFilteredAppointments = relevantAppointments.filter(appt => isSameDay(parseISO(appt.date as string), start));
    } else if (viewType === 'week') {
       dateFilteredAppointments = relevantAppointments.filter(appt => isWithinInterval(parseISO(appt.date as string), { start, end }));
    } else { // month view
     dateFilteredAppointments = relevantAppointments.filter(appt => parseISO(appt.date as string).getMonth() === viewDate.getMonth() && parseISO(appt.date as string).getFullYear() === viewDate.getFullYear());
    }

    return dateFilteredAppointments.sort((a,b) => {
        if (a.isCompleted !== b.isCompleted) {
            return a.isCompleted ? 1 : -1;
        }
        const dateComparison = parseISO(a.date as string).getTime() - parseISO(b.date as string).getTime();
        if (dateComparison !== 0) return dateComparison;
        return a.time.localeCompare(b.time);
    });

  }, [appointments, allUsers]);

  const addAppointment = useCallback((appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy' | 'assignedTo' | 'createdBy' | 'updatedBy'> & { assignedToId: string; createdById: string; }) => {
    if (!loggedInUser) {
        console.error("Cannot add appointment: no user logged in.");
        return;
    }
    const newAppointment: Appointment = {
      ...appointmentData,
      id: `appt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      // createdById is now passed in appointmentData
      isShared: appointmentData.isShared || false,
      isCompleted: appointmentData.isCompleted || false,
    };
    setAppointments(prev => [...prev, newAppointment]);
    // TODO: API call to add appointment to DB
  }, [setAppointments, loggedInUser]);

  const updateAppointment = useCallback((appointmentId: string, updates: Partial<Omit<Appointment, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'assignedToId' | 'createdById' | 'updatedBy'>> & { updatedById: string; }) => {
    if (!loggedInUser) {
        console.error("Cannot update appointment: no user logged in.");
        return;
    }
    setAppointments(prev => prev.map(appt =>
        appt.id === appointmentId
        ? {
            ...appt,
            ...updates,
            isShared: updates.isShared !== undefined ? updates.isShared : appt.isShared,
            isCompleted: updates.isCompleted !== undefined ? updates.isCompleted : appt.isCompleted,
            // updatedById is now passed in updates
            updatedAt: new Date().toISOString(),
          }
        : appt
    ));
    // TODO: API call to update appointment in DB
  }, [setAppointments, loggedInUser]);

  const deleteAppointment = useCallback((appointmentId: string) => {
    setAppointments(prev => prev.filter(appt => appt.id !== appointmentId));
    // TODO: API call to delete appointment from DB
  }, [setAppointments]);

  const getWeeklyAppointmentCount = useCallback((currentUser: User | null, targetDate: Date = new Date()): number => {
    if (!currentUser) return 0;
    let userAppointments = getAppointmentsForUser(currentUser.id, currentUser.role, currentUser.canViewCalendarsOf || [], targetDate, 'week');
    return userAppointments.length;
  }, [getAppointmentsForUser]);

  const getUpcomingAppointments = useCallback((currentUser: User | null, limit: number = 5): Appointment[] => {
    if (!currentUser) return [];
    const today = new Date();

    // Get all relevant appointments first (month view for today is a broad enough scope)
    // For this temporary in-memory version, we fetch all appointments the user can see.
    // When using an API, this query might be more targeted (e.g., appointments from today onwards).
    const allRelevantAppointments = getAppointmentsForUser(currentUser.id, currentUser.role, currentUser.canViewCalendarsOf || [], today, 'month');


    return allRelevantAppointments
      .filter(appt => isAfter(parseISO(appt.date as string), subDays(today,1)))
      .sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) {
            return a.isCompleted ? 1 : -1;
        }
        const dateComparison = parseISO(a.date as string).getTime() - parseISO(b.date as string).getTime();
        if (dateComparison !== 0) return dateComparison;
        return a.time.localeCompare(b.time);
      })
      .slice(0, limit);
  }, [getAppointmentsForUser]);


  const contextValue = useMemo(() => ({
    appointments,
    setAppointments, // Added setter
    getAppointmentsForUser,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getWeeklyAppointmentCount,
    getUpcomingAppointments,
  }), [appointments, setAppointments, getAppointmentsForUser, addAppointment, updateAppointment, deleteAppointment, getWeeklyAppointmentCount, getUpcomingAppointments]);


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

