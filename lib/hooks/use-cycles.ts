import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { TablesInsert, TablesUpdate } from '@/types/database'

export function useCycles() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['cycles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cycles')
        .select('*')
        .order('start_date', { ascending: false })

      if (error) throw error
      return data
    },
  })
}

export function useCycle(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['cycles', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cycles')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useCreateCycle() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (cycle: Omit<TablesInsert<'cycles'>, 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // Deactivate all existing cycles
      await supabase
        .from('cycles')
        .update({ status: 'completed' })
        .eq('user_id', user.id)
        .eq('status', 'active')

      const { data, error } = await supabase
        .from('cycles')
        .insert([
          {
            ...cycle,
            user_id: user.id,
          },
        ])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycles'] })
    },
  })
}

export function useUpdateCycle() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'cycles'> & { id: string }) => {
      const { data, error } = await supabase
        .from('cycles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycles'] })
    },
  })
}
