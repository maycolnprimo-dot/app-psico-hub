import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.reload()
  }

  private handleGoHome = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] h-full w-full p-8 text-center animate-fade-in bg-muted/20 rounded-2xl border border-dashed">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">
            Ops! Algo deu errado ao carregar esta seção.
          </h2>
          <p className="text-muted-foreground max-w-md mb-6">
            Identificamos uma inconsistência nos dados ou um erro inesperado que impediu a exibição
            deste conteúdo. O restante do sistema continua operando.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={this.handleGoHome} className="gap-2">
              <Home className="h-4 w-4" /> Início
            </Button>
            <Button onClick={this.handleReset} className="gap-2 shadow-md">
              <RefreshCw className="h-4 w-4" /> Tentar Novamente
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
