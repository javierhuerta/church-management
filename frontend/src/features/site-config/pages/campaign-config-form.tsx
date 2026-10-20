import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Megaphone, Loader2, Save } from 'lucide-react'
import { SiteConfigService, GalleryService } from '@/lib/api'
import type { ReadHomeConfigDto, UpdateHomeConfigDto } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

// ─── Schema ──────────────────────────────────────────────────────────────────
const optionalUrl = z
  .string()
  .regex(/^https?:\/\/\S+$/i, 'URL inválida (debe empezar con https://)')
  .or(z.literal(''))

const campaignSchema = z
  .object({
    campaignEnabled: z.boolean(),
    campaignLayout: z.enum(['band', 'hero']),
    campaignKicker: z.string(),
    campaignTitle: z.string(),
    campaignTitleAccent: z.string(),
    campaignText: z.string(),
    campaignCtaText: z.string(),
    campaignCtaUrl: optionalUrl,
    campaignSecondaryCtaText: z.string(),
    campaignSecondaryCtaUrl: optionalUrl,
    campaignVideoUrl: optionalUrl,
    campaignVideoPosterUrl: optionalUrl,
    campaignAlbumId: z.string(),
    campaignCountdownTarget: z.string(),
    campaignCountdownLabel: z.string(),
    campaignStartsAt: z.string(),
    campaignEndsAt: z.string(),
  })
  .refine((v) => !v.campaignEnabled || v.campaignTitle.trim() !== '', {
    path: ['campaignTitle'],
    message: 'Requerido para mostrar la campaña',
  })

type CampaignFormValues = z.infer<typeof campaignSchema>

const DATE_FIELDS = ['campaignCountdownTarget', 'campaignStartsAt', 'campaignEndsAt'] as const

/** ISO 8601 → valor de <input type="datetime-local"> en la hora local del navegador. */
function isoToLocalInput(iso: string | undefined): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function localInputToIso(value: string): string {
  return value ? new Date(value).toISOString() : ''
}

function toFormValues(config: ReadHomeConfigDto | undefined): CampaignFormValues {
  return {
    campaignEnabled: config?.campaignEnabled ?? false,
    campaignLayout: config?.campaignLayout ?? 'band',
    campaignKicker: config?.campaignKicker ?? '',
    campaignTitle: config?.campaignTitle ?? '',
    campaignTitleAccent: config?.campaignTitleAccent ?? '',
    campaignText: config?.campaignText ?? '',
    campaignCtaText: config?.campaignCtaText ?? '',
    campaignCtaUrl: config?.campaignCtaUrl ?? '',
    campaignSecondaryCtaText: config?.campaignSecondaryCtaText ?? '',
    campaignSecondaryCtaUrl: config?.campaignSecondaryCtaUrl ?? '',
    campaignVideoUrl: config?.campaignVideoUrl ?? '',
    campaignVideoPosterUrl: config?.campaignVideoPosterUrl ?? '',
    campaignAlbumId: config?.campaignAlbumId ?? '',
    campaignCountdownTarget: isoToLocalInput(config?.campaignCountdownTarget),
    campaignCountdownLabel: config?.campaignCountdownLabel ?? '',
    campaignStartsAt: isoToLocalInput(config?.campaignStartsAt),
    campaignEndsAt: isoToLocalInput(config?.campaignEndsAt),
  }
}

function toPayload(values: CampaignFormValues): UpdateHomeConfigDto {
  const payload: UpdateHomeConfigDto = { ...values }
  for (const field of DATE_FIELDS) payload[field] = localInputToIso(values[field])
  return payload
}

const LAYOUTS = [
  {
    value: 'hero' as const,
    title: 'La campaña ocupa el inicio',
    description: 'Para el evento principal de la semana: es lo primero que se ve y el hero habitual baja.',
  },
  {
    value: 'band' as const,
    title: 'Banda bajo el hero',
    description: 'Para destacar algo sin reemplazar la portada: aparece justo debajo del hero.',
  },
]

// ─── Component ───────────────────────────────────────────────────────────────

export function CampaignConfigForm() {
  const queryClient = useQueryClient()

  const { data: config, isLoading } = useQuery({
    queryKey: ['site-config', 'home'],
    queryFn: () => SiteConfigService.siteConfigControllerGetHomeConfig(),
  })

  const { data: albums } = useQuery({
    queryKey: ['gallery', 'albums'],
    queryFn: () => GalleryService.galleryAdminControllerListAlbums(),
  })

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: toFormValues(undefined),
  })

  const enabled = useWatch({ control: form.control, name: 'campaignEnabled' })

  useEffect(() => {
    if (config) form.reset(toFormValues(config))
  }, [config, form])

  const saveMutation = useMutation({
    mutationFn: (values: CampaignFormValues) =>
      SiteConfigService.siteConfigControllerSaveHomeConfig(toPayload(values)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-config', 'home'] })
      queryClient.invalidateQueries({ queryKey: ['public-home'] })
      toast.success('Campaña guardada')
    },
    onError: () => toast.error('Error al guardar la campaña'),
  })

  if (isLoading) return null

  const errors = form.formState.errors

  return (
    <form
      data-testid="campaign-config-form"
      onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
      className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-primary" />
          <p className="text-sm font-bold text-foreground uppercase tracking-wider">Campaña destacada</p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="campaignEnabled" className="text-sm">
            {enabled ? 'Visible en el sitio' : 'Oculta'}
          </Label>
          <Controller
            control={form.control}
            name="campaignEnabled"
            render={({ field }) => (
              <Switch
                id="campaignEnabled"
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-label="Mostrar campaña en el inicio"
              />
            )}
          />
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold text-muted-foreground uppercase mb-2">Diseño</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {LAYOUTS.map((layout) => (
            <label
              key={layout.value}
              className="flex gap-3 rounded-lg border border-border p-4 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input type="radio" value={layout.value} {...form.register('campaignLayout')} className="mt-1" />
              <span>
                <span className="block text-sm font-semibold text-foreground">{layout.title}</span>
                <span className="block text-xs text-muted-foreground mt-1">{layout.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="campaignKicker">Antetítulo</Label>
          <Input id="campaignKicker" {...form.register('campaignKicker')} placeholder="Ej: Semana de evangelismo · 21 al 24 de octubre" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="campaignTitle">Título</Label>
          <Input id="campaignTitle" {...form.register('campaignTitle')} placeholder="Ej: Cuenta Regresiva" />
          {errors.campaignTitle && <p className="text-xs text-destructive">{errors.campaignTitle.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="campaignTitleAccent">Subtítulo (cursiva)</Label>
          <Input id="campaignTitleAccent" {...form.register('campaignTitleAccent')} placeholder="Ej: El amanecer de un nuevo tiempo" />
        </div>
        <div className="space-y-2 lg:row-span-2">
          <Label htmlFor="campaignText">Texto</Label>
          <Textarea id="campaignText" rows={4} {...form.register('campaignText')} placeholder="Ej: Seminario profético con el Pr. ... Cada noche a las 19:30." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="campaignCtaText">Botón principal · texto</Label>
          <Input id="campaignCtaText" {...form.register('campaignCtaText')} placeholder="Ej: Ir al sitio de la campaña" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="campaignCtaUrl">Botón principal · enlace</Label>
          <Input id="campaignCtaUrl" {...form.register('campaignCtaUrl')} placeholder="https://..." />
          {errors.campaignCtaUrl && <p className="text-xs text-destructive">{errors.campaignCtaUrl.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="campaignSecondaryCtaText">Botón secundario · texto (opcional)</Label>
          <Input id="campaignSecondaryCtaText" {...form.register('campaignSecondaryCtaText')} placeholder="Ej: Descargar el libro gratis" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="campaignSecondaryCtaUrl">Botón secundario · enlace (opcional)</Label>
          <Input id="campaignSecondaryCtaUrl" {...form.register('campaignSecondaryCtaUrl')} placeholder="https://..." />
          {errors.campaignSecondaryCtaUrl && <p className="text-xs text-destructive">{errors.campaignSecondaryCtaUrl.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="campaignVideoUrl">Video de invitación</Label>
          <Input id="campaignVideoUrl" {...form.register('campaignVideoUrl')} placeholder="YouTube o archivo .mp4: https://..." />
          {errors.campaignVideoUrl && <p className="text-xs text-destructive">{errors.campaignVideoUrl.message}</p>}
          <p className="text-xs text-muted-foreground">Acepta un enlace de YouTube o un archivo de video directo (.mp4, .webm).</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="campaignVideoPosterUrl">Portada del video (solo archivo .mp4/.webm)</Label>
          <Input id="campaignVideoPosterUrl" {...form.register('campaignVideoPosterUrl')} placeholder="https://.../portada.webp" />
          {errors.campaignVideoPosterUrl && <p className="text-xs text-destructive">{errors.campaignVideoPosterUrl.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="campaignAlbumId">Fotos (álbum de la galería)</Label>
          <select
            id="campaignAlbumId"
            {...form.register('campaignAlbumId')}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="">Sin fotos</option>
            {(albums ?? []).map((album) => (
              <option key={album.id} value={album.id}>
                {album.title}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">Se muestran las fotos publicadas del álbum (hasta 8).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="campaignCountdownTarget">Cuenta regresiva hasta (opcional)</Label>
          <Input id="campaignCountdownTarget" type="datetime-local" {...form.register('campaignCountdownTarget')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="campaignCountdownLabel">Texto de la cuenta regresiva</Label>
          <Input id="campaignCountdownLabel" {...form.register('campaignCountdownLabel')} placeholder="Ej: Primera noche en" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="campaignStartsAt">Mostrar desde (opcional)</Label>
          <Input id="campaignStartsAt" type="datetime-local" {...form.register('campaignStartsAt')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="campaignEndsAt">Ocultar después de (opcional)</Label>
          <Input id="campaignEndsAt" type="datetime-local" {...form.register('campaignEndsAt')} />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" data-testid="campaign-save-button" disabled={saveMutation.isPending} className="gap-2">
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar campaña
        </Button>
      </div>
    </form>
  )
}
