import { supabase, Database } from '@/lib/supabase';
import { PostContent } from '@/types';

// Settings Service
export class SettingsService {
  // Get current settings (we'll use the first/only row)
  static async getSettings() {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching settings:', error);
      throw new Error('Failed to load settings');
    }

    // Return default values if no settings found
    return data || {
      flowise_api_url: '',
      n8n_webhook_url: ''
    };
  }

  // Update settings
  static async updateSettings(flowiseUrl: string, n8nUrl: string) {
    // First, try to get existing settings
    const { data: existing } = await supabase
      .from('settings')
      .select('id')
      .limit(1)
      .single();

    if (existing) {
      // Update existing row
      const { data, error } = await supabase
        .from('settings')
        .update({
          flowise_api_url: flowiseUrl || null,
          n8n_webhook_url: n8nUrl || null
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating settings:', error);
        throw new Error('Failed to save settings');
      }

      return data;
    } else {
      // Create new row if none exists
      const { data, error } = await supabase
        .from('settings')
        .insert({
          flowise_api_url: flowiseUrl || null,
          n8n_webhook_url: n8nUrl || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating settings:', error);
        throw new Error('Failed to save settings');
      }

      return data;
    }
  }
}

// Posts Service
export class PostsService {
  // Get all posts, newest first
  static async getAllPosts(): Promise<PostContent[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      throw new Error('Failed to load posts');
    }

    // Convert database format to app format
    return (data || []).map(this.dbPostToAppPost);
  }

  // Get single post by ID
  static async getPostById(id: string): Promise<PostContent | null> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error fetching post:', error);
      throw new Error('Failed to load post');
    }

    return this.dbPostToAppPost(data);
  }

  // Save new post
  static async createPost(post: PostContent): Promise<PostContent> {
    console.log('Creating post with data:', post);
    const dbPost = this.appPostToDbPost(post);
    console.log('Transformed to DB format:', dbPost);

    const { data, error } = await supabase
      .from('posts')
      .insert(dbPost)
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      console.error('Database error details:', error.details);
      console.error('Database error hint:', error.hint);
      console.error('Database error message:', error.message);
      throw new Error(`Failed to save post: ${error.message}`);
    }

    return this.dbPostToAppPost(data);
  }

  // Update existing post
  static async updatePost(id: string, updates: Partial<PostContent>): Promise<PostContent> {
    const dbUpdates = this.appPostToDbPost(updates as PostContent);

    const { data, error } = await supabase
      .from('posts')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating post:', error);
      throw new Error('Failed to update post');
    }

    return this.dbPostToAppPost(data);
  }

  // Delete post
  static async deletePost(id: string): Promise<void> {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting post:', error);
      throw new Error('Failed to delete post');
    }
  }

  // Get posts by platform
  static async getPostsByPlatform(platform: string): Promise<PostContent[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('platform', platform)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts by platform:', error);
      throw new Error('Failed to load posts');
    }

    return (data || []).map(this.dbPostToAppPost);
  }

  // Get posts by status
  static async getPostsByStatus(status: string): Promise<PostContent[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts by status:', error);
      throw new Error('Failed to load posts');
    }

    return (data || []).map(this.dbPostToAppPost);
  }

  // Convert database post format to app format
  private static dbPostToAppPost(dbPost: Database['public']['Tables']['posts']['Row']): PostContent {
    return {
      id: dbPost.id,
      hook: dbPost.hook || '',
      slide_ideas: dbPost.slide_ideas || [],
      caption: dbPost.caption || '',
      CTA: dbPost.cta || '',
      hashtags: dbPost.hashtags || [],
      platform: dbPost.platform as any,
      postType: dbPost.post_type as any,
      status: dbPost.status as any,
      createdAt: dbPost.created_at,
      // Add any additional fields we might have
      tone: dbPost.tone,
      length: dbPost.length,
      originalIdea: dbPost.original_idea
    };
  }

  // Convert app post format to database format
  private static appPostToDbPost(post: PostContent): Database['public']['Tables']['posts']['Insert'] {
    return {
      // Let database generate UUID automatically - don't include id
      hook: post.hook,
      slide_ideas: post.slide_ideas,
      caption: post.caption,
      cta: post.CTA,
      hashtags: post.hashtags,
      platform: post.platform,
      post_type: post.postType,
      status: post.status,
      tone: (post as any).tone || null,
      length: (post as any).length || null,
      original_idea: (post as any).originalIdea || null
    };
  }
}

// Utility function to test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('id')
      .limit(1);

    return !error;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}