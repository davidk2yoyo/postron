'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import ContentPreview from '@/components/ContentPreview';
import { useApp, actions } from '@/stores/AppContext';
import { useServices, createPostFromResponse } from '@/utils/api';
import { GeneratePostRequest, SocialPlatform, PostType, PostTone, PostLength, PostContent } from '@/types';

export default function GeneratePage() {
  const { state, dispatch, savePost, updatePost: updatePostInDb } = useApp();
  const { flowiseService, n8nService } = useServices(state.settings.flowiseApiUrl, state.settings.n8nWebhookUrl);
  
  const [formData, setFormData] = useState<GeneratePostRequest>({
    idea: '',
    platform: '' as SocialPlatform,
    postType: '' as PostType,
    tone: 'professional' as PostTone,
    length: 'medium' as PostLength,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.idea || !formData.platform || !formData.postType) {
      dispatch(actions.setError('Por favor completa todos los campos requeridos'));
      return;
    }

    if (!state.settings.flowiseApiUrl) {
      dispatch(actions.setError('Por favor configura la URL de Flowise en Configuración'));
      return;
    }

    try {
      dispatch(actions.setGenerating(true));
      dispatch(actions.clearError());

      const response = await flowiseService.generateContent(formData);
      const post = createPostFromResponse(formData, response);
      
      // Save to database instead of just updating context
      await savePost(post);
      
      // Reset form
      setFormData({
        idea: '',
        platform: '' as SocialPlatform,
        postType: '' as PostType,
        tone: 'professional',
        length: 'medium',
      });

    } catch (error) {
      dispatch(actions.setError(error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      dispatch(actions.setGenerating(false));
    }
  };

  const handleInputChange = (field: keyof GeneratePostRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getPostTypeOptions = () => {
    const options: { value: PostType; label: string }[] = [];
    
    switch (formData.platform) {
      case 'facebook':
        return [
          { value: 'post', label: 'Post Simple' },
          { value: 'carousel', label: 'Carrusel' },
        ];
      case 'instagram':
        return [
          { value: 'post', label: 'Post' },
          { value: 'carousel', label: 'Carrusel' },
          { value: 'story', label: 'Historia' },
          { value: 'reel', label: 'Reel' },
        ];
      case 'tiktok':
        return [
          { value: 'reel', label: 'Video Corto' },
        ];
      case 'linkedin':
        return [
          { value: 'post', label: 'Post' },
          { value: 'carousel', label: 'Carrusel' },
        ];
      default:
        return [{ value: 'post', label: 'Post Simple' }];
    }
  };

  const handleEditPost = async (updatedPost: PostContent) => {
    try {
      await updatePostInDb(updatedPost.id, updatedPost);
      dispatch(actions.setCurrentPost(updatedPost));
    } catch (error) {
      // Error is already handled in the context
    }
  };

  const handlePublishPost = async (post: PostContent) => {
    if (!state.settings.n8nWebhookUrl) {
      // Mockup for now - just show success message
      alert('🎉 Post programado para publicación!\n\n(Esto es un mockup. En producción se enviará al webhook de n8n)');
      await updatePostInDb(post.id, { status: 'published' });
      return;
    }

    try {
      dispatch(actions.setPublishing(true));
      await n8nService.publishPost(post);
      await updatePostInDb(post.id, { status: 'published' });
      alert('🎉 Post publicado exitosamente!');
    } catch (error) {
      dispatch(actions.setError('Error al publicar el post'));
    } finally {
      dispatch(actions.setPublishing(false));
    }
  };
  return (
    <Layout title="Generar Post">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 font-title">
            Crea contenido increíble para tus redes sociales
          </h2>
          <p className="text-lg text-gray-600">
            Describe tu idea y nuestra IA generará contenido optimizado para cada plataforma
          </p>
        </div>

        {/* Error Message */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{state.error}</p>
                </div>
                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <button
                      type="button"
                      onClick={() => dispatch(actions.clearError())}
                      className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Idea Input */}
            <div>
              <label htmlFor="idea" className="block text-sm font-medium text-gray-700 mb-2">
                💡 Describe tu idea
              </label>
              <textarea
                id="idea"
                name="idea"
                rows={4}
                value={formData.idea}
                onChange={(e) => handleInputChange('idea', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                placeholder="Ej: Quiero promocionar mi nuevo curso de marketing digital, destacando que es perfecto para principiantes y tiene descuento por tiempo limitado..."
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Sé específico sobre tu mensaje, audiencia objetivo y llamada a la acción
              </p>
            </div>

            {/* Social Network Selection */}
            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-2">
                📱 Red Social
              </label>
              <select
                id="platform"
                name="platform"
                value={formData.platform}
                onChange={(e) => {
                  handleInputChange('platform', e.target.value);
                  handleInputChange('postType', ''); // Reset post type when platform changes
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="">Selecciona una plataforma</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </div>

            {/* Post Type Selection */}
            <div>
              <label htmlFor="postType" className="block text-sm font-medium text-gray-700 mb-2">
                📝 Tipo de Publicación
              </label>
              <select
                id="postType"
                name="postType"
                value={formData.postType}
                onChange={(e) => handleInputChange('postType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
                disabled={!formData.platform}
              >
                <option value="">Selecciona el tipo de contenido</option>
                {getPostTypeOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Additional Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
                  🎭 Tono
                </label>
                <select
                  id="tone"
                  name="tone"
                  value={formData.tone}
                  onChange={(e) => handleInputChange('tone', e.target.value as PostTone)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="professional">Profesional</option>
                  <option value="casual">Casual</option>
                  <option value="funny">Divertido</option>
                  <option value="inspiring">Inspirador</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div>
                <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-2">
                  📏 Longitud
                </label>
                <select
                  id="length"
                  name="length"
                  value={formData.length}
                  onChange={(e) => handleInputChange('length', e.target.value as PostLength)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="short">Corto</option>
                  <option value="medium">Medio</option>
                  <option value="long">Largo</option>
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={state.isGenerating}
                className="w-full bg-gradient-to-r from-red-500 to-orange-400 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-red-600 hover:to-orange-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state.isGenerating ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generando contenido...
                  </span>
                ) : (
                  '✨ Generar Contenido con IA'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tips Section */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 font-title">
            💡 Tips para mejores resultados
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Incluye detalles específicos sobre tu producto o servicio</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Menciona tu audiencia objetivo (ej: "para emprendedores", "para padres")</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Incluye llamadas a la acción claras (comprar, registrarse, compartir)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Añade contexto temporal si es relevante (ofertas limitadas, eventos)</span>
            </li>
          </ul>
        </div>

        {/* Generated Content Preview */}
        {state.currentPost && (
          <ContentPreview
            post={state.currentPost}
            onEdit={handleEditPost}
            onPublish={handlePublishPost}
          />
        )}
      </div>
    </Layout>
  );
}