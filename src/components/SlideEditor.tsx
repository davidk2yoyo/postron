'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export interface Slide {
  id: string;
  title: string;
  content: string;
  template: SlideTemplate;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: 'small' | 'medium' | 'large';
  alignment?: 'left' | 'center' | 'right';
  image?: string;
}

export type SlideTemplate = 'title' | 'content' | 'quote' | 'list' | 'image-text' | 'cta' | 'comparison' | 'stats';

interface SlideEditorProps {
  slides: Slide[];
  onSlidesChange: (slides: Slide[]) => void;
}

const slideTemplates: { [key in SlideTemplate]: { name: string; icon: string; description: string } } = {
  title: { name: 'Título', icon: '📜', description: 'Slide de título principal' },
  content: { name: 'Contenido', icon: '📝', description: 'Slide con contenido de texto' },
  quote: { name: 'Cita', icon: '💬', description: 'Slide con cita destacada' },
  list: { name: 'Lista', icon: '📋', description: 'Slide con lista de puntos' },
  'image-text': { name: 'Imagen + Texto', icon: '🖼️', description: 'Slide con imagen y texto' },
  cta: { name: 'Call to Action', icon: '📢', description: 'Slide de llamada a la acción' },
  comparison: { name: 'Comparación', icon: '⚖️', description: 'Slide de comparación' },
  stats: { name: 'Estadísticas', icon: '📊', description: 'Slide con datos y números' }
};

const backgroundColors = [
  { name: 'Blanco', value: '#ffffff' },
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Rojo', value: '#ef4444' },
  { name: 'Verde', value: '#10b981' },
  { name: 'Púrpura', value: '#8b5cf6' },
  { name: 'Naranja', value: '#f97316' },
  { name: 'Negro', value: '#1f2937' },
  { name: 'Gradiente Azul', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Gradiente Rojo', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Gradiente Verde', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }
];

export default function SlideEditor({ slides, onSlidesChange }: SlideEditorProps) {
  const [selectedSlide, setSelectedSlide] = useState<number>(0);
  const [showTemplates, setShowTemplates] = useState(false);

  const generateSlideId = () => `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addSlide = (template: SlideTemplate) => {
    const newSlide: Slide = {
      id: generateSlideId(),
      title: getDefaultTitle(template),
      content: getDefaultContent(template),
      template,
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      fontSize: 'medium',
      alignment: 'center'
    };
    
    const newSlides = [...slides, newSlide];
    onSlidesChange(newSlides);
    setSelectedSlide(newSlides.length - 1);
    setShowTemplates(false);
  };

  const getDefaultTitle = (template: SlideTemplate): string => {
    const defaults = {
      title: 'Título Principal',
      content: 'Título de Contenido',
      quote: 'Cita Inspiradora',
      list: 'Lista de Puntos',
      'image-text': 'Imagen con Texto',
      cta: '¡Actúa Ahora!',
      comparison: 'Antes vs Después',
      stats: 'Datos Impactantes'
    };
    return defaults[template];
  };

  const getDefaultContent = (template: SlideTemplate): string => {
    const defaults = {
      title: 'Subtítulo o descripción adicional',
      content: 'Aquí va el contenido principal del slide. Puedes agregar información detallada.',
      quote: '"Esta es una cita inspiradora que captará la atención de tu audiencia"',
      list: '• Punto 1 importante\n• Punto 2 relevante\n• Punto 3 destacado',
      'image-text': 'Texto que acompaña la imagen y proporciona contexto adicional.',
      cta: '¿Estás listo para dar el siguiente paso? ¡Haz clic en el enlace!',
      comparison: 'ANTES: Situación problemática\n\nDESPUÉS: Situación mejorada',
      stats: '85% de mejora\n2x más engagement\n500+ clientes satisfechos'
    };
    return defaults[template];
  };

  const updateSlide = (index: number, field: keyof Slide, value: any) => {
    const updatedSlides = slides.map((slide, i) => 
      i === index ? { ...slide, [field]: value } : slide
    );
    onSlidesChange(updatedSlides);
  };

  const deleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    
    const newSlides = slides.filter((_, i) => i !== index);
    onSlidesChange(newSlides);
    
    if (selectedSlide >= newSlides.length) {
      setSelectedSlide(newSlides.length - 1);
    }
  };

  const duplicateSlide = (index: number) => {
    const slideToClone = slides[index];
    const newSlide: Slide = {
      ...slideToClone,
      id: generateSlideId(),
      title: slideToClone.title + ' (Copia)'
    };
    
    const newSlides = [...slides.slice(0, index + 1), newSlide, ...slides.slice(index + 1)];
    onSlidesChange(newSlides);
    setSelectedSlide(index + 1);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newSlides = Array.from(slides);
    const [reorderedItem] = newSlides.splice(result.source.index, 1);
    newSlides.splice(result.destination.index, 0, reorderedItem);

    onSlidesChange(newSlides);
    setSelectedSlide(result.destination.index);
  };

  const currentSlide = slides[selectedSlide];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex h-[600px]">
        {/* Slide List */}
        <div className="w-1/4 border-r border-gray-200 bg-gray-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Slides ({slides.length})</h3>
              <button
                onClick={() => setShowTemplates(true)}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
              >
                + Agregar
              </button>
            </div>
          </div>
          
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="slides">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="p-2 space-y-2 max-h-[500px] overflow-y-auto"
                >
                  {slides.map((slide, index) => (
                    <Draggable key={slide.id} draggableId={slide.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedSlide === index
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                          onClick={() => setSelectedSlide(index)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">Slide {index + 1}</span>
                            <div className="flex space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  duplicateSlide(index);
                                }}
                                className="text-xs text-gray-400 hover:text-blue-500"
                              >
                                📋
                              </button>
                              {slides.length > 1 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteSlide(index);
                                  }}
                                  className="text-xs text-gray-400 hover:text-red-500"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {slide.title}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center space-x-1">
                            <span>{slideTemplates[slide.template].icon}</span>
                            <span>{slideTemplates[slide.template].name}</span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Slide Editor */}
        <div className="flex-1 flex flex-col">
          {/* Editor Header */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                Editando Slide {selectedSlide + 1}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Template:</span>
                <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                  {slideTemplates[currentSlide.template].icon} {slideTemplates[currentSlide.template].name}
                </span>
              </div>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título
              </label>
              <input
                type="text"
                value={currentSlide.title}
                onChange={(e) => updateSlide(selectedSlide, 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenido
              </label>
              <textarea
                value={currentSlide.content}
                onChange={(e) => updateSlide(selectedSlide, 'content', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Style Options */}
            <div className="grid grid-cols-2 gap-4">
              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color de Fondo
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {backgroundColors.slice(0, 6).map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updateSlide(selectedSlide, 'backgroundColor', color.value)}
                      className={`w-full h-8 rounded border-2 ${
                        currentSlide.backgroundColor === color.value
                          ? 'border-blue-500'
                          : 'border-gray-200'
                      }`}
                      style={{ background: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamaño de Fuente
                </label>
                <select
                  value={currentSlide.fontSize}
                  onChange={(e) => updateSlide(selectedSlide, 'fontSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="small">Pequeña</option>
                  <option value="medium">Mediana</option>
                  <option value="large">Grande</option>
                </select>
              </div>

              {/* Text Alignment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alineación
                </label>
                <div className="flex space-x-1">
                  {[
                    { value: 'left', icon: '⬅️', label: 'Izquierda' },
                    { value: 'center', icon: '↔️', label: 'Centro' },
                    { value: 'right', icon: '➡️', label: 'Derecha' }
                  ].map((alignment) => (
                    <button
                      key={alignment.value}
                      onClick={() => updateSlide(selectedSlide, 'alignment', alignment.value)}
                      className={`flex-1 px-3 py-2 text-sm border rounded ${
                        currentSlide.alignment === alignment.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      title={alignment.label}
                    >
                      {alignment.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color de Texto
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {['#1f2937', '#ffffff', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#f97316', '#6b7280'].map((color) => (
                    <button
                      key={color}
                      onClick={() => updateSlide(selectedSlide, 'textColor', color)}
                      className={`w-8 h-8 rounded border-2 ${
                        currentSlide.textColor === color
                          ? 'border-blue-500'
                          : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="w-1/3 border-l border-gray-200 bg-gray-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Vista Previa</h3>
          </div>
          <div className="p-4">
            <div 
              className="aspect-square rounded-lg shadow-md flex flex-col justify-center items-center p-6 text-center"
              style={{ 
                background: currentSlide.backgroundColor,
                color: currentSlide.textColor 
              }}
            >
              <h2 
                className={`font-bold mb-4 ${
                  currentSlide.fontSize === 'large' ? 'text-2xl' : 
                  currentSlide.fontSize === 'medium' ? 'text-xl' : 'text-lg'
                }`}
                style={{ textAlign: currentSlide.alignment as any }}
              >
                {currentSlide.title}
              </h2>
              <div 
                className={`whitespace-pre-line ${
                  currentSlide.fontSize === 'large' ? 'text-lg' : 
                  currentSlide.fontSize === 'medium' ? 'text-base' : 'text-sm'
                }`}
                style={{ textAlign: currentSlide.alignment as any }}
              >
                {currentSlide.content}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Template Selection Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Seleccionar Template</h3>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(slideTemplates).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => addSlide(key as SlideTemplate)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
                >
                  <div className="text-3xl mb-2">{template.icon}</div>
                  <div className="font-medium text-gray-900 mb-1">{template.name}</div>
                  <div className="text-sm text-gray-600">{template.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}