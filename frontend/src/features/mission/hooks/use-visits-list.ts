import { useQuery } from '@tanstack/react-query'
import { MissionRescueMembersService, MissionVisitsService, RescueStagesService, VisitStatusesService } from '@/lib/api'

export function useVisitsList(statusId?: string) {
  return useQuery({
    queryKey: ['mission-visits', statusId],
    queryFn: () => MissionVisitsService.visitControllerFindAll(statusId),
  })
}

export function useVisit(id: string) {
  return useQuery({
    queryKey: ['mission-visit', id],
    queryFn: () => MissionVisitsService.visitControllerFindOne(id),
    enabled: !!id,
  })
}

export function useRescueMembersList(stageId?: string) {
  return useQuery({
    queryKey: ['mission-rescue-members', stageId],
    queryFn: () => MissionRescueMembersService.rescueMemberControllerFindAll(stageId),
  })
}

export function useRescueMember(id: string) {
  return useQuery({
    queryKey: ['mission-rescue-member', id],
    queryFn: () => MissionRescueMembersService.rescueMemberControllerFindOne(id),
    enabled: !!id,
  })
}

export function useRescueStages() {
  return useQuery({
    queryKey: ['rescue-stages'],
    queryFn: () => RescueStagesService.rescueStagesControllerFindAll(),
  })
}

export function useVisitStatuses() {
  return useQuery({
    queryKey: ['visit-statuses'],
    queryFn: () => VisitStatusesService.visitStatusesControllerFindAll(),
  })
}