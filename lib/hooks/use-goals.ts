import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { TablesInsert, TablesUpdate } from '@/types/database'

export function useGoals(cycleId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['goals', cycleId],
    queryFn: async () => {
      if (!cycleId) return []

      const { data, error } = await supabase
        .from('goals')
        .select('*, tactics(*), goal_lag_indicators(*)')
        .eq('cycle_id', cycleId)
        .order('display_order')

      if (error) throw error
      return data
    },
    enabled: !!cycleId,
  })
}

export function useGoal(goalId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['goal', goalId],
    queryFn: async () => {
      if (!goalId) return null

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', goalId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!goalId,
  })
}

export function useCreateGoal() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (goal: TablesInsert<'goals'>) => {
      const { data, error } = await supabase
        .from('goals')
        .insert([goal])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goals', variables.cycle_id] })
    },
  })
}

export function useUpdateGoal() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, cycle_id, ...updates }: TablesUpdate<'goals'> & { id: string; cycle_id?: string }) => {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      if (variables.cycle_id) {
        queryClient.invalidateQueries({ queryKey: ['goals', variables.cycle_id] })
      }
    },
  })
}

export function useDeleteGoal() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, cycle_id }: { id: string; cycle_id: string }) => {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goals', variables.cycle_id] })
    },
  })
}
