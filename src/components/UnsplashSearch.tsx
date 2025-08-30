'use client';

import { useState } from 'react';

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

interface UnsplashSearchProps {
  onImagesSelect: (images: UnsplashImage[]) => void;
  selectedImageIds?: string[];
  postType?: 'post' | 'carousel' | 'story' | 'reel';
}

export default function UnsplashSearch({ onImagesSelect, selectedImageIds = [], postType = 'carousel' }: UnsplashSearchProps) {
  const [query, setQuery] = useState('');
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedImages, setSelectedImages] = useState<UnsplashImage[]>([]);

  const searchImages = async (searchQuery: string, page: number = 1) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/unsplash/search?q=${encodeURIComponent(searchQuery)}&page=${page}&per_page=12`
      );

      if (!response.ok) {
        throw new Error('Failed to search images');
      }

      const data = await response.json();
      
      if (page === 1) {
        setImages(data.results);
      } else {
        setImages(prev => {
          const existingIds = new Set(prev.map(img => img.id));
          const newImages = data.results.filter((img: UnsplashImage) => !existingIds.has(img.id));
          return [...prev, ...newImages];
        });
      }
      
      setTotalPages(data.total_pages);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search images');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    searchImages(query, 1);
  };

  const loadMore = () => {
    if (currentPage < totalPages && !isLoading) {
      searchImages(query, currentPage + 1);
    }
  };

  const handleImageClick = async (image: UnsplashImage) => {
    const isSelected = selectedImages.some(img => img.id === image.id);
    
    if (isSelected) {
      // Remove from selection
      setSelectedImages(prev => prev.filter(img => img.id !== image.id));
    } else {
      // Check selection limits based on post type
      const maxImages = postType === 'post' ? 1 : 10; // 1 for single post, 10 for carousel
      
      if (selectedImages.length >= maxImages) {
        alert(`${postType === 'post' ? 'Single posts' : 'Carousels'} can only have ${maxImages} image${maxImages === 1 ? '' : 's'}.`);
        return;
      }
      
      // Add to selection and trigger download tracking
      try {
        await fetch('/api/unsplash/download', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: image.id,
            download_location: image.download_location,
          }),
        });
      } catch (err) {
        console.error('Failed to track download:', err);
      }
      
      setSelectedImages(prev => [...prev, image]);
    }
  };

  const handleCreateSlides = () => {
    if (selectedImages.length > 0) {
      onImagesSelect(selectedImages);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for images (e.g., 'marketing', 'business', 'technology')"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '🔍' : 'Search'}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={`${image.id}-${index}`}
                className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 hover:shadow-lg ${
                  selectedImages.some(img => img.id === image.id)
                    ? 'border-red-500 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleImageClick(image)}
              >
                <div className="relative">
                  <img
                    src={image.urls.small}
                    alt={image.alt_description || 'Unsplash image'}
                    className="w-full h-32 object-cover"
                  />
                  {selectedImages.some(img => img.id === image.id) && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {selectedImages.findIndex(img => img.id === image.id) + 1}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-2 bg-white">
                  <p className="text-xs text-gray-600 truncate">
                    by{' '}
                    <a
                      href={image.user.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-500 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {image.user.name}
                    </a>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Images Summary & Create Button */}
          {selectedImages.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-700 font-medium">
                    {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} selected
                  </p>
                  <p className="text-red-600 text-sm">
                    {postType === 'post'
                      ? `You'll create 1 single post with this image`
                      : `You'll create 1 carousel with ${selectedImages.length} slide${selectedImages.length !== 1 ? 's' : ''}`
                    }
                  </p>
                </div>
                <button
                  onClick={handleCreateSlides}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                >
                  {postType === 'post' ? 'Create Post' : 'Create Carousel'} →
                </button>
              </div>
            </div>
          )}

          {/* Load More Button */}
          {currentPage < totalPages && (
            <div className="text-center">
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Load More Images'}
              </button>
            </div>
          )}

          {/* Attribution */}
          <div className="text-center text-xs text-gray-500">
            Images from{' '}
            <a
              href="https://unsplash.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 hover:underline"
            >
              Unsplash
            </a>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && images.length === 0 && query && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🔍</div>
          <p>No images found for &quot;{query}&quot;</p>
          <p className="text-sm">Try a different search term</p>
        </div>
      )}
    </div>
  );
}