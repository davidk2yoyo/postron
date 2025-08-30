import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_project_url_here') {
  console.error('❌ Missing Supabase credentials. Please update your .env.local file.');
  console.error('Get them from: Supabase Dashboard → Settings → API');
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

// Create Supabase client (for server-side and general use)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

// Create browser client for client-side auth
export const createClient_ = () => {
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
};

// Database types for TypeScript
export type Database = {
  public: {
    Tables: {
      settings: {
        Row: {
          id: string;
          flowise_api_url: string | null;
          n8n_webhook_url: string | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          flowise_api_url?: string | null;
          n8n_webhook_url?: string | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          flowise_api_url?: string | null;
          n8n_webhook_url?: string | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          hook: string | null;
          slide_ideas: any | null; // JSONB type
          caption: string | null;
          cta: string | null;
          hashtags: any | null; // JSONB type
          platform: string;
          post_type: string;
          tone: string | null;
          length: string | null;
          status: string;
          original_idea: string | null;
          created_at: string;
          updated_at: string;
          flowise_json: any | null; // JSONB type - missing field
          user_id: string; // missing field
        };
        Insert: {
          id?: string;
          hook?: string | null;
          slide_ideas?: any | null;
          caption?: string | null;
          cta?: string | null;
          hashtags?: any | null;
          platform: string;
          post_type: string;
          tone?: string | null;
          length?: string | null;
          status?: string;
          original_idea?: string | null;
          created_at?: string;
          updated_at?: string;
          flowise_json?: any | null; // JSONB type - missing field
          user_id?: string; // missing field
        };
        Update: {
          id?: string;
          hook?: string | null;
          slide_ideas?: any | null;
          caption?: string | null;
          cta?: string | null;
          hashtags?: any | null;
          platform?: string;
          post_type?: string;
          tone?: string | null;
          length?: string | null;
          status?: string;
          original_idea?: string | null;
          created_at?: string;
          updated_at?: string;
          flowise_json?: any | null; // JSONB type - missing field
          user_id?: string; // missing field
        };
      };
      logos: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          url: string;
          storage_path: string;
          width: number;
          height: number;
          file_size: number;
          mime_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          url: string;
          storage_path: string;
          width: number;
          height: number;
          file_size: number;
          mime_type: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          url?: string;
          storage_path?: string;
          width?: number;
          height?: number;
          file_size?: number;
          mime_type?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};