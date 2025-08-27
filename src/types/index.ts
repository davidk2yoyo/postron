// Tipos principales de la aplicación

export interface Slide {
  id: string;
  title: string;
  content: string;
  template: SlideTemplate;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: 'small' | 'medium' | 'large';
  alignment?: 'left' | 'center' | 'right';
  image?: string;
}

export type SlideTemplate = 'title' | 'content' | 'quote' | 'list' | 'image-text' | 'cta' | 'comparison' | 'stats';

export interface PostContent {
  id: string;
  hook: string;
  slide_ideas: string[];
  slides?: Slide[]; // New enhanced slides structure
  caption: string;
  CTA: string;
  hashtags: string[];
  createdAt: string;
  platform: SocialPlatform;
  postType: PostType;
  status: PostStatus;
  // Additional fields for database
  tone?: PostTone;
  length?: PostLength;
  originalIdea?: string;
}

export interface GeneratePostRequest {
  idea: string;
  platform: SocialPlatform;
  postType: PostType;
  tone: PostTone;
  length: PostLength;
}

export interface FlowiseResponse {
  hook: string;
  slide_ideas: string[];
  caption: string;
  CTA: string;
  hashtags: string[];
}

export type SocialPlatform = 'facebook' | 'instagram' | 'tiktok' | 'linkedin';

export type PostType = 'post' | 'carousel' | 'story' | 'reel';

export type PostTone = 'professional' | 'casual' | 'funny' | 'inspiring' | 'urgent';

export type PostLength = 'short' | 'medium' | 'long';

export type PostStatus = 'draft' | 'generated' | 'published';

export interface AppSettings {
  flowiseApiUrl: string;
  n8nWebhookUrl: string;
  connectedPlatforms: {
    facebook: boolean;
    instagram: boolean;
    tiktok: boolean;
    linkedin: boolean;
  };
  preferences: {
    emailNotifications: boolean;
    autoApproval: boolean;
  };
}

export interface AppState {
  posts: PostContent[];
  currentPost: PostContent | null;
  isGenerating: boolean;
  isPublishing: boolean;
  isLoading: boolean;
  settings: AppSettings;
  error: string | null;
}