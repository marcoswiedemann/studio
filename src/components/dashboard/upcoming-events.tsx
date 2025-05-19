
"use client";

import type { Appointment } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, MapPin, Phone, Users, Info, CheckCircle2, XCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

interface UpcomingEventsProps {
  appointments: Appointment[];
}

export function UpcomingEvents({ appointments }: UpcomingEventsProps) {
  const { allUsers } = useAuth();

  const getUserName = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    return user ? user.name : 'Desconhecido';
  };

  return (
    <Card className="shadow-lg col-span-1 md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle>Próximos Compromissos</CardTitle>
        <CardDescription>Seus próximos compromissos agendados.</CardDescription>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Nenhum compromisso futuro encontrado.</p>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className={cn("p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors", appointment.isCompleted && "opacity-75")}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={cn("font-semibold text-lg text-primary flex-1 break-words", appointment.isCompleted && "line-through text-muted-foreground")}>{appointment.title}</h3>
                    <div className="flex flex-col items-end gap-1 ml-2 flex-shrink-0">
                        <Badge variant="outline">{format(parseISO(appointment.date), "dd/MM/yy", { locale: ptBR })}</Badge>
                        {appointment.isCompleted !== undefined && (
                             appointment.isCompleted ? (
                                <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white text-xs">
                                  <CheckCircle2 className="h-3 w-3 mr-1" /> Realizado
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  <XCircle className="h-3 w-3 mr-1" /> Pendente
                                </Badge>
                              )
                        )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1 mt-1">
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
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-check flex-shrink-0"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
                      <span>Para: {getUserName(appointment.assignedTo)}</span>
                    </div>
                     {appointment.contactPerson && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>Contato: {appointment.contactPerson}</span>
                      </div>
                    )}
                  </div>
                  {appointment.participants && (
                      <div className="text-sm text-muted-foreground mt-2 pt-2 border-t flex items-start gap-2">
                        <Users className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <p className="whitespace-pre-line"><strong>Participantes:</strong> {appointment.participants}</p>
                      </div>
                    )}
                  {appointment.notes && (
                     <div className="text-xs text-muted-foreground mt-2 pt-2 border-t flex items-start gap-2">
                        <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                        <p className="whitespace-pre-line"><strong>Obs:</strong> {appointment.notes}</p>
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

