'use client';

import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Image, Text, Rect } from 'react-konva';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';

interface PlacedLogo {
  id: string;
  logoUrl: string;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
}

interface Logo {
  id: string;
  user_id: string;
  name: string;
  url: string;
  storage_path: string;
  width: number;
  height: number;
  file_size: number;
  mime_type: string;
  created_at: string;
  updated_at: string;
}

interface CanvasEditorProps {
  backgroundImage: string;
  initialText: string;
  width?: number;
  height?: number;
  onExport?: (dataURL: string) => void;
  onTextChange?: (text: string) => void;
  onPropertiesChange?: (properties: any) => void;
  initialProperties?: any;
  logos?: Logo[];
  onExportRef?: (exportFn: () => void) => void;
}

const CANVAS_PRESETS = {
  instagram: { width: 1080, height: 1350, name: 'Instagram Portrait' },
  story: { width: 1080, height: 1920, name: 'Instagram/TikTok Story' },
  facebook: { width: 1080, height: 1080, name: 'Facebook Square' },
};

const FONT_OPTIONS = [
  { value: 'Arial', name: 'Arial' },
  { value: 'Helvetica', name: 'Helvetica' },
  { value: 'Georgia', name: 'Georgia' },
  { value: 'Times New Roman', name: 'Times New Roman' },
  { value: 'Verdana', name: 'Verdana' },
  { value: 'Impact', name: 'Impact' },
  { value: 'Trebuchet MS', name: 'Trebuchet MS' },
  { value: 'Comic Sans MS', name: 'Comic Sans MS' },
  { value: 'Courier New', name: 'Courier New' },
  { value: 'Lucida Console', name: 'Lucida Console' },
];

export default function CanvasEditor({ 
  backgroundImage, 
  initialText,
  width = 1080,
  height = 1350,
  onExport,
  onTextChange,
  onPropertiesChange,
  initialProperties,
  logos = [],
  onExportRef
}: CanvasEditorProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof CANVAS_PRESETS>('instagram');
  const [canvasSize, setCanvasSize] = useState({ width, height });
  const [scaleToFit, setScaleToFit] = useState(1);
  const [isClient, setIsClient] = useState(false);
  
  // Image transformation state (persisted per image URL)
  const [imageTransforms, setImageTransforms] = useState<{[key: string]: any}>({});
  
  // Text positions per image (persisted per image URL)
  const [textPositionsPerImage, setTextPositionsPerImage] = useState<{[key: string]: {x: number, y: number}}>({});
  
  // Logo positions per image (persisted per image URL) 
  const [logosPerImage, setLogosPerImage] = useState<{[key: string]: PlacedLogo[]}>({});
  
  // Logo state
  const [logoImages, setLogoImages] = useState<{[key: string]: HTMLImageElement}>({});
  const [selectedLogo, setSelectedLogo] = useState<string>('');
  const [selectedLogoForControls, setSelectedLogoForControls] = useState<string>('');
  // Get current placed logos for this image
  const getCurrentPlacedLogos = () => {
    return logosPerImage[backgroundImage] || [];
  };
  
  const setPlacedLogos = (logosOrUpdater: PlacedLogo[] | ((prev: PlacedLogo[]) => PlacedLogo[])) => {
    setLogosPerImage(prev => ({
      ...prev,
      [backgroundImage]: typeof logosOrUpdater === 'function' 
        ? logosOrUpdater(prev[backgroundImage] || [])
        : logosOrUpdater
    }));
  };
  
  // Text properties
  const [textContent, setTextContent] = useState(initialText);

  // Update text content when initialText changes
  useEffect(() => {
    setTextContent(initialText);
  }, [initialText]);

  // Handle text changes
  const handleTextChange = (newText: string) => {
    setTextContent(newText);
    if (onTextChange) {
      onTextChange(newText);
    }
  };
  // Get current text position for this image (with fallback)
  const getCurrentTextPosition = () => {
    return textPositionsPerImage[backgroundImage] || { x: 100, y: 100 };
  };
  
  const setTextPosition = (newPosition: { x: number, y: number }) => {
    setTextPositionsPerImage(prev => ({
      ...prev,
      [backgroundImage]: newPosition
    }));
  };
  const [fontSize, setFontSize] = useState(48);
  const [fontColor, setFontColor] = useState('#FFFFFF');
  const [fontWeight, setFontWeight] = useState('bold');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  
  // Overlay properties
  const [overlayOpacity, setOverlayOpacity] = useState(0.3);
  const [overlayColor, setOverlayColor] = useState('#000000');

  // Check if we're on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load background image
  useEffect(() => {
    if (!backgroundImage) return;
    
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
    };
    img.src = backgroundImage;
  }, [backgroundImage]);

  // Load logo images
  useEffect(() => {
    logos.forEach(logo => {
      if (!logoImages[logo.url]) {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          setLogoImages(prev => ({
            ...prev,
            [logo.url]: img
          }));
        };
        img.onerror = (error) => {
          console.error('Failed to load logo:', logo.url, error);
        };
        img.src = logo.url;
      }
    });
  }, [logos, logoImages]);

  // Update canvas size when preset changes
  useEffect(() => {
    const preset = CANVAS_PRESETS[selectedPreset];
    setCanvasSize(preset);
    
    // Calculate scale to fit in viewport (max 400px height)
    const maxDisplayHeight = 400;
    const scale = Math.min(maxDisplayHeight / preset.height, 1);
    setScaleToFit(scale);
    
    // Only set default text position if this is a new image (no existing position)
    // and we have a backgroundImage to work with
    if (backgroundImage && !textPositionsPerImage[backgroundImage]) {
      setTextPositionsPerImage(prev => ({
        ...prev,
        [backgroundImage]: {
          x: preset.width * 0.1,
          y: preset.height * 0.7,
        }
      }));
    }
  }, [selectedPreset, backgroundImage, textPositionsPerImage]);

  // Handle logo selection clearing when switching images
  useEffect(() => {
    if (selectedLogoForControls) {
      const currentLogos = getCurrentPlacedLogos();
      if (!currentLogos.find(logo => logo.id === selectedLogoForControls)) {
        setSelectedLogoForControls('');
      }
    }
  }, [backgroundImage]);

  // Handle property changes
  const handlePropertyChange = (properties: any) => {
    if (onPropertiesChange) {
      onPropertiesChange(properties);
    }
  };

  // Handle text drag
  const handleTextDragEnd = (e: KonvaEventObject<DragEvent>) => {
    const newPosition = { x: e.target.x(), y: e.target.y() };
    setTextPosition(newPosition);
    handlePropertyChange({ position: newPosition });
  };

  // Get current image transform
  const getCurrentImageTransform = () => {
    return imageTransforms[backgroundImage] || {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      rotation: 0
    };
  };

  // Handle image transformation
  const handleImageTransform = (e: KonvaEventObject<Event>) => {
    const node = e.target;
    const newTransform = {
      x: node.x(),
      y: node.y(),
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
      rotation: node.rotation()
    };
    
    setImageTransforms(prev => ({
      ...prev,
      [backgroundImage]: newTransform
    }));
  };

  // Handle logo placement
  const addLogo = () => {
    if (!selectedLogo) return;
    
    const logoId = `logo-${Date.now()}`;
    const newLogo = {
      id: logoId,
      logoUrl: selectedLogo,
      x: canvasSize.width * 0.8,
      y: canvasSize.height * 0.1,
      scaleX: 0.2,
      scaleY: 0.2,
      rotation: 0
    };
    
    setPlacedLogos(prev => [...prev, newLogo]);
  };

  // Handle logo transformation
  const handleLogoTransform = (logoId: string, e: KonvaEventObject<Event>) => {
    const node = e.target;
    setPlacedLogos(prev => prev.map(logo => 
      logo.id === logoId 
        ? {
            ...logo,
            x: node.x(),
            y: node.y(),
            scaleX: node.scaleX(),
            scaleY: node.scaleY(),
            rotation: node.rotation()
          }
        : logo
    ));
  };

  // Remove logo
  const removeLogo = (logoId: string) => {
    setPlacedLogos(prev => prev.filter(logo => logo.id !== logoId));
    // Clear selection if removing selected logo
    if (selectedLogoForControls === logoId) {
      setSelectedLogoForControls('');
    }
  };

  // Helper functions for logo transform controls
  const getSelectedLogo = () => {
    return getCurrentPlacedLogos().find(logo => logo.id === selectedLogoForControls);
  };

  const updateSelectedLogo = (updates: Partial<PlacedLogo>) => {
    if (!selectedLogoForControls) return;
    setPlacedLogos(prev => prev.map(logo => 
      logo.id === selectedLogoForControls 
        ? { ...logo, ...updates }
        : logo
    ));
  };

  // Export canvas as PNG
  const handleExport = () => {
    if (!stageRef.current || !onExport) return;

    // Temporarily reset scale to 1 for export to get full resolution
    const originalScaleX = stageRef.current.scaleX();
    const originalScaleY = stageRef.current.scaleY();
    
    stageRef.current.scale({ x: 1, y: 1 });

    const dataURL = stageRef.current.toDataURL({
      pixelRatio: 2, // High DPI for sharp images
      mimeType: 'image/png',
      quality: 1, // Maximum quality
      width: canvasSize.width,
      height: canvasSize.height,
    });

    // Restore original scale for display
    stageRef.current.scale({ x: originalScaleX, y: originalScaleY });

    onExport(dataURL);
  };

  // Expose export function to parent
  useEffect(() => {
    if (onExportRef) {
      onExportRef(handleExport);
    }
  }, [onExportRef]);

  // Text alignment helpers
  const getTextX = () => {
    const safeMargin = 64;
    switch (textAlign) {
      case 'center':
        return canvasSize.width / 2;
      case 'right':
        return canvasSize.width - safeMargin;
      case 'left':
      default:
        return getCurrentTextPosition().x;
    }
  };

  const getTextWidth = () => {
    const safeMargin = 128;
    return canvasSize.width - safeMargin;
  };

  // Show loading state while components load
  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading canvas editor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Canvas Preset Selector */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(CANVAS_PRESETS).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => setSelectedPreset(key as keyof typeof CANVAS_PRESETS)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              selectedPreset === key
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Canvas Section */}
        <div className="flex-1 max-w-3xl mx-auto lg:mx-0">
          <div className="bg-gray-100 rounded-lg p-4 flex justify-center">
            <div 
              className="border border-gray-300 rounded-lg overflow-hidden shadow-lg"
              style={{
                width: canvasSize.width * scaleToFit,
                height: canvasSize.height * scaleToFit,
              }}
            >
              <Stage
                ref={stageRef}
                width={canvasSize.width}
                height={canvasSize.height}
                scaleX={scaleToFit}
                scaleY={scaleToFit}
              >
                <Layer>
                  {/* Background Image */}
                  {image && (
                    <Image
                      image={image}
                      width={canvasSize.width}
                      height={canvasSize.height}
                      {...getCurrentImageTransform()}
                      draggable
                      onTransformEnd={handleImageTransform}
                      onDragEnd={handleImageTransform}
                    />
                  )}
                  
                  {/* Overlay */}
                  {overlayOpacity > 0 && (
                    <Rect
                      width={canvasSize.width}
                      height={canvasSize.height}
                      fill={overlayColor}
                      opacity={overlayOpacity}
                      listening={false}
                    />
                  )}
                  
                  {/* Logos */}
                  {getCurrentPlacedLogos().map((logo) => {
                    const logoImg = logoImages[logo.logoUrl];
                    // Only render if logo image loaded successfully
                    return logoImg && logoImg.complete ? (
                      <Image
                        key={logo.id}
                        image={logoImg}
                        x={logo.x}
                        y={logo.y}
                        scaleX={logo.scaleX}
                        scaleY={logo.scaleY}
                        rotation={logo.rotation}
                        draggable
                        onTransformEnd={(e) => handleLogoTransform(logo.id, e)}
                        onDragEnd={(e) => handleLogoTransform(logo.id, e)}
                        onDblClick={() => removeLogo(logo.id)}
                      />
                    ) : null;
                  })}
                  
                  {/* Text */}
                  <Text
                    text={textContent}
                    x={getTextX()}
                    y={getCurrentTextPosition().y}
                    width={getTextWidth()}
                    fontSize={fontSize}
                    fontFamily={fontFamily}
                    fontStyle={fontWeight}
                    fill={fontColor}
                    align={textAlign}
                    wrap="word"
                    draggable
                    onDragEnd={handleTextDragEnd}
                  />
                </Layer>
              </Stage>
            </div>
          </div>
          
          {/* Safe Area Indicator */}
          <p className="text-xs text-gray-500 text-center mt-2">
            Drag image, text, or logos to reposition. Double-click logos to remove. Keep important content within safe margins.
          </p>
        </div>

        {/* Controls Panel - More Compact Layout */}
        <div className="lg:w-96 xl:w-80 space-y-3">
          {/* Logo Controls */}
          {logos.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h3 className="text-sm font-semibold mb-2">🏷️ Logos</h3>
              
              <div className="flex gap-2 mb-2">
                <select
                  value={selectedLogo}
                  onChange={(e) => setSelectedLogo(e.target.value)}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Choose logo...</option>
                  {logos.map((logo, index) => {
                    const logoImg = logoImages[logo.url];
                    // Only show logos that loaded successfully
                    return (logoImg && logoImg.complete) ? (
                      <option key={logo.url} value={logo.url}>
                        {logo.name}
                      </option>
                    ) : null;
                  })}
                </select>
                <button
                  onClick={addLogo}
                  disabled={!selectedLogo}
                  className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Add
                </button>
              </div>
              
              {getCurrentPlacedLogos().length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Placed ({getCurrentPlacedLogos().length}):</p>
                  <div className="flex flex-wrap gap-1">
                    {getCurrentPlacedLogos().map((logo, index) => (
                      <div key={logo.id} className="flex gap-0.5">
                        <button
                          onClick={() => setSelectedLogoForControls(logo.id)}
                          className={`text-xs px-1.5 py-0.5 rounded transition-colors duration-200 ${
                            selectedLogoForControls === logo.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title="Click to select for editing"
                        >
                          #{index + 1}
                        </button>
                        <button
                          onClick={() => removeLogo(logo.id)}
                          className="text-xs bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 px-1 py-0.5 rounded transition-colors duration-200"
                          title="Click to remove"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Logo Transform Controls */}
          {selectedLogoForControls && getSelectedLogo() && (
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h3 className="text-sm font-semibold mb-2">🎯 Logo Controls</h3>
              
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Scale: {getSelectedLogo()!.scaleX.toFixed(2)}x
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={getSelectedLogo()!.scaleX}
                    onChange={(e) => {
                      const scale = Number(e.target.value);
                      updateSelectedLogo({ scaleX: scale, scaleY: scale });
                    }}
                    className="w-full h-2"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Rotation: {getSelectedLogo()!.rotation.toFixed(0)}°
                  </label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="5"
                    value={getSelectedLogo()!.rotation}
                    onChange={(e) => {
                      const rotation = Number(e.target.value);
                      updateSelectedLogo({ rotation });
                    }}
                    className="w-full h-2"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    updateSelectedLogo({ scaleX: 0.2, scaleY: 0.2, rotation: 0 });
                  }}
                  className="flex-1 bg-gray-500 text-white py-1 rounded text-xs hover:bg-gray-600 transition-colors duration-200 font-medium"
                >
                  Reset
                </button>
                <button
                  onClick={() => setSelectedLogoForControls('')}
                  className="flex-1 bg-blue-500 text-white py-1 rounded text-xs hover:bg-blue-600 transition-colors duration-200 font-medium"
                >
                  Deselect
                </button>
              </div>
            </div>
          )}

          {/* Image Transform Controls */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-sm font-semibold mb-2">🖼️ Image</h3>
            
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Scale: {getCurrentImageTransform().scaleX.toFixed(2)}x
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={getCurrentImageTransform().scaleX}
                  onChange={(e) => {
                    const scale = Number(e.target.value);
                    const newTransform = { ...getCurrentImageTransform(), scaleX: scale, scaleY: scale };
                    setImageTransforms(prev => ({ ...prev, [backgroundImage]: newTransform }));
                  }}
                  className="w-full h-2"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Rotation: {getCurrentImageTransform().rotation.toFixed(0)}°
                </label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="5"
                  value={getCurrentImageTransform().rotation}
                  onChange={(e) => {
                    const rotation = Number(e.target.value);
                    const newTransform = { ...getCurrentImageTransform(), rotation };
                    setImageTransforms(prev => ({ ...prev, [backgroundImage]: newTransform }));
                  }}
                  className="w-full h-2"
                />
              </div>
            </div>
            
            <button
              onClick={() => {
                const resetTransform = { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 };
                setImageTransforms(prev => ({ ...prev, [backgroundImage]: resetTransform }));
              }}
              className="w-full bg-gray-500 text-white py-1 rounded text-xs hover:bg-gray-600 transition-colors duration-200 font-medium mt-2"
            >
              Reset
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-sm font-semibold mb-2">✏️ Text</h3>
            
            {/* Text Content */}
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Content
              </label>
              <textarea
                value={textContent}
                onChange={(e) => handleTextChange(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-transparent resize-none"
                rows={2}
              />
            </div>

            {/* Font Size */}
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Size: {fontSize}px
              </label>
              <input
                type="range"
                min="20"
                max="120"
                value={fontSize}
                onChange={(e) => {
                  const newSize = Number(e.target.value);
                  setFontSize(newSize);
                  handlePropertyChange({ fontSize: newSize });
                }}
                className="w-full h-2"
              />
            </div>

            {/* Font Color & Alignment */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={fontColor}
                  onChange={(e) => {
                    const newColor = e.target.value;
                    setFontColor(newColor);
                    handlePropertyChange({ fontColor: newColor });
                  }}
                  className="w-full h-6 rounded border border-gray-300"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Align
                </label>
                <div className="flex gap-0.5">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => {
                        setTextAlign(align);
                        handlePropertyChange({ textAlign: align });
                      }}
                      className={`flex-1 px-1 py-0.5 rounded text-xs font-medium transition-colors duration-200 ${
                        textAlign === align
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {align[0].toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Font Family & Weight */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Font
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => {
                    const newFamily = e.target.value;
                    setFontFamily(newFamily);
                    handlePropertyChange({ fontFamily: newFamily });
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-transparent"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Weight
                </label>
                <select
                  value={fontWeight}
                  onChange={(e) => {
                    const newWeight = e.target.value;
                    setFontWeight(newWeight);
                    handlePropertyChange({ fontWeight: newWeight });
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-sm font-semibold mb-2">🎭 Overlay</h3>
            
            {/* Overlay Controls */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Opacity: {Math.round(overlayOpacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="0.8"
                  step="0.1"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                  className="w-full h-2"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={overlayColor}
                  onChange={(e) => setOverlayColor(e.target.value)}
                  className="w-full h-6 rounded border border-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Export Button - Hidden but kept for batch capture functionality */}
          <button
            onClick={handleExport}
            disabled={!image}
            data-testid="export-button"
            className="hidden"
            style={{ display: 'none' }}
          >
            📥 Export PNG
          </button>
          
          {/* Info about new export flow */}
          <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium">
              🚀 Use "Export All Slides" button above to export all slides at once!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}