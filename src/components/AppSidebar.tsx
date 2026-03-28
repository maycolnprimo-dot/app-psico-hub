import { Home, Users, Calendar, DollarSign, Settings, UserCircle, LifeBuoy } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

const menuItems = [
  {
    title: 'Meu Consultório',
    url: '/',
    icon: Home,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    title: 'Agenda',
    url: '/agenda',
    icon: Calendar,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    title: 'Pacientes',
    url: '/pacientes',
    icon: Users,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    title: 'Financeiro',
    url: '/financeiro',
    icon: DollarSign,
    color: 'text-emerald-600',
    bg: 'bg-emerald-600/10',
  },
  {
    title: 'Meu Perfil',
    url: '/perfil',
    icon: UserCircle,
    color: 'text-slate-500',
    bg: 'bg-slate-500/10',
  },
  {
    title: 'Configurações',
    url: '/configuracoes',
    icon: Settings,
    color: 'text-slate-500',
    bg: 'bg-slate-500/10',
  },
  {
    title: 'Ajuda',
    url: '/ajuda',
    icon: LifeBuoy,
    color: 'text-sky-500',
    bg: 'bg-sky-500/10',
  },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="border-r border-border/50 bg-white/50 backdrop-blur-xl"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="pt-6 px-3">
            <SidebarMenu className="gap-3">
              {menuItems.map((item) => {
                const isActive =
                  location.pathname === item.url ||
                  (item.url !== '/' && location.pathname.startsWith(item.url))
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        'h-12 text-base font-medium rounded-xl transition-all duration-200',
                        isActive ? 'bg-primary/10 shadow-sm' : 'hover:bg-sidebar-accent/50',
                      )}
                    >
                      <Link to={item.url} className="flex items-center gap-3 w-full">
                        <div
                          className={cn(
                            'p-1.5 rounded-lg flex items-center justify-center transition-colors',
                            isActive ? 'bg-primary/20 text-primary' : item.bg,
                          )}
                        >
                          <item.icon
                            className={cn('size-5', isActive ? 'text-primary' : item.color)}
                          />
                        </div>
                        <span
                          className={cn(
                            'tracking-tight',
                            isActive ? 'text-primary font-bold' : 'text-muted-foreground',
                          )}
                        >
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
