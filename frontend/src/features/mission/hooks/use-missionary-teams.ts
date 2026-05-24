import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MissionaryTeamsService } from '@/lib/api/services/MissionaryTeamsService'
import type { CreateMissionaryTeamDto } from '@/lib/api/models/CreateMissionaryTeamDto'
import type { UpdateMissionaryTeamDto } from '@/lib/api/models/UpdateMissionaryTeamDto'

const KEYS = {
  all: (periodId?: string, smallGroupId?: string, sabbathClassId?: string) =>
    ['missionary-teams', { periodId, smallGroupId, sabbathClassId }] as const,
  one: (id: string) => ['missionary-teams', id] as const,
}

export function useMissionaryTeamsList(
  periodId?: string,
  smallGroupId?: string,
  sabbathClassId?: string,
) {
  return useQuery({
    queryKey: KEYS.all(periodId, smallGroupId, sabbathClassId),
    queryFn: () =>
      MissionaryTeamsService.missionaryTeamControllerFindAll(
        periodId,
        smallGroupId,
        sabbathClassId,
      ),
  })
}

export function useMissionaryTeam(id: string) {
  return useQuery({
    queryKey: KEYS.one(id),
    queryFn: () => MissionaryTeamsService.missionaryTeamControllerFindOne(id),
    enabled: !!id,
  })
}

export function useCreateMissionaryTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateMissionaryTeamDto) =>
      MissionaryTeamsService.missionaryTeamControllerCreate(dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['missionary-teams'] })
    },
  })
}

export function useUpdateMissionaryTeam(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: UpdateMissionaryTeamDto) =>
      MissionaryTeamsService.missionaryTeamControllerUpdate(id, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['missionary-teams'] })
      void qc.invalidateQueries({ queryKey: KEYS.one(id) })
    },
  })
}

export function useDeleteMissionaryTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      MissionaryTeamsService.missionaryTeamControllerRemove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['missionary-teams'] })
    },
  })
}

export function useAddTeamMember(teamId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { personId: string; joinedAt?: string | null }) =>
      MissionaryTeamsService.missionaryTeamControllerAddMember(teamId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['missionary-teams'] })
      void qc.invalidateQueries({ queryKey: KEYS.one(teamId) })
    },
  })
}

export function useRemoveTeamMember(teamId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      memberId,
      leftAt,
    }: {
      memberId: string
      leftAt?: string | null
    }) =>
      MissionaryTeamsService.missionaryTeamControllerRemoveMember(teamId, memberId, {
        leftAt,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['missionary-teams'] })
      void qc.invalidateQueries({ queryKey: KEYS.one(teamId) })
    },
  })
}
