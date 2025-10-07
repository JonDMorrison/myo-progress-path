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
      app_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          key: string
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          description: string | null
          icon: string | null
          id: string
          key: string
          name: string
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id?: string
          key: string
          name: string
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: string
          key?: string
          name?: string
        }
        Relationships: []
      }
      challenge_progress: {
        Row: {
          challenge_id: string | null
          completed: boolean | null
          id: string
          patient_id: string | null
          progress: number
          updated_at: string | null
        }
        Insert: {
          challenge_id?: string | null
          completed?: boolean | null
          id?: string
          patient_id?: string | null
          progress?: number
          updated_at?: string | null
        }
        Update: {
          challenge_id?: string | null
          completed?: boolean | null
          id?: string
          patient_id?: string | null
          progress?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_progress_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          active: boolean | null
          clinic_id: string | null
          description: string | null
          ends_on: string
          goal_key: string
          goal_target: number
          id: string
          reward_points: number
          starts_on: string
          title: string
        }
        Insert: {
          active?: boolean | null
          clinic_id?: string | null
          description?: string | null
          ends_on: string
          goal_key: string
          goal_target: number
          id?: string
          reward_points?: number
          starts_on: string
          title: string
        }
        Update: {
          active?: boolean | null
          clinic_id?: string | null
          description?: string | null
          ends_on?: string
          goal_key?: string
          goal_target?: number
          id?: string
          reward_points?: number
          starts_on?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          created_at: string | null
          id: string
          leaderboard_enabled: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          leaderboard_enabled?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          leaderboard_enabled?: boolean | null
          name?: string
        }
        Relationships: []
      }
      earned_badges: {
        Row: {
          badge_key: string | null
          earned_at: string | null
          id: string
          patient_id: string | null
        }
        Insert: {
          badge_key?: string | null
          earned_at?: string | null
          id?: string
          patient_id?: string | null
        }
        Update: {
          badge_key?: string | null
          earned_at?: string | null
          id?: string
          patient_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "earned_badges_badge_key_fkey"
            columns: ["badge_key"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "earned_badges_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          id: string
          meta: Json | null
          patient_id: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          meta?: Json | null
          patient_id?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          meta?: Json | null
          patient_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          compensations: string | null
          demo_video_url: string | null
          id: string
          instructions: string | null
          props: string | null
          title: string
          type: Database["public"]["Enums"]["exercise_type"]
          week_id: string | null
        }
        Insert: {
          compensations?: string | null
          demo_video_url?: string | null
          id?: string
          instructions?: string | null
          props?: string | null
          title: string
          type: Database["public"]["Enums"]["exercise_type"]
          week_id?: string | null
        }
        Update: {
          compensations?: string | null
          demo_video_url?: string | null
          id?: string
          instructions?: string | null
          props?: string | null
          title?: string
          type?: Database["public"]["Enums"]["exercise_type"]
          week_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "v_weekly_metrics"
            referencedColumns: ["week_id"]
          },
          {
            foreignKeyName: "exercises_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      gamification_stats: {
        Row: {
          clinic_id: string
          current_streak: number
          last_activity_date: string | null
          level: number
          longest_streak: number
          patient_id: string
          points: number
          updated_at: string | null
        }
        Insert: {
          clinic_id: string
          current_streak?: number
          last_activity_date?: string | null
          level?: number
          longest_streak?: number
          patient_id: string
          points?: number
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string
          current_streak?: number
          last_activity_date?: string | null
          level?: number
          longest_streak?: number
          patient_id?: string
          points?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gamification_stats_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gamification_stats_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string | null
          id: string
          patient_id: string | null
          therapist_id: string | null
          week_id: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          patient_id?: string | null
          therapist_id?: string | null
          week_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          patient_id?: string | null
          therapist_id?: string | null
          week_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "v_weekly_metrics"
            referencedColumns: ["week_id"]
          },
          {
            foreignKeyName: "messages_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          id: string
          patient_id: string | null
          read: boolean | null
          sent_email: boolean | null
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          patient_id?: string | null
          read?: boolean | null
          sent_email?: boolean | null
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          patient_id?: string | null
          read?: boolean | null
          sent_email?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_week_progress: {
        Row: {
          ai_summary: string | null
          bolt_score: number | null
          completed_at: string | null
          id: string
          nasal_breathing_pct: number | null
          patient_id: string | null
          status: Database["public"]["Enums"]["week_status"] | null
          tongue_on_spot_pct: number | null
          week_id: string | null
        }
        Insert: {
          ai_summary?: string | null
          bolt_score?: number | null
          completed_at?: string | null
          id?: string
          nasal_breathing_pct?: number | null
          patient_id?: string | null
          status?: Database["public"]["Enums"]["week_status"] | null
          tongue_on_spot_pct?: number | null
          week_id?: string | null
        }
        Update: {
          ai_summary?: string | null
          bolt_score?: number | null
          completed_at?: string | null
          id?: string
          nasal_breathing_pct?: number | null
          patient_id?: string | null
          status?: Database["public"]["Enums"]["week_status"] | null
          tongue_on_spot_pct?: number | null
          week_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_week_progress_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_week_progress_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "v_weekly_metrics"
            referencedColumns: ["week_id"]
          },
          {
            foreignKeyName: "patient_week_progress_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          assigned_therapist_id: string | null
          clinic_id: string
          consent_accepted_at: string | null
          consent_payload: Json | null
          consent_signature: string | null
          created_at: string | null
          id: string
          program_variant: Database["public"]["Enums"]["program_variant"] | null
          status: Database["public"]["Enums"]["patient_status"] | null
          user_id: string | null
        }
        Insert: {
          assigned_therapist_id?: string | null
          clinic_id: string
          consent_accepted_at?: string | null
          consent_payload?: Json | null
          consent_signature?: string | null
          created_at?: string | null
          id?: string
          program_variant?:
            | Database["public"]["Enums"]["program_variant"]
            | null
          status?: Database["public"]["Enums"]["patient_status"] | null
          user_id?: string | null
        }
        Update: {
          assigned_therapist_id?: string | null
          clinic_id?: string
          consent_accepted_at?: string | null
          consent_payload?: Json | null
          consent_signature?: string | null
          created_at?: string | null
          id?: string
          program_variant?:
            | Database["public"]["Enums"]["program_variant"]
            | null
          status?: Database["public"]["Enums"]["patient_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_assigned_therapist_id_fkey"
            columns: ["assigned_therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          description: string | null
          id: string
          title: string
          weeks_count: number
        }
        Insert: {
          description?: string | null
          id?: string
          title: string
          weeks_count: number
        }
        Update: {
          description?: string | null
          id?: string
          title?: string
          weeks_count?: number
        }
        Relationships: []
      }
      uploads: {
        Row: {
          ai_feedback: Json | null
          created_at: string | null
          file_url: string | null
          id: string
          kind: Database["public"]["Enums"]["upload_kind"] | null
          patient_id: string | null
          thumb_failed: boolean | null
          thumb_url: string | null
          week_id: string | null
        }
        Insert: {
          ai_feedback?: Json | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["upload_kind"] | null
          patient_id?: string | null
          thumb_failed?: boolean | null
          thumb_url?: string | null
          week_id?: string | null
        }
        Update: {
          ai_feedback?: Json | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["upload_kind"] | null
          patient_id?: string | null
          thumb_failed?: boolean | null
          thumb_url?: string | null
          week_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uploads_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uploads_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "v_weekly_metrics"
            referencedColumns: ["week_id"]
          },
          {
            foreignKeyName: "uploads_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          leaderboard_opt_out: boolean | null
          name: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          leaderboard_opt_out?: boolean | null
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          leaderboard_opt_out?: boolean | null
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      weeks: {
        Row: {
          checklist_schema: Json | null
          id: string
          notes: string | null
          number: number
          program_id: string | null
          requires_bolt: boolean | null
          requires_video_first: boolean | null
          requires_video_last: boolean | null
          title: string | null
        }
        Insert: {
          checklist_schema?: Json | null
          id?: string
          notes?: string | null
          number: number
          program_id?: string | null
          requires_bolt?: boolean | null
          requires_video_first?: boolean | null
          requires_video_last?: boolean | null
          title?: string | null
        }
        Update: {
          checklist_schema?: Json | null
          id?: string
          notes?: string | null
          number?: number
          program_id?: string | null
          requires_bolt?: boolean | null
          requires_video_first?: boolean | null
          requires_video_last?: boolean | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weeks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_weekly_metrics: {
        Row: {
          assigned_therapist_id: string | null
          bolt_score: number | null
          completed_at: string | null
          nasal_breathing_pct: number | null
          patient_email: string | null
          patient_id: string | null
          patient_name: string | null
          patient_user_id: string | null
          program_variant: Database["public"]["Enums"]["program_variant"] | null
          progress_id: string | null
          status: Database["public"]["Enums"]["week_status"] | null
          tongue_on_spot_pct: number | null
          week_id: string | null
          week_number: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_week_progress_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_assigned_therapist_id_fkey"
            columns: ["assigned_therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_user_id_fkey"
            columns: ["patient_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calc_week_progress: {
        Args: { _patient_id: string; _week_id: string }
        Returns: Json
      }
      get_adherence_metrics: {
        Args: {
          _end_date?: string
          _patient_ids?: string[]
          _program_variant?: Database["public"]["Enums"]["program_variant"]
          _start_date?: string
          _therapist_id?: string
        }
        Returns: {
          avg_nasal_pct: number
          avg_tongue_pct: number
          completed_count: number
          total_patients: number
          week_number: number
        }[]
      }
      get_bolt_trends: {
        Args: {
          _end_date?: string
          _patient_ids?: string[]
          _start_date?: string
          _therapist_id?: string
        }
        Returns: {
          avg_bolt: number
          max_bolt: number
          min_bolt: number
          sample_count: number
          week_number: number
        }[]
      }
      get_week_status_distribution: {
        Args: {
          _end_date?: string
          _patient_ids?: string[]
          _start_date?: string
          _therapist_id?: string
        }
        Returns: {
          count: number
          status: Database["public"]["Enums"]["week_status"]
        }[]
      }
    }
    Enums: {
      exercise_type: "active" | "passive" | "breathing" | "posture" | "test"
      patient_status: "active" | "inactive" | "completed"
      program_variant: "standard" | "frenectomy"
      upload_kind: "first_attempt" | "last_attempt" | "progress"
      user_role: "patient" | "therapist" | "admin" | "super_admin"
      week_status: "locked" | "open" | "submitted" | "approved" | "needs_more"
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
    Enums: {
      exercise_type: ["active", "passive", "breathing", "posture", "test"],
      patient_status: ["active", "inactive", "completed"],
      program_variant: ["standard", "frenectomy"],
      upload_kind: ["first_attempt", "last_attempt", "progress"],
      user_role: ["patient", "therapist", "admin", "super_admin"],
      week_status: ["locked", "open", "submitted", "approved", "needs_more"],
    },
  },
} as const
