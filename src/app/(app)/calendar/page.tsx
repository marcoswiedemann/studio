
"use client";

import { useState, useEffect, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AppointmentForm, AppointmentFormValues } from "@/components/calendar/appointment-form";
import { AppointmentList } from "@/components/calendar/appointment-list";
import { useAuth } from "@/contexts/auth-context";
import { useAppointments } from "@/contexts/appointment-context";
import type { Appointment } from "@/types";
import { PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { format, parseISO, addDays, subDays, addMonths, subMonths, startOfWeek, endOfWeek, isSameDay as dateFnsIsSameDay, isToday as dateFnsIsToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { USER_ROLES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type ViewMode = "day" | "week" | "month";

export default function CalendarPage() {
  const { user } = useAuth();
  const { appointments, addAppointment, updateAppointment, deleteAppointment, getAppointmentsForUser } = useAppointments();
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isViewerRole = user?.role === USER_ROLES.VIEWER;

  const displayedAppointments = useMemo(() => {
    if (!user) return [];
    return getAppointmentsForUser(user.id, user.role, user.canViewCalendarsOf || [], selectedDate, viewMode);
  }, [user, selectedDate, viewMode, getAppointmentsForUser]);

  const appointmentsOnSelectedMonth = useMemo(() => {
    if (!user) return [];
    // Get all appointments for the month of the selectedDate
    return getAppointmentsForUser(user.id, user.role, user.canViewCalendarsOf || [], selectedDate, 'month');
  }, [user, selectedDate, getAppointmentsForUser]);


  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setViewMode("day");
    }
  };

  const handleFormSubmit = async (values: AppointmentFormValues) => {
    if (!user || isViewerRole) return;
    setIsLoading(true);
    const appointmentData = {
      ...values,
      date: format(values.date, "yyyy-MM-dd"),
      isShared: values.isShared || false,
      isCompleted: values.isCompleted || false,
    };

    try {
      if (editingAppointment) {
        await updateAppointment(editingAppointment.id, appointmentData);
        toast({ title: "Sucesso!", description: "Compromisso atualizado." });
      } else {
        await addAppointment(appointmentData);
        toast({ title: "Sucesso!", description: "Compromisso criado." });
      }
      setIsFormOpen(false);
      setEditingAppointment(null);
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível salvar o compromisso.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditForm = (appointment: Appointment) => {
    if (isViewerRole) return;
    setEditingAppointment({ ...appointment, date: parseISO(appointment.date) });
    setIsFormOpen(true);
  };

  const openDeleteConfirm = (appointmentId: string) => {
    if (isViewerRole) return;
    setAppointmentToDelete(appointmentId);
  };

  const handleDeleteConfirm = async () => {
    if (!appointmentToDelete || isViewerRole) return;
    setIsLoading(true);
    try {
      await deleteAppointment(appointmentToDelete);
      toast({ title: "Sucesso!", description: "Compromisso excluído." });
      setAppointmentToDelete(null);
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível excluir o compromisso.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === 'day') {
      setSelectedDate(prev => direction === 'prev' ? subDays(prev, 1) : addDays(prev, 1));
    } else if (viewMode === 'week') {
      setSelectedDate(prev => direction === 'prev' ? subDays(prev, 7) : addDays(prev, 7));
    } else {
      // When in month view, navigating should change the month for the calendar highlight as well
      setSelectedDate(prev => {
        const newDate = direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1);
        return newDate;
      });
    }
  };

  const getTitleForView = () => {
    if (viewMode === 'day') return format(selectedDate, "PPP", { locale: ptBR });
    if (viewMode === 'week') {
      const start = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Assuming week starts on Monday for ptBR
      const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
      return `Semana de ${format(start, "d MMM", { locale: ptBR })} - ${format(end, "d MMM yyyy", { locale: ptBR })}`;
    }
    return format(selectedDate, "MMMM yyyy", { locale: ptBR });
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
           <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}><ChevronLeft className="h-4 w-4" /></Button>
           <Button variant="outline" onClick={() => { setSelectedDate(new Date()); setViewMode('day'); }}>Hoje</Button>
           <Button variant="outline" size="icon" onClick={() => navigateDate('next')}><ChevronRight className="h-4 w-4" /></Button>
           <h2 className="text-xl font-semibold ml-2 hidden md:block">{getTitleForView()}</h2>
        </div>
        <div className="flex gap-2">
          {(['day', 'week', 'month'] as ViewMode[]).map(mode => (
            <Button key={mode} variant={viewMode === mode ? "default" : "outline"} onClick={() => setViewMode(mode)}>
              {mode === 'day' ? 'Dia' : mode === 'week' ? 'Semana' : 'Mês'}
            </Button>
          ))}
        </div>
        {!isViewerRole && (
          <Button onClick={() => { setEditingAppointment(null); setIsFormOpen(true); }} className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Novo Compromisso
          </Button>
        )}
      </div>
      <h2 className="text-xl font-semibold md:hidden text-center">{getTitleForView()}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border shadow-md bg-card p-0"
            locale={ptBR}
            month={selectedDate} // Control the displayed month
            onMonthChange={setSelectedDate} // Update selectedDate when month changes in calendar
            modifiers={{
              // We'll use DayContent for custom rendering of appointment indicators
            }}
            modifiersStyles={{
              // Custom styles for modifiers if needed
            }}
            components={{
              DayContent: ({ date, displayMonth }) => {
                const isCurrentDisplayMonth = date.getMonth() === displayMonth.getMonth();
                if (!isCurrentDisplayMonth) {
                  return <span>{format(date, "d")}</span>;
                }

                const hasAppointment = appointmentsOnSelectedMonth.some(appt =>
                  dateFnsIsSameDay(parseISO(appt.date), date)
                );
                const isSelected = selectedDate && dateFnsIsSameDay(date, selectedDate);
                const isToday = dateFnsIsToday(date);

                return (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <span>{format(date, "d")}</span>
                    {hasAppointment && !isSelected && (
                      <span
                        className={cn(
                          "absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full",
                          isToday ? "bg-primary-foreground" : "bg-primary"
                        )}
                      ></span>
                    )}
                  </div>
                );
              }
            }}
          />
        </div>
        <div className="md:col-span-2">
           <AppointmentList
            appointments={displayedAppointments}
            title={`Compromissos - ${getTitleForView()}`}
            onEdit={openEditForm}
            onDelete={openDeleteConfirm}
            isReadOnly={isViewerRole}
          />
        </div>
      </div>

      {!isViewerRole && isFormOpen && (
        <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingAppointment(null); }}>
          <DialogContent className="sm:max-w-[425px] md:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingAppointment ? "Editar Compromisso" : "Novo Compromisso"}</DialogTitle>
              <DialogDescription>
                {editingAppointment ? "Atualize os detalhes do seu compromisso." : "Preencha os detalhes para agendar um novo compromisso."}
              </DialogDescription>
            </DialogHeader>
            <AppointmentForm
              onSubmit={handleFormSubmit}
              initialData={editingAppointment || undefined}
              onCancel={() => { setIsFormOpen(false); setEditingAppointment(null); }}
              isLoading={isLoading}
            />
          </DialogContent>
        </Dialog>
      )}

      {!isViewerRole && !!appointmentToDelete && (
        <AlertDialog open={!!appointmentToDelete} onOpenChange={(open) => !open && setAppointmentToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este compromisso? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setAppointmentToDelete(null)} disabled={isLoading}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} disabled={isLoading} className="bg-destructive hover:bg-destructive/90">
                {isLoading ? "Excluindo..." : "Excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

