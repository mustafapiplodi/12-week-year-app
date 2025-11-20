export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
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
        Relationships: [
          {
            foreignKeyName: "cycles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cycles_vision_id_fkey"
            columns: ["vision_id"]
            isOneToOne: false
            referencedRelation: "visions"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "goal_lag_indicators_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "goal_lag_snapshots_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_lag_snapshots_goal_lag_indicator_id_fkey"
            columns: ["goal_lag_indicator_id"]
            isOneToOne: false
            referencedRelation: "goal_lag_indicators"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "goals_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "cycles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "scheduled_tasks_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_tasks_tactic_id_fkey"
            columns: ["tactic_id"]
            isOneToOne: false
            referencedRelation: "tactics"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "tactics_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "visions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "weekly_reviews_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "cycles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_scheduled_tasks: {
        Args: { p_cycle_id: string; p_week_number: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
