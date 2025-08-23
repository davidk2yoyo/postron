'use client';

import { useState } from 'react';
import { PostContent } from '@/types';
import { useApp, actions } from '@/stores/AppContext';
import { useServices } from '@/utils/api';

interface PostPreviewProps {
  post: PostContent;
  onClose: () => void;
}

export default function PostPreview({ post, onClose }: PostPreviewProps) {
  const { state, dispatch } = useApp();
  const { n8nService } = useServices(state.settings.flowiseApiUrl, state.settings.n8nWebhookUrl);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(post.text);

  const handleSaveEdit = () => {
    dispatch(actions.updatePost(post.id, { text: editedText }));
    setIsEditing(false);
  };

  const handleApproveAndPublish = async () => {
    if (!state.settings.n8nWebhookUrl) {
      dispatch(actions.setError('Por favor configura la URL de n8n en Configuración'));
      return;
    }

    try {
      dispatch(actions.setPublishing(true));
      dispatch(actions.clearError());
      
      await n8nService.publishPost(post);
      
      dispatch(actions.updatePost(post.id, { status: 'published' }));
      dispatch(actions.setCurrentPost(null));
      onClose();
      
    } catch (error) {
      dispatch(actions.setError(error instanceof Error ? error.message : 'Error al publicar'));
      dispatch(actions.updatePost(post.id, { status: 'failed' }));
    } finally {
      dispatch(actions.setPublishing(false));
    }
  };

  const handleSaveAsDraft = () => {
    dispatch(actions.updatePost(post.id, { status: 'draft' }));
    dispatch(actions.setCurrentPost(null));
    onClose();
  };

  const getPlatformIcon = () => {
    switch (post.platform) {
      case 'facebook': return '📘';
      case 'instagram': return '📸';
      case 'tiktok': return '🎵';
      case 'linkedin': return '💼';
      default: return '📱';
    }
  };

  const getPlatformName = () => {
    switch (post.platform) {
      case 'facebook': return 'Facebook';
      case 'instagram': return 'Instagram';
      case 'tiktok': return 'TikTok';
      case 'linkedin': return 'LinkedIn';
      default: return 'Red Social';
    }
  };

  const getPostTypeName = () => {
    switch (post.postType) {
      case 'post': return 'Post';
      case 'carousel': return 'Carrusel';
      case 'story': return 'Historia';
      case 'reel': return 'Reel';
      default: return 'Publicación';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getPlatformIcon()}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900 font-title">
                Vista Previa del Post
              </h2>
              <p className="text-sm text-gray-600">
                {getPlatformName()} • {getPostTypeName()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Post Content */}
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Contenido del Post</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {isEditing ? 'Cancelar' : 'Editar'}
              </button>
            </div>
            
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveEdit}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedText(post.text);
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {editedText}
              </div>
            )}
          </div>

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Hashtags</h3>
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((hashtag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {hashtag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Images Suggestions */}
          {post.images && post.images.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Sugerencias de Imágenes</h3>
              <div className="space-y-2">
                {post.images.map((image, index) => (
                  <div
                    key={index}
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                  >
                    <div className="flex items-start">
                      <span className="text-yellow-600 mr-2">🖼️</span>
                      <p className="text-yellow-800 text-sm">{image}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleSaveAsDraft}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200"
          >
            Guardar como Borrador
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Volver a Editar
            </button>
            <button
              onClick={handleApproveAndPublish}
              disabled={state.isPublishing}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state.isPublishing ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Publicando...
                </span>
              ) : (
                '🚀 Aprobar y Publicar'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}