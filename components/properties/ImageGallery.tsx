'use client';

import { useState } from 'react';
import { PropertyImage as PropertyImageType } from '@/types/property';
import { PropertyImage } from '@/components/ui/PropertyImage';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';

interface ImageGalleryProps {
  images: PropertyImageType[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'photo' | 'floorplan' | '360tour'>('photo');

  // Group images by type
  const photoImages = images.filter((img) => img.type === 'photo').sort((a, b) => a.orderIndex - b.orderIndex);
  const floorplanImages = images.filter((img) => img.type === 'floorplan').sort((a, b) => a.orderIndex - b.orderIndex);
  const tour360Images = images.filter((img) => img.type === '360tour').sort((a, b) => a.orderIndex - b.orderIndex);

  // Get current tab images
  const getCurrentTabImages = () => {
    switch (activeTab) {
      case 'photo':
        return photoImages;
      case 'floorplan':
        return floorplanImages;
      case '360tour':
        return tour360Images;
      default:
        return photoImages;
    }
  };

  const currentTabImages = getCurrentTabImages();
  const primaryImage = currentTabImages.find((img) => img.isPrimary) || currentTabImages[0];
  const [selectedImage, setSelectedImage] = useState(primaryImage);

  // Update selected image when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab as 'photo' | 'floorplan' | '360tour');
    const newTabImages = tab === 'photo' ? photoImages : tab === 'floorplan' ? floorplanImages : tour360Images;
    const newPrimary = newTabImages.find((img) => img.isPrimary) || newTabImages[0];
    setSelectedImage(newPrimary);
  };

  // Open lightbox with selected image
  const openLightbox = (image: PropertyImageType) => {
    const imageIndex = currentTabImages.findIndex((img) => img.id === image.id);
    setLightboxIndex(imageIndex);
    setLightboxOpen(true);
  };

  // Navigate lightbox
  const goToPrevious = () => {
    setLightboxIndex((prev) => (prev === 0 ? currentTabImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setLightboxIndex((prev) => (prev === currentTabImages.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') setLightboxOpen(false);
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
        <p className="text-gray-400">No images available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* Tab Navigation */}
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="photo" disabled={photoImages.length === 0}>
            Photos {photoImages.length > 0 && `(${photoImages.length})`}
          </TabsTrigger>
          <TabsTrigger value="floorplan" disabled={floorplanImages.length === 0}>
            Floor Plans {floorplanImages.length > 0 && `(${floorplanImages.length})`}
          </TabsTrigger>
          <TabsTrigger value="360tour" disabled={tour360Images.length === 0}>
            360° Tour {tour360Images.length > 0 && `(${tour360Images.length})`}
          </TabsTrigger>
        </TabsList>

        {/* Photo Tab */}
        <TabsContent value="photo" className="space-y-4">
          {photoImages.length > 0 && (
            <>
              {/* Main Image */}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 group">
                <PropertyImage src={selectedImage?.url ?? photoImages[0]?.url} alt="Property photo" priority sizes="(max-width: 768px) 100vw, 70vw" />
                {/* Expand button */}
                <button
                  onClick={() => openLightbox(selectedImage || photoImages[0])}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="View fullscreen"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>

              {/* Thumbnail Strip */}
              {photoImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {photoImages.map((image) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(image)}
                      className={[
                        'relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all',
                        selectedImage?.id === image.id
                          ? 'border-emerald-600 ring-2 ring-emerald-200'
                          : 'border-gray-200 hover:border-gray-300',
                      ].join(' ')}
                    >
                      <PropertyImage src={image.url} alt={`Thumbnail ${image.orderIndex + 1}`} sizes="80px" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Floor Plan Tab */}
        <TabsContent value="floorplan" className="space-y-4">
          {floorplanImages.length > 0 && (
            <>
              {/* Main Image */}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 group">
                <PropertyImage src={selectedImage?.url ?? floorplanImages[0]?.url} alt="Floor plan" className="object-contain" sizes="(max-width: 768px) 100vw, 70vw" />
                {/* Expand button */}
                <button
                  onClick={() => openLightbox(selectedImage || floorplanImages[0])}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="View fullscreen"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>

              {/* Thumbnail Strip */}
              {floorplanImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {floorplanImages.map((image) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(image)}
                      className={[
                        'relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all',
                        selectedImage?.id === image.id
                          ? 'border-emerald-600 ring-2 ring-emerald-200'
                          : 'border-gray-200 hover:border-gray-300',
                      ].join(' ')}
                    >
                      <PropertyImage src={image.url} alt={`Floor plan ${image.orderIndex + 1}`} className="object-contain" sizes="80px" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* 360° Tour Tab */}
        <TabsContent value="360tour" className="space-y-4">
          {tour360Images.length > 0 && (
            <>
              {/* Main Image (placeholder for actual 360 tour) */}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 group">
                <PropertyImage src={selectedImage?.url ?? tour360Images[0]?.url} alt="360° tour" sizes="(max-width: 768px) 100vw, 70vw" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <p className="text-white text-sm font-medium">360° Tour Coming Soon</p>
                </div>
              </div>

              {/* Thumbnail Strip */}
              {tour360Images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {tour360Images.map((image) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(image)}
                      className={[
                        'relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all',
                        selectedImage?.id === image.id
                          ? 'border-emerald-600 ring-2 ring-emerald-200'
                          : 'border-gray-200 hover:border-gray-300',
                      ].join(' ')}
                    >
                      <PropertyImage src={image.url} alt={`Tour ${image.orderIndex + 1}`} sizes="80px" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Lightbox Modal */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none"
          onKeyDown={handleKeyDown}
        >
          <DialogTitle className="sr-only">Image Lightbox</DialogTitle>
          <div className="relative w-full h-[90vh] flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Previous button */}
            {currentTabImages.length > 1 && (
              <button
                onClick={goToPrevious}
                className="absolute left-4 z-50 bg-black/50 hover:bg-black/70 text-white p-3 rounded-lg"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Image */}
            <div className="relative w-full h-full">
              <PropertyImage src={currentTabImages[lightboxIndex]?.url} alt={`Image ${lightboxIndex + 1}`} className="object-contain" priority sizes="95vw" />
            </div>

            {/* Next button */}
            {currentTabImages.length > 1 && (
              <button
                onClick={goToNext}
                className="absolute right-4 z-50 bg-black/50 hover:bg-black/70 text-white p-3 rounded-lg"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/50 text-white px-4 py-2 rounded-lg text-sm">
              {lightboxIndex + 1} / {currentTabImages.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
