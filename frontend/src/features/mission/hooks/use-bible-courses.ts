import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MissionBibleCoursesService } from '@/lib/api/services/MissionBibleCoursesService'
import type { CreateBibleCourseDto } from '@/lib/api/models/CreateBibleCourseDto'
import type { UpdateBibleCourseDto } from '@/lib/api/models/UpdateBibleCourseDto'

const KEYS = {
  all: ['bible-courses'] as const,
  one: (id: string) => ['bible-courses', id] as const,
}

export function useBibleCoursesList() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn: () => MissionBibleCoursesService.bibleCourseControllerFindAll(),
  })
}

export function useBibleCourse(id: string) {
  return useQuery({
    queryKey: KEYS.one(id),
    queryFn: () => MissionBibleCoursesService.bibleCourseControllerFindOne(id),
    enabled: !!id,
  })
}

export function useCreateBibleCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateBibleCourseDto) =>
      MissionBibleCoursesService.bibleCourseControllerCreate(dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.all })
    },
  })
}

export function useUpdateBibleCourse(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: UpdateBibleCourseDto) =>
      MissionBibleCoursesService.bibleCourseControllerUpdate(id, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.all })
      void qc.invalidateQueries({ queryKey: KEYS.one(id) })
    },
  })
}

export function useDeleteBibleCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => MissionBibleCoursesService.bibleCourseControllerRemove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.all })
    },
  })
}
