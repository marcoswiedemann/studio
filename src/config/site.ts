
import type { UserRole } from "@/types";
import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, CalendarDays, UserCircle, Users, Settings, Eye } from "lucide-react";
import { USER_ROLES } from "@/lib/constants";


export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles?: UserRole[]; // Roles that can see this item. If undefined, all roles see it.
};

export const navItems: NavItem[] = [
  {
    title: "Painel",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: [USER_ROLES.ADMIN, USER_ROLES.MAYOR, USER_ROLES.VICE_MAYOR, USER_ROLES.VIEWER],
  },
  {
    title: "Agenda",
    href: "/calendar",
    icon: CalendarDays,
    roles: [USER_ROLES.ADMIN, USER_ROLES.MAYOR, USER_ROLES.VICE_MAYOR, USER_ROLES.VIEWER],
  },
  {
    title: "Perfil",
    href: "/profile",
    icon: UserCircle,
    roles: [USER_ROLES.ADMIN, USER_ROLES.MAYOR, USER_ROLES.VICE_MAYOR, USER_ROLES.VIEWER],
  },
  {
    title: "Usuários",
    href: "/users",
    icon: Users,
    roles: [USER_ROLES.ADMIN],
  },
];

