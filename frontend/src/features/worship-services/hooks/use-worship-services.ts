import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
  ServiceTemplateResponseDto,
  ServiceProgramResponseDto,
  ProgramLogResponseDto,
  HymnAutocompleteResponseDto,
} from '@/lib/api';
import {
  WorshipServicesTemplatesService,
  WorshipServicesProgramsService,
  HymnsService,
} from '@/lib/api';

export type ServiceTemplateType = ServiceTemplateResponseDto.type;

export interface ProgramFilters {
  createdById?: string;
  templateId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export function useTemplates(type?: ServiceTemplateType) {
  return useQuery({
    queryKey: ['worship-services', 'templates', type],
    queryFn: () =>
      WorshipServicesTemplatesService.templateControllerFindAll(type) as Promise<ServiceTemplateResponseDto[]>,
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ['worship-services', 'templates', id],
    queryFn: () =>
      WorshipServicesTemplatesService.templateControllerFindOne(id) as Promise<ServiceTemplateResponseDto>,
    enabled: !!id,
  });
}

export function usePrograms(filters: ProgramFilters = {}) {
  return useQuery({
    queryKey: ['worship-services', 'programs', filters],
    queryFn: () =>
      WorshipServicesProgramsService.programControllerFindAll(
        filters.createdById,
        filters.templateId,
        filters.dateFrom,
        filters.dateTo,
        filters.status,
      ) as Promise<ServiceProgramResponseDto[]>,
  });
}

export function useProgram(id: string) {
  return useQuery({
    queryKey: ['worship-services', 'programs', id],
    queryFn: () =>
      WorshipServicesProgramsService.programControllerFindOne(id) as Promise<ServiceProgramResponseDto>,
    enabled: !!id,
  });
}

export function useProgramLogs(programId: string) {
  return useQuery({
    queryKey: ['worship-services', 'programs', programId, 'logs'],
    queryFn: () =>
      WorshipServicesProgramsService.programControllerGetLogs(programId) as Promise<ProgramLogResponseDto[]>,
    enabled: !!programId,
  });
}

export function useDeleteProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (programId: string) =>
      WorshipServicesProgramsService.programControllerDelete(programId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worship-services', 'programs'] });
      toast.success('Programa eliminado');
    },
    onError: () => toast.error('No se pudo eliminar el programa'),
  });
}

export function useArchiveProgram(programId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      WorshipServicesProgramsService.programControllerArchive(programId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worship-services', 'programs', programId] });
      queryClient.invalidateQueries({ queryKey: ['worship-services', 'programs'] });
      toast.success('Programa archivado');
    },
    onError: () => toast.error('No se pudo archivar el programa'),
  });
}

export function useDeleteGroup(programId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) =>
      WorshipServicesProgramsService.programControllerDeleteGroup(programId, groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worship-services', 'programs', programId] });
      toast.success('Grupo eliminado');
    },
    onError: () => toast.error('No se pudo eliminar el grupo'),
  });
}

export function useDeleteSection(programId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sectionId: string) =>
      WorshipServicesProgramsService.programControllerDeleteSection(programId, sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worship-services', 'programs', programId] });
      toast.success('Sección eliminada');
    },
    onError: () => toast.error('No se pudo eliminar la sección'),
  });
}

export function useReorderGroups(programId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) =>
      WorshipServicesProgramsService.programControllerReorderGroups(programId, { orderedIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worship-services', 'programs', programId] });
    },
    onError: () => toast.error('No se pudo reordenar los grupos'),
  });
}

export function useReorderSections(programId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) =>
      WorshipServicesProgramsService.programControllerReorderSections(programId, { orderedIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worship-services', 'programs', programId] });
    },
    onError: () => toast.error('No se pudo reordenar las secciones'),
  });
}

export function useHymnSearch(query: string) {
  return useQuery({
    queryKey: ['hymns', 'search', query],
    queryFn: () =>
      HymnsService.hymnControllerAutocomplete(query) as Promise<HymnAutocompleteResponseDto[]>,
    enabled: query.length >= 1,
  });
}

export function useUserSearch(query: string) {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: async () => {
      const response = await fetch(`/auth/autocomplete?q=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to search users');
      return response.json() as Promise<{ id: string; name: string; email: string }[]>;
    },
    enabled: query.length >= 1,
  });
}
