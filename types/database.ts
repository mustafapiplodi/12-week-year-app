export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cycles: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          overall_execution_score: number | null
          start_date: string
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
          vision_id: string | null
          week_13_reflection: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          overall_execution_score?: number | null
          start_date: string
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          vision_id?: string | null
          week_13_reflection?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          overall_execution_score?: number | null
          start_date?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          vision_id?: string | null
          week_13_reflection?: string | null
        }
      }
      goal_lag_indicators: {
        Row: {
          created_at: string | null
          display_order: number | null
          goal_id: string
          id: string
          metric_type: string
          name: string
          target_value: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          goal_id: string
          id?: string
          metric_type: string
          name: string
          target_value?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          goal_id?: string
          id?: string
          metric_type?: string
          name?: string
          target_value?: number | null
          updated_at?: string | null
        }
      }
      goal_lag_snapshots: {
        Row: {
          created_at: string | null
          cycle_id: string
          goal_lag_indicator_id: string
          id: string
          notes: string | null
          recorded_at: string | null
          value: number
          week_number: number
        }
        Insert: {
          created_at?: string | null
          cycle_id: string
          goal_lag_indicator_id: string
          id?: string
          notes?: string | null
          recorded_at?: string | null
          value: number
          week_number: number
        }
        Update: {
          created_at?: string | null
          cycle_id?: string
          goal_lag_indicator_id?: string
          id?: string
          notes?: string | null
          recorded_at?: string | null
          value?: number
          week_number?: number
        }
      }
      goals: {
        Row: {
          created_at: string | null
          cycle_id: string | null
          description: string | null
          display_order: number
          id: string
          target_metric: string | null
          title: string
          updated_at: string | null
          why_it_matters: string | null
        }
        Insert: {
          created_at?: string | null
          cycle_id?: string | null
          description?: string | null
          display_order?: number
          id?: string
          target_metric?: string | null
          title: string
          updated_at?: string | null
          why_it_matters?: string | null
        }
        Update: {
          created_at?: string | null
          cycle_id?: string | null
          description?: string | null
          display_order?: number
          id?: string
          target_metric?: string | null
          title?: string
          updated_at?: string | null
          why_it_matters?: string | null
        }
      }
      scheduled_tasks: {
        Row: {
          completed_at: string | null
          created_at: string | null
          cycle_id: string | null
          id: string
          is_completed: boolean | null
          notes: string | null
          scheduled_date: string
          tactic_id: string | null
          updated_at: string | null
          week_number: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          cycle_id?: string | null
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          scheduled_date: string
          tactic_id?: string | null
          updated_at?: string | null
          week_number: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          cycle_id?: string | null
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          scheduled_date?: string
          tactic_id?: string | null
          updated_at?: string | null
          week_number?: number
        }
      }
      tactics: {
        Row: {
          created_at: string | null
          description: string | null
          end_week: number | null
          estimated_duration: number | null
          goal_id: string | null
          id: string
          notes: string | null
          priority: string | null
          recurrence_days: number[] | null
          recurrence_pattern: string | null
          start_week: number | null
          tactic_type: string
          title: string
          updated_at: string | null
          weekly_frequency: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_week?: number | null
          estimated_duration?: number | null
          goal_id?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          recurrence_days?: number[] | null
          recurrence_pattern?: string | null
          start_week?: number | null
          tactic_type: string
          title: string
          updated_at?: string | null
          weekly_frequency?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_week?: number | null
          estimated_duration?: number | null
          goal_id?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          recurrence_days?: number[] | null
          recurrence_pattern?: string | null
          start_week?: number | null
          tactic_type?: string
          title?: string
          updated_at?: string | null
          weekly_frequency?: number | null
        }
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          updated_at?: string | null
        }
      }
      visions: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          long_term_vision: string
          three_year_vision: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          long_term_vision: string
          three_year_vision: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          long_term_vision?: string
          three_year_vision?: string
          updated_at?: string | null
          user_id?: string | null
        }
      }
      weekly_reviews: {
        Row: {
          adjustments_needed: string | null
          completed_tasks_count: number
          created_at: string | null
          cycle_id: string | null
          execution_percentage: number | null
          id: string
          planned_tasks_count: number
          updated_at: string | null
          week_end_date: string
          week_number: number
          week_start_date: string
          what_didnt_work: string | null
          what_worked: string | null
        }
        Insert: {
          adjustments_needed?: string | null
          completed_tasks_count?: number
          created_at?: string | null
          cycle_id?: string | null
          execution_percentage?: number | null
          id?: string
          planned_tasks_count?: number
          updated_at?: string | null
          week_end_date: string
          week_number: number
          week_start_date: string
          what_didnt_work?: string | null
          what_worked?: string | null
        }
        Update: {
          adjustments_needed?: string | null
          completed_tasks_count?: number
          created_at?: string | null
          cycle_id?: string | null
          execution_percentage?: number | null
          id?: string
          planned_tasks_count?: number
          updated_at?: string | null
          week_end_date?: string
          week_number?: number
          week_start_date?: string
          what_didnt_work?: string | null
          what_worked?: string | null
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
