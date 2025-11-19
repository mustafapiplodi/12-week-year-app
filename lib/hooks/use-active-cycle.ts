import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Tables } from '@/types/database'

export function useActiveCycle() {
  const supabase = createClient()

  return useQuery<Tables<'cycles'> | null>({
    queryKey: ['cycles', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cycles')
        .select('*')
        .eq('status', 'active')
        .maybeSingle()

      if (error) throw error
      return data
    },
  })
}

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
