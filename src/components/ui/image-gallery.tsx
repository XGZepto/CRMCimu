import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Expand } from "lucide-react"

interface ImageGalleryProps {
  images: Array<{
    url?: string
    filename?: string
    alt?: string
  }>
  className?: string
}

export function ImageGallery({ images, className = "" }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  if (!images || images.length === 0) {
    return null
  }

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Image */}
      <Dialog>
        <DialogTrigger asChild>
          <div className="relative group cursor-pointer">
            <img
              src={images[selectedImage]?.url || images[selectedImage]?.filename}
              alt={images[selectedImage]?.alt || `Image ${selectedImage + 1}`}
              className="w-full h-48 object-cover rounded-lg border hover:opacity-90 transition-opacity"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
              <Expand className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {images.length > 1 && (
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {selectedImage + 1} / {images.length}
              </div>
            )}
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-4xl w-full">
          <DialogTitle className="sr-only">
            Image {selectedImage + 1} of {images.length}
          </DialogTitle>
          <div className="relative">
            <img
              src={images[selectedImage]?.url || images[selectedImage]?.filename}
              alt={images[selectedImage]?.alt || `Image ${selectedImage + 1}`}
              className="w-full max-h-[80vh] object-contain"
            />
            {images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded">
                  {selectedImage + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`flex-shrink-0 w-16 h-16 rounded border-2 transition-colors ${
                selectedImage === index 
                  ? 'border-primary' 
                  : 'border-muted hover:border-muted-foreground'
              }`}
            >
              <img
                src={image.url || image.filename}
                alt={image.alt || `Thumbnail ${index + 1}`}
                className="w-full h-full object-cover rounded"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 