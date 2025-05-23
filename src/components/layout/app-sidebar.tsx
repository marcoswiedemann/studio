
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { navItems, NavItem } from "@/config/site";
import { useAuth } from "@/contexts/auth-context";
import { useSettings } from "@/contexts/settings-context"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DEFAULT_LOGO_URL } from "@/lib/constants"; // Importar DEFAULT_LOGO_URL para a lógica de fallback

function getInitials(name: string) {
  const names = name.split(' ');
  let initials = names[0].substring(0, 1).toUpperCase();
  if (names.length > 1) {
    initials += names[names.length - 1].substring(0, 1).toUpperCase();
  }
  return initials;
}

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { themeSettings } = useSettings(); 
  const pathname = usePathname();

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true; 
    return user && item.roles.includes(user.role);
  });

  // A sidebar é escura, então deve priorizar o logo para tema escuro.
  // Se o logo para tema escuro não foi customizado (ou seja, ainda é o mesmo que o light, ou o default escuro),
  // e o logo para tema claro for diferente e mais apropriado (improvável neste cenário de sidebar escura),
  // ou como último recurso, o logo padrão.
  // A intenção principal é: usar o logo que o admin definiu para fundos escuros.
  const logoToDisplay = themeSettings.logoDarkModeUrl || themeSettings.logoLightModeUrl || DEFAULT_LOGO_URL;
  const logoHint = (themeSettings.logoDarkModeUrl && themeSettings.logoDarkModeUrl !== DEFAULT_LOGO_URL) ? "logo dark" : "logo light";


  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex flex-col items-center text-center gap-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
          <div className="group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 w-[100px] h-[40px] relative mb-1">
            {logoToDisplay && (
              <Image
                src={logoToDisplay} 
                alt={`Logo ${themeSettings.appName}`}
                fill
                sizes="(max-width: 768px) 32px, 100px" 
                style={{ objectFit: 'contain' }}
                priority
                data-ai-hint={logoHint}
              />
            )}
          </div>
          <span className="font-semibold text-sm text-primary group-data-[collapsible=icon]:hidden">{themeSettings.appName}</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {filteredNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                  tooltip={{children: item.title, className: "bg-popover text-popover-foreground"}}
                  asChild
                >
                  <a>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 mt-auto">
         {user && (
           <div className="flex items-center gap-2 p-2 rounded-md hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://placehold.co/40x40.png?text=${getInitials(user.name)}`} alt={user.name} data-ai-hint="user avatar" />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium text-sidebar-foreground">{user.name}</span>
                <span className="text-xs text-sidebar-foreground/70">{user.role}</span>
              </div>
           </div>
         )}
        <Button variant="ghost" onClick={logout} className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          <span className="group-data-[collapsible=icon]:hidden ml-2">Sair</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
