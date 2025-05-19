
"use client";

import { StatsCard } from "@/components/dashboard/stats-card";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";
import { useAuth } from "@/contexts/auth-context";
import { useAppointments } from "@/contexts/appointment-context";
import { BarChart, ListChecks, Users } from "lucide-react";
import { useEffect, useState } from "react";
import type { Appointment, User } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const { getWeeklyAppointmentCount, getUpcomingAppointments } = useAppointments();
  
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);

  useEffect(() => {
    if (user) {
      setWeeklyCount(getWeeklyAppointmentCount(user.id, user.role));
      setUpcoming(getUpcomingAppointments(user.id, user.role, 5));
    }
  }, [user, getWeeklyAppointmentCount, getUpcomingAppointments]);

  if (!user) {
    return null; // Or a loading state, though layout should handle this
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Compromissos Semanais"
          value={weeklyCount}
          icon={BarChart}
          description="Total de compromissos para esta semana."
        />
        <StatsCard
          title="Próximos Eventos"
          value={upcoming.length}
          icon={ListChecks}
          description="Eventos agendados nos próximos dias."
        />
        <StatsCard
          title="Função Atual"
          value={user.role}
          icon={Users}
          description={`Bem-vindo, ${user.name}!`}
        />
      </div>
      <UpcomingEvents appointments={upcoming} />
    </div>
  );
}
