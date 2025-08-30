import { supabase, Database } from '@/lib/supabase';
import { PostContent } from '@/types';

// Asset types
export interface Asset {
  id: string;
  post_id: string;
  user_id: string;
  kind: string;
  url: string;
  storage_path: string;
  order_index: number;
  width: number;
  height: number;
  created_at: string;
  updated_at: string;
}

// Logo types
export interface Logo {
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
}

// Settings Service
export class SettingsService {
  // Get current user's settings
  static async getSettings() {
    let userId: string;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || '01d499fc-c3c4-4b5d-8928-e21389b548d8';
    } catch {
      userId = '01d499fc-c3c4-4b5d-8928-e21389b548d8';
    }

    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
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

  // Update current user's settings
  static async updateSettings(flowiseUrl: string, n8nUrl: string) {
    let userId: string;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || '01d499fc-c3c4-4b5d-8928-e21389b548d8';
    } catch {
      userId = '01d499fc-c3c4-4b5d-8928-e21389b548d8';
    }

    // First, try to get existing settings for this user
    const { data: existing } = await supabase
      .from('settings')
      .select('id')
      .eq('user_id', userId)
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
      // Create new row if none exists for this user
      const { data, error } = await supabase
        .from('settings')
        .insert({
          flowise_api_url: flowiseUrl || null,
          n8n_webhook_url: n8nUrl || null,
          user_id: userId
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Creating post with data:', post);
    const dbPost = this.appPostToDbPost(post, user.id);
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const dbUpdates = this.partialAppPostToDbPost(updates);

    const { data, error } = await supabase
      .from('posts')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id)
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting post:', error);
      throw new Error('Failed to delete post');
    }
  }

  // Get posts by platform
  static async getPostsByPlatform(platform: string): Promise<PostContent[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('platform', platform)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts by platform:', error);
      throw new Error('Failed to load posts');
    }

    return (data || []).map(this.dbPostToAppPost);
  }

  // Get posts by status
  static async getPostsByStatus(status: string): Promise<PostContent[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', status)
      .eq('user_id', user.id)
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
  private static appPostToDbPost(post: PostContent, userId: string): Database['public']['Tables']['posts']['Insert'] {
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
      original_idea: (post as any).originalIdea || null,
      flowise_json: {
        hook: post.hook,
        slide_ideas: post.slide_ideas,
        caption: post.caption,
        CTA: post.CTA,
        hashtags: post.hashtags
      },
      user_id: userId
    };
  }

  // Convert partial app post format to database format (for updates)
  private static partialAppPostToDbPost(updates: Partial<PostContent>): Partial<Database['public']['Tables']['posts']['Update']> {
    const dbUpdates: Partial<Database['public']['Tables']['posts']['Update']> = {};
    
    if (updates.hook !== undefined) dbUpdates.hook = updates.hook;
    if (updates.slide_ideas !== undefined) dbUpdates.slide_ideas = updates.slide_ideas;
    if (updates.caption !== undefined) dbUpdates.caption = updates.caption;
    if (updates.CTA !== undefined) dbUpdates.cta = updates.CTA;
    if (updates.hashtags !== undefined) dbUpdates.hashtags = updates.hashtags;
    if (updates.platform !== undefined) dbUpdates.platform = updates.platform;
    if (updates.postType !== undefined) dbUpdates.post_type = updates.postType;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if ((updates as any).tone !== undefined) dbUpdates.tone = (updates as any).tone;
    if ((updates as any).length !== undefined) dbUpdates.length = (updates as any).length;
    if ((updates as any).originalIdea !== undefined) dbUpdates.original_idea = (updates as any).originalIdea;
    
    // Update flowise_json only if relevant fields are being updated
    if (updates.hook !== undefined || updates.slide_ideas !== undefined || updates.caption !== undefined || 
        updates.CTA !== undefined || updates.hashtags !== undefined) {
      dbUpdates.flowise_json = {
        hook: updates.hook,
        slide_ideas: updates.slide_ideas,
        caption: updates.caption,
        CTA: updates.CTA,
        hashtags: updates.hashtags
      };
    }
    
    return dbUpdates;
  }
}

// Assets Service
export class AssetsService {
  // Get all assets for a post
  static async getAssetsByPostId(postId: string): Promise<Asset[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching assets:', error);
      throw new Error('Failed to load assets');
    }

    return data || [];
  }

  // Save new asset
  static async createAsset(asset: Omit<Asset, 'id' | 'created_at' | 'updated_at'>): Promise<Asset> {
    let userId: string;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || '01d499fc-c3c4-4b5d-8928-e21389b548d8';
    } catch {
      userId = '01d499fc-c3c4-4b5d-8928-e21389b548d8';
    }

    const { data, error } = await supabase
      .from('assets')
      .insert({
        ...asset,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating asset:', error);
      throw new Error('Failed to save asset');
    }

    return data;
  }

  // Update asset
  static async updateAsset(id: string, updates: Partial<Asset>): Promise<Asset> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('assets')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating asset:', error);
      throw new Error('Failed to update asset');
    }

    return data;
  }

  // Delete asset
  static async deleteAsset(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting asset:', error);
      throw new Error('Failed to delete asset');
    }
  }

  // Delete all assets for a post
  static async deleteAssetsByPostId(postId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting assets:', error);
      throw new Error('Failed to delete assets');
    }
  }

  // Upload image to Supabase Storage
  static async uploadImage(
    file: File | Blob,
    path: string
  ): Promise<{ url: string; path: string }> {
    const { data, error } = await supabase.storage
      .from('assets')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading to storage:', error);
      throw new Error('Failed to upload image');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('assets')
      .getPublicUrl(data.path);

    return {
      url: publicUrl,
      path: data.path,
    };
  }

  // Convert data URL to blob for upload
  static dataURLToBlob(dataURL: string): Blob {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  }
}

// Logos Service
export class LogosService {
  // Get all logos for the user
  static async getUserLogos(): Promise<Logo[]> {
    let userId: string;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || '01d499fc-c3c4-4b5d-8928-e21389b548d8'; // Fallback to your user ID for API routes
    } catch {
      userId = '01d499fc-c3c4-4b5d-8928-e21389b548d8'; // Use your user ID when auth context is unavailable
    }

    const { data, error } = await supabase
      .from('logos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching logos:', error);
      throw new Error('Failed to load logos');
    }

    return data || [];
  }

  // Create new logo
  static async createLogo(logo: Omit<Logo, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Logo> {
    let userId: string;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || '01d499fc-c3c4-4b5d-8928-e21389b548d8';
    } catch {
      userId = '01d499fc-c3c4-4b5d-8928-e21389b548d8';
    }

    const { data, error } = await supabase
      .from('logos')
      .insert({
        ...logo,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating logo:', error);
      throw new Error('Failed to save logo');
    }

    return data;
  }

  // Update logo
  static async updateLogo(id: string, updates: Partial<Pick<Logo, 'name'>>): Promise<Logo> {
    let userId: string;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || '01d499fc-c3c4-4b5d-8928-e21389b548d8';
    } catch {
      userId = '01d499fc-c3c4-4b5d-8928-e21389b548d8';
    }

    const { data, error } = await supabase
      .from('logos')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating logo:', error);
      throw new Error('Failed to update logo');
    }

    return data;
  }

  // Delete logo
  static async deleteLogo(id: string): Promise<void> {
    let userId: string;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || '01d499fc-c3c4-4b5d-8928-e21389b548d8';
    } catch {
      userId = '01d499fc-c3c4-4b5d-8928-e21389b548d8';
    }

    // First get the logo to get the storage path
    const { data: logo, error: fetchError } = await supabase
      .from('logos')
      .select('storage_path')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching logo for deletion:', fetchError);
      throw new Error('Failed to find logo');
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('logos')
      .remove([logo.storage_path]);

    if (storageError) {
      console.error('Error deleting from storage:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    const { error } = await supabase
      .from('logos')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting logo:', error);
      throw new Error('Failed to delete logo');
    }
  }

  // Upload logo to Supabase Storage
  static async uploadLogo(
    file: File,
    name: string
  ): Promise<{ url: string; path: string; width: number; height: number }> {
    let userId: string;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || '01d499fc-c3c4-4b5d-8928-e21389b548d8';
    } catch {
      userId = '01d499fc-c3c4-4b5d-8928-e21389b548d8';
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    // Upload to storage
    const { data, error } = await supabase.storage
      .from('logos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading logo to storage:', error);
      throw new Error('Failed to upload logo');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('logos')
      .getPublicUrl(data.path);

    // Get image dimensions
    const dimensions = await this.getImageDimensions(file);

    return {
      url: publicUrl,
      path: data.path,
      width: dimensions.width,
      height: dimensions.height,
    };
  }

  // Get image dimensions from file (server-side fallback)
  private static getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    // Server-side fallback - return default dimensions
    // TODO: Use a server-side image library like 'sharp' for real dimensions
    return Promise.resolve({
      width: 200,  // Default width
      height: 200, // Default height
    });
  }

  // Upload and create logo in one operation
  static async uploadAndCreateLogo(file: File, name: string): Promise<Logo> {
    const upload = await this.uploadLogo(file, name);
    
    const logo = await this.createLogo({
      name,
      url: upload.url,
      storage_path: upload.path,
      width: upload.width,
      height: upload.height,
      file_size: file.size,
      mime_type: file.type,
    });

    return logo;
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