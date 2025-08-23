# Post-Tron 🚀

**Generador de Contenido para Redes Sociales con IA**

Post-Tron es una webapp moderna que te permite generar contenido viral para redes sociales usando inteligencia artificial. Conecta con Flowise para la generación de contenido y n8n para la publicación automática.

## ✨ Características

- **🎨 Interfaz moderna** inspirada en Artiq con gradientes y animaciones
- **🤖 Generación con IA** a través de Flowise
- **📱 Multi-plataforma** (Facebook, Instagram, TikTok, LinkedIn)
- **📝 Tipos de contenido** (Posts, Carruseles, Stories, Reels)
- **🔄 Publicación automática** con n8n
- **✏️ Editor integrado** para revisar y modificar contenido
- **📊 Dashboard** con métricas y estadísticas
- **⚙️ Configuración flexible** de APIs y preferencias

## 🚀 Instalación

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

3. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🔧 Configuración

### 1. Configurar Flowise

1. Ve a **Configuración** en la app
2. Ingresa tu URL de Flowise:
   ```
   https://tu-flowise-instance.com/api/v1/prediction/your-chatflow-id
   ```

**Prompt recomendado para Flowise:**
```
Eres un experto en marketing digital y creación de contenido para redes sociales. 

Tu tarea es generar contenido optimizado para {platform} con las siguientes especificaciones:
- Tipo de publicación: {postType}
- Tono: {tone} 
- Longitud: {length}

Genera contenido basado en esta idea: {idea}

Responde SOLO en formato JSON válido:
{
  "text": "contenido del post optimizado para la plataforma",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "images": ["descripción de imagen 1", "descripción de imagen 2"]
}
```

### 2. Configurar n8n

1. Crea un workflow en n8n con un webhook
2. Configura el webhook para recibir:
   ```json
   {
     "platform": "instagram",
     "content": {
       "text": "texto del post",
       "images": ["desc1", "desc2"],
       "hashtags": ["#tag1", "#tag2"]
     },
     "postType": "post",
     "postId": "post_123"
   }
   ```
3. Ingresa la URL del webhook en **Configuración**

### 3. Conectar Redes Sociales

En **Configuración > Cuentas de Redes Sociales**, marca las plataformas que tienes configuradas en tu workflow de n8n.

## 📱 Uso

### Generar un Post

1. **Ve a "Generar Post"**
2. **Describe tu idea** (sé específico sobre mensaje, audiencia y llamada a la acción)
3. **Selecciona la red social** (Facebook, Instagram, TikTok, LinkedIn)
4. **Elige el tipo de publicación** (las opciones cambian según la plataforma)
5. **Configura tono y longitud**
6. **Click en "Generar Contenido con IA"**

### Revisar y Publicar

1. **Revisa el contenido generado** en la vista previa
2. **Edita si es necesario** usando el editor integrado
3. **Guarda como borrador** o **Aprueba y Publica**

### Dashboard

- **Métricas**: Posts generados, publicados y engagement
- **Posts recientes**: Historial de tu contenido
- **Acceso rápido**: Enlaces a generación y configuración

## 🎨 Características del Diseño

### Inspirado en Artiq
- **Colores**: Gradientes rojo-naranja (#ff1d1d a #ff9776)
- **Tipografías**: Jost para títulos, Inter para texto
- **Animaciones**: Transiciones suaves y efectos hover
- **Layout**: Sidebar responsive con navegación intuitiva

### Componentes Visuales
- **Cards con sombras** y bordes redondeados
- **Botones con gradientes** y estados de carga
- **Iconos SVG** integrados
- **Estados responsivos** para móvil y desktop

## 🔄 Flujo de Trabajo

```
Usuario escribe idea
       ↓
Selecciona plataforma y tipo
       ↓
Post-Tron envía a Flowise
       ↓
IA genera contenido
       ↓
Usuario revisa en preview
       ↓
Usuario edita (opcional)
       ↓
Usuario aprueba
       ↓
Post-Tron envía a n8n
       ↓
n8n publica automáticamente
```

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 15 + TypeScript
- **Estilos**: Tailwind CSS v4
- **Estado**: Context API de React
- **APIs**: Fetch nativo
- **Iconos**: SVG personalizados

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar build
npm start

# Linting
npm run lint
```

## 🚨 Solución de Problemas

### Error: "No se puede generar contenido"
- Verifica que la URL de Flowise esté configurada correctamente
- Asegúrate de que el chatflow esté activo y accesible

### Error: "No se puede publicar"
- Verifica que la URL de n8n esté configurada
- Confirma que el webhook esté funcionando
- Revisa que las plataformas estén conectadas en configuración

### Problemas de diseño
- Asegúrate de que Tailwind CSS esté cargando correctamente
- Verifica que las fuentes de Google estén disponibles

## 🔮 Próximas Funcionalidades

- [ ] Análisis de engagement en tiempo real
- [ ] Plantillas predefinidas por industria
- [ ] Programación de publicaciones
- [ ] Integración con más plataformas
- [ ] Dashboard de analíticas avanzado
- [ ] Colaboración en equipo

---

**¡Disfruta creando contenido viral con Post-Tron! 🚀**
