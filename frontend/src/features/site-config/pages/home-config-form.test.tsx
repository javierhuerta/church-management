import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockSiteConfigService, mockPublicSiteService, resetAllMocks } from '@/test/mocks';
import { HomeConfigForm } from './home-config-form';

// Create a fresh QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

const mockConfigData = {
  heroTitle: 'Bienvenidos',
  heroSubtitle: 'Iglesia Adventista Central Osorno',
  verseText: 'Porque de tal manera amó Dios al mundo...',
  verseReference: 'Juan 3:16',
  scheduleTitle: 'Nuestros Horarios',
  scheduleSubtitle: 'Te esperamos en cada culto',
  facebookUrl: 'https://facebook.com/iglesia',
  instagramUrl: 'https://instagram.com/iglesia',
  youtubeUrl: 'https://youtube.com/iglesia',
  footerCtaTitle: '¿Quieres saber más?',
  footerCtaSubtitle: 'Contáctanos',
  footerCtaButtonText: 'Ver más',
  heroMainImageUrl: '/uploads/site/hero.jpg',
  heroSmallImageUrl: null,
  nextServiceImageUrl: null,
};

const mockPublicHomeData = {
  hero: { title: 'Test', subtitle: 'Test', mainImageUrl: null, smallImageUrl: null },
  verse: { text: 'Test verse', reference: 'Juan 3:16' },
  schedule: { title: 'Test', subtitle: 'Test' },
  social: { facebookUrl: null, instagramUrl: null, youtubeUrl: null },
  footerCta: { title: 'Test', subtitle: 'Test', buttonText: 'Test' },
  nextService: {
    title: 'Culto de Adoración',
    date: '2026-06-20T10:00:00.000Z',
    location: 'Templo Central',
    imageUrl: null,
  },
};

describe('HomeConfigForm', () => {
  beforeEach(() => {
    resetAllMocks();
    mockSiteConfigService.siteConfigControllerGetHomeConfig.mockResolvedValue(mockConfigData);
    mockPublicSiteService.publicSiteControllerGetHome.mockResolvedValue(mockPublicHomeData);
  });

  describe('Loading state', () => {
    it('shows skeleton while loading config', async () => {
      mockSiteConfigService.siteConfigControllerGetHomeConfig.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithProviders(<HomeConfigForm />);

      // Should show loading skeletons
      expect(document.querySelector('.animate-pulse')).toBeTruthy();
    });
  });

  describe('Form rendering', () => {
    it('renders all form sections when loaded', async () => {
      renderWithProviders(<HomeConfigForm />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Título Principal/i)).toBeInTheDocument();
      });

      // Check all sections are rendered
      expect(screen.getByText(/Sección Hero/i)).toBeInTheDocument();
      expect(screen.getByText(/Versículo del Mes/i)).toBeInTheDocument();
      expect(screen.getByText(/Próximo Culto/i)).toBeInTheDocument();
      expect(screen.getByText(/Sección Horarios/i)).toBeInTheDocument();
      expect(screen.getByText(/Redes Sociales/i)).toBeInTheDocument();
      expect(screen.getByText(/Llamado a la Acción/i)).toBeInTheDocument();
    });

    it('pre-fills form with loaded config data', async () => {
      renderWithProviders(<HomeConfigForm />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Título Principal/i)).toHaveValue('Bienvenidos');
      });

      expect(screen.getByLabelText(/Subtítulo \/ Eslogan/i)).toHaveValue(
        'Iglesia Adventista Central Osorno'
      );
      expect(screen.getByLabelText(/Texto Bíblico/i)).toHaveValue(
        'Porque de tal manera amó Dios al mundo...'
      );
      expect(screen.getByLabelText(/Referencia/i)).toHaveValue('Juan 3:16');
    });
  });

  describe('Next service display', () => {
    it('displays next service info when available', async () => {
      renderWithProviders(<HomeConfigForm />);

      await waitFor(() => {
        expect(screen.getByText('Culto de Adoración')).toBeInTheDocument();
      });

      expect(screen.getByText(/EN VIVO PRONTO/i)).toBeInTheDocument();
      expect(screen.getByText(/Templo Central/i)).toBeInTheDocument();
    });

    it('shows message when no next service', async () => {
      mockPublicSiteService.publicSiteControllerGetHome.mockResolvedValue({
        ...mockPublicHomeData,
        nextService: null,
      });

      renderWithProviders(<HomeConfigForm />);

      await waitFor(() => {
        expect(screen.getByText(/No hay eventos próximos/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form validation', () => {
    it('shows validation errors for required fields', async () => {
      const user = userEvent.setup();
      renderWithProviders(<HomeConfigForm />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Título Principal/i)).toBeInTheDocument();
      });

      // Clear a required field and try to submit
      const heroTitleInput = screen.getByLabelText(/Título Principal/i);
      await user.clear(heroTitleInput);
      await user.click(screen.getByRole('button', { name: /GUARDAR CAMBIOS/i }));

      await waitFor(() => {
        expect(screen.getByText(/Requerido/i)).toBeInTheDocument();
      });
    });

    it('shows error for invalid URL format', async () => {
      const user = userEvent.setup();
      mockSiteConfigService.siteConfigControllerGetHomeConfig.mockResolvedValue({
        ...mockConfigData,
        facebookUrl: 'not-a-valid-url',
      });

      renderWithProviders(<HomeConfigForm />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Título Principal/i)).toBeInTheDocument();
      });

      const facebookInput = screen.getByLabelText(/Facebook/i);
      await user.clear(facebookInput);
      await user.type(facebookInput, 'invalid-url');
      await user.click(screen.getByRole('button', { name: /GUARDAR CAMBIOS/i }));

      await waitFor(() => {
        expect(screen.getByText(/URL inválida/i)).toBeInTheDocument();
      });
    });

    it('accepts empty string for social media fields (optional)', async () => {
      const user = userEvent.setup();
      mockSiteConfigService.siteConfigControllerGetHomeConfig.mockResolvedValue({
        ...mockConfigData,
        facebookUrl: '',
        instagramUrl: '',
        youtubeUrl: '',
      });

      renderWithProviders(<HomeConfigForm />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Título Principal/i)).toBeInTheDocument();
      });

      // Should not show URL validation error for empty fields
      await user.click(screen.getByRole('button', { name: /GUARDAR CAMBIOS/i }));

      // Wait a bit for any async validation
      await new Promise(r => setTimeout(r, 100));

      expect(screen.queryByText(/URL inválida/i)).not.toBeInTheDocument();
    });
  });

  describe('Form submission', () => {
    it('calls save mutation with form values on submit', async () => {
      const user = userEvent.setup();
      mockSiteConfigService.siteConfigControllerSaveHomeConfig.mockResolvedValue(undefined);

      renderWithProviders(<HomeConfigForm />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Título Principal/i)).toBeInTheDocument();
      });

      // Change a field
      const heroTitleInput = screen.getByLabelText(/Título Principal/i);
      await user.clear(heroTitleInput);
      await user.type(heroTitleInput, 'Nuevo Título');

      // Submit
      await user.click(screen.getByRole('button', { name: /GUARDAR CAMBIOS/i }));

      await waitFor(() => {
        expect(mockSiteConfigService.siteConfigControllerSaveHomeConfig).toHaveBeenCalledWith(
          expect.objectContaining({
            heroTitle: 'Nuevo Título',
          })
        );
      });
    });

    it('displays loading state while saving', async () => {
      const user = userEvent.setup();
      mockSiteConfigService.siteConfigControllerSaveHomeConfig.mockImplementation(
        () => new Promise(r => setTimeout(r, 100))
      );

      renderWithProviders(<HomeConfigForm />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Título Principal/i)).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /GUARDAR CAMBIOS/i }));

      // Button should show loading state
      await waitFor(() => {
        const button = screen.getByRole('button', { name: /GUARDAR CAMBIOS/i });
        expect(button.querySelector('.animate-spin')).toBeTruthy();
      });
    });
  });

  describe('Image upload', () => {
    it('renders image slots for main, small, and next-service', async () => {
      renderWithProviders(<HomeConfigForm />);

      await waitFor(() => {
        expect(screen.getByText(/Imagen Principal/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Imagen Detalle/i)).toBeInTheDocument();
      expect(screen.getByText(/Imagen para bloque Próximo Culto/i)).toBeInTheDocument();
    });

    it('displays current image when URL is provided', async () => {
      mockSiteConfigService.siteConfigControllerGetHomeConfig.mockResolvedValue({
        ...mockConfigData,
        heroMainImageUrl: '/uploads/site/hero.jpg',
      });

      renderWithProviders(<HomeConfigForm />);

      await waitFor(() => {
        const img = document.querySelector('img[src="/uploads/site/hero.jpg"]');
        expect(img).toBeInTheDocument();
      });
    });
  });
});
