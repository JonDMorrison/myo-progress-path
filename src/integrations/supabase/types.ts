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
      audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          target_id: string | null
          target_type: string
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          target_id?: string | null
          target_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          target_id?: string | null
          target_type?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "v_master_patient_list"
            referencedColumns: ["therapist_id"]
          },
        ]
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
          {
            foreignKeyName: "challenge_progress_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_master_patient_list"
            referencedColumns: ["patient_id"]
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
          {
            foreignKeyName: "challenges_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_master_patient_list"
            referencedColumns: ["clinic_id"]
          },
        ]
      }
      clinical_testing_feedback: {
        Row: {
          bugs_notes: string | null
          checklist_state: Json | null
          clinical_notes: string | null
          created_at: string | null
          id: string
          patient_notes: string | null
          tester_email: string | null
          tester_name: string | null
          therapist_notes: string | null
          updated_at: string | null
        }
        Insert: {
          bugs_notes?: string | null
          checklist_state?: Json | null
          clinical_notes?: string | null
          created_at?: string | null
          id?: string
          patient_notes?: string | null
          tester_email?: string | null
          tester_name?: string | null
          therapist_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          bugs_notes?: string | null
          checklist_state?: Json | null
          clinical_notes?: string | null
          created_at?: string | null
          id?: string
          patient_notes?: string | null
          tester_email?: string | null
          tester_name?: string | null
          therapist_notes?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
          {
            foreignKeyName: "earned_badges_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_master_patient_list"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      email_log: {
        Row: {
          email: string
          error_message: string | null
          id: number
          metadata: Json | null
          provider_id: string | null
          sent_at: string
          status: string
          template_name: string
          user_id: string | null
        }
        Insert: {
          email: string
          error_message?: string | null
          id?: number
          metadata?: Json | null
          provider_id?: string | null
          sent_at?: string
          status: string
          template_name: string
          user_id?: string | null
        }
        Update: {
          email?: string
          error_message?: string | null
          id?: number
          metadata?: Json | null
          provider_id?: string | null
          sent_at?: string
          status?: string
          template_name?: string
          user_id?: string | null
        }
        Relationships: []
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
          {
            foreignKeyName: "events_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_master_patient_list"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      exercises: {
        Row: {
          admin_notes: string | null
          compensations: string | null
          completion_target: number | null
          demo_video_url: string | null
          duration: string | null
          frequency: string | null
          id: string
          instructions: string | null
          media_approved: boolean | null
          media_status: Database["public"]["Enums"]["media_status"] | null
          media_waiting_on_clinician: boolean | null
          props: string | null
          requires_clinician_confirmation: boolean | null
          title: string
          type: Database["public"]["Enums"]["exercise_type"]
          week_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          compensations?: string | null
          completion_target?: number | null
          demo_video_url?: string | null
          duration?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          media_approved?: boolean | null
          media_status?: Database["public"]["Enums"]["media_status"] | null
          media_waiting_on_clinician?: boolean | null
          props?: string | null
          requires_clinician_confirmation?: boolean | null
          title: string
          type: Database["public"]["Enums"]["exercise_type"]
          week_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          compensations?: string | null
          completion_target?: number | null
          demo_video_url?: string | null
          duration?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          media_approved?: boolean | null
          media_status?: Database["public"]["Enums"]["media_status"] | null
          media_waiting_on_clinician?: boolean | null
          props?: string | null
          requires_clinician_confirmation?: boolean | null
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
            foreignKeyName: "gamification_stats_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_master_patient_list"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "gamification_stats_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gamification_stats_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "v_master_patient_list"
            referencedColumns: ["patient_id"]
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
            foreignKeyName: "messages_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_master_patient_list"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "messages_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "v_master_patient_list"
            referencedColumns: ["therapist_id"]
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
          {
            foreignKeyName: "notifications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_master_patient_list"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      onboarding_progress: {
        Row: {
          completed_at: string | null
          completed_steps: Json | null
          created_at: string | null
          current_step: string | null
          patient_id: string
          skipped: boolean | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_steps?: Json | null
          created_at?: string | null
          current_step?: string | null
          patient_id: string
          skipped?: boolean | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_steps?: Json | null
          created_at?: string | null
          current_step?: string | null
          patient_id?: string
          skipped?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_progress_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_progress_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "v_master_patient_list"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      patient_week_progress: {
        Row: {
          ai_summary: string | null
          bolt_score: number | null
          completed_at: string | null
          exercise_completions: Json | null
          frenectomy_consult_booked: boolean | null
          id: string
          introduction_viewed: boolean | null
          nasal_breathing_pct: number | null
          patient_id: string | null
          reviewing_by: string | null
          reviewing_since: string | null
          status: Database["public"]["Enums"]["week_status"] | null
          tongue_on_spot_pct: number | null
          week_id: string | null
        }
        Insert: {
          ai_summary?: string | null
          bolt_score?: number | null
          completed_at?: string | null
          exercise_completions?: Json | null
          frenectomy_consult_booked?: boolean | null
          id?: string
          introduction_viewed?: boolean | null
          nasal_breathing_pct?: number | null
          patient_id?: string | null
          reviewing_by?: string | null
          reviewing_since?: string | null
          status?: Database["public"]["Enums"]["week_status"] | null
          tongue_on_spot_pct?: number | null
          week_id?: string | null
        }
        Update: {
          ai_summary?: string | null
          bolt_score?: number | null
          completed_at?: string | null
          exercise_completions?: Json | null
          frenectomy_consult_booked?: boolean | null
          id?: string
          introduction_viewed?: boolean | null
          nasal_breathing_pct?: number | null
          patient_id?: string | null
          reviewing_by?: string | null
          reviewing_since?: string | null
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
            foreignKeyName: "patient_week_progress_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_master_patient_list"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "patient_week_progress_reviewing_by_fkey"
            columns: ["reviewing_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_week_progress_reviewing_by_fkey"
            columns: ["reviewing_by"]
            isOneToOne: false
            referencedRelation: "v_master_patient_list"
            referencedColumns: ["therapist_id"]
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
          user_id: string
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
          user_id: string
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
          user_id?: string
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
            foreignKeyName: "patients_assigned_therapist_id_fkey"
            columns: ["assigned_therapist_id"]
            isOneToOne: false
            referencedRelation: "v_master_patient_list"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "v_master_patient_list"
            referencedColumns: ["clinic_id"]
          },
          {
            foreignKeyName: "patients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_master_patient_list"
            referencedColumns: ["therapist_id"]
          },
        ]
      }
      prelaunch_audit_log: {
        Row: {
          auditor_id: string | null
          created_at: string
          id: number
          results: Json
          status: string
          summary: string
        }
        Insert: {
          auditor_id?: string | null
          created_at?: string
          id?: number
          results: Json
          status: string
          summary: string
        }
        Update: {
          auditor_id?: string | null
          created_at?: string
          id?: number
          results?: Json
          status?: string
          summary?: string
        }
        Relationships: []
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
          ai_feedback_status:
            | Database["public"]["Enums"]["ai_feedback_status"]
            | null
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
          ai_feedback_status?:
            | Database["public"]["Enums"]["ai_feedback_status"]
            | null
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
          ai_feedback_status?:
            | Database["public"]["Enums"]["ai_feedback_status"]
            | null
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
            foreignKeyName: "uploads_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_master_patient_list"
            referencedColumns: ["patient_id"]
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
          mfa_enabled: boolean | null
          mfa_enforced_at: string | null
          name: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          leaderboard_opt_out?: boolean | null
          mfa_enabled?: boolean | null
          mfa_enforced_at?: string | null
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          leaderboard_opt_out?: boolean | null
          mfa_enabled?: boolean | null
          mfa_enforced_at?: string | null
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      weeks: {
        Row: {
          checklist_schema: Json | null
          id: string
          introduction: string | null
          notes: string | null
          number: number
          objectives: Json | null
          overview: string | null
          program_id: string | null
          requires_bolt: boolean | null
          requires_video_first: boolean | null
          requires_video_last: boolean | null
          title: string | null
          video_title: string | null
          video_url: string | null
        }
        Insert: {
          checklist_schema?: Json | null
          id?: string
          introduction?: string | null
          notes?: string | null
          number: number
          objectives?: Json | null
          overview?: string | null
          program_id?: string | null
          requires_bolt?: boolean | null
          requires_video_first?: boolean | null
          requires_video_last?: boolean | null
          title?: string | null
          video_title?: string | null
          video_url?: string | null
        }
        Update: {
          checklist_schema?: Json | null
          id?: string
          introduction?: string | null
          notes?: string | null
          number?: number
          objectives?: Json | null
          overview?: string | null
          program_id?: string | null
          requires_bolt?: boolean | null
          requires_video_first?: boolean | null
          requires_video_last?: boolean | null
          title?: string | null
          video_title?: string | null
          video_url?: string | null
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
      v_master_patient_list: {
        Row: {
          adherence_14d: number | null
          clinic_id: string | null
          clinic_name: string | null
          current_week_number: number | null
          current_week_status: Database["public"]["Enums"]["week_status"] | null
          enrolled_at: string | null
          last_activity: string | null
          patient_email: string | null
          patient_id: string | null
          patient_name: string | null
          patient_status: Database["public"]["Enums"]["patient_status"] | null
          program_variant: Database["public"]["Enums"]["program_variant"] | null
          therapist_email: string | null
          therapist_id: string | null
          therapist_name: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_master_patient_list"
            referencedColumns: ["therapist_id"]
          },
        ]
      }
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
            foreignKeyName: "patient_week_progress_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_master_patient_list"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "patients_assigned_therapist_id_fkey"
            columns: ["assigned_therapist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_assigned_therapist_id_fkey"
            columns: ["assigned_therapist_id"]
            isOneToOne: false
            referencedRelation: "v_master_patient_list"
            referencedColumns: ["therapist_id"]
          },
          {
            foreignKeyName: "patients_user_id_fkey"
            columns: ["patient_user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_user_id_fkey"
            columns: ["patient_user_id"]
            isOneToOne: true
            referencedRelation: "v_master_patient_list"
            referencedColumns: ["therapist_id"]
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
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
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
      is_own_patient_record: { Args: { _patient_id: string }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      release_stale_review_locks: { Args: never; Returns: undefined }
    }
    Enums: {
      ai_feedback_status: "pending" | "complete" | "error"
      exercise_type: "active" | "passive" | "breathing" | "posture" | "test"
      media_status:
        | "has_video"
        | "needs_ai_video"
        | "needs_photo"
        | "description_only"
        | "pending"
      patient_status: "active" | "inactive" | "completed"
      program_variant: "standard" | "frenectomy" | "non_frenectomy"
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
      ai_feedback_status: ["pending", "complete", "error"],
      exercise_type: ["active", "passive", "breathing", "posture", "test"],
      media_status: [
        "has_video",
        "needs_ai_video",
        "needs_photo",
        "description_only",
        "pending",
      ],
      patient_status: ["active", "inactive", "completed"],
      program_variant: ["standard", "frenectomy", "non_frenectomy"],
      upload_kind: ["first_attempt", "last_attempt", "progress"],
      user_role: ["patient", "therapist", "admin", "super_admin"],
      week_status: ["locked", "open", "submitted", "approved", "needs_more"],
    },
  },
} as const
