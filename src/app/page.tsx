'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useApp } from '@/stores/AppContext';
import { PostContent, SocialPlatform, PostStatus } from '@/types';

export default function Home() {
  const { state } = useApp();

  // Calculate real statistics
  const stats = useMemo(() => {
    const posts = state.posts;
    
    const totalPosts = posts.length;
    const publishedPosts = posts.filter(post => post.status === 'published').length;
    const draftPosts = posts.filter(post => post.status === 'draft').length;
    const generatedPosts = posts.filter(post => post.status === 'generated').length;
    
    // Platform distribution
    const platformStats = posts.reduce((acc, post) => {
      acc[post.platform] = (acc[post.platform] || 0) + 1;
      return acc;
    }, {} as Record<SocialPlatform, number>);

    // Recent activity (posts created in the last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentPosts = posts.filter(post => new Date(post.createdAt) > weekAgo);
    
    return {
      totalPosts,
      publishedPosts,
      draftPosts,
      generatedPosts,
      platformStats,
      recentActivity: recentPosts.length
    };
  }, [state.posts]);

  // Get recent posts (last 5)
  const recentPosts = useMemo(() => {
    return [...state.posts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [state.posts]);

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

  const getStatusBadge = (status: PostStatus) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
            Borrador
          </span>
        );
      case 'generated':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            Generado
          </span>
        );
      case 'published':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            Publicado
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <ProtectedRoute>
      <Layout title="Dashboard">
        <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-red-500 to-orange-400 rounded-xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4 font-title">
              ¡Bienvenido a Post-Tron! 🚀
            </h2>
            <p className="text-lg opacity-90 mb-6">
              Tu asistente inteligente para crear contenido viral en redes sociales. 
              Genera posts increíbles con IA en segundos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                href="/generate" 
                className="bg-white text-red-500 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 text-center"
              >
                ✨ Crear nuevo post
              </Link>
              {state.posts.length > 0 && (
                <Link 
                  href="/history" 
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 text-center border border-red-400"
                >
                  📚 Ver historial
                </Link>
              )}
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/history" className="block group">
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 group-hover:border-blue-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Posts Totales</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalPosts}</p>
                  <p className="text-xs text-blue-600 group-hover:text-blue-700">Ver todos →</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                  <span className="text-blue-600 text-xl">📝</span>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/history?filter=published" className="block group">
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 group-hover:border-green-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Posts Publicados</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.publishedPosts}</p>
                  <p className="text-xs text-green-600 group-hover:text-green-700">Ver publicados →</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
                  <span className="text-green-600 text-xl">✅</span>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/history?filter=generated" className="block group">
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 group-hover:border-purple-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Listos para Publicar</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.generatedPosts}</p>
                  <p className="text-xs text-purple-600 group-hover:text-purple-700">Ver generados →</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-200">
                  <span className="text-purple-600 text-xl">🚀</span>
                </div>
              </div>
            </div>
          </Link>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700">Actividad Reciente</p>
                <p className="text-3xl font-bold text-orange-900">{stats.recentActivity}</p>
                <p className="text-xs text-orange-600">Últimos 7 días</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-xl">📈</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Posts & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Posts */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 font-title">Posts Recientes</h3>
              {recentPosts.length > 0 && (
                <Link 
                  href="/history" 
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Ver todos →
                </Link>
              )}
            </div>
            <div className="p-6">
              {recentPosts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-gray-400 text-2xl">📄</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No hay posts aún</h4>
                  <p className="text-gray-600 mb-4">
                    Comienza creando tu primer post con nuestra IA
                  </p>
                  <Link 
                    href="/generate"
                    className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors duration-200 inline-block"
                  >
                    ✨ Generar mi primer post
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="flex items-start space-x-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">{getPlatformIcon(post.platform)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(post.status)}
                            <span className="text-xs text-gray-500">{formatDate(post.createdAt)}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-900 line-clamp-2 mb-2">
                          {post.hook.length > 80 ? `${post.hook.substring(0, 80)}...` : post.hook}
                        </p>
                        <div className="flex items-center space-x-3">
                          <Link 
                            href={`/history`}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Ver detalles
                          </Link>
                          {post.status === 'generated' && (
                            <span className="text-xs text-purple-600 font-medium">
                              🚀 Listo para publicar
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Stats */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 font-title mb-4">Acciones Rápidas</h3>
              <div className="space-y-3">
                <Link 
                  href="/generate"
                  className="w-full bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <span>✨</span>
                  <span>Crear nuevo post</span>
                </Link>
                
                {stats.generatedPosts > 0 && (
                  <Link 
                    href="/history?filter=generated"
                    className="w-full bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>🚀</span>
                    <span>Publicar posts ({stats.generatedPosts})</span>
                  </Link>
                )}
                
                <Link 
                  href="/settings"
                  className="w-full bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <span>⚙️</span>
                  <span>Configuración</span>
                </Link>
              </div>
            </div>

            {/* Platform Distribution */}
            {stats.totalPosts > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 font-title mb-4">Por Plataforma</h3>
                <div className="space-y-3">
                  {Object.entries(stats.platformStats).map(([platform, count]) => {
                    const percentage = Math.round((count / stats.totalPosts) * 100);
                    return (
                      <div key={platform} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getPlatformIcon(platform as SocialPlatform)}</span>
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {platform}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600 w-8 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
