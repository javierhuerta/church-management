import { useQuery } from '@tanstack/react-query'
import { MissionPeopleService } from '@/lib/api'

export function usePeopleList(search: string) {
  return useQuery({
    queryKey: ['mission-people', search],
    queryFn: () =>
      MissionPeopleService.missionControllerFindAll(
        1,
        100,
        search.trim() || undefined,
      ),
  })
}