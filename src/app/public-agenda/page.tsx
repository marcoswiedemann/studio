
"use client";

import { useAppointments } from "@/contexts/appointment-context";
import { useAuth } from "@/contexts/auth-context"; 
import { useSettings } from "@/contexts/settings-context"; 
import { Appointment } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, MapPin, User as UserIcon, Phone, Users as UsersIcon, Info } from "lucide-react";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

function PublicAppointmentItem({ appointment, getUserName }: { appointment: Appointment; getUserName: (userId: string) => string }) {
  return (
    <div className="p-4 border rounded-lg bg-card shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg text-primary pr-2 flex-1 break-words">{appointment.title}</h3>
        <div className="flex-shrink-0 ml-2">
          <Badge variant="outline">
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
          <span>Responsável: {getUserName(appointment.assignedTo)}</span>
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
    </div>
  );
}

export default function PublicAgendaPage() {
  const { appointments } = useAppointments();
  const { allUsers, loading: authLoading } = useAuth();
  const { themeSettings } = useSettings(); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      setIsLoading(false);
    }
  }, [authLoading]);

  const getUserName = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    return user ? user.name : 'Não disponível';
  };

  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = parseISO(a.date).getTime();
    const dateB = parseISO(b.date).getTime();
    if (dateA !== dateB) {
      return dateA - dateB;
    }
    return a.time.localeCompare(b.time);
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Carregando agenda pública...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-6 bg-card border-b border-border">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center gap-4">
          {themeSettings.logoLightModeUrl && (
            <Image
              src={themeSettings.logoLightModeUrl}
              alt="Logo Prefeitura (Tema Claro)"
              width={150} 
              height={75}
              style={{ objectFit: 'contain' }} 
              priority
              data-ai-hint="logo prefeitura light"
              className="block dark:hidden"
            />
          )}
          {themeSettings.logoDarkModeUrl && (
             <Image
              src={themeSettings.logoDarkModeUrl}
              alt="Logo Prefeitura (Tema Escuro)"
              width={150} 
              height={75}
              style={{ objectFit: 'contain' }} 
              priority
              data-ai-hint="logo prefeitura dark"
              className="hidden dark:block"
            />
          )}
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-primary">Agenda Pública da Prefeitura</h1>
            <p className="text-muted-foreground">Compromissos oficiais abertos ao público.</p>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Próximos Compromissos</CardTitle>
            <CardDescription>
              Confira os compromissos agendados. Esta agenda é atualizada periodicamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sortedAppointments.length === 0 ? (
              <p className="text-muted-foreground text-center py-10">
                Nenhum compromisso público agendado no momento.
              </p>
            ) : (
              <ScrollArea className="h-[calc(100vh-320px)] pr-3"> 
                <div className="space-y-4">
                  {sortedAppointments.map((appointment) => (
                    <PublicAppointmentItem
                      key={appointment.id}
                      appointment={appointment}
                      getUserName={getUserName}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </main>
      <footer className="py-6 text-center text-muted-foreground border-t border-border mt-8">
        <p>&copy; {new Date().getFullYear()} Prefeitura Municipal. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
