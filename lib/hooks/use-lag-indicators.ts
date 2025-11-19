import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { TablesInsert, TablesUpdate } from '@/types/database'

// Fetch lag indicators for a specific goal
export function useGoalLagIndicators(goalId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['goal-lag-indicators', goalId],
    queryFn: async () => {
      if (!goalId) return []

      const { data, error } = await supabase
        .from('goal_lag_indicators')
        .select('*')
        .eq('goal_id', goalId)
        .order('display_order')

      if (error) throw error
      return data
    },
    enabled: !!goalId,
  })
}

// Fetch lag snapshots for a specific indicator and cycle
export function useLagSnapshots(indicatorId: string | undefined, cycleId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['lag-snapshots', indicatorId, cycleId],
    queryFn: async () => {
      if (!indicatorId || !cycleId) return []

      const { data, error } = await supabase
        .from('goal_lag_snapshots')
        .select('*')
        .eq('goal_lag_indicator_id', indicatorId)
        .eq('cycle_id', cycleId)
        .order('week_number')

      if (error) throw error
      return data
    },
    enabled: !!indicatorId && !!cycleId,
  })
}

// Fetch all lag snapshots for a specific week
export function useWeekLagSnapshots(cycleId: string | undefined, weekNumber: number) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['week-lag-snapshots', cycleId, weekNumber],
    queryFn: async () => {
      if (!cycleId) return []

      const { data, error } = await supabase
        .from('goal_lag_snapshots')
        .select(`
          *,
          goal_lag_indicator:goal_lag_indicators(*)
        `)
        .eq('cycle_id', cycleId)
        .eq('week_number', weekNumber)

      if (error) throw error
      return data
    },
    enabled: !!cycleId,
  })
}

// Create a lag indicator for a goal
export function useCreateLagIndicator() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (indicator: TablesInsert<'goal_lag_indicators'>) => {
      const { data, error } = await supabase
        .from('goal_lag_indicators')
        .insert([indicator])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goal-lag-indicators', variables.goal_id] })
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

// Update a lag indicator
export function useUpdateLagIndicator() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, goal_id, ...updates }: TablesUpdate<'goal_lag_indicators'> & { id: string; goal_id?: string }) => {
      const { data, error } = await supabase
        .from('goal_lag_indicators')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      if (variables.goal_id) {
        queryClient.invalidateQueries({ queryKey: ['goal-lag-indicators', variables.goal_id] })
      }
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

// Delete a lag indicator
export function useDeleteLagIndicator() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, goal_id }: { id: string; goal_id: string }) => {
      const { error } = await supabase
        .from('goal_lag_indicators')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goal-lag-indicators', variables.goal_id] })
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

// Create or update a lag snapshot
export function useUpsertLagSnapshot() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (snapshot: TablesInsert<'goal_lag_snapshots'> & { id?: string }) => {
      const { data, error } = await supabase
        .from('goal_lag_snapshots')
        .upsert([snapshot])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lag-snapshots', variables.goal_lag_indicator_id, variables.cycle_id] })
      queryClient.invalidateQueries({ queryKey: ['week-lag-snapshots', variables.cycle_id, variables.week_number] })
    },
  })
}

// Delete a lag snapshot
export function useDeleteLagSnapshot() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, goal_lag_indicator_id, cycle_id, week_number }: { id: string; goal_lag_indicator_id: string; cycle_id: string; week_number: number }) => {
      const { error } = await supabase
        .from('goal_lag_snapshots')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lag-snapshots', variables.goal_lag_indicator_id, variables.cycle_id] })
      queryClient.invalidateQueries({ queryKey: ['week-lag-snapshots', variables.cycle_id, variables.week_number] })
    },
  })
}
