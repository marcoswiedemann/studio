
"use client";

import type { Appointment, User, UserRole } from '@/types';
import { LOCAL_STORAGE_KEYS, INITIAL_APPOINTMENTS, USER_ROLES } from '@/lib/constants';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useAuth } from '@/contexts/auth-context';
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO, addWeeks, subWeeks, isSameDay, isAfter, isBefore } from 'date-fns';

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
  const { user: loggedInUser, allUsers } = useAuth(); // Get allUsers for sharing logic

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
      if (canViewUserIds && canViewUserIds.length > 0) {
        // Viewers see appointments of users they can view, including shared ones visible to those users
        const viewableAppointments = new Set<string>();
        
        canViewUserIds.forEach(viewableUserId => {
          const targetUser = allUsers.find(u => u.id === viewableUserId);
          if (!targetUser) return;

          appointments.forEach(appt => {
            if (appt.assignedTo === viewableUserId) {
              viewableAppointments.add(appt.id);
            }
            // If viewer can see Mayor, and Vice shared with Mayor
            if (targetUser.role === USER_ROLES.MAYOR && appt.isShared && viceMayor && appt.assignedTo === viceMayor.id) {
              viewableAppointments.add(appt.id);
            }
            // If viewer can see Vice, and Mayor shared with Vice
            if (targetUser.role === USER_ROLES.VICE_MAYOR && appt.isShared && mayor && appt.assignedTo === mayor.id) {
              viewableAppointments.add(appt.id);
            }
          });
        });
        filteredAppointments = appointments.filter(appt => viewableAppointments.has(appt.id));

      } else {
        return []; // Viewer with no assigned calendars sees nothing
      }
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
      isShared: appointmentData.isShared || false, // Ensure isShared defaults to false
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

    const start = startOfWeek(targetDate, { weekStartsOn: 1 });
    const end = endOfWeek(targetDate, { weekStartsOn: 1 });
    
    let userAppointments = getAppointmentsForUser(currentUser.id, currentUser.role, currentUser.canViewCalendarsOf, targetDate, 'week');
    // The getAppointmentsForUser already handles sharing logic based on role
    
    return userAppointments.filter(appt => isWithinInterval(parseISO(appt.date), { start, end })).length;
  }, [appointments, getAppointmentsForUser]); // Added getAppointmentsForUser to dependencies

  const getUpcomingAppointments = useCallback((currentUser: User | null, limit: number = 5): Appointment[] => {
    if (!currentUser) return [];
    const today = new Date();
    
    // Use getAppointmentsForUser to get base list, then filter for upcoming
    // This reuses the complex filtering logic including sharing and viewer permissions
    // We pass 'month' as viewType to get a broader set initially, then filter by date
    const allRelevantAppointments = getAppointmentsForUser(currentUser.id, currentUser.role, currentUser.canViewCalendarsOf, today, 'month');
    
    return allRelevantAppointments
      .filter(appt => isAfter(parseISO(appt.date), subWeeks(today,1))) // Keep previous week's for context if needed, or change to isAfter(parseISO(appt.date), subDays(today,1)) for strictly future
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime() || a.time.localeCompare(b.time))
      .slice(0, limit);
  }, [appointments, getAppointmentsForUser]); // Added getAppointmentsForUser to dependencies


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

