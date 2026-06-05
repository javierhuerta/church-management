import { vi } from 'vitest';

// Mock lucide-react icons
const mockIcons: Record<string, unknown> = {
  Save: 'mock-save-icon',
  Image: 'mock-image-icon',
  Upload: 'mock-upload-icon',
  Globe: 'mock-globe-icon',
  Type: 'mock-type-icon',
  Hash: 'mock-hash-icon',
  Calendar: 'mock-calendar-icon',
  Facebook: 'mock-facebook-icon',
  Instagram: 'mock-instagram-icon',
  Youtube: 'mock-youtube-icon',
  MousePointerClick: 'mock-mouse-pointer-icon',
  Loader2: 'mock-loader-icon',
  Plus: 'mock-plus-icon',
  Pencil: 'mock-pencil-icon',
  Trash2: 'mock-trash-icon',
  ChevronUp: 'mock-chevron-up-icon',
  ChevronDown: 'mock-chevron-down-icon',
  Clock: 'mock-clock-icon',
};

// Mock API services
export const mockSiteConfigService = {
  siteConfigControllerGetHomeConfig: vi.fn(),
  siteConfigControllerSaveHomeConfig: vi.fn(),
  siteConfigControllerSetHomeImage: vi.fn(),
};

export const mockPublicSiteService = {
  publicSiteControllerGetHome: vi.fn(),
};

export const mockScheduleService = {
  scheduleControllerGetTexts: vi.fn(),
  scheduleControllerSaveTexts: vi.fn(),
  scheduleControllerFindAll: vi.fn(),
  scheduleControllerFindOne: vi.fn(),
  scheduleControllerCreate: vi.fn(),
  scheduleControllerUpdate: vi.fn(),
  scheduleControllerRemove: vi.fn(),
  scheduleControllerReorder: vi.fn(),
};

// Setup all module mocks
export function setupApiMocks() {
  vi.mock('@/lib/api', () => ({
    SiteConfigService: mockSiteConfigService,
    PublicSiteService: mockPublicSiteService,
    SiteConfigScheduleService: mockScheduleService,
  }));

  vi.mock('@/components/theme-provider', () => ({
    useTheme: () => ({ resolvedTheme: 'light' }),
  }));

  vi.mock('sonner', () => ({
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
  }));

  vi.mock('lucide-react', () => ({
    Save: 'mock-save-icon',
    Image: 'mock-image-icon',
    Upload: 'mock-upload-icon',
    Globe: 'mock-globe-icon',
    Type: 'mock-type-icon',
    Hash: 'mock-hash-icon',
    Calendar: 'mock-calendar-icon',
    Facebook: 'mock-facebook-icon',
    Instagram: 'mock-instagram-icon',
    Youtube: 'mock-youtube-icon',
    MousePointerClick: 'mock-mouse-pointer-icon',
    Loader2: 'mock-loader-icon',
    Plus: 'mock-plus-icon',
    Pencil: 'mock-pencil-icon',
    Trash2: 'mock-trash-icon',
    ChevronUp: 'mock-chevron-up-icon',
    ChevronDown: 'mock-chevron-down-icon',
    Clock: 'mock-clock-icon',
  }));

  // Mock UI components
  vi.mock('@/components/ui/button', () => ({
    Button: ({ children, ...props }: React.PropsWithChildren) => (
      <button {...props}>{children}</button>
    ),
  }));

  vi.mock('@/components/ui/input', () => ({
    Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
      <input {...props} />
    ),
  }));

  vi.mock('@/components/ui/textarea', () => ({
    Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
      <textarea {...props} />
    ),
  }));

  vi.mock('@/components/ui/label', () => ({
    Label: ({ children, ...props }: React.PropsWithChildren) => (
      <label {...props}>{children}</label>
    ),
  }));

  vi.mock('@/components/ui/skeleton', () => ({
    Skeleton: (props: React.HTMLAttributes<HTMLDivElement>) => (
      <div className="animate-pulse" {...props} />
    ),
  }));

  vi.mock('@/components/ui/switch', () => ({
    Switch: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
      <input type="checkbox" {...props} />
    ),
  }));

  vi.mock('@/components/ui/badge', () => ({
    Badge: ({ children, ...props }: React.PropsWithChildren) => (
      <span {...props}>{children}</span>
    ),
  }));

  vi.mock('@/components/ui/sheet', () => ({
    Sheet: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
      open ? <div data-testid="sheet-open">{children}</div> : null,
    SheetContent: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    SheetHeader: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    SheetTitle: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  }));

  vi.mock('@/components/ui/table', () => ({
    Table: ({ children }: { children: React.ReactNode }) => (
      <table>{children}</table>
    ),
    TableBody: ({ children }: { children: React.ReactNode }) => (
      <tbody>{children}</tbody>
    ),
    TableCell: ({ children }: { children: React.ReactNode }) => (
      <td>{children}</td>
    ),
    TableHead: ({ children }: { children: React.ReactNode }) => (
      <th>{children}</th>
    ),
    TableHeader: ({ children }: { children: React.ReactNode }) => (
      <thead>{children}</thead>
    ),
    TableRow: ({ children }: { children: React.ReactNode }) => (
      <tr>{children}</tr>
    ),
  }));

  vi.mock('@/components/ui/alert-dialog', () => ({
    AlertDialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
      open ? <div>{children}</div> : null,
    AlertDialogAction: ({ children, ...props }: React.PropsWithChildren) => (
      <button {...props}>{children}</button>
    ),
    AlertDialogCancel: ({ children, ...props }: React.PropsWithChildren) => (
      <button {...props}>{children}</button>
    ),
    AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    AlertDialogHeader: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  }));
}

// Reset all mocks
export function resetAllMocks() {
  vi.clearAllMocks();
  mockSiteConfigService.siteConfigControllerGetHomeConfig.mockReset();
  mockSiteConfigService.siteConfigControllerSaveHomeConfig.mockReset();
  mockSiteConfigService.siteConfigControllerSetHomeImage.mockReset();
  mockPublicSiteService.publicSiteControllerGetHome.mockReset();
  mockScheduleService.scheduleControllerGetTexts.mockReset();
  mockScheduleService.scheduleControllerSaveTexts.mockReset();
  mockScheduleService.scheduleControllerFindAll.mockReset();
  mockScheduleService.scheduleControllerFindOne.mockReset();
  mockScheduleService.scheduleControllerCreate.mockReset();
  mockScheduleService.scheduleControllerUpdate.mockReset();
  mockScheduleService.scheduleControllerRemove.mockReset();
  mockScheduleService.scheduleControllerReorder.mockReset();
}
