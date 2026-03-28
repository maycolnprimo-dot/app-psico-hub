import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useAppStore } from '@/stores/useAppStore'
import { Plus, Trash2 } from 'lucide-react'
import { generateId } from '@/lib/utils'

export function LocationsSetup() {
  const { settings, updateSettings } = useAppStore()
  const locations = settings.locations || []
  const categories = settings.serviceCategories || []

  const addLocation = () => {
    updateSettings({
      locations: [
        ...locations,
        { id: generateId(), name: 'Novo Local', address: '', isOnline: false, color: '#4F46E5' },
      ],
    })
  }

  const updateLocation = (id: string, data: any) => {
    updateSettings({
      locations: locations.map((l) => (l.id === id ? { ...l, ...data } : l)),
    })
  }

  const removeLocation = (id: string) => {
    updateSettings({
      locations: locations.filter((l) => l.id !== id),
    })
  }

  const addCategory = () => {
    updateSettings({
      serviceCategories: [
        ...categories,
        { id: generateId(), name: 'Nova Categoria', color: '#10B981' },
      ],
    })
  }

  const updateCategory = (id: string, data: any) => {
    updateSettings({
      serviceCategories: categories.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })
  }

  const removeCategory = (id: string) => {
    updateSettings({
      serviceCategories: categories.filter((c) => c.id !== id),
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-t-4 border-t-primary shadow-sm">
        <CardHeader className="bg-muted/20 border-b">
          <CardTitle>Locais de Atendimento</CardTitle>
          <CardDescription>
            Cadastre seus consultórios físicos ou remotos e atribua cores para a agenda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="flex flex-col md:flex-row gap-4 items-end md:items-center p-4 border rounded-xl bg-card hover:bg-muted/10 transition-colors"
            >
              <div className="flex-1 space-y-1.5 w-full">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Nome do Local
                </Label>
                <Input
                  value={loc.name}
                  onChange={(e) => updateLocation(loc.id, { name: e.target.value })}
                />
              </div>
              {!loc.isOnline && (
                <div className="flex-1 space-y-1.5 w-full">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Endereço
                  </Label>
                  <Input
                    value={loc.address}
                    onChange={(e) => updateLocation(loc.id, { address: e.target.value })}
                  />
                </div>
              )}
              <div className="flex items-center gap-3 w-full md:w-auto h-10 px-2">
                <Switch
                  checked={loc.isOnline}
                  onCheckedChange={(c) => updateLocation(loc.id, { isOnline: c })}
                />
                <Label className="cursor-pointer">Online</Label>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Cor
                </Label>
                <Input
                  type="color"
                  value={loc.color}
                  onChange={(e) => updateLocation(loc.id, { color: e.target.value })}
                  className="w-14 h-10 p-1 cursor-pointer"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeLocation(loc.id)}
                className="text-destructive hover:bg-destructive/10 w-10 h-10 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={addLocation}
            className="gap-2 w-full md:w-auto mt-2 border-dashed border-2"
          >
            <Plus className="w-4 h-4" /> Adicionar Local
          </Button>
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-emerald-500 shadow-sm">
        <CardHeader className="bg-emerald-50/30 border-b">
          <CardTitle>Categorias de Serviço</CardTitle>
          <CardDescription>
            Defina os tipos de atendimento (Sessão Individual, Terapia de Casal, etc).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex gap-4 items-end p-4 border rounded-xl bg-card hover:bg-muted/10 transition-colors"
            >
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Nome da Categoria
                </Label>
                <Input
                  value={cat.name}
                  onChange={(e) => updateCategory(cat.id, { name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Cor
                </Label>
                <Input
                  type="color"
                  value={cat.color}
                  onChange={(e) => updateCategory(cat.id, { color: e.target.value })}
                  className="w-14 h-10 p-1 cursor-pointer"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCategory(cat.id)}
                className="text-destructive hover:bg-destructive/10 w-10 h-10 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={addCategory}
            className="gap-2 w-full md:w-auto mt-2 border-dashed border-2"
          >
            <Plus className="w-4 h-4" /> Adicionar Categoria
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
