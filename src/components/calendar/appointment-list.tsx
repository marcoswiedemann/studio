
"use client";

import type { Appointment } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarClock, MapPin, Edit3, Trash2, User as UserIcon, Phone, Users as UsersIcon, Info } from "lucide-react";
import { format, parseISO, isSameDay as dateFnsIsSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/auth-context";
import { USER_ROLES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface AppointmentListProps {
  appointments: Appointment[];
  title: string;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointmentId: string) => void;
  isReadOnly?: boolean;
}

export function AppointmentList({ appointments, title, onEdit, onDelete, isReadOnly = false }: AppointmentListProps) {
  const { user, allUsers } = useAuth();

  const getUserName = (userId: string) => {
    const u = allUsers.find(u => u.id === userId);
    return u ? u.name : 'Desconhecido';
  };
  
  const canModify = (appointment: Appointment): boolean => {
    if (isReadOnly || !user) return false;
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
          <ScrollArea className="h-[calc(100vh-320px)] md:h-[400px] pr-4">
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div 
                  key={appointment.id} 
                  className={cn(
                    "p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors relative group",
                    canModify(appointment) && "cursor-pointer"
                  )}
                  onClick={() => { if(canModify(appointment)) onEdit(appointment); }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-primary pr-2 flex-1 break-words">{appointment.title}</h3>
                    <div className="flex-shrink-0 ml-2">
                       <Badge variant={parseISO(appointment.date) < new Date() && !dateFnsIsSameDay(parseISO(appointment.date), new Date()) ? "destructive" : "outline"}>
                        {format(parseISO(appointment.date), "dd/MM/yy", { locale: ptBR })}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1.5 mt-1">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 flex-shrink-0" />
                      <span>{appointment.time}</span>
                    </div>
                    {appointment.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>{appointment.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 flex-shrink-0" />
                      <span>Para: {getUserName(appointment.assignedTo)}</span>
                    </div>
                    {appointment.contactPerson && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>Contato: {appointment.contactPerson}</span>
                      </div>
                    )}
                    {appointment.participants && (
                      <div className="flex items-start gap-2">
                        <UsersIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span className="whitespace-pre-line">Participantes: {appointment.participants}</span>
                      </div>
                    )}
                  </div>

                  {appointment.notes && (
                    <div className="text-xs text-muted-foreground mt-2 pt-2 border-t flex items-start gap-2">
                        <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                        <p className="whitespace-pre-line"><strong>Obs:</strong> {appointment.notes}</p>
                    </div>
                  )}

                  {canModify(appointment) && (
                    <div 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 bg-card p-1 rounded-md shadow-sm"
                      onClick={(e) => e.stopPropagation()} 
                    >
                      <Button variant="ghost" size="icon" onClick={() => onEdit(appointment)} className="h-7 w-7">
                        <Edit3 className="h-4 w-4 text-blue-500" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(appointment.id)} className="h-7 w-7">
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Excluir</span>
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
