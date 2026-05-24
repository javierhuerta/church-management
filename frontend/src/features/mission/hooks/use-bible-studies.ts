import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MissionBibleStudiesService } from '@/lib/api/services/MissionBibleStudiesService'
import { MissionPeopleService } from '@/lib/api/services/MissionPeopleService'
import type { CreateBibleStudyDto } from '@/lib/api/models/CreateBibleStudyDto'
import type { UpdateBibleStudyDto } from '@/lib/api/models/UpdateBibleStudyDto'

type BibleStudyStatus = 'Invitar' | 'Estudiando' | 'Graduado' | 'Bautismo' | 'Bautizado'

const KEYS = {
  all: (params?: { status?: BibleStudyStatus; instructorId?: string; instructorTeamId?: string; courseId?: string }) =>
    ['bible-studies', params ?? {}] as const,
  one: (id: string) => ['bible-studies', id] as const,
  byStudent: (personId: string) => ['bible-studies', 'student', personId] as const,
}

export function useBibleStudiesList(params?: {
  status?: BibleStudyStatus
  instructorId?: string
  instructorTeamId?: string
  courseId?: string
}) {
  return useQuery({
    queryKey: KEYS.all(params),
    queryFn: () =>
      MissionBibleStudiesService.bibleStudyControllerFindAll(
        params?.status,
        params?.instructorId,
        params?.courseId,
        params?.instructorTeamId,
      ),
  })
}

export function useBibleStudy(id: string) {
  return useQuery({
    queryKey: KEYS.one(id),
    queryFn: () => MissionBibleStudiesService.bibleStudyControllerFindOne(id),
    enabled: !!id,
  })
}

export function useBibleStudiesByStudent(personId: string) {
  return useQuery({
    queryKey: KEYS.byStudent(personId),
    queryFn: () => MissionPeopleService.missionControllerGetPersonBibleStudies(personId),
    enabled: !!personId,
  })
}

export function useCreateBibleStudy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateBibleStudyDto) =>
      MissionBibleStudiesService.bibleStudyControllerCreate(dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['bible-studies'] })
    },
  })
}

export function useUpdateBibleStudy(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: UpdateBibleStudyDto) =>
      MissionBibleStudiesService.bibleStudyControllerUpdate(id, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['bible-studies'] })
    },
  })
}

export function useDeleteBibleStudy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => MissionBibleStudiesService.bibleStudyControllerRemove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['bible-studies'] })
    },
  })
}
