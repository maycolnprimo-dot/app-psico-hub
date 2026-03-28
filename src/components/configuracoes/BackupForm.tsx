import { useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/useAppStore'
import { Download, Save, Upload, Loader2, FileUp, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function BackupForm() {
  const store = useAppStore()
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)

  const [isRestoring, setIsRestoring] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingData, setPendingData] = useState<any>(null)

  const handleExport = () => {
    try {
      const backupData = {
        settings: store.settings,
        patients: store.patients,
        sessions: store.sessions,
        finances: store.finances,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      }

      const dataStr = JSON.stringify(backupData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `psico-gestao-backup-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: 'Backup Concluído',
        description: 'Seu arquivo de backup foi baixado com sucesso.',
      })
    } catch (e) {
      toast({
        title: 'Erro no Backup',
        description: 'Ocorreu um erro ao gerar o arquivo de segurança.',
        variant: 'destructive',
      })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string)
        if (
          parsed &&
          typeof parsed === 'object' &&
          parsed.settings &&
          Array.isArray(parsed.patients)
        ) {
          const safeData = {
            settings: parsed.settings,
            patients: parsed.patients,
            sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
            finances: Array.isArray(parsed.finances) ? parsed.finances : [],
          }

          setPendingData(safeData)
          setShowConfirm(true)
        } else {
          throw new Error('Formato inválido do arquivo JSON.')
        }
      } catch (error) {
        toast({
          title: 'Erro de Leitura',
          description: 'Arquivo de backup inválido ou corrompido.',
          variant: 'destructive',
        })
      }
      if (fileRef.current) fileRef.current.value = ''
    }

    reader.onerror = () => {
      toast({
        title: 'Erro de Leitura',
        description: 'Falha ao ler o arquivo selecionado.',
        variant: 'destructive',
      })
      if (fileRef.current) fileRef.current.value = ''
    }

    reader.readAsText(file)
  }

  const executeRestore = () => {
    if (!pendingData) return

    setIsRestoring(true)

    // Using a slight timeout to render the loading state smoothly before heavy compute
    setTimeout(() => {
      store.restoreBackup(pendingData)
      setShowConfirm(false)
      setIsRestoring(false)
      setPendingData(null)

      toast({
        title: 'Backup Restaurado',
        description: 'Seus dados e personalizações foram aplicados com sucesso.',
      })
    }, 600)
  }

  return (
    <>
      <Card className="max-w-2xl animate-fade-in-up mt-6 border-t-4 border-t-slate-600/80 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/20 pb-4 border-b">
          <CardTitle className="text-lg">Backup Local & Segurança</CardTitle>
          <CardDescription>
            Exporte ou restaure todo o seu histórico clínico e financeiro.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="p-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full shrink-0 hidden sm:block">
              <Save className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-2">
              <h4 className="font-semibold text-foreground">Gerenciar cópias de segurança</h4>
              <p className="text-sm text-muted-foreground">
                Os arquivos são salvos no formato estruturado (JSON), garantindo a migração e
                arquivamento seguro dos seus dados criptografados.
              </p>
            </div>
          </div>

          <div className="flex gap-3 w-full flex-col sm:flex-row flex-wrap mt-4">
            <Button
              onClick={handleExport}
              disabled={isRestoring}
              className="gap-2 shadow-sm flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-white"
            >
              <Download className="w-4 h-4" /> Baixar Dados
            </Button>
            <Button
              variant="secondary"
              onClick={() => fileRef.current?.click()}
              disabled={isRestoring}
              className="gap-2 shadow-sm flex-1 sm:flex-none"
            >
              <FileUp className="w-4 h-4" /> Recuperar Backup
            </Button>
            <Button
              variant="destructive"
              onClick={() => fileRef.current?.click()}
              disabled={isRestoring}
              className="gap-2 shadow-sm flex-1 sm:flex-none"
            >
              <Upload className="w-4 h-4" /> Restaurar
            </Button>

            <input
              type="file"
              accept=".json"
              className="hidden"
              ref={fileRef}
              onChange={handleFileSelect}
            />
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Atenção: Sobrescrita de Dados
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              Você está prestes a restaurar um arquivo de backup local. Esta ação irá{' '}
              <strong className="text-foreground">substituir permanentemente</strong> todos os seus
              dados atuais (pacientes, sessões e histórico financeiro) pelos dados contidos no
              arquivo.
              <br />
              <br />
              Tem certeza que deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={isRestoring}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                executeRestore()
              }}
              disabled={isRestoring}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-2"
            >
              {isRestoring ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Confirmar Restauração
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
