export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type ProjectDifficulty = 'beginner' | 'easy' | 'intermediate' | 'advanced';
export type ProjectStatus = 'saved' | 'in_progress' | 'completed';
export type LearningMode = 'video' | 'written' | 'steps';
export type TutorialReviewStatus = 'draft' | 'in_review' | 'verified_published';
export type PatternSourceType =
  | 'original_loop'
  | 'creator_approved'
  | 'public_domain'
  | 'creative_commons'
  | 'pending_permission';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          experience_level: ExperienceLevel | null;
          onboarding_preferences: Json;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          experience_level?: ExperienceLevel | null;
          onboarding_preferences?: Json;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          experience_level?: ExperienceLevel | null;
          onboarding_preferences?: Json;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          category: string;
          difficulty: ProjectDifficulty;
          thumbnail_url: string | null;
          estimated_duration: string | null;
          estimated_minutes: number | null;
          materials: string[];
          skills: string[];
          skills_text?: string | null;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          category: string;
          difficulty: ProjectDifficulty;
          thumbnail_url?: string | null;
          estimated_duration?: string | null;
          estimated_minutes?: number | null;
          materials?: string[];
          skills?: string[];
          skills_text?: string | null;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          category?: string;
          difficulty?: ProjectDifficulty;
          thumbnail_url?: string | null;
          estimated_duration?: string | null;
          estimated_minutes?: number | null;
          materials?: string[];
          skills?: string[];
          skills_text?: string | null;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_projects: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          status: ProjectStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          status?: ProjectStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string;
          status?: ProjectStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_projects_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_projects_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      learning_progress: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          learning_mode: LearningMode;
          video_position_seconds: number;
          current_section: string | null;
          active_step_identifier: string | null;
          completed_step_identifiers: string[];
          notes: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          learning_mode?: LearningMode;
          video_position_seconds?: number;
          current_section?: string | null;
          active_step_identifier?: string | null;
          completed_step_identifiers?: string[];
          notes?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string;
          learning_mode?: LearningMode;
          video_position_seconds?: number;
          current_section?: string | null;
          active_step_identifier?: string | null;
          completed_step_identifiers?: string[];
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      tutorials: {
        Row: {
          id: string;
          project_id: string;
          tutorial_key: string;
          title: string;
          learning_objective: string;
          terminology: string;
          abbreviations: Json;
          materials_details: Json;
          pattern_source_type: PatternSourceType;
          pattern_source_title: string | null;
          pattern_source_author: string | null;
          pattern_source_url: string | null;
          pattern_license: string | null;
          pattern_permission_notes: string | null;
          pattern_tested: boolean;
          pattern_tested_notes: string | null;
          video_url: string | null;
          video_creator_name: string | null;
          video_creator_url: string | null;
          video_embed_allowed: boolean;
          review_status: TutorialReviewStatus;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          tutorial_key?: string;
          title: string;
          learning_objective: string;
          terminology?: string;
          abbreviations?: Json;
          materials_details?: Json;
          pattern_source_type?: PatternSourceType;
          pattern_source_title?: string | null;
          pattern_source_author?: string | null;
          pattern_source_url?: string | null;
          pattern_license?: string | null;
          pattern_permission_notes?: string | null;
          pattern_tested?: boolean;
          pattern_tested_notes?: string | null;
          video_url?: string | null;
          video_creator_name?: string | null;
          video_creator_url?: string | null;
          video_embed_allowed?: boolean;
          review_status?: TutorialReviewStatus;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          tutorial_key?: string;
          title?: string;
          learning_objective?: string;
          terminology?: string;
          abbreviations?: Json;
          materials_details?: Json;
          pattern_source_type?: PatternSourceType;
          pattern_source_title?: string | null;
          pattern_source_author?: string | null;
          pattern_source_url?: string | null;
          pattern_license?: string | null;
          pattern_permission_notes?: string | null;
          pattern_tested?: boolean;
          pattern_tested_notes?: string | null;
          video_url?: string | null;
          video_creator_name?: string | null;
          video_creator_url?: string | null;
          video_embed_allowed?: boolean;
          review_status?: TutorialReviewStatus;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tutorials_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          }
        ];
      };
      pattern_steps: {
        Row: {
          id: string;
          tutorial_id: string;
          step_number: number;
          step_identifier: string;
          title: string;
          instruction: string;
          stitch_count: string | null;
          abbreviations: string[];
          notes: string | null;
          video_timestamp_seconds: number | null;
          timestamp_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tutorial_id: string;
          step_number: number;
          step_identifier: string;
          title: string;
          instruction: string;
          stitch_count?: string | null;
          abbreviations?: string[];
          notes?: string | null;
          video_timestamp_seconds?: number | null;
          timestamp_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tutorial_id?: string;
          step_number?: number;
          step_identifier?: string;
          title?: string;
          instruction?: string;
          stitch_count?: string | null;
          abbreviations?: string[];
          notes?: string | null;
          video_timestamp_seconds?: number | null;
          timestamp_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'pattern_steps_tutorial_id_fkey';
            columns: ['tutorial_id'];
            isOneToOne: false;
            referencedRelation: 'tutorials';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      experience_level: ExperienceLevel;
      project_difficulty: ProjectDifficulty;
      project_status: ProjectStatus;
      learning_mode: LearningMode;
      tutorial_review_status: TutorialReviewStatus;
      pattern_source_type: PatternSourceType;
    };
  };
}

