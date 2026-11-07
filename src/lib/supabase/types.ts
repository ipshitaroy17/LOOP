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
        Relationships: [];
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      experience_level: ExperienceLevel;
      project_difficulty: ProjectDifficulty;
      project_status: ProjectStatus;
      learning_mode: LearningMode;
    };
  };
}

