import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { TablesInsert, TablesUpdate } from '@/types/database'

export function useWeeklyReviews(cycleId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['weekly_reviews', cycleId],
    queryFn: async () => {
      if (!cycleId) return []

      const { data, error } = await supabase
        .from('weekly_reviews')
        .select('*')
        .eq('cycle_id', cycleId)
        .order('week_number')

      if (error) throw error
      return data
    },
    enabled: !!cycleId,
  })
}

export function useWeeklyReview(cycleId: string | undefined, weekNumber: number | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['weekly_review', cycleId, weekNumber],
    queryFn: async () => {
      if (!cycleId || weekNumber === undefined) return null

      const { data, error } = await supabase
        .from('weekly_reviews')
        .select('*')
        .eq('cycle_id', cycleId)
        .eq('week_number', weekNumber)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!cycleId && weekNumber !== undefined,
  })
}

export function useCreateWeeklyReview() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (review: TablesInsert<'weekly_reviews'>) => {
      const { data, error } = await supabase
        .from('weekly_reviews')
        .insert([review])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['weekly_reviews', variables.cycle_id] })
      queryClient.invalidateQueries({
        queryKey: ['weekly_review', variables.cycle_id, variables.week_number]
      })
    },
  })
}

export function useUpdateWeeklyReview() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      cycle_id,
      week_number,
      ...updates
    }: TablesUpdate<'weekly_reviews'> & {
      id: string
      cycle_id?: string
      week_number?: number
    }) => {
      const { data, error } = await supabase
        .from('weekly_reviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      if (variables.cycle_id) {
        queryClient.invalidateQueries({ queryKey: ['weekly_reviews', variables.cycle_id] })
        if (variables.week_number) {
          queryClient.invalidateQueries({
            queryKey: ['weekly_review', variables.cycle_id, variables.week_number]
          })
        }
      }
    },
  })
}

export function useDeleteWeeklyReview() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      cycle_id,
      week_number
    }: {
      id: string
      cycle_id: string
      week_number: number
    }) => {
      const { error } = await supabase
        .from('weekly_reviews')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['weekly_reviews', variables.cycle_id] })
      queryClient.invalidateQueries({
        queryKey: ['weekly_review', variables.cycle_id, variables.week_number]
      })
    },
  })
}
