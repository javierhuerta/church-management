import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HorariosConfigPage } from './horarios-config-page';
import { mockScheduleService, setupApiMocks, resetAllMocks } from '@/test/mocks';
import { toast } from 'sonner';

// Setup mocks before tests
setupApiMocks();

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

// Mock data
const mockTexts = {
  kicker: 'Horarios',
  title: 'Cada semana, un lugar para ti.',
  paragraph: 'Todas las visitas son bienvenidas.',
};

const mockItems = [
  {
    id: 'item-1',
    dayLabel: 'Sábado',
    dayAccent: true,
    time: '09:45',
    title: 'Escuela Sabática',
    description: 'Estudio bíblico por grupos de edades',
    sortOrder: 0,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'item-2',
    dayLabel: 'Sábado',
    dayAccent: false,
    time: '11:00',
    title: 'Culto Divino',
    description: null,
    sortOrder: 1,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'item-3',
    dayLabel: 'Miércoles',
    dayAccent: false,
    time: '19:00',
    title: 'Estudio Bíblico',
    description: 'Estudio profundo de las Escrituras',
    sortOrder: 2,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('HorariosConfigPage', () => {
  beforeEach(() => {
    resetAllMocks();
    mockScheduleService.scheduleControllerGetTexts.mockResolvedValue(mockTexts);
    mockScheduleService.scheduleControllerFindAll.mockResolvedValue(mockItems);
  });

  describe('Page texts section', () => {
    it('renders page texts section with loaded data', async () => {
      renderWithProviders(<HorariosConfigPage />);

      await waitFor(() => {
        expect(screen.getByText(/Textos de la página/i)).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue('Horarios')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Cada semana, un lugar para ti.')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Todas las visitas son bienvenidas.')).toBeInTheDocument();
    });

    it('shows save texts button', async () => {
      renderWithProviders(<HorariosConfigPage />);

      await waitFor(() => {
        expect(screen.getByText(/Textos de la página/i)).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /Guardar textos/i })).toBeInTheDocument();
    });
  });

  describe('Schedule items section', () => {
    it('renders schedule items section header', async () => {
      renderWithProviders(<HorariosConfigPage />);

      await waitFor(() => {
        expect(screen.getByText(/Horarios$/i)).toBeInTheDocument();
      });
    });

    it('renders "Nuevo horario" button', async () => {
      renderWithProviders(<HorariosConfigPage />);

      await waitFor(() => {
        expect(screen.getByText(/Horarios$/i)).toBeInTheDocument();
      });

      // Button appears in both desktop and mobile views
      const buttons = screen.getAllByRole('button', { name: /Nuevo horario/i });
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });

    it('renders schedule items', async () => {
      renderWithProviders(<HorariosConfigPage />);

      await waitFor(() => {
        // Use getAllByText since items appear in both desktop table and mobile cards
        expect(screen.getAllByText('Escuela Sabática').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Culto Divino').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Estudio Bíblico').length).toBeGreaterThanOrEqual(1);
      });
    });

    it('renders times in HH:MM format', async () => {
      renderWithProviders(<HorariosConfigPage />);

      await waitFor(() => {
        // Times appear in both desktop and mobile views
        expect(screen.getAllByText('09:45').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('11:00').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('19:00').length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Empty state', () => {
    it('shows empty state when no items', async () => {
      mockScheduleService.scheduleControllerFindAll.mockResolvedValue([]);

      renderWithProviders(<HorariosConfigPage />);

      await waitFor(() => {
        expect(screen.getByText(/No hay horarios registrados/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Agregar primer horario/i)).toBeInTheDocument();
    });
  });

  describe('Form validation', () => {
    it('shows error toast when submitting empty form', async () => {
      const user = userEvent.setup();
      renderWithProviders(<HorariosConfigPage />);

      await waitFor(() => {
        expect(screen.getByText(/Horarios$/i)).toBeInTheDocument();
      });

      // Open create form - use first "Nuevo horario" button
      const nuevoButtons = screen.getAllByRole('button', { name: /Nuevo horario/i });
      await user.click(nuevoButtons[0]);

      await waitFor(() => {
        // Sheet contains "Crear" button which only appears in the form
        expect(screen.getByRole('button', { name: /Crear/i })).toBeInTheDocument();
      });

      // Try to submit empty form - the component validates required fields
      const crearButton = screen.getByRole('button', { name: /Crear/i });
      await user.click(crearButton);

      // The component should call toast.error for validation error
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Día, hora y nombre del servicio son obligatorios');
      });
    });
  });

  describe('Item actions', () => {
    it('opens create form when clicking "Nuevo horario"', async () => {
      const user = userEvent.setup();
      renderWithProviders(<HorariosConfigPage />);

      await waitFor(() => {
        expect(screen.getByText(/Horarios$/i)).toBeInTheDocument();
      });

      // Use first "Nuevo horario" button to open form
      const nuevoButtons = screen.getAllByRole('button', { name: /Nuevo horario/i });
      await user.click(nuevoButtons[0]);

      await waitFor(() => {
        // Sheet contains "Crear" button which only appears when form is open
        expect(screen.getByRole('button', { name: /Crear/i })).toBeInTheDocument();
      });
    });
  });

  describe('Toggle active state', () => {
    it('renders switches for active state', async () => {
      renderWithProviders(<HorariosConfigPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Escuela Sabática').length).toBeGreaterThanOrEqual(1);
      });

      // Find checkboxes (switches)
      const switches = screen.getAllByRole('checkbox');
      expect(switches.length).toBeGreaterThan(0);
    });
  });

  describe('Delete confirmation', () => {
    it('opens delete confirmation dialog when clicking delete', async () => {
      const user = userEvent.setup();
      renderWithProviders(<HorariosConfigPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Escuela Sabática').length).toBeGreaterThanOrEqual(1);
      });

      // Click first delete button
      const deleteButtons = screen.getAllByRole('button', { name: /Eliminar/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/¿Eliminar horario?/i)).toBeInTheDocument();
      });
    });
  });
});
