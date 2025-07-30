import { createClient, SupabaseClient } from '@supabase/supabase-js';
import config from './index';

// Create Supabase client for service operations
export const supabaseAdmin: SupabaseClient = createClient(
  config.supabase.url,
  config.supabase.serviceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Create Supabase client for user operations  
export const supabaseClient: SupabaseClient = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);

// Database schema types for better TypeScript support
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
          role: 'admin' | 'user' | 'viewer';
          last_active_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          avatar_url?: string;
          role?: 'admin' | 'user' | 'viewer';
          last_active_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string;
          role?: 'admin' | 'user' | 'viewer';
          last_active_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description?: string;
          key: string;
          color: string;
          owner_id: string;
          is_archived: boolean;
          settings?: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          key: string;
          color?: string;
          owner_id: string;
          is_archived?: boolean;
          settings?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          key?: string;
          color?: string;
          owner_id?: string;
          is_archived?: boolean;
          settings?: Record<string, any>;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description?: string;
          type: 'story' | 'bug' | 'task' | 'epic';
          status: 'todo' | 'in-progress' | 'in-review' | 'done';
          priority: 'low' | 'medium' | 'high';
          story_points?: number;
          project_id: string;
          epic_id?: string;
          assignee_id?: string;
          reporter_id?: string;
          sprint_id?: string;
          labels: string[];
          due_date?: string;
          estimated_hours?: number;
          logged_hours?: number;
          watchers: string[];
          attachments: string[];
          linked_tasks: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          type: 'story' | 'bug' | 'task' | 'epic';
          status?: 'todo' | 'in-progress' | 'in-review' | 'done';
          priority: 'low' | 'medium' | 'high';
          story_points?: number;
          project_id: string;
          epic_id?: string;
          assignee_id?: string;
          reporter_id?: string;
          sprint_id?: string;
          labels?: string[];
          due_date?: string;
          estimated_hours?: number;
          logged_hours?: number;
          watchers?: string[];
          attachments?: string[];
          linked_tasks?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          type?: 'story' | 'bug' | 'task' | 'epic';
          status?: 'todo' | 'in-progress' | 'in-review' | 'done';
          priority?: 'low' | 'medium' | 'high';
          story_points?: number;
          project_id?: string;
          epic_id?: string;
          assignee_id?: string;
          reporter_id?: string;
          sprint_id?: string;
          labels?: string[];
          due_date?: string;
          estimated_hours?: number;
          logged_hours?: number;
          watchers?: string[];
          attachments?: string[];
          linked_tasks?: string[];
          updated_at?: string;
        };
      };
      sprints: {
        Row: {
          id: string;
          name: string;
          goal?: string;
          start_date: string;
          end_date: string;
          status: 'planned' | 'active' | 'completed';
          capacity: number;
          project_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          goal?: string;
          start_date: string;
          end_date: string;
          status?: 'planned' | 'active' | 'completed';
          capacity: number;
          project_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          goal?: string;
          start_date?: string;
          end_date?: string;
          status?: 'planned' | 'active' | 'completed';
          capacity?: number;
          project_id?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          content: string;
          task_id: string;
          author_id: string;
          parent_id?: string;
          is_edited: boolean;
          edited_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          task_id: string;
          author_id: string;
          parent_id?: string;
          is_edited?: boolean;
          edited_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          task_id?: string;
          author_id?: string;
          parent_id?: string;
          is_edited?: boolean;
          edited_at?: string;
          updated_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          type: string;
          description: string;
          task_id: string;
          project_id: string;
          user_id: string;
          metadata?: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          description: string;
          task_id: string;
          project_id: string;
          user_id: string;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          description?: string;
          task_id?: string;
          project_id?: string;
          user_id?: string;
          metadata?: Record<string, any>;
          updated_at?: string;
        };
      };
      attachments: {
        Row: {
          id: string;
          name: string;
          size: number;
          type: string;
          url: string;
          task_id: string;
          uploaded_by: string;
          storage_path: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          size: number;
          type: string;
          url: string;
          task_id: string;
          uploaded_by: string;
          storage_path: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          size?: number;
          type?: string;
          url?: string;
          task_id?: string;
          uploaded_by?: string;
          storage_path?: string;
          updated_at?: string;
        };
      };
      task_links: {
        Row: {
          id: string;
          source_task_id: string;
          target_task_id: string;
          link_type: 'blocks' | 'blocked_by' | 'relates_to' | 'duplicates' | 'clones';
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source_task_id: string;
          target_task_id: string;
          link_type: 'blocks' | 'blocked_by' | 'relates_to' | 'duplicates' | 'clones';
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          source_task_id?: string;
          target_task_id?: string;
          link_type?: 'blocks' | 'blocked_by' | 'relates_to' | 'duplicates' | 'clones';
          created_by?: string;
          updated_at?: string;
        };
      };
      time_entries: {
        Row: {
          id: string;
          description: string;
          hours: number;
          date: string;
          task_id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          description: string;
          hours: number;
          date: string;
          task_id: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          description?: string;
          hours?: number;
          date?: string;
          task_id?: string;
          user_id?: string;
          updated_at?: string;
        };
      };
      project_members: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member' | 'viewer';
          invited_by?: string;
          joined_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member' | 'viewer';
          invited_by?: string;
          joined_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          role?: 'owner' | 'admin' | 'member' | 'viewer';
          invited_by?: string;
          joined_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export default supabaseAdmin;