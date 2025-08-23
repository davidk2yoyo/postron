import { GeneratePostRequest, FlowiseResponse, PostContent } from '@/types';

// Servicio para Flowise
export class FlowiseService {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async generateContent(request: GeneratePostRequest): Promise<FlowiseResponse> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: this.buildPrompt(request),
          overrideConfig: {
            platform: request.platform,
            postType: request.postType,
            tone: request.tone,
            length: request.length,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Flowise API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Log para debugging
      console.log('Flowise response:', data);
      
      // Parseamos la respuesta de Flowise
      return this.parseFlowiseResponse(data);
    } catch (error) {
      console.error('Error calling Flowise:', error);
      throw new Error('Error al generar contenido con IA');
    }
  }

  private buildPrompt(request: GeneratePostRequest): string {
    return `IDEA: ${request.idea}
Social Network: ${request.platform}
Post Type: ${request.postType}
Tone: ${request.tone}
Length: ${request.length}`;
  }

  private parseFlowiseResponse(data: any): FlowiseResponse {
    try {
      // Si la respuesta tiene data.json, usar eso
      if (data.json) {
        return {
          hook: data.json.hook || '',
          slide_ideas: data.json.slide_ideas || [],
          caption: data.json.caption || '',
          CTA: data.json.CTA || '',
          hashtags: data.json.hashtags || [],
        };
      }
      
      // Si la respuesta es un string JSON, parsearlo
      if (typeof data.text === 'string') {
        const parsed = JSON.parse(data.text);
        return {
          hook: parsed.hook || '',
          slide_ideas: parsed.slide_ideas || [],
          caption: parsed.caption || '',
          CTA: parsed.CTA || '',
          hashtags: parsed.hashtags || [],
        };
      }
      
      // Si ya es un objeto, usar directamente
      return {
        hook: data.hook || '',
        slide_ideas: data.slide_ideas || [],
        caption: data.caption || '',
        CTA: data.CTA || '',
        hashtags: data.hashtags || [],
      };
    } catch (error) {
      // Fallback si no se puede parsear
      return {
        hook: 'Error al generar contenido',
        slide_ideas: [],
        caption: data.text || data.message || 'Contenido generado',
        CTA: '',
        hashtags: [],
      };
    }
  }
}

// Servicio para n8n
export class N8nService {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async publishPost(post: PostContent): Promise<boolean> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: post.platform,
          content: {
            hook: post.hook,
            slide_ideas: post.slide_ideas,
            caption: post.caption,
            CTA: post.CTA,
            hashtags: post.hashtags,
          },
          postType: post.postType,
          postId: post.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`n8n API error: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error calling n8n:', error);
      throw new Error('Error al publicar contenido');
    }
  }
}

// Utility functions
export function generatePostId(): string {
  // Generate a UUID v4-like string
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function createPostFromResponse(
  request: GeneratePostRequest,
  response: FlowiseResponse
): PostContent {
  return {
    id: generatePostId(),
    hook: response.hook,
    slide_ideas: response.slide_ideas,
    caption: response.caption,
    CTA: response.CTA,
    hashtags: response.hashtags,
    platform: request.platform,
    postType: request.postType,
    status: 'generated',
    createdAt: new Date().toISOString(),
    // Add missing fields for database
    tone: request.tone,
    length: request.length,
    originalIdea: request.idea,
  } as PostContent;
}

// Hook para usar los servicios
export function useServices(flowiseUrl: string, n8nUrl: string) {
  const flowiseService = new FlowiseService(flowiseUrl);
  const n8nService = new N8nService(n8nUrl);

  return {
    flowiseService,
    n8nService,
  };
}