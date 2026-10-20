import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CampaignConfigForm } from './campaign-config-form'

const api = vi.hoisted(() => ({
  getHomeConfig: vi.fn(),
  saveHomeConfig: vi.fn(),
  listAlbums: vi.fn(),
}))

vi.mock('@/lib/api', () => ({
  SiteConfigService: {
    siteConfigControllerGetHomeConfig: api.getHomeConfig,
    siteConfigControllerSaveHomeConfig: api.saveHomeConfig,
  },
  GalleryService: {
    galleryAdminControllerListAlbums: api.listAlbums,
  },
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

vi.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, ...props }: { checked: boolean; onCheckedChange: (v: boolean) => void }) => (
    <input type="checkbox" checked={checked} onChange={(e) => onCheckedChange(e.target.checked)} {...props} />
  ),
}))

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <CampaignConfigForm />
    </QueryClientProvider>,
  )
}

const storedConfig = {
  heroTitle: 'Central',
  campaignEnabled: true,
  campaignLayout: 'hero' as const,
  campaignKicker: 'Semana de evangelismo',
  campaignTitle: 'Cuenta Regresiva',
  campaignTitleAccent: 'El amanecer de un nuevo tiempo',
  campaignText: '',
  campaignCtaText: 'Ir al sitio de la campaña',
  campaignCtaUrl: 'https://regresiva.adventistascentralosorno.cl',
  campaignSecondaryCtaText: '',
  campaignSecondaryCtaUrl: '',
  campaignVideoUrl: '',
  campaignVideoPosterUrl: '',
  campaignAlbumId: 'album-2',
  campaignCountdownTarget: '2026-10-21T22:30:00.000Z',
  campaignCountdownLabel: 'Primera noche en',
  campaignStartsAt: '',
  campaignEndsAt: '',
}

describe('CampaignConfigForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.getHomeConfig.mockResolvedValue(storedConfig)
    api.saveHomeConfig.mockResolvedValue(undefined)
    api.listAlbums.mockResolvedValue([
      { id: 'album-1', title: 'Cultos' },
      { id: 'album-2', title: 'Globos y libros' },
    ])
  })

  it('pre-fills the stored campaign, layout, album and local countdown date', async () => {
    renderForm()

    expect(await screen.findByDisplayValue('Cuenta Regresiva')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /La campaña ocupa el inicio/ })).toBeChecked()
    expect(screen.getByRole('radio', { name: /Banda bajo el hero/ })).not.toBeChecked()
    await waitFor(() => expect(screen.getByLabelText(/Fotos/)).toHaveValue('album-2'))
    const expectedLocal = (() => {
      const d = new Date('2026-10-21T22:30:00.000Z')
      const pad = (n: number) => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    })()
    expect(screen.getByLabelText(/Cuenta regresiva hasta/)).toHaveValue(expectedLocal)
  })

  it('saves only campaign fields, with dates converted back to ISO', async () => {
    const user = userEvent.setup()
    renderForm()
    await screen.findByDisplayValue('Cuenta Regresiva')

    await user.click(screen.getByRole('radio', { name: /Banda bajo el hero/ }))
    await user.type(screen.getByLabelText(/Video de invitación/), 'https://youtu.be/abcDEF12345')
    await user.click(screen.getByTestId('campaign-save-button'))

    await waitFor(() => expect(api.saveHomeConfig).toHaveBeenCalledTimes(1))
    const payload = api.saveHomeConfig.mock.calls[0][0]
    expect(payload).toMatchObject({
      campaignEnabled: true,
      campaignLayout: 'band',
      campaignTitle: 'Cuenta Regresiva',
      campaignVideoUrl: 'https://youtu.be/abcDEF12345',
      campaignAlbumId: 'album-2',
      campaignCountdownTarget: '2026-10-21T22:30:00.000Z',
      campaignStartsAt: '',
      campaignEndsAt: '',
    })
    expect(payload).not.toHaveProperty('heroTitle')
  })

  it('requires a title when the campaign is visible', async () => {
    const user = userEvent.setup()
    renderForm()
    await screen.findByDisplayValue('Cuenta Regresiva')

    await user.clear(screen.getByLabelText('Título'))
    await user.click(screen.getByTestId('campaign-save-button'))

    expect(await screen.findByText('Requerido para mostrar la campaña')).toBeInTheDocument()
    expect(api.saveHomeConfig).not.toHaveBeenCalled()
  })

  it('rejects an invalid video URL', async () => {
    const user = userEvent.setup()
    renderForm()
    await screen.findByDisplayValue('Cuenta Regresiva')

    await user.type(screen.getByLabelText(/Video de invitación/), 'no-es-url')
    await user.click(screen.getByTestId('campaign-save-button'))

    expect(await screen.findByText('URL inválida (debe empezar con https://)')).toBeInTheDocument()
    expect(api.saveHomeConfig).not.toHaveBeenCalled()
  })

  it('accepts a direct .mp4 video with its poster', async () => {
    const user = userEvent.setup()
    renderForm()
    await screen.findByDisplayValue('Cuenta Regresiva')

    await user.type(screen.getByLabelText(/^Video de invitación/), 'https://regresiva.adventistascentralosorno.cl/video/invitacion.mp4')
    await user.type(screen.getByLabelText(/Portada del video/), 'https://regresiva.adventistascentralosorno.cl/video/invitacion.webp')
    await user.click(screen.getByTestId('campaign-save-button'))

    await waitFor(() => expect(api.saveHomeConfig).toHaveBeenCalledTimes(1))
    expect(api.saveHomeConfig.mock.calls[0][0]).toMatchObject({
      campaignVideoUrl: 'https://regresiva.adventistascentralosorno.cl/video/invitacion.mp4',
      campaignVideoPosterUrl: 'https://regresiva.adventistascentralosorno.cl/video/invitacion.webp',
    })
  })

  it('rejects a URL without protocol', async () => {
    const user = userEvent.setup()
    renderForm()
    await screen.findByDisplayValue('Cuenta Regresiva')

    await user.clear(screen.getByLabelText(/Botón principal · enlace/))
    await user.type(screen.getByLabelText(/Botón principal · enlace/), 'regresiva.adventistascentralosorno.cl')
    await user.click(screen.getByTestId('campaign-save-button'))

    expect(await screen.findByText('URL inválida (debe empezar con https://)')).toBeInTheDocument()
    expect(api.saveHomeConfig).not.toHaveBeenCalled()
  })

  it('allows saving a hidden campaign without a title', async () => {
    const user = userEvent.setup()
    api.getHomeConfig.mockResolvedValue({ ...storedConfig, campaignEnabled: false, campaignTitle: '' })
    renderForm()
    await screen.findByText('Oculta')

    await user.click(screen.getByTestId('campaign-save-button'))

    await waitFor(() => expect(api.saveHomeConfig).toHaveBeenCalledTimes(1))
    expect(api.saveHomeConfig.mock.calls[0][0]).toMatchObject({ campaignEnabled: false, campaignTitle: '' })
  })
})
