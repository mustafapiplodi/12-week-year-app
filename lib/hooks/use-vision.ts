import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { TablesInsert, TablesUpdate } from '@/types/database'

export function useActiveVision() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['visions', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visions')
        .select('*')
        .eq('is_active', true)
        .maybeSingle()

      if (error) throw error
      return data
    },
  })
}

export function useCreateVision() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (vision: Omit<TablesInsert<'visions'>, 'user_id'>) => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError) {
        console.error('Auth error in useCreateVision:', authError)
        throw new Error(`Authentication error: ${authError.message}`)
      }

      if (!user) {
        throw new Error('No authenticated user found. Please log in.')
      }

      console.log('Creating vision for user:', user.id)

      // Deactivate all existing visions
      const { error: updateError } = await supabase
        .from('visions')
        .update({ is_active: false })
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error deactivating visions:', updateError)
        // Don't throw here, as there might be no existing visions
      }

      const { data, error } = await supabase
        .from('visions')
        .insert([
          {
            ...vision,
            user_id: user.id,
            is_active: true,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error('Error inserting vision:', error)
        throw new Error(`Database error: ${error.message || 'Failed to create vision'}`)
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visions'] })
    },
  })
}

export function useUpdateVision() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'visions'> & { id: string }) => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError) {
        console.error('Auth error in useUpdateVision:', authError)
        throw new Error(`Authentication error: ${authError.message}`)
      }

      if (!user) {
        throw new Error('No authenticated user found. Please log in.')
      }

      console.log('Updating vision:', id, 'for user:', user.id)

      const { data, error } = await supabase
        .from('visions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating vision:', error)
        throw new Error(`Database error: ${error.message || 'Failed to update vision'}`)
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visions'] })
    },
  })
}
