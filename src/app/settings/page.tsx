'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useApp, actions } from '@/stores/AppContext';
import { Logo } from '@/services/database';

export default function SettingsPage() {
  const { state, saveSettings } = useApp();
  const [formData, setFormData] = useState(state.settings);
  const [isSaving, setIsSaving] = useState(false);

  // Logo management state
  const [logos, setLogos] = useState<Logo[]>([]);
  const [isLoadingLogos, setIsLoadingLogos] = useState(true);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoName, setLogoName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Load logos on component mount
  useEffect(() => {
    loadLogos();
  }, []);

  const loadLogos = async () => {
    try {
      const response = await fetch('/api/logos');
      const data = await response.json();
      if (response.ok) {
        setLogos(data.logos);
      }
    } catch (error) {
      console.error('Error loading logos:', error);
    } finally {
      setIsLoadingLogos(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Auto-generate name from filename if empty
      if (!logoName) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setLogoName(nameWithoutExt);
      }
    }
  };

  const handleUploadLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !logoName) return;

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', logoName);

      const response = await fetch('/api/logos', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        setLogos(prev => [data.logo, ...prev]);
        setLogoName('');
        setSelectedFile(null);
        setPreviewUrl('');
        // Reset file input
        const fileInput = document.getElementById('logoFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        alert('✅ Logo uploaded successfully!');
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      alert('❌ Error uploading logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleDeleteLogo = async (logoId: string) => {
    if (!confirm('Are you sure you want to delete this logo?')) return;

    try {
      const response = await fetch(`/api/logos/${logoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLogos(prev => prev.filter(logo => logo.id !== logoId));
        alert('✅ Logo deleted successfully!');
      } else {
        alert('❌ Error deleting logo');
      }
    } catch (error) {
      alert('❌ Error deleting logo');
    }
  };

  const handleUpdateLogoName = async (logoId: string, newName: string) => {
    try {
      const response = await fetch(`/api/logos/${logoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setLogos(prev => prev.map(logo => 
          logo.id === logoId ? data.logo : logo
        ));
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      alert('❌ Error updating logo name');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Save to database
      await saveSettings({
        flowiseApiUrl: formData.flowiseApiUrl,
        n8nWebhookUrl: formData.n8nWebhookUrl
      });
      
      alert('✅ Configuración guardada exitosamente!');
      
    } catch (error) {
      alert('❌ Error al guardar configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const togglePlatform = (platform: keyof typeof formData.connectedPlatforms) => {
    setFormData(prev => ({
      ...prev,
      connectedPlatforms: {
        ...prev.connectedPlatforms,
        [platform]: !prev.connectedPlatforms[platform]
      }
    }));
  };

  const togglePreference = (preference: keyof typeof formData.preferences) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [preference]: !prev.preferences[preference]
      }
    }));
  };
  return (
    <ProtectedRoute>
      <Layout title="Configuración">
        <div className="max-w-4xl mx-auto space-y-8">
        {/* Logo Management - Separate from main form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 font-title">
            🏷️ Brand Logos
          </h3>
          
          {/* Upload Logo Form */}
          <div className="mb-6 p-6 border border-dashed border-gray-300 rounded-xl bg-gradient-to-br from-gray-50 to-white">
            <div className="text-center mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
              </svg>
              <h4 className="text-lg font-semibold text-gray-900 mb-1">Upload New Logo</h4>
              <p className="text-sm text-gray-500">Add your brand logos to use in posts</p>
            </div>
            
            <form onSubmit={handleUploadLogo} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="logoName" className="block text-sm font-medium text-gray-700 mb-2">
                    📝 Logo Name
                  </label>
                  <input
                    type="text"
                    id="logoName"
                    value={logoName}
                    onChange={(e) => setLogoName(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    placeholder="Company Logo"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="logoFile" className="block text-sm font-medium text-gray-700 mb-2">
                    🖼️ Logo File
                  </label>
                  <input
                    type="file"
                    id="logoFile"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                    required
                  />
                </div>
              </div>

              {previewUrl && (
                <div className="flex justify-center">
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-white">
                    <p className="text-sm font-medium text-gray-700 mb-3 text-center">Preview:</p>
                    <div className="bg-gray-50 rounded-lg p-4 min-h-[80px] flex items-center justify-center">
                      <img 
                        src={previewUrl} 
                        alt="Logo preview" 
                        className="max-h-16 max-w-32 object-contain"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!selectedFile || !logoName || isUploadingLogo}
                  className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium shadow-lg hover:shadow-xl"
                >
                  {isUploadingLogo ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload Logo
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Logos Gallery */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">
                📁 Your Logo Library 
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({logos.length} logo{logos.length !== 1 ? 's' : ''})
                </span>
              </h4>
              {logos.length > 0 && (
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  Total: {Math.round(logos.reduce((sum, logo) => sum + logo.file_size, 0) / 1024)} KB
                </div>
              )}
            </div>
            
            {isLoadingLogos ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              </div>
            ) : logos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>No logos uploaded yet</p>
                <p className="text-sm">Upload your first logo using the form above</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {logos.map((logo) => (
                  <div key={logo.id} className="group relative border border-gray-200 rounded-xl p-4 bg-white hover:shadow-lg hover:border-red-200 transition-all duration-200">
                    {/* Logo Image with better styling */}
                    <div className="relative bg-gray-50 rounded-lg p-4 mb-4 min-h-[120px] flex items-center justify-center">
                      <img 
                        src={logo.url} 
                        alt={logo.name}
                        className="max-h-24 max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0Y5RkFGQiIvPgo8cGF0aCBkPSJNMTIgMjhIMjhWMjJMMjMgMTdMMTggMjJMMTUgMTlMMTIgMjJWMjhaIiBmaWxsPSIjRDFEOUU2Ii8+CjxjaXJjbGUgY3g9IjE2IiBjeT0iMTQiIHI9IjIiIGZpbGw9IiNEMUQ5RTYiLz4KPC9zdmc+';
                        }}
                      />
                      
                      {/* File size badge */}
                      <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-full">
                        {Math.round(logo.file_size / 1024)} KB
                      </div>
                    </div>
                    
                    {/* Logo Info */}
                    <div className="space-y-3">
                      {/* Editable Name */}
                      <input
                        type="text"
                        value={logo.name}
                        onChange={(e) => handleUpdateLogoName(logo.id, e.target.value)}
                        className="w-full px-3 py-2 text-sm font-medium text-gray-900 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-red-300 focus:ring-2 focus:ring-red-100 transition-all duration-200"
                        placeholder="Logo name..."
                      />
                      
                      {/* Dimensions and metadata */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                            {logo.width}×{logo.height}
                          </span>
                        </div>
                        <span className="text-gray-400 text-xs">
                          {logo.mime_type?.split('/')[1]?.toUpperCase() || 'IMAGE'}
                        </span>
                      </div>
                      
                      {/* Action Button */}
                      <button
                        onClick={() => handleDeleteLogo(logo.id)}
                        className="w-full flex items-center justify-center space-x-2 text-red-600 hover:text-white hover:bg-red-500 text-sm py-2 px-3 border border-red-200 rounded-lg hover:border-red-500 transition-all duration-200 group-hover:shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* API Configuration */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 font-title">
              🔧 Configuración de APIs
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="flowise" className="block text-sm font-medium text-gray-700 mb-2">
                  Flowise API URL
                </label>
                <input
                  type="url"
                  id="flowise"
                  value={formData.flowiseApiUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, flowiseApiUrl: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="https://tu-flowise-instance.com/api/v1/prediction/your-chatflow-id"
                />
                <p className="mt-1 text-sm text-gray-500">
                  URL de tu chatflow de Flowise para generación de contenido
                </p>
              </div>
              
              <div>
                <label htmlFor="n8n" className="block text-sm font-medium text-gray-700 mb-2">
                  n8n Webhook URL
                </label>
                <input
                  type="url"
                  id="n8n"
                  value={formData.n8nWebhookUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, n8nWebhookUrl: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="https://tu-n8n-instance.com/webhook/publicar-post"
                />
                <p className="mt-1 text-sm text-gray-500">
                  URL del webhook de n8n para publicación automática
                </p>
              </div>
            </div>
          </div>

          {/* Social Media Accounts */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 font-title">
              📱 Cuentas de Redes Sociales
            </h3>
            <div className="space-y-4">
              {[
                { key: 'facebook', name: 'Facebook', icon: '📘' },
                { key: 'instagram', name: 'Instagram', icon: '📸' },
                { key: 'tiktok', name: 'TikTok', icon: '🎵' },
                { key: 'linkedin', name: 'LinkedIn', icon: '💼' },
              ].map((platform) => (
                <div key={platform.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{platform.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{platform.name}</p>
                      <p className="text-sm text-gray-500">
                        {formData.connectedPlatforms[platform.key as keyof typeof formData.connectedPlatforms] ? 'Conectado' : 'No conectado'}
                      </p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => togglePlatform(platform.key as keyof typeof formData.connectedPlatforms)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      formData.connectedPlatforms[platform.key as keyof typeof formData.connectedPlatforms]
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {formData.connectedPlatforms[platform.key as keyof typeof formData.connectedPlatforms] ? 'Desconectar' : 'Conectar'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 font-title">
              ⚙️ Preferencias
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Notificaciones de email</p>
                  <p className="text-sm text-gray-500">Recibe notificaciones cuando se publiquen posts</p>
                </div>
                <button 
                  type="button"
                  onClick={() => togglePreference('emailNotifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    formData.preferences.emailNotifications ? 'bg-red-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    formData.preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}></span>
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Aprobación automática</p>
                  <p className="text-sm text-gray-500">Publicar automáticamente sin revisión previa</p>
                </div>
                <button 
                  type="button"
                  onClick={() => togglePreference('autoApproval')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    formData.preferences.autoApproval ? 'bg-red-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    formData.preferences.autoApproval ? 'translate-x-6' : 'translate-x-1'
                  }`}></span>
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={isSaving}
              className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </span>
              ) : (
                'Guardar Configuración'
              )}
            </button>
          </div>
        </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}