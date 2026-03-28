import { Bell, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useAppStore } from '@/stores/useAppStore'
import { useNavigate } from 'react-router-dom'

export function AppHeader() {
  const { settings } = useAppStore()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/80 backdrop-blur-md px-4 shadow-sm md:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <div
          className="hidden items-center gap-2 md:flex cursor-pointer"
          onClick={() => navigate('/')}
        >
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="h-8 w-8 object-contain" />
          ) : (
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              {settings.clinicName.substring(0, 1)}
            </div>
          )}
          <span className="text-lg font-semibold tracking-tight">{settings.clinicName}</span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-4 md:gap-6">
        <div className="relative hidden max-w-md flex-1 md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar pacientes..."
            className="w-full bg-muted/50 pl-9 shadow-none rounded-full"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-primary ring-2 ring-background"></span>
        </Button>

        <Avatar
          className="h-9 w-9 cursor-pointer border-2 border-transparent hover:border-primary transition-colors"
          onClick={() => navigate('/perfil')}
        >
          <AvatarImage
            src={
              settings.professionalAvatar ||
              'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=10'
            }
            alt="Avatar"
          />
          <AvatarFallback>
            {settings.professionalName?.substring(0, 2).toUpperCase() || 'DR'}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
