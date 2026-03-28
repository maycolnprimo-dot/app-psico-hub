import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/useAppStore'
import { useToast } from '@/hooks/use-toast'
import { Key, Lock, Unlock, ShieldAlert, Eye, EyeOff, Save } from 'lucide-react'

export function ApiCredentials() {
  const { settings, updateSettings } = useAppStore()
  const { toast } = useToast()

  const [isUnlocked, setIsUnlocked] = useState(false)
  const [password, setPassword] = useState('')

  const [form, setForm] = useState({
    googleApiKey: settings.googleApiKey || '',
    googleClientSecret: settings.googleClientSecret || '',
    whatsappApiToken: settings.whatsappApiToken || '',
  })

  useEffect(() => {
    setForm({
      googleApiKey: settings.googleApiKey || '',
      googleClientSecret: settings.googleClientSecret || '',
      whatsappApiToken: settings.whatsappApiToken || '',
    })
  }, [settings.googleApiKey, settings.googleClientSecret, settings.whatsappApiToken])

  const [showKey, setShowKey] = useState({
    googleKey: false,
    googleSecret: false,
    whatsappToken: false,
  })

  const handleUnlock = () => {
    if (password.length >= 4) {
      setIsUnlocked(true)
      toast({ title: 'Acesso Liberado', description: 'Credenciais disponíveis para edição.' })
      setPassword('')
    } else {
      toast({
        title: 'Senha Inválida',
        description: 'Digite uma senha válida (min. 4 caracteres).',
        variant: 'destructive',
      })
    }
  }

  const handleSave = () => {
    updateSettings(form)
    toast({
      title: 'Integrações Salvas',
      description: 'Suas credenciais de API foram atualizadas com sucesso.',
    })
    setIsUnlocked(false)
  }

  return (
    <Card className="shadow-sm border-t-4 border-t-red-500 animate-fade-in-up">
      <CardHeader className="bg-red-50/30 border-b flex flex-row items-center justify-between py-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-red-700 text-lg">
            <Key className="w-5 h-5" /> Configurações de Integração (API)
          </CardTitle>
          <CardDescription className="mt-1">
            Gerencie suas chaves e tokens do Google Calendar & Meet e WhatsApp Cloud API.
          </CardDescription>
        </div>
        {isUnlocked && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsUnlocked(false)}
            className="gap-2"
          >
            <Lock className="w-4 h-4" /> Bloquear
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        {!isUnlocked ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-500">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-semibold text-foreground text-lg">Camada de Proteção de Dados</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Esta área contém dados sensíveis. Confirme sua senha de segurança para acessar e
                editar as chaves.
              </p>
            </div>
            <div className="flex w-full max-w-sm items-center space-x-2 pt-4">
              <Input
                type="password"
                placeholder="Sua senha..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              />
              <Button onClick={handleUnlock} className="gap-2 shrink-0 bg-red-600 hover:bg-red-700">
                <Unlock className="w-4 h-4" /> Desbloquear
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="border-b pb-2 space-y-1">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Google Calendar &
                    Meet
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Estas credenciais habilitam a integração com o Google Calendar e Google Meet em
                    sua conta.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Client ID (API Key)</Label>
                  <div className="relative">
                    <Input
                      type={showKey.googleKey ? 'text' : 'password'}
                      value={form.googleApiKey}
                      onChange={(e) => setForm({ ...form, googleApiKey: e.target.value })}
                      placeholder="AIzaSyB..."
                      className="pr-10 font-mono text-sm bg-muted/30"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full w-10 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowKey({ ...showKey, googleKey: !showKey.googleKey })}
                    >
                      {showKey.googleKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Client Secret</Label>
                  <div className="relative">
                    <Input
                      type={showKey.googleSecret ? 'text' : 'password'}
                      value={form.googleClientSecret}
                      onChange={(e) => setForm({ ...form, googleClientSecret: e.target.value })}
                      placeholder="GOCSPX-..."
                      className="pr-10 font-mono text-sm bg-muted/30"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full w-10 text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        setShowKey({ ...showKey, googleSecret: !showKey.googleSecret })
                      }
                    >
                      {showKey.googleSecret ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2 border-b pb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> WhatsApp Cloud API
                </h4>
                <div className="space-y-2">
                  <Label>Access Token (Bearer)</Label>
                  <div className="relative">
                    <Input
                      type={showKey.whatsappToken ? 'text' : 'password'}
                      value={form.whatsappApiToken}
                      onChange={(e) => setForm({ ...form, whatsappApiToken: e.target.value })}
                      placeholder="EAAGm0..."
                      className="pr-10 font-mono text-sm bg-muted/30"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full w-10 text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        setShowKey({ ...showKey, whatsappToken: !showKey.whatsappToken })
                      }
                    >
                      {showKey.whatsappToken ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Utilizado para automatizar os disparos de mensagens e lembretes aos pacientes.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={handleSave} className="gap-2 px-8 h-11 font-medium shadow-elevation">
                <Save className="w-4 h-4" /> Salvar Credenciais Seguras
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
