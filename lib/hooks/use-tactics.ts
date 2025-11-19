import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { TablesInsert, TablesUpdate } from '@/types/database'

export function useTactics(goalId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['tactics', goalId],
    queryFn: async () => {
      if (!goalId) return []

      const { data, error } = await supabase
        .from('tactics')
        .select('*')
        .eq('goal_id', goalId)
        .order('created_at')

      if (error) throw error
      return data
    },
    enabled: !!goalId,
  })
}

export function useCreateTactic() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tactic: TablesInsert<'tactics'>) => {
      const { data, error } = await supabase
        .from('tactics')
        .insert([tactic])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tactics', variables.goal_id] })
      // Also invalidate goals query since goals include nested tactics
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useUpdateTactic() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, goal_id, ...updates }: TablesUpdate<'tactics'> & { id: string; goal_id?: string }) => {
      const { data, error } = await supabase
        .from('tactics')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      if (variables.goal_id) {
        queryClient.invalidateQueries({ queryKey: ['tactics', variables.goal_id] })
      }
      // Also invalidate goals query since goals include nested tactics
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useDeleteTactic() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, goal_id }: { id: string; goal_id: string }) => {
      const { error } = await supabase
        .from('tactics')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tactics', variables.goal_id] })
      // Also invalidate goals query since goals include nested tactics
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}
