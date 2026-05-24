import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PeriodsService, DocumentsService } from '@/lib/api'
import type { CreatePeriodDto } from '@/lib/api'

interface Period {
  id: string
  year: number
  startDate: string
  endDate: string
  pastor?: { id: string; name: string } | null
  pastorId?: string | null
  rotationMode: 'AUTOMATIC' | 'MANUAL'
  shiftWeeks: number
  rotationGroups?: string[][] | null
  elderShifts?: Array<{ id: string; elder?: { id: string; name: string } | null; weekStart: string; weekEnd: string }>
  notes?: string | null
}

interface Document {
  id: string
  year: number
  month: number
  category: string
  originalName: string
  mimeType: string
  periodId?: string | null
  period?: Period | null
}

export function usePeriods() {
  return useQuery({
    queryKey: ['periods'],
    queryFn: () => PeriodsService.periodControllerFindAll() as Promise<Period[]>,
  })
}

export function usePeriodByYear(year: number) {
  return useQuery({
    queryKey: ['period', year],
    queryFn: async () => {
      const result = await PeriodsService.periodControllerFindByYear(year)
      // Ensure we never return undefined — React Query invariant requires null instead
      return result ?? null
    },
  })
}

export function usePeriod(id: string) {
  return useQuery({
    queryKey: ['period', id],
    queryFn: () => PeriodsService.periodControllerFindOne(id) as Promise<Period>,
    enabled: !!id,
  })
}

export function useCreatePeriod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePeriodDto) => PeriodsService.periodControllerCreate(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['period'], refetchType: 'all' })
      await queryClient.invalidateQueries({ queryKey: ['periods'], refetchType: 'all' })
    },
  })
}

export function useUpdatePeriod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => PeriodsService.periodControllerUpdate(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['period'], refetchType: 'all' })
      await queryClient.invalidateQueries({ queryKey: ['periods'], refetchType: 'all' })
    },
  })
}

export function useDocumentsByYear(year: number) {
  return useQuery({
    queryKey: ['documents', 'year', year],
    queryFn: () => DocumentsService.documentCenterControllerFindByYear(year) as Promise<Document[]>,
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => DocumentsService.documentCenterControllerDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}