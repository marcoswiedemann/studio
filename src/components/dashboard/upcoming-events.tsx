
"use client";

import type { Appointment } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/auth-context";

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
                <div key={appointment.id} className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg text-primary">{appointment.title}</h3>
                    <Badge variant="outline">{format(parseISO(appointment.date), "dd/MM/yy", { locale: ptBR })}</Badge>
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
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-check"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
                      <span>Para: {getUserName(appointment.assignedTo)}</span>
                    </div>
                  </div>
                  {appointment.notes && (
                    <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                      <strong>Obs:</strong> {appointment.notes}
                    </p>
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
