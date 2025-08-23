'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, PostContent, GeneratePostRequest, AppSettings } from '@/types';
import { SettingsService, PostsService } from '@/services/database';

// Estado inicial
const initialState: AppState = {
  posts: [],
  currentPost: null,
  isGenerating: false,
  isPublishing: false,
  isLoading: true, // New: for initial data load
  settings: {
    flowiseApiUrl: '',
    n8nWebhookUrl: '',
    connectedPlatforms: {
      facebook: false,
      instagram: false,
      tiktok: false,
      linkedin: false,
    },
    preferences: {
      emailNotifications: true,
      autoApproval: false,
    },
  },
  error: null,
};

// Tipos de acciones expandidos
type AppAction =
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_PUBLISHING'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CURRENT_POST'; payload: PostContent | null }
  | { type: 'SET_POSTS'; payload: PostContent[] }
  | { type: 'ADD_POST'; payload: PostContent }
  | { type: 'UPDATE_POST'; payload: { id: string; updates: Partial<PostContent> } }
  | { type: 'DELETE_POST'; payload: string }
  | { type: 'SET_SETTINGS'; payload: AppSettings }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

// Reducer expandido
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };
    
    case 'SET_PUBLISHING':
      return { ...state, isPublishing: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_CURRENT_POST':
      return { ...state, currentPost: action.payload };
    
    case 'SET_POSTS':
      return { ...state, posts: action.payload };
    
    case 'ADD_POST':
      return { 
        ...state, 
        posts: [action.payload, ...state.posts],
        currentPost: action.payload 
      };
    
    case 'UPDATE_POST':
      return {
        ...state,
        posts: state.posts.map(post => 
          post.id === action.payload.id 
            ? { ...post, ...action.payload.updates }
            : post
        ),
        currentPost: state.currentPost?.id === action.payload.id
          ? { ...state.currentPost, ...action.payload.updates }
          : state.currentPost,
      };
    
    case 'DELETE_POST':
      return {
        ...state,
        posts: state.posts.filter(post => post.id !== action.payload),
        currentPost: state.currentPost?.id === action.payload ? null : state.currentPost,
      };
    
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
}

// Context con funciones asíncronas
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Database operations
  loadInitialData: () => Promise<void>;
  savePost: (post: PostContent) => Promise<void>;
  updatePost: (id: string, updates: Partial<PostContent>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  saveSettings: (settings: { flowiseApiUrl: string; n8nWebhookUrl: string }) => Promise<void>;
  refreshPosts: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

// Provider mejorado
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Cargar datos iniciales
  const loadInitialData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // Cargar configuraciones y posts en paralelo
      const [settings, posts] = await Promise.all([
        SettingsService.getSettings(),
        PostsService.getAllPosts()
      ]);

      // Actualizar configuraciones
      dispatch({ 
        type: 'UPDATE_SETTINGS', 
        payload: {
          flowiseApiUrl: settings.flowise_api_url || '',
          n8nWebhookUrl: settings.n8n_webhook_url || '',
        }
      });

      // Actualizar posts
      dispatch({ type: 'SET_POSTS', payload: posts });

    } catch (error) {
      console.error('Error loading initial data:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Error al cargar datos'
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Guardar nuevo post
  const savePost = async (post: PostContent) => {
    try {
      const savedPost = await PostsService.createPost(post);
      dispatch({ type: 'ADD_POST', payload: savedPost });
    } catch (error) {
      console.error('Error saving post:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Error al guardar post'
      });
      throw error;
    }
  };

  // Actualizar post existente
  const updatePost = async (id: string, updates: Partial<PostContent>) => {
    try {
      const updatedPost = await PostsService.updatePost(id, updates);
      dispatch({ type: 'UPDATE_POST', payload: { id, updates: updatedPost } });
    } catch (error) {
      console.error('Error updating post:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Error al actualizar post'
      });
      throw error;
    }
  };

  // Eliminar post
  const deletePost = async (id: string) => {
    try {
      await PostsService.deletePost(id);
      dispatch({ type: 'DELETE_POST', payload: id });
    } catch (error) {
      console.error('Error deleting post:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Error al eliminar post'
      });
      throw error;
    }
  };

  // Guardar configuraciones
  const saveSettings = async (settings: { flowiseApiUrl: string; n8nWebhookUrl: string }) => {
    try {
      await SettingsService.updateSettings(settings.flowiseApiUrl, settings.n8nWebhookUrl);
      dispatch({ 
        type: 'UPDATE_SETTINGS', 
        payload: {
          flowiseApiUrl: settings.flowiseApiUrl,
          n8nWebhookUrl: settings.n8nWebhookUrl,
        }
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Error al guardar configuración'
      });
      throw error;
    }
  };

  // Refrescar posts
  const refreshPosts = async () => {
    try {
      const posts = await PostsService.getAllPosts();
      dispatch({ type: 'SET_POSTS', payload: posts });
    } catch (error) {
      console.error('Error refreshing posts:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Error al cargar posts'
      });
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadInitialData();
  }, []);

  const contextValue: AppContextType = {
    state,
    dispatch,
    loadInitialData,
    savePost,
    updatePost,
    deletePost,
    saveSettings,
    refreshPosts,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Hook personalizado mejorado
export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Actions helpers (mantiene compatibilidad)
export const actions = {
  setGenerating: (isGenerating: boolean) => ({ 
    type: 'SET_GENERATING' as const, 
    payload: isGenerating 
  }),
  
  setPublishing: (isPublishing: boolean) => ({ 
    type: 'SET_PUBLISHING' as const, 
    payload: isPublishing 
  }),
  
  setCurrentPost: (post: PostContent | null) => ({ 
    type: 'SET_CURRENT_POST' as const, 
    payload: post 
  }),
  
  addPost: (post: PostContent) => ({ 
    type: 'ADD_POST' as const, 
    payload: post 
  }),
  
  updatePost: (id: string, updates: Partial<PostContent>) => ({ 
    type: 'UPDATE_POST' as const, 
    payload: { id, updates } 
  }),
  
  updateSettings: (settings: Partial<AppSettings>) => ({ 
    type: 'UPDATE_SETTINGS' as const, 
    payload: settings 
  }),
  
  setError: (error: string | null) => ({ 
    type: 'SET_ERROR' as const, 
    payload: error 
  }),
  
  clearError: () => ({ 
    type: 'CLEAR_ERROR' as const 
  }),
};