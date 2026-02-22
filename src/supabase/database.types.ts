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
          user_id: string
        }
        Insert: {
          anon_id: string
          created_at?: string | null
          user_id: string
        }
        Update: {
          anon_id?: string
          created_at?: string | null
          user_id?: string
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
          brand_id: string | null
          created_at: string | null
          id: string
          image_url: string | null
          label: string
          sort_order: number | null
        }
        Insert: {
          battle_id: string
          brand_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          label: string
          sort_order?: number | null
        }
        Update: {
          battle_id?: string
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
          created_at: string | null
          id: string
          metadata: Json | null
          name: string
          slug: string
          type: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name: string
          slug: string
          type: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          slug?: string
          type?: string
        }
        Relationships: []
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
          code: string
          created_at: string | null
          created_by: string | null
          current_uses: number | null
          expires_at: string | null
          id: string
          max_uses: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
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
      profiles: {
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
          created_at: string | null
          id: string
          ranking: Json
          segment_filters: Json | null
          segment_hash: string
          snapshot_at: string | null
          total_signals: number | null
        }
        Insert: {
          attribute_id?: string | null
          created_at?: string | null
          id?: string
          ranking: Json
          segment_filters?: Json | null
          segment_hash: string
          snapshot_at?: string | null
          total_signals?: number | null
        }
        Update: {
          attribute_id?: string | null
          created_at?: string | null
          id?: string
          ranking?: Json
          segment_filters?: Json | null
          segment_hash?: string
          snapshot_at?: string | null
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
        ]
      }
      ranking_snapshots: {
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
      signal_events: {
        Row: {
          age_bucket: string | null
          algorithm_version: string | null
          algorithm_version_id: string | null
          anon_id: string
          attribute_id: string | null
          battle_id: string | null
          battle_instance_id: string | null
          computed_weight: number | null
          context_id: string | null
          country: string | null
          created_at: string
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
          computed_weight?: number | null
          context_id?: string | null
          country?: string | null
          created_at?: string
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
          computed_weight?: number | null
          context_id?: string | null
          country?: string | null
          created_at?: string
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
          activity_type: string
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          age_range: string | null
          birth_year: number | null
          comuna: string | null
          created_at: string | null
          education_level: string | null
          employment_status: string | null
          gender: string | null
          housing_status: string | null
          housing_type: string | null
          income_range: string | null
          influence_level: string | null
          interests: string[] | null
          nickname: string | null
          profile_completion_percentage: number | null
          profile_stage: number | null
          purchase_behavior: string | null
          region: string | null
          signal_weight: number | null
          updated_at: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          age_range?: string | null
          birth_year?: number | null
          comuna?: string | null
          created_at?: string | null
          education_level?: string | null
          employment_status?: string | null
          gender?: string | null
          housing_status?: string | null
          housing_type?: string | null
          income_range?: string | null
          influence_level?: string | null
          interests?: string[] | null
          nickname?: string | null
          profile_completion_percentage?: number | null
          profile_stage?: number | null
          purchase_behavior?: string | null
          region?: string | null
          signal_weight?: number | null
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          age_range?: string | null
          birth_year?: number | null
          comuna?: string | null
          created_at?: string | null
          education_level?: string | null
          employment_status?: string | null
          gender?: string | null
          housing_status?: string | null
          housing_type?: string | null
          income_range?: string | null
          influence_level?: string | null
          interests?: string[] | null
          nickname?: string | null
          profile_completion_percentage?: number | null
          profile_stage?: number | null
          purchase_behavior?: string | null
          region?: string | null
          signal_weight?: number | null
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          created_at: string | null
          email: string
          id: string
          identity_verified_at: string | null
          invitation_code_id: string | null
          is_identity_verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          identity_verified_at?: string | null
          invitation_code_id?: string | null
          is_identity_verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          identity_verified_at?: string | null
          invitation_code_id?: string | null
          is_identity_verified?: boolean | null
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
    }
    Functions: {
      activate_algorithm_version: {
        Args: { p_version_id: string }
        Returns: undefined
      }
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
      calculate_rank_snapshot: { Args: never; Returns: undefined }
      calculate_recency_factor:
        | { Args: { p_created_at: string }; Returns: number }
        | {
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
      consume_invitation: { Args: { p_code: string }; Returns: undefined }
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
      generate_benchmark_report: {
        Args: { p_api_key: string; p_days_back?: number }
        Returns: Json
      }
      generate_depth_snapshot: { Args: never; Returns: undefined }
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
      get_user_personal_history: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string
          module_type: string
          option_name: string
          value_numeric: number
        }[]
      }
      insert_depth_answers: {
        Args: { p_answers: Json; p_option_id: string }
        Returns: undefined
      }
      insert_signal_event: {
        Args: {
          p_attribute_id?: string
          p_battle_id: string
          p_option_id: string
          p_session_id?: string
        }
        Returns: undefined
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
      mark_platform_alert_read: {
        Args: { p_alert_id: string }
        Returns: undefined
      }
      update_trust_score: { Args: { p_user: string }; Returns: undefined }
      validate_api_key: { Args: { p_key: string }; Returns: string }
      validate_invitation: { Args: { p_code: string }; Returns: boolean }
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
