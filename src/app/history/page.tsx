'use client';

import { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useApp } from '@/stores/AppContext';
import { PostContent, SocialPlatform, PostStatus } from '@/types';

export default function HistoryPage() {
  const { state, updatePost, deletePost } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PostStatus>('all');
  const [platformFilter, setPlatformFilter] = useState<'all' | SocialPlatform>('all');
  const [sortBy, setSortBy] = useState<'date' | 'platform' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPost, setSelectedPost] = useState<PostContent | null>(null);

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = state.posts;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.hook.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.hashtags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(post => post.status === statusFilter);
    }

    // Apply platform filter
    if (platformFilter !== 'all') {
      filtered = filtered.filter(post => post.platform === platformFilter);
    }

    // Sort posts
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'platform':
          comparison = a.platform.localeCompare(b.platform);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [state.posts, searchTerm, statusFilter, platformFilter, sortBy, sortOrder]);

  // Helper functions
  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case 'facebook': return '📘';
      case 'instagram': return '📸';
      case 'tiktok': return '🎵';
      case 'linkedin': return '💼';
      default: return '📱';
    }
  };

  const getPlatformName = (platform: SocialPlatform) => {
    switch (platform) {
      case 'facebook': return 'Facebook';
      case 'instagram': return 'Instagram';
      case 'tiktok': return 'TikTok';
      case 'linkedin': return 'LinkedIn';
      default: return 'Red Social';
    }
  };

  const getPostTypeName = (postType: string) => {
    switch (postType) {
      case 'post': return 'Post';
      case 'carousel': return 'Carrusel';
      case 'story': return 'Historia';
      case 'reel': return 'Reel';
      default: return 'Publicación';
    }
  };

  const getStatusBadge = (status: PostStatus) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Borrador
          </span>
        );
      case 'generated':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Generado
          </span>
        );
      case 'published':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Publicado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSort = (column: 'date' | 'platform' | 'status') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handleDownload = (post: PostContent) => {
    // For now, create a simple text file with post content
    // In a real implementation, you'd download the actual generated image
    const content = `Post ID: ${post.id}
Plataforma: ${getPlatformName(post.platform)}
Tipo: ${getPostTypeName(post.postType)}
Estado: ${post.status}
Fecha: ${formatDate(post.createdAt)}

Hook:
${post.hook}

Contenido:
${post.caption}

Call to Action:
${post.CTA}

Hashtags:
${post.hashtags.join(', ')}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `post-${post.id}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleDelete = async (post: PostContent) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este post? Esta acción no se puede deshacer.')) {
      try {
        await deletePost(post.id);
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error al eliminar el post. Por favor, inténtalo de nuevo.');
      }
    }
  };

  return (
    <ProtectedRoute>
      <Layout title="Historial">
        <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-title">Historial de Posts</h2>
            <p className="text-gray-600">Revisa todos tus posts generados y publicados</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por contenido, hashtags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | PostStatus)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="draft">Borradores</option>
                <option value="generated">Generados</option>
                <option value="published">Publicados</option>
              </select>
              
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value as 'all' | SocialPlatform)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Todas las redes</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </div>
          </div>
        </div>

        {/* Posts Table/Cards */}
        {filteredAndSortedPosts.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-gray-400 text-3xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {state.posts.length === 0 ? 'No hay posts en tu historial' : 'No se encontraron posts'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {state.posts.length === 0 
                  ? 'Una vez que generes tu primer post con IA, aparecerá aquí para que puedas revisarlo y gestionarlo.'
                  : 'Intenta cambiar los filtros de búsqueda para encontrar los posts que buscas.'
                }
              </p>
              {state.posts.length === 0 && (
                <a
                  href="/generate"
                  className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors duration-200 inline-block"
                >
                  Generar mi primer post
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Fecha</span>
                        {sortBy === 'date' && (
                          <span className="text-red-500">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('platform')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Plataforma</span>
                        {sortBy === 'platform' && (
                          <span className="text-red-500">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Estado</span>
                        {sortBy === 'status' && (
                          <span className="text-red-500">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contenido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(post.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{getPlatformIcon(post.platform)}</span>
                          <span className="text-sm font-medium text-gray-900">
                            {getPlatformName(post.platform)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getPostTypeName(post.postType)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(post.status)}
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="text-sm text-gray-900 truncate" title={post.hook}>
                          {post.hook.length > 50 ? `${post.hook.substring(0, 50)}...` : post.hook}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedPost(post)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors duration-200"
                            title="Ver detalles"
                          >
                            👁️ Ver
                          </button>
                          <button
                            onClick={() => handleDownload(post)}
                            className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors duration-200"
                            title="Descargar contenido"
                          >
                            📥 Descargar
                          </button>
                          <button
                            onClick={() => handleDelete(post)}
                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors duration-200"
                            title="Eliminar post"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray-200">
              {filteredAndSortedPosts.map((post) => (
                <div key={post.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getPlatformIcon(post.platform)}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {getPlatformName(post.platform)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getPostTypeName(post.postType)} • {formatDate(post.createdAt)}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(post.status)}
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-900 line-clamp-2">
                      {post.hook}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedPost(post)}
                      className="flex-1 text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      👁️ Ver
                    </button>
                    <button
                      onClick={() => handleDownload(post)}
                      className="flex-1 text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      📥 Descargar
                    </button>
                    <button
                      onClick={() => handleDelete(post)}
                      className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Post Preview Modal */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getPlatformIcon(selectedPost.platform)}</span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 font-title">
                      Detalles del Post
                    </h2>
                    <p className="text-sm text-gray-600">
                      {getPlatformName(selectedPost.platform)} • {getPostTypeName(selectedPost.postType)} • {formatDate(selectedPost.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Estado:</span>
                  {getStatusBadge(selectedPost.status)}
                </div>

                {/* Hook */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Hook:</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedPost.hook}</p>
                  </div>
                </div>

                {/* Caption */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Contenido:</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedPost.caption}</p>
                  </div>
                </div>

                {/* CTA */}
                {selectedPost.CTA && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Call to Action:</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedPost.CTA}</p>
                    </div>
                  </div>
                )}

                {/* Hashtags */}
                {selectedPost.hashtags && selectedPost.hashtags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Hashtags:</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPost.hashtags.map((hashtag, index) => (
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

                {/* Slide Ideas */}
                {selectedPost.slide_ideas && selectedPost.slide_ideas.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Ideas de Slides:</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <ul className="list-disc list-inside space-y-1">
                        {selectedPost.slide_ideas.map((idea, index) => (
                          <li key={index} className="text-gray-900">{idea}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                >
                  Cerrar
                </button>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      handleDownload(selectedPost);
                      setSelectedPost(null);
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200"
                  >
                    📥 Descargar
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(selectedPost);
                      setSelectedPost(null);
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}