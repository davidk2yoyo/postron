'use client';

import { useState } from 'react';
import { PostContent, Slide } from '@/types';
import ImageEditor from './ImageEditor';
import SlideEditor from './SlideEditor';
import { ensureSlidesForPost, convertSlidesToSlideIdeas } from '@/utils/slideConverter';

interface ContentPreviewProps {
  post: PostContent;
  onEdit: (updatedPost: PostContent) => void;
  onPublish: (post: PostContent) => void;
}

export default function ContentPreview({ post, onEdit, onPublish }: ContentPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPost, setEditedPost] = useState<PostContent>(ensureSlidesForPost(post));
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [showSlideEditor, setShowSlideEditor] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(post.status || 'generated');

  const handleSaveEdit = () => {
    onEdit(editedPost);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedPost(post);
    setIsEditing(false);
  };

  const updateField = (field: keyof PostContent, value: any) => {
    setEditedPost(prev => ({ ...prev, [field]: value }));
  };

  const addSlideIdea = () => {
    setEditedPost(prev => ({
      ...prev,
      slide_ideas: [...prev.slide_ideas, 'Nueva idea de slide']
    }));
  };

  const removeSlideIdea = (index: number) => {
    setEditedPost(prev => ({
      ...prev,
      slide_ideas: prev.slide_ideas.filter((_, i) => i !== index)
    }));
  };

  const updateSlideIdea = (index: number, value: string) => {
    setEditedPost(prev => ({
      ...prev,
      slide_ideas: prev.slide_ideas.map((idea, i) => i === index ? value : idea)
    }));
  };

  const handleStatusUpdate = async (status: 'generated' | 'draft' | 'published') => {
    setCurrentStatus(status);
    // Update the post with new status
    const updatedPost = { ...post, status };
    onEdit(updatedPost);
  };

  const handleCreateImages = () => {
    setShowImageEditor(true);
  };

  const handleEditSlides = () => {
    setShowSlideEditor(true);
  };

  const handleSlidesChange = (slides: Slide[]) => {
    const updatedPost = {
      ...editedPost,
      slides,
      slide_ideas: convertSlidesToSlideIdeas(slides)
    };
    setEditedPost(updatedPost);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'bg-blue-100 text-blue-800';
      case 'editing': return 'bg-yellow-100 text-yellow-800';
      case 'published': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'generated': return '📝 Generado';
      case 'editing': return '✏️ Editando';
      case 'published': return '✅ Publicado';
      default: return status;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-400 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">✨</span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 font-title">
              Contenido Generado
            </h3>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-500">
                {post.platform} • {post.postType}
              </p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentStatus)}`}>
                {getStatusText(currentStatus)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Guardar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                ✏️ Editar Texto
              </button>
              {(post.postType === 'carousel' || post.slides) && (
                <button
                  onClick={handleEditSlides}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-200"
                >
                  🎠 Editar Slides
                </button>
              )}
              {currentStatus === 'generated' && (
                <button
                  onClick={handleCreateImages}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200"
                >
                  🎨 Crear Imágenes
                </button>
              )}
              {currentStatus === 'published' && (
                <button
                  onClick={() => onPublish(post)}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-400 text-white rounded-lg hover:from-green-600 hover:to-emerald-500 transition-all duration-200"
                >
                  ✅ Publicar
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content Preview */}
      <div className="space-y-6">
        {/* Hook */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🎣 Hook (Gancho)
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editedPost.hook}
              onChange={(e) => updateField('hook', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-gray-900 font-medium">{post.hook}</p>
            </div>
          )}
        </div>

        {/* Slide Ideas (only show if carousel or has slide ideas) */}
        {(post.postType === 'carousel' || post.slide_ideas.length > 0) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
              <span>🎠 Ideas de Slides</span>
              {!isEditing && (post.postType === 'carousel' || post.slides) && (
                <button
                  onClick={handleEditSlides}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Editor Avanzado →
                </button>
              )}
            </label>
            {isEditing ? (
              <div className="space-y-2">
                {editedPost.slide_ideas.map((idea, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 w-8">{index + 1}.</span>
                    <input
                      type="text"
                      value={idea}
                      onChange={(e) => updateSlideIdea(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => removeSlideIdea(index)}
                      className="p-2 text-red-500 hover:text-red-700 transition-colors duration-200"
                    >
                      ❌
                    </button>
                  </div>
                ))}
                <button
                  onClick={addSlideIdea}
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                >
                  + Agregar slide
                </button>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <ul className="space-y-2">
                  {post.slide_ideas.map((idea, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-600 font-semibold text-sm mt-1">
                        {index + 1}.
                      </span>
                      <span className="text-gray-900">{idea}</span>
                    </li>
                  ))}
                </ul>
                {post.slides && post.slides.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-sm text-blue-700">
                      💡 Este contenido tiene {post.slides.length} slides diseñados. 
                      Usa el editor avanzado para personalizar colores, tipografía y layouts.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Caption */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📝 Caption (Descripción)
          </label>
          {isEditing ? (
            <textarea
              value={editedPost.caption}
              onChange={(e) => updateField('caption', e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-900 whitespace-pre-wrap">{post.caption}</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📢 Call to Action (CTA)
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editedPost.CTA}
              onChange={(e) => updateField('CTA', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-gray-900 font-semibold">{post.CTA}</p>
            </div>
          )}
        </div>

        {/* Hashtags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            # Hashtags
          </label>
          {isEditing ? (
            <textarea
              value={editedPost.hashtags.join(' ')}
              onChange={(e) => updateField('hashtags', e.target.value.split(' ').filter(tag => tag.length > 0))}
              rows={3}
              placeholder="Separar hashtags con espacios"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          ) : (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((hashtag, index) => (
                  <span
                    key={index}
                    className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-sm"
                  >
                    {hashtag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Slide Editor */}
      {showSlideEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Editor de Slides Avanzado</h2>
              <button
                onClick={() => setShowSlideEditor(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[80vh] overflow-hidden">
              <SlideEditor
                slides={editedPost.slides || []}
                onSlidesChange={handleSlidesChange}
              />
            </div>
          </div>
        </div>
      )}

      {/* Image Editor */}
      {showImageEditor && (
        <div className="mt-8">
          <ImageEditor
            post={post}
            onStatusUpdate={handleStatusUpdate}
          />
        </div>
      )}
    </div>
  );
}