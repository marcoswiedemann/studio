
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function getInitials(name: string) {
  const names = name.split(' ');
  let initials = names[0].substring(0, 1).toUpperCase();
  if (names.length > 1) {
    initials += names[names.length - 1].substring(0, 1).toUpperCase();
  }
  return initials;
}

const logoUrl = "https://pmsantoangelo.abase.com.br/site/Brasoes/120/cabecalho.png";


export function AppSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true; // No specific roles means visible to all
    return user && item.roles.includes(user.role);
  });

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <div className="group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 w-auto h-10 relative">
            <Image 
              src={logoUrl} 
              alt="Logo AgendaGov" 
              fill
              sizes="(max-width: 768px) 32px, 100px" // Adjust sizes as needed
              style={{ objectFit: 'contain' }}
              priority
              data-ai-hint="logo prefeitura"
            />
          </div>
          <span className="font-semibold text-lg text-primary group-data-[collapsible=icon]:hidden ml-2">AgendaGov</span>
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
