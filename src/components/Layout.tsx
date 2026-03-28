import { Outlet } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { AppHeader } from './AppHeader'
import { SidebarProvider } from '@/components/ui/sidebar'
import { useAppStore } from '@/stores/useAppStore'
import { hexToHSL } from '@/lib/color-utils'
import { ErrorBoundary } from './ErrorBoundary'

export default function Layout() {
  const { settings } = useAppStore()
  const primaryHsl = hexToHSL(settings?.primaryColor || '#4F46E5')

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --primary: ${primaryHsl};
          --ring: ${primaryHsl};
        }
      `}</style>
      <div className="flex min-h-screen w-full flex-col bg-slate-50 md:flex-row">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 animate-fade-in relative">
            <div className="mx-auto max-w-7xl h-full">
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
