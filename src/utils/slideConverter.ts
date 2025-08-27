import { Slide, SlideTemplate, PostContent } from '@/types';

/**
 * Converts simple slide_ideas (strings) to enhanced Slide objects
 */
export function convertSlideIdeasToSlides(slideIdeas: string[]): Slide[] {
  return slideIdeas.map((idea, index) => ({
    id: `slide-${Date.now()}-${index}`,
    title: extractTitleFromIdea(idea),
    content: extractContentFromIdea(idea),
    template: determineTemplateFromContent(idea),
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    fontSize: 'medium' as const,
    alignment: 'center' as const
  }));
}

/**
 * Converts enhanced Slide objects back to simple slide_ideas (strings)
 */
export function convertSlidesToSlideIdeas(slides: Slide[]): string[] {
  return slides.map(slide => {
    if (slide.title === slide.content) {
      return slide.title;
    }
    return slide.content ? `${slide.title}\n${slide.content}` : slide.title;
  });
}

/**
 * Extracts a title from a slide idea string
 */
function extractTitleFromIdea(idea: string): string {
  // If the idea has multiple lines, use the first line as title
  const lines = idea.split('\n').filter(line => line.trim());
  if (lines.length > 1) {
    return lines[0].trim();
  }
  
  // If it's a single line, truncate if too long
  if (idea.length > 50) {
    return idea.substring(0, 47) + '...';
  }
  
  return idea.trim();
}

/**
 * Extracts content from a slide idea string
 */
function extractContentFromIdea(idea: string): string {
  const lines = idea.split('\n').filter(line => line.trim());
  
  if (lines.length > 1) {
    // Use everything except the first line as content
    return lines.slice(1).join('\n').trim();
  }
  
  // If single line, use the full idea as content
  return idea.trim();
}

/**
 * Determines the best template based on content analysis
 */
function determineTemplateFromContent(content: string): SlideTemplate {
  const lowerContent = content.toLowerCase();
  
  // Check for specific patterns
  if (lowerContent.includes('título') || lowerContent.includes('title') || lowerContent.includes('bienvenid')) {
    return 'title';
  }
  
  if (lowerContent.includes('"') || lowerContent.includes('cita') || lowerContent.includes('quote')) {
    return 'quote';
  }
  
  if (lowerContent.includes('•') || lowerContent.includes('-') || lowerContent.includes('lista') || lowerContent.includes('puntos')) {
    return 'list';
  }
  
  if (lowerContent.includes('cta') || lowerContent.includes('acción') || lowerContent.includes('llamada') || 
      lowerContent.includes('haz clic') || lowerContent.includes('compra') || lowerContent.includes('descarga')) {
    return 'cta';
  }
  
  if (lowerContent.includes('vs') || lowerContent.includes('antes') || lowerContent.includes('después') || 
      lowerContent.includes('comparación')) {
    return 'comparison';
  }
  
  if (/\d+%/.test(content) || lowerContent.includes('estadística') || lowerContent.includes('datos') || 
      lowerContent.includes('número')) {
    return 'stats';
  }
  
  if (lowerContent.includes('imagen') || lowerContent.includes('foto') || lowerContent.includes('visual')) {
    return 'image-text';
  }
  
  // Default to content template
  return 'content';
}

/**
 * Creates default slides for a new carousel post
 */
export function createDefaultCarouselSlides(hook: string, cta: string): Slide[] {
  return [
    {
      id: `slide-${Date.now()}-0`,
      title: hook,
      content: 'Desliza para ver más →',
      template: 'title',
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      textColor: '#ffffff',
      fontSize: 'large',
      alignment: 'center'
    },
    {
      id: `slide-${Date.now()}-1`,
      title: 'Punto Clave 1',
      content: 'Explica el primer punto importante de tu contenido.',
      template: 'content',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      fontSize: 'medium',
      alignment: 'center'
    },
    {
      id: `slide-${Date.now()}-2`,
      title: 'Punto Clave 2',
      content: 'Desarrolla el segundo aspecto relevante.',
      template: 'content',
      backgroundColor: '#f8fafc',
      textColor: '#1f2937',
      fontSize: 'medium',
      alignment: 'center'
    },
    {
      id: `slide-${Date.now()}-3`,
      title: cta,
      content: '¿Te gustó este contenido? ¡Síguenos para más!',
      template: 'cta',
      backgroundColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      textColor: '#ffffff',
      fontSize: 'medium',
      alignment: 'center'
    }
  ];
}

/**
 * Ensures a PostContent has slides if it's a carousel
 */
export function ensureSlidesForPost(post: PostContent): PostContent {
  if (post.postType === 'carousel' && (!post.slides || post.slides.length === 0)) {
    // Create slides from slide_ideas if they exist, otherwise create default slides
    const slides = post.slide_ideas.length > 0 
      ? convertSlideIdeasToSlides(post.slide_ideas)
      : createDefaultCarouselSlides(post.hook, post.CTA);
    
    return {
      ...post,
      slides
    };
  }
  
  return post;
}

/**
 * Template configurations for quick slide creation
 */
export const slideTemplateConfigs = {
  title: {
    defaultTitle: 'Título Principal',
    defaultContent: 'Subtítulo o descripción',
    suggestedBackgrounds: ['linear-gradient(135deg, #667eea 0%, #764ba2 100%)', '#3b82f6', '#1f2937'],
    suggestedTextColor: '#ffffff',
    suggestedFontSize: 'large' as const
  },
  content: {
    defaultTitle: 'Punto Importante',
    defaultContent: 'Desarrolla tu idea principal aquí con detalles relevantes.',
    suggestedBackgrounds: ['#ffffff', '#f8fafc', '#f1f5f9'],
    suggestedTextColor: '#1f2937',
    suggestedFontSize: 'medium' as const
  },
  quote: {
    defaultTitle: 'Cita Inspiradora',
    defaultContent: '"Esta es una frase que impactará a tu audiencia"',
    suggestedBackgrounds: ['#fef3c7', '#ddd6fe', '#fce7f3'],
    suggestedTextColor: '#1f2937',
    suggestedFontSize: 'large' as const
  },
  list: {
    defaultTitle: 'Lista de Puntos',
    defaultContent: '• Punto 1 importante\n• Punto 2 relevante\n• Punto 3 destacado',
    suggestedBackgrounds: ['#ffffff', '#f0f9ff', '#f0fdf4'],
    suggestedTextColor: '#1f2937',
    suggestedFontSize: 'medium' as const
  },
  'image-text': {
    defaultTitle: 'Imagen con Texto',
    defaultContent: 'Texto descriptivo que acompaña la imagen visual.',
    suggestedBackgrounds: ['#ffffff', '#f8fafc'],
    suggestedTextColor: '#1f2937',
    suggestedFontSize: 'medium' as const
  },
  cta: {
    defaultTitle: '¡Actúa Ahora!',
    defaultContent: '¿Estás listo para dar el siguiente paso? ¡Haz clic aquí!',
    suggestedBackgrounds: ['linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', '#10b981', '#f97316'],
    suggestedTextColor: '#ffffff',
    suggestedFontSize: 'large' as const
  },
  comparison: {
    defaultTitle: 'Antes vs Después',
    defaultContent: 'ANTES: Situación problemática\n\nDESPUÉS: Situación mejorada',
    suggestedBackgrounds: ['#ffffff', '#fef2f2', '#f0fdf4'],
    suggestedTextColor: '#1f2937',
    suggestedFontSize: 'medium' as const
  },
  stats: {
    defaultTitle: 'Datos Impactantes',
    defaultContent: '85% mejora\n2x más resultados\n500+ usuarios',
    suggestedBackgrounds: ['#1e293b', '#7c2d12', '#4c1d95'],
    suggestedTextColor: '#ffffff',
    suggestedFontSize: 'large' as const
  }
};

/**
 * Creates a new slide with template-specific defaults
 */
export function createSlideFromTemplate(template: SlideTemplate): Slide {
  const config = slideTemplateConfigs[template];
  
  return {
    id: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: config.defaultTitle,
    content: config.defaultContent,
    template,
    backgroundColor: config.suggestedBackgrounds[0],
    textColor: config.suggestedTextColor,
    fontSize: config.suggestedFontSize,
    alignment: 'center'
  };
}