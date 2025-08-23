import Layout from '@/components/Layout';

export default function Home() {
  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-red-500 to-orange-400 rounded-xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4 font-title">
            ¡Bienvenido a Post-Tron! 🚀
          </h2>
          <p className="text-lg opacity-90 mb-6">
            Tu asistente inteligente para crear contenido viral en redes sociales. 
            Genera posts increíbles con IA en segundos.
          </p>
          <button className="bg-white text-red-500 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
            Crear mi primer post
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Posts Generados</p>
                <p className="text-3xl font-bold text-gray-900">24</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">📝</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Posts Publicados</p>
                <p className="text-3xl font-bold text-gray-900">18</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Engagement</p>
                <p className="text-3xl font-bold text-gray-900">+45%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">📈</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 font-title">Posts Recientes</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">📄</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No hay posts aún</h4>
              <p className="text-gray-600 mb-4">
                Comienza creando tu primer post con nuestra IA
              </p>
              <button className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200">
                Generar Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
