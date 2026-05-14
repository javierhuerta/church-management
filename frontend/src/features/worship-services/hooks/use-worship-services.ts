import { useQuery } from '@tanstack/react-query';
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

export function usePrograms(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['worship-services', 'programs', startDate, endDate],
    queryFn: () =>
      WorshipServicesProgramsService.programControllerFindAll(startDate, endDate) as Promise<ServiceProgramResponseDto[]>,
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