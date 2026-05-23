import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MissionSmallGroupsService } from '@/lib/api/services/MissionSmallGroupsService'
import type { CreateSmallGroupDto } from '@/lib/api/models/CreateSmallGroupDto'
import type { UpdateSmallGroupDto } from '@/lib/api/models/UpdateSmallGroupDto'

const KEYS = {
  all: ['small-groups'] as const,
  one: (id: string) => ['small-groups', id] as const,
  my: ['small-groups', 'my'] as const,
}

export function useSmallGroupsList() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn: () => MissionSmallGroupsService.smallGroupControllerFindAll(),
  })
}

export function useMySmallGroups() {
  return useQuery({
    queryKey: KEYS.my,
    queryFn: () => MissionSmallGroupsService.smallGroupControllerFindMy(),
  })
}

export function useSmallGroup(id: string) {
  return useQuery({
    queryKey: KEYS.one(id),
    queryFn: () => MissionSmallGroupsService.smallGroupControllerFindOne(id),
    enabled: !!id,
  })
}

export function useCreateSmallGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateSmallGroupDto) =>
      MissionSmallGroupsService.smallGroupControllerCreate(dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.all })
      void qc.invalidateQueries({ queryKey: KEYS.my })
    },
  })
}

export function useUpdateSmallGroup(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: UpdateSmallGroupDto) =>
      MissionSmallGroupsService.smallGroupControllerUpdate(id, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.all })
      void qc.invalidateQueries({ queryKey: KEYS.one(id) })
      void qc.invalidateQueries({ queryKey: KEYS.my })
    },
  })
}

export function useDeleteSmallGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      MissionSmallGroupsService.smallGroupControllerRemove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.all })
      void qc.invalidateQueries({ queryKey: KEYS.my })
    },
  })
}

export function useAddSmallGroupMember(groupId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (personId: string) =>
      MissionSmallGroupsService.smallGroupControllerAddMember(groupId, {
        personId,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.one(groupId) })
      void qc.invalidateQueries({ queryKey: KEYS.all })
      void qc.invalidateQueries({ queryKey: KEYS.my })
    },
  })
}

export function useRemoveSmallGroupMember(groupId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (personId: string) =>
      MissionSmallGroupsService.smallGroupControllerRemoveMember(
        groupId,
        personId,
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.one(groupId) })
      void qc.invalidateQueries({ queryKey: KEYS.all })
      void qc.invalidateQueries({ queryKey: KEYS.my })
    },
  })
}
