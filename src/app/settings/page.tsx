'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import { useApp, actions } from '@/stores/AppContext';

export default function SettingsPage() {
  const { state, saveSettings } = useApp();
  const [formData, setFormData] = useState(state.settings);
  const [isSaving, setIsSaving] = useState(false);

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
    <Layout title="Configuración">
      <div className="max-w-4xl mx-auto space-y-8">
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
  );
}