import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/stores/useAppStore'
import { Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { compressImage } from '@/lib/image-utils'

const colorPresets = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#0EA5E9']

export function BrandingForm() {
  const { settings, updateSettings } = useAppStore()
  const { toast } = useToast()

  const [localColor, setLocalColor] = useState(settings.primaryColor || '#4F46E5')
  const [localLogo, setLocalLogo] = useState(settings.logoUrl || '')
  const [localName, setLocalName] = useState(settings.clinicName || '')

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLocalColor(settings.primaryColor || '#4F46E5')
    setLocalLogo(settings.logoUrl || '')
    setLocalName(settings.clinicName || '')
  }, [settings.primaryColor, settings.logoUrl, settings.clinicName])

  const handleSave = () => {
    updateSettings({
      primaryColor: localColor,
      logoUrl: localLogo,
      clinicName: localName,
    })
    toast({
      title: 'Configurações Salvas',
      description: 'A identidade visual foi atualizada com sucesso.',
    })
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const compressed = await compressImage(file, 500, 0.9)
        setLocalLogo(compressed)
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível processar a logo.',
          variant: 'destructive',
        })
      }
    }
  }

  return (
    <Card className="max-w-2xl animate-fade-in-up">
      <CardHeader>
        <CardTitle>White Label & Identidade Visual</CardTitle>
        <CardDescription>Personalize a plataforma com a cara do seu consultório.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="clinicName">Nome do Consultório / Profissional</Label>
          <Input id="clinicName" value={localName} onChange={(e) => setLocalName(e.target.value)} />
        </div>

        <div className="space-y-3">
          <Label>Logomarca</Label>
          <Tabs
            defaultValue={localLogo.startsWith('data:image') ? 'upload' : 'url'}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-2">
              <TabsTrigger value="url">Carregar da Web (URL)</TabsTrigger>
              <TabsTrigger value="upload">Arquivo Local / Drive</TabsTrigger>
            </TabsList>
            <TabsContent value="url" className="pt-2">
              <Input
                placeholder="https://..."
                value={localLogo.startsWith('data:image') ? '' : localLogo}
                onChange={(e) => setLocalLogo(e.target.value)}
              />
            </TabsContent>
            <TabsContent value="upload" className="pt-2">
              <div className="flex gap-4 items-center border p-3 rounded-lg bg-muted/20">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  className="shrink-0"
                >
                  Selecionar Imagem
                </Button>
                <span className="text-xs text-muted-foreground truncate">
                  {localLogo.startsWith('data:image')
                    ? 'Imagem local carregada'
                    : 'Nenhuma imagem local'}
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="p-3 border rounded-xl bg-muted/10 inline-block mt-2 shadow-sm">
            <img
              src={localLogo || 'https://img.usecurling.com/i?q=image'}
              alt="Preview"
              className="h-12 w-auto object-contain"
            />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Label>Cor Principal (Marca)</Label>
          <div className="flex items-center gap-4">
            <Input
              type="color"
              value={localColor}
              onChange={(e) => setLocalColor(e.target.value)}
              className="w-16 h-12 p-1 cursor-pointer"
            />
            <Input
              value={localColor}
              onChange={(e) => setLocalColor(e.target.value)}
              className="w-32 font-mono uppercase"
            />
          </div>
          <div className="flex gap-2 pt-2">
            {colorPresets.map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${localColor === color ? 'border-foreground shadow-md' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
                onClick={() => setLocalColor(color)}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Insira qualquer código Hex customizado. Esta cor será aplicada a botões, destaques e
            gráficos.
          </p>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <Button onClick={handleSave} className="gap-2 px-8 shadow-elevation font-medium">
            <Save className="h-4 w-4" /> Salvar Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
