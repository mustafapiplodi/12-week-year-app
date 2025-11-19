import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { TablesInsert, TablesUpdate } from '@/types/database'

export function useScheduledTasks(cycleId: string | undefined, weekNumber?: number) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['scheduled_tasks', cycleId, weekNumber],
    queryFn: async () => {
      if (!cycleId) return []

      let query = supabase
        .from('scheduled_tasks')
        .select('*, tactics(*)')
        .eq('cycle_id', cycleId)
        .order('scheduled_date')

      if (weekNumber !== undefined) {
        query = query.eq('week_number', weekNumber)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },
    enabled: !!cycleId,
  })
}

export function useTasksForDate(cycleId: string | undefined, date: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['scheduled_tasks', cycleId, 'date', date],
    queryFn: async () => {
      if (!cycleId || !date) return []

      const { data, error } = await supabase
        .from('scheduled_tasks')
        .select('*, tactics!inner(*, goals!inner(*))')
        .eq('cycle_id', cycleId)
        .eq('scheduled_date', date)
        .order('tactics(priority)')

      if (error) throw error
      return data
    },
    enabled: !!cycleId && !!date,
  })
}

export function useCreateScheduledTask() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (task: TablesInsert<'scheduled_tasks'>) => {
      const { data, error } = await supabase
        .from('scheduled_tasks')
        .insert([task])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scheduled_tasks', variables.cycle_id] })
      if (variables.scheduled_date) {
        queryClient.invalidateQueries({
          queryKey: ['scheduled_tasks', variables.cycle_id, 'date', variables.scheduled_date]
        })
      }
    },
  })
}

export function useUpdateScheduledTask() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      cycle_id,
      old_date,
      ...updates
    }: TablesUpdate<'scheduled_tasks'> & {
      id: string
      cycle_id?: string
      old_date?: string
    }) => {
      const { data, error } = await supabase
        .from('scheduled_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data, variables) => {
      if (variables.cycle_id) {
        queryClient.invalidateQueries({ queryKey: ['scheduled_tasks', variables.cycle_id] })
        if (variables.old_date) {
          queryClient.invalidateQueries({
            queryKey: ['scheduled_tasks', variables.cycle_id, 'date', variables.old_date]
          })
        }
        if (data.scheduled_date) {
          queryClient.invalidateQueries({
            queryKey: ['scheduled_tasks', variables.cycle_id, 'date', data.scheduled_date]
          })
        }
      }
    },
  })
}

export function useDeleteScheduledTask() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, cycle_id, scheduled_date }: {
      id: string
      cycle_id: string
      scheduled_date?: string
    }) => {
      const { error } = await supabase
        .from('scheduled_tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scheduled_tasks', variables.cycle_id] })
      if (variables.scheduled_date) {
        queryClient.invalidateQueries({
          queryKey: ['scheduled_tasks', variables.cycle_id, 'date', variables.scheduled_date]
        })
      }
    },
  })
}

export function useCompleteTask() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      is_completed,
      notes,
      cycle_id,
      scheduled_date
    }: {
      id: string
      is_completed: boolean
      notes?: string
      cycle_id: string
      scheduled_date: string
    }) => {
      const { data, error } = await supabase
        .from('scheduled_tasks')
        .update({
          is_completed,
          completed_at: is_completed ? new Date().toISOString() : null,
          notes,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scheduled_tasks', variables.cycle_id] })
      queryClient.invalidateQueries({
        queryKey: ['scheduled_tasks', variables.cycle_id, 'date', variables.scheduled_date]
      })
    },
  })
}
