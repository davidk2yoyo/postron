import Layout from '@/components/Layout';

export default function HistoryPage() {
  return (
    <Layout title="Historial">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-title">Historial de Posts</h2>
            <p className="text-gray-600">Revisa todos tus posts generados y publicados</p>
          </div>
          <div className="flex space-x-3">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
              <option>Todos los posts</option>
              <option>Publicados</option>
              <option>Borradores</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
              <option>Todas las redes</option>
              <option>Facebook</option>
              <option>Instagram</option>
              <option>TikTok</option>
              <option>LinkedIn</option>
            </select>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-gray-400 text-3xl">📚</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No hay posts en tu historial</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Una vez que generes tu primer post con IA, aparecerá aquí para que puedas revisarlo y gestionarlo.
            </p>
            <button className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors duration-200">
              Generar mi primer post
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}