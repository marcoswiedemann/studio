
"use client";

import type { Appointment, User } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarClock, MapPin, Edit3, Trash2, User as UserIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/auth-context";
import { USER_ROLES } from "@/lib/constants";

interface AppointmentListProps {
  appointments: Appointment[];
  title: string;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointmentId: string) => void;
}

export function AppointmentList({ appointments, title, onEdit, onDelete }: AppointmentListProps) {
  const { user, allUsers } = useAuth();

  const getUserName = (userId: string) => {
    const u = allUsers.find(u => u.id === userId);
    return u ? u.name : 'Desconhecido';
  };
  
  const canModify = (appointment: Appointment): boolean => {
    if (!user) return false;
    if (user.role === USER_ROLES.ADMIN) return true;
    return user.id === appointment.assignedTo;
  };

  return (
    <Card className="shadow-md mt-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Lista de compromissos para o período selecionado.</CardDescription>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Nenhum compromisso encontrado.</p>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors relative group">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg text-primary">{appointment.title}</h3>
                    <Badge variant={parseISO(appointment.date) < new Date() && !isSameDay(parseISO(appointment.date), new Date()) ? "destructive" : "outline"}>
                      {format(parseISO(appointment.date), "dd/MM/yy", { locale: ptBR })}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1 mt-1">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4" />
                      <span>{appointment.time}</span>
                    </div>
                    {appointment.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{appointment.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      <span>Para: {getUserName(appointment.assignedTo)}</span>
                    </div>
                  </div>
                  {appointment.notes && (
                    <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                      <strong>Obs:</strong> {appointment.notes}
                    </p>
                  )}
                  {canModify(appointment) && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(appointment)} className="h-7 w-7">
                        <Edit3 className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(appointment.id)} className="h-7 w-7">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function isSameDay(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
}
