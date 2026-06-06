import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, Loader2, Image as ImageIcon } from 'lucide-react'
import { SiteConfigService } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

// ─── Constants ───────────────────────────────────────────────────────────────
const GOLD = '#C9A84C'

// ─── Schema ──────────────────────────────────────────────────────────────────
const galeriaSchema = z.object({
  headerTitle: z.string().min(1, 'Requerido'),
  introText: z.string(),
})

type GaleriaFormValues = z.infer<typeof galeriaSchema>

// ─── Default values ──────────────────────────────────────────────────────────
const DEFAULT_VALUES: GaleriaFormValues = {
  headerTitle: 'Vida de la congregación',
  introText: 'Momentos de adoración, comunión y servicio.',
}

// ─── Component ───────────────────────────────────────────────────────────────
export function GaleriaConfigForm() {
  const queryClient = useQueryClient()

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings', 'galeria'],
    queryFn: async () => {
      const [titleRes, textRes] = await Promise.allSettled([
        SiteConfigService.siteConfigControllerGetSetting('galeria.header_title'),
        SiteConfigService.siteConfigControllerGetSetting('galeria.intro_text'),
      ])
      return {
        headerTitle: titleRes.status === 'fulfilled' ? titleRes.value.value : null,
        introText: textRes.status === 'fulfilled' ? textRes.value.value : null,
      }
    },
  })

  const form = useForm<GaleriaFormValues>({
    resolver: zodResolver(galeriaSchema),
    values: {
      headerTitle: settings?.headerTitle || DEFAULT_VALUES.headerTitle,
      introText: settings?.introText || DEFAULT_VALUES.introText,
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (values: GaleriaFormValues) => {
      await Promise.all([
        SiteConfigService.siteConfigControllerSetSetting('galeria.header_title', { value: values.headerTitle }),
        SiteConfigService.siteConfigControllerSetSetting('galeria.intro_text', { value: values.introText }),
      ])
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'galeria'] })
      toast.success('Configuración de galería guardada')
    },
    onError: () => {
      toast.error('Error al guardar la configuración')
    },
  })

  const onSubmit = (values: GaleriaFormValues) => {
    saveMutation.mutate(values)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Header section */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <ImageIcon className="h-4 w-4 text-primary" />
          <p className="text-sm font-bold text-foreground uppercase tracking-wider">
            Encabezado de Galería
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="headerTitle">Título del encabezado</Label>
          <Input
            id="headerTitle"
            {...form.register('headerTitle')}
            placeholder="Vida de la congregación"
          />
          {form.formState.errors.headerTitle && (
            <p className="text-sm text-destructive">
              {form.formState.errors.headerTitle.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="introText">Texto introductorio</Label>
          <Textarea
            id="introText"
            {...form.register('introText')}
            placeholder="Momentos de adoración, comunión y servicio."
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Se muestra debajo del título en la página de Galería del sitio público.
          </p>
        </div>
      </div>

      {/* Submit button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={saveMutation.isPending || !form.formState.isDirty}
          className="gap-2"
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Guardar cambios
        </Button>
      </div>
    </form>
  )
}
