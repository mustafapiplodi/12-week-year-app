import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { TablesInsert, TablesUpdate } from '@/types/database'

export function useObstacles(cycleId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['obstacles', cycleId],
    queryFn: async () => {
      if (!cycleId) return []

      const { data, error } = await supabase
        .from('obstacles')
        .select('*, tactics(*)')
        .eq('cycle_id', cycleId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!cycleId,
  })
}

export function useTacticObstacles(tacticId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['obstacles', 'tactic', tacticId],
    queryFn: async () => {
      if (!tacticId) return []

      const { data, error } = await supabase
        .from('obstacles')
        .select('*')
        .eq('tactic_id', tacticId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!tacticId,
  })
}

export function useCreateObstacle() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (obstacle: TablesInsert<'obstacles'>) => {
      const { data, error } = await supabase
        .from('obstacles')
        .insert([obstacle])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['obstacles', variables.cycle_id] })
      if (variables.tactic_id) {
        queryClient.invalidateQueries({ queryKey: ['obstacles', 'tactic', variables.tactic_id] })
      }
    },
  })
}

export function useUpdateObstacle() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      cycle_id,
      tactic_id,
      ...updates
    }: TablesUpdate<'obstacles'> & {
      id: string
      cycle_id?: string
      tactic_id?: string
    }) => {
      const { data, error } = await supabase
        .from('obstacles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      if (variables.cycle_id) {
        queryClient.invalidateQueries({ queryKey: ['obstacles', variables.cycle_id] })
      }
      if (variables.tactic_id) {
        queryClient.invalidateQueries({ queryKey: ['obstacles', 'tactic', variables.tactic_id] })
      }
    },
  })
}

export function useDeleteObstacle() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, cycle_id, tactic_id }: { id: string; cycle_id: string; tactic_id?: string }) => {
      const { error } = await supabase
        .from('obstacles')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['obstacles', variables.cycle_id] })
      if (variables.tactic_id) {
        queryClient.invalidateQueries({ queryKey: ['obstacles', 'tactic', variables.tactic_id] })
      }
    },
  })
}
