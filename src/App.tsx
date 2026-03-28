import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import Index from './pages/Index'
import Pacientes from './pages/Pacientes'
import PacienteDetails from './pages/PacienteDetails'
import Agenda from './pages/Agenda'
import Financeiro from './pages/Financeiro'
import Configuracoes from './pages/Configuracoes'
import PerfilProfissional from './pages/PerfilProfissional'
import Ajuda from './pages/Ajuda'
import NotFound from './pages/NotFound'
import { AppProvider } from './stores/AppProvider'
import { ErrorBoundary } from './components/ErrorBoundary'

const App = () => (
  <ErrorBoundary>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/pacientes" element={<Pacientes />} />
              <Route path="/pacientes/:id" element={<PacienteDetails />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/financeiro" element={<Financeiro />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="/perfil" element={<PerfilProfissional />} />
              <Route path="/ajuda" element={<Ajuda />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AppProvider>
    </BrowserRouter>
  </ErrorBoundary>
)

export default App
