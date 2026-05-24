import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SabbathClassesService } from '@/lib/api/services/SabbathClassesService'
import type { CreateSabbathClassDto } from '@/lib/api/models/CreateSabbathClassDto'
import type { UpdateSabbathClassDto } from '@/lib/api/models/UpdateSabbathClassDto'

const KEYS = {
  all: ['sabbath-classes'] as const,
  active: ['sabbath-classes', 'active'] as const,
  one: (id: string) => ['sabbath-classes', id] as const,
}

export function useSabbathClassesList() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn: () => SabbathClassesService.sabbathClassControllerFindAll(),
  })
}

export function useSabbathClassesActive() {
  return useQuery({
    queryKey: KEYS.active,
    queryFn: () => SabbathClassesService.sabbathClassControllerFindAllActive(),
  })
}

export function useSabbathClass(id: string) {
  return useQuery({
    queryKey: KEYS.one(id),
    queryFn: () => SabbathClassesService.sabbathClassControllerFindOne(id),
    enabled: !!id,
  })
}

export function useCreateSabbathClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateSabbathClassDto) =>
      SabbathClassesService.sabbathClassControllerCreate(dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.all })
      void qc.invalidateQueries({ queryKey: KEYS.active })
    },
  })
}

export function useUpdateSabbathClass(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: UpdateSabbathClassDto) =>
      SabbathClassesService.sabbathClassControllerUpdate(id, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.all })
      void qc.invalidateQueries({ queryKey: KEYS.active })
      void qc.invalidateQueries({ queryKey: KEYS.one(id) })
    },
  })
}

export function useDeleteSabbathClass() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      SabbathClassesService.sabbathClassControllerRemove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.all })
      void qc.invalidateQueries({ queryKey: KEYS.active })
    },
  })
}
