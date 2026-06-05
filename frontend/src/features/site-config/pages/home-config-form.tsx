import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Save, 
  Image as ImageIcon, 
  Upload, 
  Globe, 
  Type, 
  Hash, 
  Calendar, 
  Facebook, 
  Instagram, 
  Youtube, 
  MousePointerClick,
  Loader2
} from 'lucide-react'
import { SiteConfigService, PublicSiteService } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useTheme } from '@/components/theme-provider'
import { Skeleton } from '@/components/ui/skeleton'

// ─── Constants ───────────────────────────────────────────────────────────────
const GOLD = '#C9A84C'
const NAVY = '#1B3A6B'

// ─── Schema ──────────────────────────────────────────────────────────────────
const homeSchema = z.object({
  heroTitle: z.string().min(1, 'Requerido'),
  heroSubtitle: z.string().min(1, 'Requerido'),
  verseText: z.string().min(1, 'Requerido'),
  verseReference: z.string().min(1, 'Requerido'),
  scheduleTitle: z.string().min(1, 'Requerido'),
  scheduleSubtitle: z.string().min(1, 'Requerido'),
  facebookUrl: z.string().url('URL inválida').or(z.literal('')),
  instagramUrl: z.string().url('URL inválida').or(z.literal('')),
  youtubeUrl: z.string().url('URL inválida').or(z.literal('')),
  footerCtaTitle: z.string().min(1, 'Requerido'),
  footerCtaSubtitle: z.string().min(1, 'Requerido'),
  footerCtaButtonText: z.string().min(1, 'Requerido'),
})

type HomeFormValues = z.infer<typeof homeSchema>

// ─── Components ──────────────────────────────────────────────────────────────

function SectionHeader({ title, icon: Icon }: { title: string; icon: any }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b border-border mb-4">
      <Icon className="h-4 w-4 text-primary" />
      <p className="text-sm font-bold text-foreground uppercase tracking-wider">{title}</p>
    </div>
  )
}

function ImageSlot({ 
  label, 
  slot, 
  currentUrl, 
  onUpload 
}: { 
  label: string; 
  slot: 'main' | 'small' | 'next-service'; 
  currentUrl: string | null;
  onUpload: (slot: 'main' | 'small' | 'next-service', file: File) => void;
}) {
  const [uploading, setUploading] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await onUpload(slot, file)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold text-muted-foreground uppercase">{label}</Label>
      <div className="relative aspect-video rounded-lg border-2 border-dashed border-border bg-muted/30 overflow-hidden group">
        {currentUrl ? (
          <img src={currentUrl} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="h-8 w-8 mb-1 opacity-20" />
            <span className="text-[10px]">SIN IMAGEN</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <label className="cursor-pointer">
            <div className="bg-white text-navy-900 px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2">
              {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
              {currentUrl ? 'CAMBIAR' : 'SUBIR'}
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleChange} disabled={uploading} />
          </label>
        </div>
      </div>
    </div>
  )
}

export function HomeConfigForm() {
  const queryClient = useQueryClient()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const { data: config, isLoading } = useQuery({
    queryKey: ['site-config', 'home'],
    queryFn: () => SiteConfigService.siteConfigControllerGetHomeConfig(),
  })

  const { data: publicHome } = useQuery({
    queryKey: ['public-home'],
    queryFn: () => PublicSiteService.publicSiteControllerGetHome(),
  })

  const form = useForm<HomeFormValues>({
    resolver: zodResolver(homeSchema),
    defaultValues: {
      heroTitle: '',
      heroSubtitle: '',
      verseText: '',
      verseReference: '',
      scheduleTitle: '',
      scheduleSubtitle: '',
      facebookUrl: '',
      instagramUrl: '',
      youtubeUrl: '',
      footerCtaTitle: '',
      footerCtaSubtitle: '',
      footerCtaButtonText: '',
    }
  })

  useEffect(() => {
    if (config) {
      form.reset({
        heroTitle: config.heroTitle,
        heroSubtitle: config.heroSubtitle,
        verseText: config.verseText,
        verseReference: config.verseReference,
        scheduleTitle: config.scheduleTitle,
        scheduleSubtitle: config.scheduleSubtitle,
        facebookUrl: config.facebookUrl,
        instagramUrl: config.instagramUrl,
        youtubeUrl: config.youtubeUrl,
        footerCtaTitle: config.footerCtaTitle,
        footerCtaSubtitle: config.footerCtaSubtitle,
        footerCtaButtonText: config.footerCtaButtonText,
      })
    }
  }, [config, form])

  const saveMutation = useMutation({
    mutationFn: (values: HomeFormValues) => SiteConfigService.siteConfigControllerSaveHomeConfig(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-config', 'home'] })
      queryClient.invalidateQueries({ queryKey: ['public-home'] })
      toast.success('Configuración guardada')
    },
    onError: () => toast.error('Error al guardar la configuración')
  })

  const uploadMutation = useMutation({
    mutationFn: ({ slot, file }: { slot: any; file: File }) => 
      SiteConfigService.siteConfigControllerSetHomeImage(slot, { file: file as any }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-config', 'home'] })
      queryClient.invalidateQueries({ queryKey: ['public-home'] })
      toast.success('Imagen actualizada')
    },
    onError: () => toast.error('Error al subir la imagen')
  })

  const onSubmit = (values: HomeFormValues) => saveMutation.mutate(values)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[400px] w-full rounded-xl" />
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-20">
      {/* ─── Hero Section ─── */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <SectionHeader title="Sección Hero (Principal)" icon={Globe} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="heroTitle">Título Principal</Label>
              <Input id="heroTitle" {...form.register('heroTitle')} placeholder="Ej: Iglesia Adventista del Séptimo Día" />
              {form.formState.errors.heroTitle && <p className="text-xs text-destructive">{form.formState.errors.heroTitle.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroSubtitle">Subtítulo / Eslogan</Label>
              <Textarea id="heroSubtitle" {...form.register('heroSubtitle')} placeholder="Ej: Osorno Central: Una casa de oración para todos los pueblos" rows={3} />
              {form.formState.errors.heroSubtitle && <p className="text-xs text-destructive">{form.formState.errors.heroSubtitle.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ImageSlot 
              label="Imagen Principal (Fondo)" 
              slot="main" 
              currentUrl={config?.heroMainImageUrl ?? null} 
              onUpload={(slot, file) => uploadMutation.mutate({ slot, file })}
            />
            <ImageSlot 
              label="Imagen Detalle (Pequeña)" 
              slot="small" 
              currentUrl={config?.heroSmallImageUrl ?? null} 
              onUpload={(slot, file) => uploadMutation.mutate({ slot, file })}
            />
          </div>
        </div>
      </div>

      {/* ─── Verse & Next Service ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <SectionHeader title="Versículo del Mes" icon={Type} />
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verseText">Texto Bíblico</Label>
              <Textarea id="verseText" {...form.register('verseText')} placeholder="Ej: Porque de tal manera amó Dios al mundo..." rows={4} />
              {form.formState.errors.verseText && <p className="text-xs text-destructive">{form.formState.errors.verseText.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="verseReference">Referencia</Label>
              <Input id="verseReference" {...form.register('verseReference')} placeholder="Ej: Juan 3:16" />
              {form.formState.errors.verseReference && <p className="text-xs text-destructive">{form.formState.errors.verseReference.message}</p>}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <SectionHeader title="Próximo Culto (Auto-detectado)" icon={Calendar} />
          <div className="space-y-4">
            {publicHome?.nextService ? (
              <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-primary uppercase tracking-tighter">Siguiente Actividad</p>
                    <p className="text-base font-bold text-foreground">{publicHome.nextService.title}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    EN VIVO PRONTO
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <p>📅 {new Date(publicHome.nextService.date!).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  <p>📍 {publicHome.nextService.location ?? 'Templo Central'}</p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-border rounded-lg">
                <p className="text-sm text-muted-foreground italic">No hay eventos próximos publicados en el calendario.</p>
              </div>
            )}
            <ImageSlot 
              label="Imagen para bloque Próximo Culto" 
              slot="next-service" 
              currentUrl={config?.nextServiceImageUrl ?? null} 
              onUpload={(slot, file) => uploadMutation.mutate({ slot, file })}
            />
          </div>
        </div>
      </div>

      {/* ─── Schedule & Social ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <SectionHeader title="Sección Horarios" icon={Hash} />
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scheduleTitle">Título de Sección</Label>
              <Input id="scheduleTitle" {...form.register('scheduleTitle')} placeholder="Ej: Nuestros Horarios" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduleSubtitle">Subtítulo</Label>
              <Input id="scheduleSubtitle" {...form.register('scheduleSubtitle')} placeholder="Ej: Te esperamos en cada una de nuestras actividades" />
            </div>
            <p className="text-[10px] text-muted-foreground italic bg-muted p-2 rounded border border-border">
              Nota: Los items individuales de horarios se gestionan en la pestaña "Horarios".
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <SectionHeader title="Redes Sociales" icon={Facebook} />
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Facebook className="h-4 w-4 text-[#1877F2]" />
                <Label htmlFor="facebookUrl">Facebook</Label>
              </div>
              <Input id="facebookUrl" {...form.register('facebookUrl')} placeholder="https://facebook.com/..." />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-[#E4405F]" />
                <Label htmlFor="instagramUrl">Instagram</Label>
              </div>
              <Input id="instagramUrl" {...form.register('instagramUrl')} placeholder="https://instagram.com/..." />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Youtube className="h-4 w-4 text-[#FF0000]" />
                <Label htmlFor="youtubeUrl">YouTube</Label>
              </div>
              <Input id="youtubeUrl" {...form.register('youtubeUrl')} placeholder="https://youtube.com/..." />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Footer CTA ─── */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <SectionHeader title="Llamado a la Acción (Footer)" icon={MousePointerClick} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="footerCtaTitle">Título</Label>
            <Input id="footerCtaTitle" {...form.register('footerCtaTitle')} placeholder="Ej: ¿Quieres saber más?" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="footerCtaSubtitle">Subtítulo</Label>
            <Input id="footerCtaSubtitle" {...form.register('footerCtaSubtitle')} placeholder="Ej: Contáctanos o visítanos" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="footerCtaButtonText">Texto del Botón</Label>
            <Input id="footerCtaButtonText" {...form.register('footerCtaButtonText')} placeholder="Ej: Ver Ubicación" />
          </div>
        </div>
      </div>

      {/* ─── Floating Save Button ─── */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          type="submit" 
          size="lg" 
          className="shadow-xl h-12 px-8 gap-2"
          disabled={saveMutation.isPending}
          style={{ 
            background: isDark ? 'hsl(219,70%,60%)' : NAVY,
            color: isDark ? 'hsl(222,47%,8%)' : '#fff'
          }}
        >
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          GUARDAR CAMBIOS
        </Button>
      </div>
    </form>
  )
}
