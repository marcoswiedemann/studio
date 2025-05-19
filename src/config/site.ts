
import type { UserRole } from "@/types";
import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, CalendarDays, UserCircle, Users, Lightbulb, Settings } from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles?: UserRole[]; // Roles that can see this item
};

export const navItems: NavItem[] = [
  {
    title: "Painel",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Agenda",
    href: "/calendar",
    icon: CalendarDays,
  },
  {
    title: "Sugestões IA",
    href: "/suggestions",
    icon: Lightbulb,
  },
  {
    title: "Perfil",
    href: "/profile",
    icon: UserCircle,
  },
  {
    title: "Usuários",
    href: "/users",
    icon: Users,
    roles: ["Admin"],
  },
  // {
  //   title: "Configurações",
  //   href: "/settings",
  //   icon: Settings,
  //   roles: ["Admin"],
  // },
];
