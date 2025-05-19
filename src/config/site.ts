
import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, CalendarDays, UserCircle, Users, Settings } from "lucide-react";
// Importar USER_ROLES para os valores do enum
import { USER_ROLES } from "@/lib/constants";
// Importar o tipo UserRole de types/index.ts
import type { UserRole } from "@/types";


export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles?: UserRole[]; // Usando o tipo UserRole importado
};

export const navItems: NavItem[] = [
  {
    title: "Painel",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: [USER_ROLES.Admin, USER_ROLES.Prefeito, USER_ROLES.Vice_prefeito, USER_ROLES.Visualizador],
  },
  {
    title: "Agenda",
    href: "/calendar",
    icon: CalendarDays,
    roles: [USER_ROLES.Admin, USER_ROLES.Prefeito, USER_ROLES.Vice_prefeito, USER_ROLES.Visualizador],
  },
  {
    title: "Perfil",
    href: "/profile",
    icon: UserCircle,
    roles: [USER_ROLES.Admin, USER_ROLES.Prefeito, USER_ROLES.Vice_prefeito, USER_ROLES.Visualizador],
  },
  {
    title: "Usuários",
    href: "/users",
    icon: Users,
    roles: [USER_ROLES.Admin],
  },
  {
    title: "Configurações",
    href: "/settings",
    icon: Settings,
    roles: [USER_ROLES.Admin],
  },
];
