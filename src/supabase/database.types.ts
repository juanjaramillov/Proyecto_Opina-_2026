export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      access_gate_tokens: {
        Row: {
          code_hash: string
          created_at: string
          expires_at: string | null
          first_used_at: string | null
          id: string
          is_active: boolean
          label: string | null
          last_used_at: string | null
          uses_count: number
        }
        Insert: {
          code_hash: string
          created_at?: string
          expires_at?: string | null
          first_used_at?: string | null
          id?: string
          is_active?: boolean
          label?: string | null
          last_used_at?: string | null
          uses_count?: number
        }
        Update: {
          code_hash?: string
          created_at?: string
          expires_at?: string | null
          first_used_at?: string | null
          id?: string
          is_active?: boolean
          label?: string | null
          last_used_at?: string | null
          uses_count?: number
        }
        Relationships: []
      }
      algorithm_versions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          recency_half_life_days: number
          trust_multiplier_enabled: boolean | null
          verification_multiplier: number
          version_name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          recency_half_life_days?: number
          trust_multiplier_enabled?: boolean | null
          verification_multiplier?: number
          version_name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          recency_half_life_days?: number
          trust_multiplier_enabled?: boolean | null
          verification_multiplier?: number
          version_name?: string
        }
        Relationships: []
      }
      anonymous_identities: {
        Row: {
          anon_id: string
          created_at: string | null
          last_active_at: string | null
          total_interactions: number | null
          total_sessions: number | null
          total_time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          anon_id: string
          created_at?: string | null
          last_active_at?: string | null
          total_interactions?: number | null
          total_sessions?: number | null
          total_time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          anon_id?: string
          created_at?: string | null
          last_active_at?: string | null
          total_interactions?: number | null
          total_sessions?: number | null
          total_time_spent_seconds?: number | null
          user_id?: string
        }
        Relationships: []
      }
      antifraud_flags: {
        Row: {
          banned: boolean
          banned_at: string | null
          banned_reason: string | null
          created_at: string
          details: Json
          device_hash: string
          flag_type: string
          id: string
          is_active: boolean
          severity: string
          updated_at: string
        }
        Insert: {
          banned?: boolean
          banned_at?: string | null
          banned_reason?: string | null
          created_at?: string
          details?: Json
          device_hash: string
          flag_type: string
          id?: string
          is_active?: boolean
          severity?: string
          updated_at?: string
        }
        Update: {
          banned?: boolean
          banned_at?: string | null
          banned_reason?: string | null
          created_at?: string
          details?: Json
          device_hash?: string
          flag_type?: string
          id?: string
          is_active?: boolean
          severity?: string
          updated_at?: string
        }
        Relationships: []
      }
      api_clients: {
        Row: {
          active: boolean | null
          api_key: string
          client_name: string
          created_at: string | null
          id: string
          plan_id: string | null
          request_limit: number | null
          requests_used: number | null
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          api_key: string
          client_name: string
          created_at?: string | null
          id?: string
          plan_id?: string | null
          request_limit?: number | null
          requests_used?: number | null
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          api_key?: string
          client_name?: string
          created_at?: string | null
          id?: string
          plan_id?: string | null
          request_limit?: number | null
          requests_used?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_clients_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      api_usage_logs: {
        Row: {
          client_id: string | null
          created_at: string | null
          endpoint: string | null
          id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          endpoint?: string | null
          id?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          endpoint?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "api_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      app_config: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      app_events: {
        Row: {
          anon_id: string | null
          app_version: string | null
          client_event_id: string | null
          context: Json
          created_at: string
          event_name: string
          id: string
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          anon_id?: string | null
          app_version?: string | null
          client_event_id?: string | null
          context?: Json
          created_at?: string
          event_name: string
          id?: string
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          anon_id?: string | null
          app_version?: string | null
          client_event_id?: string | null
          context?: Json
          created_at?: string
          event_name?: string
          id?: string
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      battle_instances: {
        Row: {
          battle_id: string
          context: Json | null
          created_at: string | null
          ends_at: string | null
          id: string
          starts_at: string | null
          version: number | null
        }
        Insert: {
          battle_id: string
          context?: Json | null
          created_at?: string | null
          ends_at?: string | null
          id?: string
          starts_at?: string | null
          version?: number | null
        }
        Update: {
          battle_id?: string
          context?: Json | null
          created_at?: string | null
          ends_at?: string | null
          id?: string
          starts_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "battle_instances_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "battles"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_options: {
        Row: {
          battle_id: string
          brand_domain: string | null
          brand_id: string | null
          created_at: string | null
          id: string
          image_url: string | null
          label: string
          sort_order: number | null
        }
        Insert: {
          battle_id: string
          brand_domain?: string | null
          brand_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          label: string
          sort_order?: number | null
        }
        Update: {
          battle_id?: string
          brand_domain?: string | null
          brand_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          label?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "battle_options_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_options_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      battles: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          slug: string | null
          status: string | null
          title: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          slug?: string | null
          status?: string | null
          title: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          slug?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "battles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          cover_url: string | null
          created_at: string | null
          emoji: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string | null
          emoji?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string | null
          emoji?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      category_attributes: {
        Row: {
          category: string
          created_at: string
          id: string
          is_active: boolean
          key: string
          label: string
          scale_max: number
          scale_min: number
          sort_order: number
          vertical: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_active?: boolean
          key: string
          label: string
          scale_max?: number
          scale_min?: number
          sort_order?: number
          vertical: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          scale_max?: number
          scale_min?: number
          sort_order?: number
          vertical?: string
        }
        Relationships: []
      }
      category_daily_aggregates: {
        Row: {
          age_bucket: string | null
          category_slug: string
          day: string
          gender: string | null
          id: string
          last_refreshed_at: string
          opinascore_sum: number
          region: string | null
          signals_count: number
          unique_users: number
          weight_sum: number
        }
        Insert: {
          age_bucket?: string | null
          category_slug: string
          day: string
          gender?: string | null
          id?: string
          last_refreshed_at?: string
          opinascore_sum?: number
          region?: string | null
          signals_count?: number
          unique_users?: number
          weight_sum?: number
        }
        Update: {
          age_bucket?: string | null
          category_slug?: string
          day?: string
          gender?: string | null
          id?: string
          last_refreshed_at?: string
          opinascore_sum?: number
          region?: string | null
          signals_count?: number
          unique_users?: number
          weight_sum?: number
        }
        Relationships: []
      }
      depth_aggregates: {
        Row: {
          age_range: string | null
          average_score: number | null
          battle_slug: string
          commune: string | null
          gender: string | null
          id: string
          option_id: string
          organization_id: string | null
          question_id: string
          snapshot_at: string | null
          total_responses: number | null
        }
        Insert: {
          age_range?: string | null
          average_score?: number | null
          battle_slug: string
          commune?: string | null
          gender?: string | null
          id?: string
          option_id: string
          organization_id?: string | null
          question_id: string
          snapshot_at?: string | null
          total_responses?: number | null
        }
        Update: {
          age_range?: string | null
          average_score?: number | null
          battle_slug?: string
          commune?: string | null
          gender?: string | null
          id?: string
          option_id?: string
          organization_id?: string | null
          question_id?: string
          snapshot_at?: string | null
          total_responses?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "depth_aggregates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      depth_definitions: {
        Row: {
          category_slug: string | null
          created_at: string | null
          entity_id: string | null
          id: string
          is_required: boolean | null
          options: Json | null
          position: number | null
          question_key: string
          question_text: string
          question_type: string | null
        }
        Insert: {
          category_slug?: string | null
          created_at?: string | null
          entity_id?: string | null
          id?: string
          is_required?: boolean | null
          options?: Json | null
          position?: number | null
          question_key: string
          question_text: string
          question_type?: string | null
        }
        Update: {
          category_slug?: string | null
          created_at?: string | null
          entity_id?: string | null
          id?: string
          is_required?: boolean | null
          options?: Json | null
          position?: number | null
          question_key?: string
          question_text?: string
          question_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "depth_definitions_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      entities: {
        Row: {
          category: string | null
          city: string | null
          country_code: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          logo_path: string | null
          metadata: Json | null
          name: string
          slug: string
          sort_order: number | null
          type: string
          updated_at: string | null
          vertical: string | null
        }
        Insert: {
          category?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          logo_path?: string | null
          metadata?: Json | null
          name: string
          slug: string
          sort_order?: number | null
          type: string
          updated_at?: string | null
          vertical?: string | null
        }
        Update: {
          category?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          logo_path?: string | null
          metadata?: Json | null
          name?: string
          slug?: string
          sort_order?: number | null
          type?: string
          updated_at?: string | null
          vertical?: string | null
        }
        Relationships: []
      }
      entity_daily_aggregates: {
        Row: {
          age_bucket: string | null
          category_slug: string | null
          day: string
          depth_nota_avg: number | null
          depth_nota_n: number
          entity_id: string
          gender: string | null
          id: string
          last_refreshed_at: string
          opinascore_sum: number
          region: string | null
          signals_count: number
          unique_users: number
          weight_sum: number
        }
        Insert: {
          age_bucket?: string | null
          category_slug?: string | null
          day: string
          depth_nota_avg?: number | null
          depth_nota_n?: number
          entity_id: string
          gender?: string | null
          id?: string
          last_refreshed_at?: string
          opinascore_sum?: number
          region?: string | null
          signals_count?: number
          unique_users?: number
          weight_sum?: number
        }
        Update: {
          age_bucket?: string | null
          category_slug?: string | null
          day?: string
          depth_nota_avg?: number | null
          depth_nota_n?: number
          entity_id?: string
          gender?: string | null
          id?: string
          last_refreshed_at?: string
          opinascore_sum?: number
          region?: string | null
          signals_count?: number
          unique_users?: number
          weight_sum?: number
        }
        Relationships: [
          {
            foreignKeyName: "entity_daily_aggregates_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_rank_snapshots: {
        Row: {
          algorithm_version: string | null
          category_slug: string
          composite_index: number | null
          entity_id: string | null
          id: string
          preference_score: number | null
          quality_score: number | null
          segment_id: string | null
          snapshot_date: string | null
        }
        Insert: {
          algorithm_version?: string | null
          category_slug: string
          composite_index?: number | null
          entity_id?: string | null
          id?: string
          preference_score?: number | null
          quality_score?: number | null
          segment_id?: string | null
          snapshot_date?: string | null
        }
        Update: {
          algorithm_version?: string | null
          category_slug?: string
          composite_index?: number | null
          entity_id?: string | null
          id?: string
          preference_score?: number | null
          quality_score?: number | null
          segment_id?: string | null
          snapshot_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entity_rank_snapshots_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      executive_reports: {
        Row: {
          battle_slug: string | null
          generated_at: string | null
          generated_for: string | null
          id: string
          report_data: Json | null
          report_period_days: number | null
          report_type: string | null
        }
        Insert: {
          battle_slug?: string | null
          generated_at?: string | null
          generated_for?: string | null
          id?: string
          report_data?: Json | null
          report_period_days?: number | null
          report_type?: string | null
        }
        Update: {
          battle_slug?: string | null
          generated_at?: string | null
          generated_for?: string | null
          id?: string
          report_data?: Json | null
          report_period_days?: number | null
          report_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "executive_reports_generated_for_fkey"
            columns: ["generated_for"]
            isOneToOne: false
            referencedRelation: "api_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_codes: {
        Row: {
          assigned_alias: string | null
          claimed_at: string | null
          claimed_by: string | null
          code: string
          created_at: string | null
          created_by: string | null
          current_uses: number | null
          expires_at: string | null
          id: string
          issued_to_label: string | null
          max_uses: number | null
          status: string | null
          used_at: string | null
          used_by_user_id: string | null
        }
        Insert: {
          assigned_alias?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          code: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          issued_to_label?: string | null
          max_uses?: number | null
          status?: string | null
          used_at?: string | null
          used_by_user_id?: string | null
        }
        Update: {
          assigned_alias?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          issued_to_label?: string | null
          max_uses?: number | null
          status?: string | null
          used_at?: string | null
          used_by_user_id?: string | null
        }
        Relationships: []
      }
      invite_redemptions: {
        Row: {
          anon_id: string | null
          app_version: string | null
          created_at: string
          id: string
          invite_code_entered: string
          invite_id: string | null
          nickname: string | null
          result: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          anon_id?: string | null
          app_version?: string | null
          created_at?: string
          id?: string
          invite_code_entered: string
          invite_id?: string | null
          nickname?: string | null
          result: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          anon_id?: string | null
          app_version?: string | null
          created_at?: string
          id?: string
          invite_code_entered?: string
          invite_id?: string | null
          nickname?: string | null
          result?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invite_redemptions_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "invitation_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      module_interest_events: {
        Row: {
          anon_id: string | null
          client_event_id: string
          created_at: string
          device_hash: string | null
          event_type: string
          id: number
          metadata: Json
          module_key: string
          user_id: string | null
        }
        Insert: {
          anon_id?: string | null
          client_event_id?: string
          created_at?: string
          device_hash?: string | null
          event_type?: string
          id?: number
          metadata?: Json
          module_key: string
          user_id?: string | null
        }
        Update: {
          anon_id?: string | null
          client_event_id?: string
          created_at?: string
          device_hash?: string | null
          event_type?: string
          id?: number
          metadata?: Json
          module_key?: string
          user_id?: string | null
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          created_at: string | null
          org_id: string
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          org_id: string
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          org_id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          settings: Json | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      platform_alerts: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          severity: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          severity: string
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          severity?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      profile_history: {
        Row: {
          changed_at: string | null
          field_changed: string
          id: string
          new_value: string | null
          old_value: string | null
          user_id: string | null
        }
        Insert: {
          changed_at?: string | null
          field_changed: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          user_id?: string | null
        }
        Update: {
          changed_at?: string | null
          field_changed?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles_legacy_20260223: {
        Row: {
          age: number | null
          avatar_url: string | null
          brand_affinity: string | null
          civil_status: string | null
          clinical_attention_12m: boolean | null
          commune: string | null
          country: string | null
          display_name: string | null
          education: string | null
          full_name: string | null
          gender: string | null
          has_ci: boolean | null
          health_system: string | null
          household_size: string | null
          id: string
          identity_verified: boolean | null
          identity_verified_at: string | null
          income: string | null
          interest: string | null
          last_demographic_update: string | null
          occupation: string | null
          points: number | null
          politics_interest: string | null
          profile_completed: boolean | null
          profile_completeness: number | null
          region: string | null
          role: string | null
          shopping_preference: string | null
          social_media: string | null
          tier: string | null
          updated_at: string | null
          username: string | null
          voting_frequency: string | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          brand_affinity?: string | null
          civil_status?: string | null
          clinical_attention_12m?: boolean | null
          commune?: string | null
          country?: string | null
          display_name?: string | null
          education?: string | null
          full_name?: string | null
          gender?: string | null
          has_ci?: boolean | null
          health_system?: string | null
          household_size?: string | null
          id: string
          identity_verified?: boolean | null
          identity_verified_at?: string | null
          income?: string | null
          interest?: string | null
          last_demographic_update?: string | null
          occupation?: string | null
          points?: number | null
          politics_interest?: string | null
          profile_completed?: boolean | null
          profile_completeness?: number | null
          region?: string | null
          role?: string | null
          shopping_preference?: string | null
          social_media?: string | null
          tier?: string | null
          updated_at?: string | null
          username?: string | null
          voting_frequency?: string | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          brand_affinity?: string | null
          civil_status?: string | null
          clinical_attention_12m?: boolean | null
          commune?: string | null
          country?: string | null
          display_name?: string | null
          education?: string | null
          full_name?: string | null
          gender?: string | null
          has_ci?: boolean | null
          health_system?: string | null
          household_size?: string | null
          id?: string
          identity_verified?: boolean | null
          identity_verified_at?: string | null
          income?: string | null
          interest?: string | null
          last_demographic_update?: string | null
          occupation?: string | null
          points?: number | null
          politics_interest?: string | null
          profile_completed?: boolean | null
          profile_completeness?: number | null
          region?: string | null
          role?: string | null
          shopping_preference?: string | null
          social_media?: string | null
          tier?: string | null
          updated_at?: string | null
          username?: string | null
          voting_frequency?: string | null
        }
        Relationships: []
      }
      public_rank_snapshots: {
        Row: {
          attribute_id: string | null
          battle_id: string | null
          created_at: string | null
          id: string
          module_type: string
          option_id: string | null
          ranking: Json
          score: number | null
          segment: Json | null
          segment_filters: Json | null
          segment_hash: string
          signals_count: number | null
          snapshot_at: string | null
          snapshot_bucket: string | null
          total_signals: number | null
        }
        Insert: {
          attribute_id?: string | null
          battle_id?: string | null
          created_at?: string | null
          id?: string
          module_type?: string
          option_id?: string | null
          ranking: Json
          score?: number | null
          segment?: Json | null
          segment_filters?: Json | null
          segment_hash: string
          signals_count?: number | null
          snapshot_at?: string | null
          snapshot_bucket?: string | null
          total_signals?: number | null
        }
        Update: {
          attribute_id?: string | null
          battle_id?: string | null
          created_at?: string | null
          id?: string
          module_type?: string
          option_id?: string | null
          ranking?: Json
          score?: number | null
          segment?: Json | null
          segment_filters?: Json | null
          segment_hash?: string
          signals_count?: number | null
          snapshot_at?: string | null
          snapshot_bucket?: string | null
          total_signals?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "public_rank_snapshots_attribute_id_fkey"
            columns: ["attribute_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_rank_snapshots_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_rank_snapshots_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "battle_options"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_snapshots_legacy_20260223: {
        Row: {
          age_range: string | null
          algorithm_version_id: string | null
          battle_slug: string
          commune: string | null
          gender: string | null
          id: string
          option_id: string | null
          organization_id: string | null
          rank_position: number
          snapshot_at: string | null
          total_weight: number
        }
        Insert: {
          age_range?: string | null
          algorithm_version_id?: string | null
          battle_slug: string
          commune?: string | null
          gender?: string | null
          id?: string
          option_id?: string | null
          organization_id?: string | null
          rank_position: number
          snapshot_at?: string | null
          total_weight: number
        }
        Update: {
          age_range?: string | null
          algorithm_version_id?: string | null
          battle_slug?: string
          commune?: string | null
          gender?: string | null
          id?: string
          option_id?: string | null
          organization_id?: string | null
          rank_position?: number
          snapshot_at?: string | null
          total_weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "ranking_snapshots_algorithm_version_id_fkey"
            columns: ["algorithm_version_id"]
            isOneToOne: false
            referencedRelation: "algorithm_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_snapshots_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "battle_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_snapshots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rollup_state: {
        Row: {
          id: string
          last_event_ts: string
          updated_at: string
        }
        Insert: {
          id?: string
          last_event_ts?: string
          updated_at?: string
        }
        Update: {
          id?: string
          last_event_ts?: string
          updated_at?: string
        }
        Relationships: []
      }
      signal_events: {
        Row: {
          age_bucket: string | null
          algorithm_version: string | null
          algorithm_version_id: string | null
          anon_id: string
          attribute_id: string | null
          battle_id: string | null
          battle_instance_id: string | null
          client_event_id: string | null
          commune: string | null
          computed_weight: number | null
          context_id: string | null
          country: string | null
          created_at: string
          device_hash: string | null
          entity_id: string | null
          entity_type: string | null
          gender: string | null
          id: string
          influence_level_snapshot: string | null
          meta: Json | null
          module_type: string | null
          opinascore: number | null
          option_id: string | null
          profile_completeness: number | null
          region: string | null
          session_id: string | null
          signal_id: string
          signal_weight: number | null
          user_id: string | null
          user_tier: string | null
          value_numeric: number | null
          value_text: string | null
        }
        Insert: {
          age_bucket?: string | null
          algorithm_version?: string | null
          algorithm_version_id?: string | null
          anon_id: string
          attribute_id?: string | null
          battle_id?: string | null
          battle_instance_id?: string | null
          client_event_id?: string | null
          commune?: string | null
          computed_weight?: number | null
          context_id?: string | null
          country?: string | null
          created_at?: string
          device_hash?: string | null
          entity_id?: string | null
          entity_type?: string | null
          gender?: string | null
          id?: string
          influence_level_snapshot?: string | null
          meta?: Json | null
          module_type?: string | null
          opinascore?: number | null
          option_id?: string | null
          profile_completeness?: number | null
          region?: string | null
          session_id?: string | null
          signal_id: string
          signal_weight?: number | null
          user_id?: string | null
          user_tier?: string | null
          value_numeric?: number | null
          value_text?: string | null
        }
        Update: {
          age_bucket?: string | null
          algorithm_version?: string | null
          algorithm_version_id?: string | null
          anon_id?: string
          attribute_id?: string | null
          battle_id?: string | null
          battle_instance_id?: string | null
          client_event_id?: string | null
          commune?: string | null
          computed_weight?: number | null
          context_id?: string | null
          country?: string | null
          created_at?: string
          device_hash?: string | null
          entity_id?: string | null
          entity_type?: string | null
          gender?: string | null
          id?: string
          influence_level_snapshot?: string | null
          meta?: Json | null
          module_type?: string | null
          opinascore?: number | null
          option_id?: string | null
          profile_completeness?: number | null
          region?: string | null
          session_id?: string | null
          signal_id?: string
          signal_weight?: number | null
          user_id?: string | null
          user_tier?: string | null
          value_numeric?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signal_events_algorithm_version_id_fkey"
            columns: ["algorithm_version_id"]
            isOneToOne: false
            referencedRelation: "algorithm_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signal_events_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signal_events_battle_instance_id_fkey"
            columns: ["battle_instance_id"]
            isOneToOne: false
            referencedRelation: "battle_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signal_events_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "battle_options"
            referencedColumns: ["id"]
          },
        ]
      }
      signal_hourly_aggs: {
        Row: {
          age_bucket: string | null
          battle_id: string | null
          battle_instance_id: string | null
          gender: string | null
          hour_bucket: string
          id: string
          option_id: string | null
          region: string | null
          signals_count: number | null
          weighted_sum: number | null
        }
        Insert: {
          age_bucket?: string | null
          battle_id?: string | null
          battle_instance_id?: string | null
          gender?: string | null
          hour_bucket: string
          id?: string
          option_id?: string | null
          region?: string | null
          signals_count?: number | null
          weighted_sum?: number | null
        }
        Update: {
          age_bucket?: string | null
          battle_id?: string | null
          battle_instance_id?: string | null
          gender?: string | null
          hour_bucket?: string
          id?: string
          option_id?: string | null
          region?: string | null
          signals_count?: number | null
          weighted_sum?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "signal_hourly_aggs_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signal_hourly_aggs_battle_instance_id_fkey"
            columns: ["battle_instance_id"]
            isOneToOne: false
            referencedRelation: "battle_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signal_hourly_aggs_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "battle_options"
            referencedColumns: ["id"]
          },
        ]
      }
      signal_rollups_hourly: {
        Row: {
          age_bucket: string
          battle_id: string
          bucket_ts: string
          created_at: string
          gender: string
          module_type: string
          option_id: string
          region: string
          signals_count: number
          updated_at: string
          weight_sum: number
        }
        Insert: {
          age_bucket: string
          battle_id: string
          bucket_ts: string
          created_at?: string
          gender: string
          module_type: string
          option_id: string
          region: string
          signals_count?: number
          updated_at?: string
          weight_sum?: number
        }
        Update: {
          age_bucket?: string
          battle_id?: string
          bucket_ts?: string
          created_at?: string
          gender?: string
          module_type?: string
          option_id?: string
          region?: string
          signals_count?: number
          updated_at?: string
          weight_sum?: number
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          features: Json | null
          id: string
          monthly_price: number
          plan_name: string
          request_limit: number
        }
        Insert: {
          created_at?: string | null
          features?: Json | null
          id?: string
          monthly_price: number
          plan_name: string
          request_limit: number
        }
        Update: {
          created_at?: string | null
          features?: Json | null
          id?: string
          monthly_price?: number
          plan_name?: string
          request_limit?: number
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_daily_metrics: {
        Row: {
          anon_id: string | null
          created_at: string
          id: string
          interactions: number
          metric_date: string
          sessions: number
          time_spent_seconds: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          anon_id?: string | null
          created_at?: string
          id?: string
          interactions?: number
          metric_date?: string
          sessions?: number
          time_spent_seconds?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          anon_id?: string | null
          created_at?: string
          id?: string
          interactions?: number
          metric_date?: string
          sessions?: number
          time_spent_seconds?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_daily_metrics_anon_id_fkey"
            columns: ["anon_id"]
            isOneToOne: false
            referencedRelation: "anonymous_identities"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_daily_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          age_bucket: string | null
          birth_year: number | null
          comuna: string | null
          created_at: string
          education: string | null
          education_level: string | null
          employment_status: string | null
          gender: string | null
          housing_type: string | null
          income_range: string | null
          influence_level: string | null
          last_demographics_update: string | null
          nickname: string
          profile_completeness: number | null
          profile_stage: number | null
          purchase_behavior: string | null
          region: string | null
          signal_weight: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age_bucket?: string | null
          birth_year?: number | null
          comuna?: string | null
          created_at?: string
          education?: string | null
          education_level?: string | null
          employment_status?: string | null
          gender?: string | null
          housing_type?: string | null
          income_range?: string | null
          influence_level?: string | null
          last_demographics_update?: string | null
          nickname: string
          profile_completeness?: number | null
          profile_stage?: number | null
          purchase_behavior?: string | null
          region?: string | null
          signal_weight?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age_bucket?: string | null
          birth_year?: number | null
          comuna?: string | null
          created_at?: string
          education?: string | null
          education_level?: string | null
          employment_status?: string | null
          gender?: string | null
          housing_type?: string | null
          income_range?: string | null
          influence_level?: string | null
          last_demographics_update?: string | null
          nickname?: string
          profile_completeness?: number | null
          profile_stage?: number | null
          purchase_behavior?: string | null
          region?: string | null
          signal_weight?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_state_logs: {
        Row: {
          age_bucket: string | null
          anon_id: string
          created_at: string
          economic_score: number | null
          gender: string | null
          happiness_score: number | null
          id: string
          job_score: number | null
          mood_score: number | null
          region: string | null
        }
        Insert: {
          age_bucket?: string | null
          anon_id: string
          created_at?: string
          economic_score?: number | null
          gender?: string | null
          happiness_score?: number | null
          id?: string
          job_score?: number | null
          mood_score?: number | null
          region?: string | null
        }
        Update: {
          age_bucket?: string | null
          anon_id?: string
          created_at?: string
          economic_score?: number | null
          gender?: string | null
          happiness_score?: number | null
          id?: string
          job_score?: number | null
          mood_score?: number | null
          region?: string | null
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          created_at: string | null
          last_signal_at: string | null
          level: number | null
          signal_weight: number | null
          suspicious_flag: boolean | null
          total_signals: number | null
          trust_score: number | null
          updated_at: string | null
          user_id: string
          weighted_score: number | null
        }
        Insert: {
          created_at?: string | null
          last_signal_at?: string | null
          level?: number | null
          signal_weight?: number | null
          suspicious_flag?: boolean | null
          total_signals?: number | null
          trust_score?: number | null
          updated_at?: string | null
          user_id: string
          weighted_score?: number | null
        }
        Update: {
          created_at?: string | null
          last_signal_at?: string | null
          level?: number | null
          signal_weight?: number | null
          suspicious_flag?: boolean | null
          total_signals?: number | null
          trust_score?: number | null
          updated_at?: string | null
          user_id?: string
          weighted_score?: number | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          invitation_code_id: string | null
          is_identity_verified: boolean
          last_active_at: string | null
          role: string
          total_interactions: number | null
          total_sessions: number | null
          total_time_spent_seconds: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          invitation_code_id?: string | null
          is_identity_verified?: boolean
          last_active_at?: string | null
          role?: string
          total_interactions?: number | null
          total_sessions?: number | null
          total_time_spent_seconds?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          invitation_code_id?: string | null
          is_identity_verified?: boolean
          last_active_at?: string | null
          role?: string
          total_interactions?: number | null
          total_sessions?: number | null
          total_time_spent_seconds?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      volatility_snapshots: {
        Row: {
          battle_slug: string
          classification: string
          id: string
          snapshot_at: string | null
          volatility_index: number
        }
        Insert: {
          battle_slug: string
          classification: string
          id?: string
          snapshot_at?: string | null
          volatility_index: number
        }
        Update: {
          battle_slug?: string
          classification?: string
          id?: string
          snapshot_at?: string | null
          volatility_index?: number
        }
        Relationships: []
      }
      whatsapp_inbound_messages: {
        Row: {
          body: string | null
          created_at: string
          id: string
          invite_id: string | null
          message_type: string | null
          raw: Json | null
          token_text: string | null
          wa_from: string | null
          wa_from_hash: string | null
          wa_message_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          invite_id?: string | null
          message_type?: string | null
          raw?: Json | null
          token_text?: string | null
          wa_from?: string | null
          wa_from_hash?: string | null
          wa_message_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          invite_id?: string | null
          message_type?: string | null
          raw?: Json | null
          token_text?: string | null
          wa_from?: string | null
          wa_from_hash?: string | null
          wa_message_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      kpi_activity: {
        Row: {
          dau: number | null
          mau: number | null
          wau: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_bucket: string | null
          comuna: string | null
          created_at: string | null
          education: string | null
          gender: string | null
          identity_verified: boolean | null
          invitation_code_id: string | null
          last_demographics_update: string | null
          nickname: string | null
          profile_completeness: number | null
          region: string | null
          role: string | null
          signal_weight: number | null
          updated_at: string | null
          user_id: string | null
          verified: boolean | null
        }
        Relationships: []
      }
      signal_events_analytics: {
        Row: {
          age_bucket: string | null
          algorithm_version: string | null
          algorithm_version_id: string | null
          anon_id: string | null
          attribute_id: string | null
          battle_id: string | null
          battle_instance_id: string | null
          client_event_id: string | null
          commune: string | null
          computed_weight: number | null
          context_id: string | null
          country: string | null
          created_at: string | null
          device_hash: string | null
          entity_id: string | null
          entity_type: string | null
          gender: string | null
          id: string | null
          influence_level_snapshot: string | null
          meta: Json | null
          module_type: string | null
          opinascore: number | null
          option_id: string | null
          profile_completeness: number | null
          region: string | null
          session_id: string | null
          signal_id: string | null
          signal_weight: number | null
          user_id: string | null
          user_tier: string | null
          value_numeric: number | null
          value_text: string | null
        }
        Insert: {
          age_bucket?: string | null
          algorithm_version?: string | null
          algorithm_version_id?: string | null
          anon_id?: string | null
          attribute_id?: string | null
          battle_id?: string | null
          battle_instance_id?: string | null
          client_event_id?: string | null
          commune?: string | null
          computed_weight?: number | null
          context_id?: string | null
          country?: string | null
          created_at?: string | null
          device_hash?: string | null
          entity_id?: string | null
          entity_type?: string | null
          gender?: string | null
          id?: string | null
          influence_level_snapshot?: string | null
          meta?: Json | null
          module_type?: string | null
          opinascore?: number | null
          option_id?: string | null
          profile_completeness?: number | null
          region?: string | null
          session_id?: string | null
          signal_id?: string | null
          signal_weight?: number | null
          user_id?: string | null
          user_tier?: string | null
          value_numeric?: number | null
          value_text?: string | null
        }
        Update: {
          age_bucket?: string | null
          algorithm_version?: string | null
          algorithm_version_id?: string | null
          anon_id?: string | null
          attribute_id?: string | null
          battle_id?: string | null
          battle_instance_id?: string | null
          client_event_id?: string | null
          commune?: string | null
          computed_weight?: number | null
          context_id?: string | null
          country?: string | null
          created_at?: string | null
          device_hash?: string | null
          entity_id?: string | null
          entity_type?: string | null
          gender?: string | null
          id?: string | null
          influence_level_snapshot?: string | null
          meta?: Json | null
          module_type?: string | null
          opinascore?: number | null
          option_id?: string | null
          profile_completeness?: number | null
          region?: string | null
          session_id?: string | null
          signal_id?: string | null
          signal_weight?: number | null
          user_id?: string | null
          user_tier?: string | null
          value_numeric?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signal_events_algorithm_version_id_fkey"
            columns: ["algorithm_version_id"]
            isOneToOne: false
            referencedRelation: "algorithm_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signal_events_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signal_events_battle_instance_id_fkey"
            columns: ["battle_instance_id"]
            isOneToOne: false
            referencedRelation: "battle_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signal_events_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "battle_options"
            referencedColumns: ["id"]
          },
        ]
      }
      signal_events_analytics_all: {
        Row: {
          age_bucket: string | null
          algorithm_version: string | null
          algorithm_version_id: string | null
          anon_id: string | null
          attribute_id: string | null
          battle_id: string | null
          battle_instance_id: string | null
          client_event_id: string | null
          commune: string | null
          computed_weight: number | null
          context_id: string | null
          country: string | null
          created_at: string | null
          device_hash: string | null
          entity_id: string | null
          entity_type: string | null
          gender: string | null
          id: string | null
          influence_level_snapshot: string | null
          meta: Json | null
          module_type: string | null
          opinascore: number | null
          option_id: string | null
          profile_completeness: number | null
          region: string | null
          session_id: string | null
          signal_id: string | null
          signal_weight: number | null
          user_id: string | null
          user_tier: string | null
          value_numeric: number | null
          value_text: string | null
        }
        Insert: {
          age_bucket?: string | null
          algorithm_version?: string | null
          algorithm_version_id?: string | null
          anon_id?: string | null
          attribute_id?: string | null
          battle_id?: string | null
          battle_instance_id?: string | null
          client_event_id?: string | null
          commune?: string | null
          computed_weight?: number | null
          context_id?: string | null
          country?: string | null
          created_at?: string | null
          device_hash?: string | null
          entity_id?: string | null
          entity_type?: string | null
          gender?: string | null
          id?: string | null
          influence_level_snapshot?: string | null
          meta?: Json | null
          module_type?: string | null
          opinascore?: number | null
          option_id?: string | null
          profile_completeness?: number | null
          region?: string | null
          session_id?: string | null
          signal_id?: string | null
          signal_weight?: number | null
          user_id?: string | null
          user_tier?: string | null
          value_numeric?: number | null
          value_text?: string | null
        }
        Update: {
          age_bucket?: string | null
          algorithm_version?: string | null
          algorithm_version_id?: string | null
          anon_id?: string | null
          attribute_id?: string | null
          battle_id?: string | null
          battle_instance_id?: string | null
          client_event_id?: string | null
          commune?: string | null
          computed_weight?: number | null
          context_id?: string | null
          country?: string | null
          created_at?: string | null
          device_hash?: string | null
          entity_id?: string | null
          entity_type?: string | null
          gender?: string | null
          id?: string | null
          influence_level_snapshot?: string | null
          meta?: Json | null
          module_type?: string | null
          opinascore?: number | null
          option_id?: string | null
          profile_completeness?: number | null
          region?: string | null
          session_id?: string | null
          signal_id?: string | null
          signal_weight?: number | null
          user_id?: string | null
          user_tier?: string | null
          value_numeric?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signal_events_algorithm_version_id_fkey"
            columns: ["algorithm_version_id"]
            isOneToOne: false
            referencedRelation: "algorithm_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signal_events_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signal_events_battle_instance_id_fkey"
            columns: ["battle_instance_id"]
            isOneToOne: false
            referencedRelation: "battle_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signal_events_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "battle_options"
            referencedColumns: ["id"]
          },
        ]
      }
      signal_events_analytics_clean: {
        Row: {
          age_bucket: string | null
          algorithm_version: string | null
          algorithm_version_id: string | null
          anon_id: string | null
          attribute_id: string | null
          battle_id: string | null
          battle_instance_id: string | null
          client_event_id: string | null
          commune: string | null
          computed_weight: number | null
          context_id: string | null
          country: string | null
          created_at: string | null
          device_hash: string | null
          entity_id: string | null
          entity_type: string | null
          gender: string | null
          id: string | null
          influence_level_snapshot: string | null
          meta: Json | null
          module_type: string | null
          opinascore: number | null
          option_id: string | null
          profile_completeness: number | null
          region: string | null
          session_id: string | null
          signal_id: string | null
          signal_weight: number | null
          user_id: string | null
          user_tier: string | null
          value_numeric: number | null
          value_text: string | null
        }
        Insert: {
          age_bucket?: string | null
          algorithm_version?: string | null
          algorithm_version_id?: string | null
          anon_id?: string | null
          attribute_id?: string | null
          battle_id?: string | null
          battle_instance_id?: string | null
          client_event_id?: string | null
          commune?: string | null
          computed_weight?: number | null
          context_id?: string | null
          country?: string | null
          created_at?: string | null
          device_hash?: string | null
          entity_id?: string | null
          entity_type?: string | null
          gender?: string | null
          id?: string | null
          influence_level_snapshot?: string | null
          meta?: Json | null
          module_type?: string | null
          opinascore?: number | null
          option_id?: string | null
          profile_completeness?: number | null
          region?: string | null
          session_id?: string | null
          signal_id?: string | null
          signal_weight?: number | null
          user_id?: string | null
          user_tier?: string | null
          value_numeric?: number | null
          value_text?: string | null
        }
        Update: {
          age_bucket?: string | null
          algorithm_version?: string | null
          algorithm_version_id?: string | null
          anon_id?: string | null
          attribute_id?: string | null
          battle_id?: string | null
          battle_instance_id?: string | null
          client_event_id?: string | null
          commune?: string | null
          computed_weight?: number | null
          context_id?: string | null
          country?: string | null
          created_at?: string | null
          device_hash?: string | null
          entity_id?: string | null
          entity_type?: string | null
          gender?: string | null
          id?: string | null
          influence_level_snapshot?: string | null
          meta?: Json | null
          module_type?: string | null
          opinascore?: number | null
          option_id?: string | null
          profile_completeness?: number | null
          region?: string | null
          session_id?: string | null
          signal_id?: string | null
          signal_weight?: number | null
          user_id?: string | null
          user_tier?: string | null
          value_numeric?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signal_events_algorithm_version_id_fkey"
            columns: ["algorithm_version_id"]
            isOneToOne: false
            referencedRelation: "algorithm_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signal_events_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signal_events_battle_instance_id_fkey"
            columns: ["battle_instance_id"]
            isOneToOne: false
            referencedRelation: "battle_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signal_events_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "battle_options"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      activate_algorithm_version: {
        Args: { p_version_id: string }
        Returns: undefined
      }
      admin_delete_invitation: {
        Args: { p_invite_id: string }
        Returns: undefined
      }
      admin_generate_invites: {
        Args: {
          p_assigned_aliases?: string[]
          p_count: number
          p_expires_at?: string
          p_prefix?: string
        }
        Returns: {
          assigned_alias: string
          code: string
          created_at: string
          expires_at: string
          id: string
          status: string
          used_at: string
          used_by_user_id: string
        }[]
      }
      admin_get_analytics_mode: { Args: never; Returns: string }
      admin_get_device_summary: {
        Args: { p_device_hash: string }
        Returns: Json
      }
      admin_list_antifraud_flags: {
        Args: { p_limit?: number }
        Returns: {
          banned: boolean
          banned_at: string
          banned_reason: string
          created_at: string
          details: Json
          device_hash: string
          flag_type: string
          id: string
          is_active: boolean
          severity: string
          updated_at: string
        }[]
      }
      admin_list_app_events: {
        Args: { p_limit?: number }
        Returns: {
          anon_id: string
          app_version: string
          client_event_id: string
          context: Json
          created_at: string
          event_name: string
          id: string
          severity: string
          user_id: string
        }[]
      }
      admin_list_invite_redemptions: {
        Args: { p_limit?: number }
        Returns: {
          anon_id: string
          app_version: string
          created_at: string
          id: string
          invite_code_entered: string
          invite_id: string
          nickname: string
          result: string
          user_agent: string
          user_id: string
        }[]
      }
      admin_list_invites: {
        Args: { p_limit?: number; p_timeframe?: string }
        Returns: {
          assigned_alias: string
          code: string
          created_at: string
          expires_at: string
          id: string
          last_active_at: string
          status: string
          total_interactions: number
          total_sessions: number
          total_time_spent_seconds: number
          used_at: string
          used_by_nickname: string
          used_by_user_id: string
        }[]
      }
      admin_modules_demand_segmented: {
        Args: { p_range_days: number; p_segment_dim: string }
        Returns: {
          clicks: number
          ctr: number
          module_slug: string
          segment_value: string
          views: number
        }[]
      }
      admin_modules_demand_summary: {
        Args: { p_range_days: number }
        Returns: {
          clicks: number
          ctr: number
          module_slug: string
          preview_type: string
          views: number
        }[]
      }
      admin_modules_top_filters: {
        Args: { p_range_days: number }
        Returns: {
          filter_key: string
          filter_value: string
          module_slug: string
          usage_count: number
        }[]
      }
      admin_revoke_invite: { Args: { p_code: string }; Returns: Json }
      admin_set_analytics_mode: { Args: { p_mode: string }; Returns: Json }
      admin_set_device_ban: {
        Args: { p_banned: boolean; p_device_hash: string; p_reason?: string }
        Returns: Json
      }
      admin_set_invitation_status: {
        Args: { p_invite_id: string; p_status: string }
        Returns: undefined
      }
      antifraud_auto_decay: { Args: never; Returns: undefined }
      api_get_ranking: {
        Args: { p_api_key: string; p_battle_slug: string }
        Returns: {
          option_id: string
          option_label: string
          rank_position: number
          snapshot_at: string
          total_weight: number
        }[]
      }
      b2b_list_rankings: {
        Args: {
          p_limit?: number
          p_module_type: string
          p_segment_hash?: string
          p_snapshot_bucket?: string
        }
        Returns: {
          battle_id: string
          battle_title: string
          module_type: string
          option_id: string
          option_label: string
          score: number
          segment: Json
          segment_hash: string
          signals_count: number
          snapshot_bucket: string
        }[]
      }
      bootstrap_user_after_signup: {
        Args: { p_invitation_code: string; p_nickname: string }
        Returns: Json
      }
      bootstrap_user_after_signup_v2: {
        Args: {
          p_app_version?: string
          p_invitation_code: string
          p_nickname: string
          p_user_agent?: string
        }
        Returns: Json
      }
      calculate_rank_snapshot: { Args: never; Returns: undefined }
      calculate_recency_factor: {
        Args: { p_created_at: string; p_half_life_days?: number }
        Returns: number
      }
      calculate_user_segment_comparison: {
        Args: { p_user_id: string }
        Returns: {
          avg_age: number
          avg_commune: number
          avg_gender: number
          avg_global: number
          coherence_level: string
          entity_id: string
          entity_name: string
          signals_count: number
          user_score: number
        }[]
      }
      claim_guest_activity: { Args: { p_anon_id: string }; Returns: undefined }
      consume_access_gate_code: {
        Args: { p_code: string }
        Returns: {
          token_id: string
        }[]
      }
      consume_invitation: { Args: { p_code: string }; Returns: undefined }
      count_daily_signal_actions: {
        Args: { p_anon_id: string }
        Returns: number
      }
      count_my_versus_signals: { Args: never; Returns: number }
      detect_antifraud_high_velocity: {
        Args: { p_window?: string }
        Returns: undefined
      }
      detect_antifraud_many_accounts: {
        Args: { p_window?: string }
        Returns: undefined
      }
      detect_early_signal: {
        Args: { p_battle_slug: string; p_hours_window?: number }
        Returns: {
          classification: string
          historical_avg: number
          momentum_ratio: number
          option_id: string
          option_label: string
          recent_score: number
        }[]
      }
      detect_signal_spike: { Args: { p_user: string }; Returns: boolean }
      explain_opinascore: {
        Args: { p_user_id: string }
        Returns: {
          base_weight: number
          current_recency_factor: number
          estimated_opinascore: number
          is_verified: boolean
          verification_multiplier: number
          version_name: string
        }[]
      }
      fn_ensure_entity_depth: {
        Args: { p_entity_id: string }
        Returns: undefined
      }
      generate_access_gate_codes: {
        Args: {
          p_count: number
          p_expires_days?: number
          p_label_prefix?: string
          p_prefix?: string
        }
        Returns: {
          code: string
          token_id: string
        }[]
      }
      generate_benchmark_report: {
        Args: { p_api_key: string; p_days_back?: number }
        Returns: Json
      }
      generate_depth_snapshot: { Args: never; Returns: undefined }
      generate_entity_rank_snapshots: {
        Args: { p_segment_id?: string }
        Returns: undefined
      }
      generate_entity_rank_snapshots_all: { Args: never; Returns: undefined }
      generate_executive_report: {
        Args: { p_api_key: string; p_battle_slug: string; p_days_back?: number }
        Returns: Json
      }
      generate_momentum_alerts: {
        Args: { p_battle_slug: string }
        Returns: undefined
      }
      generate_ranking_snapshot: { Args: never; Returns: undefined }
      generate_segmented_snapshot: { Args: never; Returns: undefined }
      get_active_battles: {
        Args: never
        Returns: {
          category: Json
          created_at: string
          description: string
          id: string
          options: Json
          slug: string
          title: string
        }[]
      }
      get_advanced_results: {
        Args: {
          p_age_bucket?: string
          p_category_slug: string
          p_gender?: string
          p_region?: string
        }
        Returns: {
          avg_quality: number
          entity_id: string
          entity_name: string
          gap_score: number
          preference_rate: number
          total_signals: number
        }[]
      }
      get_age_bucket: { Args: { p_age: number }; Returns: string }
      get_agg_last_refreshed_at: {
        Args: { p_category_slug?: string }
        Returns: string
      }
      get_analytics_mode: { Args: never; Returns: string }
      get_b2b_dashboard_data: { Args: never; Returns: Json }
      get_battle_momentum: { Args: { p_battle_id: string }; Returns: Json }
      get_battle_volatility: {
        Args: { p_battle_slug: string; p_days_back?: number }
        Returns: {
          classification: string
          volatility_index: number
          volatility_score: number
        }[]
      }
      get_category_overview_agg: {
        Args: {
          p_age_bucket?: string
          p_category_slug: string
          p_days?: number
          p_gender?: string
          p_region?: string
        }
        Returns: {
          depth_nota_avg: number
          entity_id: string
          entity_name: string
          image_url: string
          preference_score: number
          signals_count: number
          unique_users: number
        }[]
      }
      get_category_overview_live: {
        Args: {
          p_age_bucket?: string
          p_category_slug: string
          p_days?: number
          p_gender?: string
          p_region?: string
        }
        Returns: {
          depth_nota_avg: number
          entity_id: string
          entity_name: string
          image_url: string
          preference_score: number
          signals_count: number
          unique_users: number
        }[]
      }
      get_client_plan: {
        Args: { p_api_key: string }
        Returns: {
          features: Json
          monthly_price: number
          plan_name: string
          request_limit: number
          requests_used: number
        }[]
      }
      get_depth_analytics: {
        Args: {
          p_age_bucket?: string
          p_gender?: string
          p_option_id: string
          p_region?: string
        }
        Returns: {
          avg_value: number
          question_key: string
          total_responses: number
        }[]
      }
      get_depth_comparison: {
        Args: {
          p_age_bucket?: string
          p_gender?: string
          p_option_a: string
          p_option_b: string
          p_region?: string
        }
        Returns: {
          avg_value: number
          option_id: string
          question_key: string
          total_responses: number
        }[]
      }
      get_depth_distribution_values: {
        Args: { p_context_id?: string; p_option_id: string }
        Returns: {
          value_numeric: number
        }[]
      }
      get_depth_immediate_comparison: {
        Args: { p_question_id: string; p_segment_filter?: string }
        Returns: Json
      }
      get_depth_insights: {
        Args: {
          p_age_range?: string
          p_battle_slug: string
          p_commune?: string
          p_gender?: string
          p_option_id: string
        }
        Returns: {
          average_score: number
          question_id: string
          snapshot_at: string
          total_responses: number
        }[]
      }
      get_depth_trend: {
        Args: {
          p_age_bucket?: string
          p_bucket?: string
          p_gender?: string
          p_option_id: string
          p_question_key: string
          p_region?: string
        }
        Returns: {
          avg_value: number
          time_bucket: string
          total_responses: number
        }[]
      }
      get_entity_rankings_latest: {
        Args: { p_category_slug: string; p_segment_id?: string }
        Returns: {
          category_slug: string
          composite_index: number
          entity_id: string
          entity_name: string
          id: string
          image_url: string
          preference_score: number
          quality_score: number
          segment_id: string
          snapshot_date: string
          trend: string
        }[]
      }
      get_entity_trend_agg: {
        Args: {
          p_age_bucket?: string
          p_days?: number
          p_entity_id: string
          p_gender?: string
          p_region?: string
        }
        Returns: {
          day: string
          depth_nota_avg: number
          preference_score: number
          signals_count: number
          unique_users: number
        }[]
      }
      get_entity_trend_live: {
        Args: {
          p_age_bucket?: string
          p_days?: number
          p_entity_id: string
          p_gender?: string
          p_region?: string
        }
        Returns: {
          day: string
          depth_nota_avg: number
          preference_score: number
          signals_count: number
          unique_users: number
        }[]
      }
      get_hub_live_stats_24h: { Args: never; Returns: Json }
      get_hub_signal_timeseries_24h: { Args: never; Returns: Json }
      get_hub_top_now_24h: { Args: never; Returns: Json }
      get_kpi_activity: {
        Args: never
        Returns: {
          dau: number
          mau: number
          wau: number
        }[]
      }
      get_latest_benchmark_report: {
        Args: { p_api_key: string }
        Returns: Json
      }
      get_latest_executive_report: {
        Args: { p_api_key: string; p_battle_slug: string }
        Returns: Json
      }
      get_latest_ranking: {
        Args: never
        Returns: {
          battle_id: string
          battle_slug: string
          battle_title: string
          image_url: string
          option_id: string
          option_label: string
          rank_position: number
          snapshot_at: string
          total_weight: number
        }[]
      }
      get_live_platform_stats: {
        Args: never
        Returns: {
          active_region: string
          active_users: number
          captured_at: string
          signals_24h: number
          trending_title: string
        }[]
      }
      get_my_activity_history: {
        Args: { p_limit?: number }
        Returns: {
          battle_id: string
          created_at: string
          id: string
          module_type: string
          option_id: string
        }[]
      }
      get_my_participation_summary: {
        Args: never
        Returns: {
          depth_count: number
          progressive_count: number
          versus_count: number
        }[]
      }
      get_my_recent_versus_signals: {
        Args: { p_limit?: number }
        Returns: {
          battle_id: string
          battle_title: string
          category_slug: string
          created_at: string
          entity_id: string
          entity_name: string
          image_url: string
          option_id: string
          option_label: string
        }[]
      }
      get_or_create_anon_id: { Args: never; Returns: string }
      get_platform_alerts: {
        Args: { p_limit?: number }
        Returns: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          severity: string
          title: string
          type: string
        }[]
        SetofOptions: {
          from: "*"
          to: "platform_alerts"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_polarization_index: {
        Args: { p_battle_slug: string }
        Returns: {
          classification: string
          polarization_index: number
          second_share: number
          top_share: number
        }[]
      }
      get_ranking_with_variation: {
        Args: never
        Returns: {
          battle_id: string
          battle_slug: string
          battle_title: string
          direction: string
          image_url: string
          option_id: string
          option_label: string
          rank_position: number
          snapshot_at: string
          total_weight: number
          variation: number
          variation_percent: number
        }[]
      }
      get_recent_signal_activity: {
        Args: never
        Returns: {
          signals_last_3h: number
          unique_users_last_3h: number
          verified_signals_last_3h: number
        }[]
      }
      get_retention_metrics: {
        Args: never
        Returns: {
          retention_day_1: number
          retention_day_7: number
        }[]
      }
      get_segment_influence: {
        Args: { p_battle_slug: string; p_days_back?: number }
        Returns: {
          age_range: string
          commune: string
          contribution_percent: number
          gender: string
          segment_variation: number
        }[]
      }
      get_segmented_ranking: {
        Args: {
          p_age_range?: string
          p_battle_slug: string
          p_commune?: string
          p_gender?: string
        }
        Returns: {
          battle_id: string
          battle_slug: string
          battle_title: string
          image_url: string
          option_id: string
          option_label: string
          rank_position: number
          snapshot_at: string
          total_weight: number
        }[]
      }
      get_segmented_trending: {
        Args: { p_age_range?: string; p_commune?: string; p_gender?: string }
        Returns: {
          battle_id: string
          battle_slug: string
          battle_title: string
          image_url: string
          option_id: string
          option_label: string
          rank_position: number
          snapshot_at: string
          total_weight: number
        }[]
      }
      get_session_vote_counts: {
        Args: { p_session_id: string }
        Returns: {
          option_id: string
          votes_count: number
        }[]
      }
      get_state_benchmarks: { Args: never; Returns: Json }
      get_system_health_metrics: {
        Args: never
        Returns: {
          last_snapshot_at: string
          profile_completion_percent: number
          signal_integrity_percent: number
          total_users: number
          verified_users: number
        }[]
      }
      get_temporal_comparison: {
        Args: { p_battle_slug: string; p_days_back: number }
        Returns: {
          current_score: number
          option_id: string
          past_score: number
          variation: number
          variation_percent: number
        }[]
      }
      get_time_series: {
        Args: { p_battle_slug: string; p_option_id: string }
        Returns: {
          snapshot_at: string
          total_weight: number
        }[]
      }
      get_trending_feed_grouped: { Args: never; Returns: Json }
      get_user_personal_history: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string
          module_type: string
          option_name: string
          value_numeric: number
        }[]
      }
      healthcheck_baseline: {
        Args: never
        Returns: {
          check_name: string
          detail: string
          ok: boolean
        }[]
      }
      insert_depth_answers: {
        Args: { p_answers: Json; p_option_id: string }
        Returns: undefined
      }
      insert_signal_event:
        | {
            Args: {
              p_attribute_id?: string
              p_battle_id: string
              p_client_event_id?: string
              p_option_id: string
              p_session_id?: string
            }
            Returns: undefined
          }
        | {
            Args: {
              p_attribute_id?: string
              p_battle_id: string
              p_client_event_id?: string
              p_device_hash?: string
              p_option_id: string
              p_session_id?: string
            }
            Returns: undefined
          }
      is_admin_user: { Args: never; Returns: boolean }
      is_b2b_user: { Args: never; Returns: boolean }
      kpi_engagement_quality: {
        Args: {
          p_battle_id: string
          p_end_date?: string
          p_start_date?: string
        }
        Returns: {
          avg_profile_completeness: number
          total_signals: number
          verified_share_pct: number
          weighted_total: number
        }[]
      }
      kpi_share_of_preference: {
        Args: {
          p_battle_id: string
          p_end_date?: string
          p_start_date?: string
        }
        Returns: {
          option_id: string
          option_label: string
          share_pct: number
          signals_count: number
          weighted_signals: number
        }[]
      }
      kpi_trend_velocity: {
        Args: {
          p_battle_id: string
          p_bucket?: string
          p_end_date?: string
          p_start_date?: string
        }
        Returns: {
          option_id: string
          signals_delta: number
          time_bucket: string
        }[]
      }
      log_app_event: {
        Args: {
          p_app_version?: string
          p_client_event_id?: string
          p_context?: Json
          p_event_name: string
          p_severity?: string
          p_user_agent?: string
        }
        Returns: undefined
      }
      lookup_battle_options_context: {
        Args: { p_option_ids: string[] }
        Returns: {
          battle_id: string
          battle_title: string
          category_slug: string
          entity_id: string
          entity_name: string
          image_url: string
          option_id: string
          option_label: string
        }[]
      }
      mark_platform_alert_read: {
        Args: { p_alert_id: string }
        Returns: undefined
      }
      raise_sanitized: { Args: { p_code: string }; Returns: undefined }
      refresh_daily_aggregates: {
        Args: { p_days?: number }
        Returns: undefined
      }
      refresh_public_rank_snapshots_3h: { Args: never; Returns: undefined }
      refresh_public_rank_snapshots_from_rollups: {
        Args: { p_window_days?: number }
        Returns: undefined
      }
      resolve_battle_context: { Args: { p_battle_slug: string }; Returns: Json }
      resolve_entity_id: { Args: { p_any_id: string }; Returns: string }
      rollup_signal_events_incremental: {
        Args: { p_max_lag_minutes?: number }
        Returns: undefined
      }
      set_access_gate_token_active: {
        Args: { p_active: boolean; p_token_id: string }
        Returns: undefined
      }
      set_access_gate_token_expiry: {
        Args: { p_expires_at: string; p_token_id: string }
        Returns: undefined
      }
      set_nickname_once: { Args: { p_nickname: string }; Returns: undefined }
      track_module_interest: {
        Args: {
          p_client_event_id?: string
          p_device_hash?: string
          p_event_type?: string
          p_metadata?: Json
          p_module_key: string
        }
        Returns: undefined
      }
      track_user_session: {
        Args: {
          p_anon_id?: string
          p_is_new_session?: boolean
          p_seconds_spent?: number
        }
        Returns: undefined
      }
      update_trust_score: { Args: { p_user: string }; Returns: undefined }
      validate_api_key: { Args: { p_key: string }; Returns: string }
      validate_invitation: { Args: { p_code: string }; Returns: boolean }
      validate_invite_token: { Args: { p_invite_id: string }; Returns: boolean }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

