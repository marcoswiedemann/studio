
"use client";

import { useAppointments } from "@/contexts/appointment-context";
import { useAuth } from "@/contexts/auth-context"; 
import { useSettings } from "@/contexts/settings-context"; 
import { Appointment, UserRole as AppUserRole } from "@/types"; // Renamed UserRole to avoid conflict
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, MapPin, User as UserIcon, Phone, Users as UsersIcon, Info, CheckCircle2, XCircle, UserCircle as CreatedUserIcon, Edit2 as UpdatedUserIcon } from "lucide-react";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { USER_ROLES } from "@/lib/constants"; // Ensure USER_ROLES is imported for comparison

function PublicAppointmentItem({ appointment, getUserName }: { appointment: Appointment; getUserName: (userId: string | undefined) => string }) {
  return (
    <div className={cn("p-4 border rounded-lg bg-card shadow-sm hover:shadow-md transition-all duration-150", appointment.isCompleted && "opacity-75")}> {/* Added shadow-sm hover:shadow-md */}
      <div className="flex justify-between items-start mb-2">
        <h3 className={cn(
            "font-semibold text-lg text-primary pr-2 flex-1 break-words",
            appointment.isCompleted && "line-through text-muted-foreground"
          )}
        >
          {appointment.title}
        </h3>
        <div className="flex-shrink-0 ml-2 flex flex-col items-end gap-1">
          <Badge variant="outline">
            {format(parseISO(appointment.date), "dd/MM/yy", { locale: ptBR })}
          </Badge>
          {appointment.isCompleted ? (
            <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Realizado
            </Badge>
          ) : (
            <Badge variant="secondary">
              <XCircle className="h-3 w-3 mr-1" /> Pendente
            </Badge>
          )}
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
      <div className="text-xs text-muted-foreground/80 mt-3 pt-2 border-t border-dashed space-y-1">
        <div className="flex items-center gap-1.5">
            <CreatedUserIcon className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Criado por: {getUserName(appointment.createdBy)} em {format(parseISO(appointment.createdAt), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}</span>
        </div>
        {appointment.updatedBy && appointment.updatedAt && (
            <div className="flex items-center gap-1.5">
            <UpdatedUserIcon className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Última atualização: {getUserName(appointment.updatedBy)} em {format(parseISO(appointment.updatedAt), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}</span>
            </div>
        )}
      </div>
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

  const getUserName = (userId: string | undefined) => {
    if (!userId) return 'Sistema';
    const user = allUsers.find(u => u.id === userId);
    return user ? user.name : 'Não disponível';
  };

  const sortedAppointments = [...appointments]
    .filter(appt => appt.isShared) 
    .sort((a, b) => {
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

  const publicAppointmentsToDisplay = sortedAppointments.filter(appt => {
    const assignedUser = allUsers.find(u => u.id === appt.assignedTo);
    // Display if assigned to Mayor or Vice-Mayor AND isShared is true
    return (assignedUser?.role === USER_ROLES.MAYOR || assignedUser?.role === USER_ROLES.VICE_MAYOR) && appt.isShared;
  });


  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-6 bg-card border-b border-border">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center gap-4">
          {themeSettings.logoLightModeUrl && (
            <Image
              src={themeSettings.logoLightModeUrl}
              alt="Logo (Tema Claro)"
              width={150} 
              height={75}
              style={{ objectFit: 'contain' }} 
              priority
              data-ai-hint="logo light"
              className="block dark:hidden"
            />
          )}
          {themeSettings.logoDarkModeUrl && (
             <Image
              src={themeSettings.logoDarkModeUrl}
              alt="Logo (Tema Escuro)"
              width={150} 
              height={75}
              style={{ objectFit: 'contain' }} 
              priority
              data-ai-hint="logo dark"
              className="hidden dark:block"
            />
          )}
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-primary">Agenda Pública da {themeSettings.appName}</h1>
            <p className="text-muted-foreground">Compromissos oficiais abertos ao público.</p>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Próximos Compromissos</CardTitle>
            <CardDescription>
              Confira os compromissos agendados. Esta agenda é atualizada periodicamente. Somente compromissos marcados como "compartilhados" pelo Prefeito ou Vice-Prefeito são exibidos aqui.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {publicAppointmentsToDisplay.length === 0 ? (
              <p className="text-muted-foreground text-center py-10">
                Nenhum compromisso público agendado no momento.
              </p>
            ) : (
              <ScrollArea className="h-[calc(100vh-320px)] pr-3"> 
                <div className="space-y-4">
                  {publicAppointmentsToDisplay.map((appointment) => (
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
        <p>&copy; {new Date().getFullYear()} {themeSettings.appName}. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
