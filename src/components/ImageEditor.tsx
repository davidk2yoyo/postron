'use client';

import { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import UnsplashSearch from './UnsplashSearch';
import { Logo } from '@/services/database';

interface TextProperties {
  content: string;
  position: { x: number; y: number };
  fontSize: number;
  fontColor: string;
  fontWeight: string;
  fontFamily: string;
  textAlign: 'left' | 'center' | 'right';
}

// Import CanvasEditor dynamically to avoid SSR issues
const CanvasEditor = dynamic(() => import('./CanvasEditor'), { 
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading canvas editor...</p>
      </div>
    </div>
  )
});
import { PostContent } from '@/types';

interface UnsplashImage {
  id: string;
  urls: {
    thumb: string;
    small: string;
    regular: string;
    full: string;
  };
  width: number;
  height: number;
  alt_description: string | null;
  user: {
    name: string;
    username: string;
    profile_url: string;
  };
  download_location: string;
}

interface ImageEditorProps {
  post: PostContent;
  onStatusUpdate: (status: 'generated' | 'editing' | 'published') => void;
}

export default function ImageEditor({ post, onStatusUpdate }: ImageEditorProps) {
  const [currentStep, setCurrentStep] = useState<'search' | 'edit'>('search');
  const [selectedImages, setSelectedImages] = useState<UnsplashImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  // Track text content and properties for each image-slide combination
  const [slideTexts, setSlideTexts] = useState<{[key: string]: string}>({});
  const [slideProperties, setSlideProperties] = useState<{[key: string]: Partial<TextProperties>}>({});
  // Collect all slides before final export
  const [collectedSlides, setCollectedSlides] = useState<{
    dataURL: string;
    width: number;
    height: number;
    imageIndex: number;
    slideIndex: number;
  }[]>([]);
  
  // Preview modal state
  const [showPreview, setShowPreview] = useState(false);
  const [previewSlides, setPreviewSlides] = useState<{
    dataURL: string;
    width: number;
    height: number;
    imageIndex: number;
    slideIndex: number;
  }[]>([]);
  
  // Logos state
  const [logos, setLogos] = useState<Logo[]>([]);
  const [isLoadingLogos, setIsLoadingLogos] = useState(true);

  // Load user logos on component mount
  useEffect(() => {
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

    loadLogos();
  }, []);

  // Generate unique key for image-slide combination
  const getSlideKey = (imageIndex: number, slideIndex: number): string => {
    return `${imageIndex}-${slideIndex}`;
  };

  // Get text content for current slide
  const getCurrentSlideText = (): string => {
    if (post.postType === 'post') {
      return slideTexts['0-0'] || getDefaultSlideContent();
    }
    
    const key = `${currentImageIndex}-0`;
    return slideTexts[key] || getDefaultSlideContent();
  };

  // Get default slide content from post data
  const getDefaultSlideContent = (): string => {
    // For single post: use hook as the main content
    if (post.postType === 'post') {
      return post.hook || 'Your Post Content Here';
    }
    
    // For carousel: get content based on current image index
    const slideIndex = currentImageIndex;
    
    if (slideIndex === 0) {
      return post.hook || 'Your Hook Here';
    }
    
    const totalSlideIdeas = post.slide_ideas.length;
    if (slideIndex === totalSlideIdeas + 1) {
      return post.CTA || 'Your Call to Action';
    }
    
    if (slideIndex <= totalSlideIdeas) {
      return post.slide_ideas[slideIndex - 1] || `Slide ${slideIndex + 1}`;
    }
    
    return `Slide ${slideIndex + 1}`;
  };

  // Update text for current slide
  const updateSlideText = (text: string) => {
    if (post.postType === 'post') {
      setSlideTexts(prev => ({ ...prev, '0-0': text }));
      return;
    }
    
    const key = `${currentImageIndex}-0`;
    setSlideTexts(prev => ({ ...prev, [key]: text }));
  };

  // Update properties for current slide
  const updateSlideProperties = (properties: Partial<TextProperties>) => {
    const key = post.postType === 'post' ? '0-0' : `${currentImageIndex}-0`;
    setSlideProperties(prev => ({ 
      ...prev, 
      [key]: { ...prev[key], ...properties }
    }));
  };

  // Get properties for current slide
  const getCurrentSlideProperties = (): Partial<TextProperties> => {
    const key = post.postType === 'post' ? '0-0' : `${currentImageIndex}-0`;
    return slideProperties[key] || {};
  };

  const getTotalSlides = (): number => {
    // For single post: always 1 slide (should only allow 1 image)
    if (post.postType === 'post') {
      return 1;
    }
    // For carousel: Hook + slide_ideas + CTA (up to 7 total)
    return Math.min(selectedImages.length, 2 + post.slide_ideas.length);
  };

  const handleImagesSelect = (images: UnsplashImage[]) => {
    setSelectedImages(images);
    setCurrentImageIndex(0);
    setCurrentSlideIndex(0);
    setSlideTexts({}); // Reset slide texts
    setSlideProperties({}); // Reset slide properties
    setCurrentStep('edit');
    onStatusUpdate('draft'); // Use 'draft' instead of 'editing'
  };

  const handleExport = async (dataURL: string) => {
    // Check if this is called from batch capture
    if ((window as any).tempExportHandler) {
      (window as any).tempExportHandler(dataURL);
      (window as any).tempExportHandler = null;
      return;
    }
    
    if (selectedImages.length === 0) return;
    setIsExporting(true);
    
    try {
      // This is now only used for the old single-export flow (kept for compatibility)
      // The new batch export uses the batch capture logic above
      toast.info('Use "Export All Slides" button for the new batch export experience!', {
        position: 'top-center',
        duration: 3000,
      });
      
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.', {
        position: 'top-center',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Ref to access canvas export function
  const canvasExportRef = useRef<(() => void) | null>(null);

  // New function: Export all slides programmatically
  const handleExportAllSlides = async () => {
    if (selectedImages.length === 0) return;
    
    setIsExporting(true);
    const allSlides: {
      dataURL: string;
      width: number;
      height: number;
      imageIndex: number;
      slideIndex: number;
    }[] = [];
    const originalIndex = currentImageIndex;
    
    toast.loading('Capturing all slides...', {
      id: 'capturing-slides',
      position: 'top-center',
    });
    
    try {
      // Capture each slide by cycling through images
      for (let imageIndex = 0; imageIndex < selectedImages.length; imageIndex++) {
        setCurrentImageIndex(imageIndex);
        
        // Wait for canvas to update with new image
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Create a promise to capture current slide
        const slideData = await new Promise<{
          dataURL: string;
          width: number;
          height: number;
          imageIndex: number;
          slideIndex: number;
        }>((resolve) => {
          const tempHandler = (dataURL: string) => {
            resolve({
              dataURL,
              width: 1080,
              height: 1350,
              imageIndex: imageIndex,
              slideIndex: 0
            });
          };
          
          // Temporarily override the export handler
          const originalHandler = handleExport;
          (window as any).tempExportHandler = tempHandler;
          
          // Trigger export
          if (canvasExportRef.current) {
            canvasExportRef.current();
          }
        });
        
        allSlides.push(slideData);
      }
      
      // Restore original state
      setCurrentImageIndex(originalIndex);
      
      // Store slides for preview and show preview modal
      setPreviewSlides(allSlides);
      setShowPreview(true);
      
      toast.dismiss('capturing-slides');
      toast.success(`Captured ${allSlides.length} slides!`, {
        position: 'top-center',
        duration: 2000,
      });
      
    } catch (error) {
      console.error('Failed to capture all slides:', error);
      toast.dismiss('capturing-slides');
      toast.error('Failed to capture all slides. Please try again.', {
        position: 'top-center',
        duration: 4000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportAllSlides = async (slidesData: {
    dataURL: string;
    width: number;
    height: number;
    imageIndex: number;
    slideIndex: number;
  }[]) => {
    try {
      // Prepare images data for API
      const images = slidesData.map(slide => ({
        dataURL: slide.dataURL,
        width: slide.width,
        height: slide.height
      }));

      // Prepare post data for API
      const postData = {
        id: post.id,
        hook: post.hook,
        slide_ideas: post.slide_ideas,
        caption: post.caption,
        cta: post.CTA,
        hashtags: post.hashtags,
        platform: post.platform,
        post_type: post.postType
      };

      // Call export API
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images,
          postData
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.dismiss('export-processing');
        
        // Create custom toast with image preview and download option
        toast.custom((t) => (
          <div className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">🎉</span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Export Complete!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Successfully exported {images.length} image{images.length > 1 ? 's' : ''} and sent to N8N
                  </p>
                  {result.downloadUrls && result.downloadUrls.length > 0 && (
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={() => {
                          result.downloadUrls.forEach((url: string, index: number) => {
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `${post.platform}_${Date.now()}_${index}.png`;
                            link.click();
                          });
                          toast.success('Downloads started!', { position: 'top-center' });
                        }}
                        className="text-sm bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded transition-colors"
                      >
                        Download Images
                      </button>
                      <button
                        onClick={() => toast.dismiss(t.id)}
                        className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-1 px-3 rounded transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ), {
          duration: 10000,
          position: 'top-center',
        });

        // Reset collected slides for next export
        setCollectedSlides([]);
        onStatusUpdate('published');
      } else {
        toast.dismiss('export-processing');
        throw new Error(result.error || 'Export failed');
      }

    } catch (error) {
      console.error('Final export failed:', error);
      toast.dismiss('export-processing');
      toast.error('Failed to export and save images. Please try again.', {
        position: 'top-center',
        duration: 4000,
      });
    }
  };

  const handleNextSlide = () => {
    if (post.postType === 'post') {
      // For single post: no navigation (only 1 slide)
      return;
    }
    
    // For carousel: move to next slide (next image with different content)
    if (currentImageIndex < getTotalSlides() - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePrevSlide = () => {
    if (post.postType === 'post') {
      // For single post: no navigation (only 1 slide)
      return;
    }
    
    // For carousel: move to previous slide
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleBackToSearch = () => {
    setCurrentStep('search');
    setSelectedImages([]);
    setCurrentImageIndex(0);
    setCurrentSlideIndex(0);
    setSlideTexts({}); // Reset slide texts
    setSlideProperties({}); // Reset slide properties
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 font-title">
            🎨 Create Visual Content
          </h3>
          <p className="text-gray-600">
            {currentStep === 'search' 
              ? 'Search for background images and create stunning visuals'
              : post.postType === 'post'
                ? 'Single Post'
                : `Slide ${currentImageIndex + 1} of ${getTotalSlides()}`
            }
          </p>
        </div>
        
        {currentStep === 'edit' && (
          <button
            onClick={handleBackToSearch}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            ← Back to Search
          </button>
        )}
      </div>

      {currentStep === 'search' && (
        <UnsplashSearch
          onImagesSelect={handleImagesSelect}
          selectedImageIds={selectedImages.map(img => img.id)}
          postType={post.postType}
        />
      )}

      {currentStep === 'edit' && selectedImages.length > 0 && (
        <div className="space-y-6">
          {/* Export All Button */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-green-800">Ready to Export?</h4>
                <p className="text-sm text-green-600">
                  Preview and export all {selectedImages.length} slide{selectedImages.length > 1 ? 's' : ''} at once
                </p>
              </div>
              <button
                onClick={handleExportAllSlides}
                disabled={isExporting || selectedImages.length === 0}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isExporting ? '🔄 Capturing...' : '🚀 Export All Slides'}
              </button>
            </div>
          </div>

          {/* Slide Navigation */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <button
              onClick={handlePrevSlide}
              disabled={post.postType === 'post' || currentImageIndex === 0}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            
            <div className="text-center">
              <h4 className="font-semibold">
                {post.postType === 'post'
                  ? 'Single Post'
                  : `Slide ${currentImageIndex + 1} of ${getTotalSlides()}`
                }
              </h4>
              <p className="text-sm text-gray-600">
                {post.postType === 'post'
                  ? 'Single Post Content'
                  : currentImageIndex === 0 ? 'Hook' : 
                    currentImageIndex === post.slide_ideas.length + 1 ? 'Call to Action' : 
                    `Slide Idea ${currentImageIndex}`
                }
              </p>
            </div>
            
            <button
              onClick={handleNextSlide}
              disabled={post.postType === 'post' || currentImageIndex === getTotalSlides() - 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: post.postType === 'post'
                  ? '100%'
                  : `${((currentImageIndex + 1) / getTotalSlides()) * 100}%`
              }}
            />
          </div>

          {/* Loading indicator for logos */}
          {isLoadingLogos && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                <p className="text-blue-700">Loading your brand logos...</p>
              </div>
            </div>
          )}

          {/* Canvas Editor */}
          <CanvasEditor
            backgroundImage={selectedImages[currentImageIndex].urls.regular}
            initialText={getCurrentSlideText()}
            onExport={handleExport}
            onTextChange={updateSlideText}
            onPropertiesChange={updateSlideProperties}
            initialProperties={getCurrentSlideProperties()}
            logos={logos}
            onExportRef={(exportFn) => {
              canvasExportRef.current = exportFn;
            }}
          />

          {/* Export Status - Only show during batch capture */}
          {isExporting && !showPreview && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                <p className="text-blue-700">Capturing all slides...</p>
              </div>
            </div>
          )}

          {/* Attribution */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              Background image by{' '}
              <a
                href={selectedImages[currentImageIndex].user.profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-500 hover:underline font-medium"
              >
                {selectedImages[currentImageIndex].user.name}
              </a>
              {' '}on{' '}
              <a
                href="https://unsplash.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-500 hover:underline"
              >
                Unsplash
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Preview/Confirmation Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">📋 Final Preview</h2>
                  <p className="text-gray-600">
                    Your {previewSlides.length} slide{previewSlides.length > 1 ? 's' : ''} ready for export to {post.platform} {post.postType}
                  </p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Slides Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {previewSlides.map((slide, index) => (
                  <div key={index} className="relative group">
                    <div className="bg-gray-100 rounded-lg p-2">
                      <img
                        src={slide.dataURL}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-auto rounded border border-gray-200 shadow-sm group-hover:shadow-md transition-shadow"
                      />
                      <p className="text-center text-sm text-gray-600 mt-2 font-medium">
                        Slide {index + 1}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Export Details */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">📤 Export Details</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Platform:</strong> {post.platform}</p>
                  <p><strong>Post Type:</strong> {post.postType}</p>
                  <p><strong>Slides:</strong> {previewSlides.length}</p>
                  <p><strong>Resolution:</strong> 1080x1350 px</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                >
                  ← Go Back & Edit
                </button>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    exportAllSlides(previewSlides);
                  }}
                  disabled={isExporting}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {isExporting ? '🔄 Processing...' : '✅ Confirm Export'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}