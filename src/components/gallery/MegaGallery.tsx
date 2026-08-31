import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { staggerContainer, itemPop } from '../../motion/variants';
import { springSnappy } from '../../motion/tokens';

interface MegaGalleryProps {
  placeId: string | number;
  placeName: string;
}

export function MegaGallery({ placeId, placeName }: MegaGalleryProps) {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/v1/places/${placeId}/gallery`);
        const pixabay = res.data.pixabay?.hits?.map((h: any) => ({ url: h.webformatURL, source: 'Pixabay', author: h.user })) || [];
        const pexels = res.data.pexels?.photos?.map((p: any) => ({ url: p.src.large, source: 'Pexels', author: p.photographer })) || [];
        
        // Merge and shuffle or just combine
        const merged = [];
        for (let i = 0; i < Math.max(pixabay.length, pexels.length); i++) {
          if (pixabay[i]) merged.push(pixabay[i]);
          if (pexels[i]) merged.push(pexels[i]);
        }
        setImages(merged);
      } catch (err) {
        console.error('Failed to load gallery', err);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [placeId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`rounded-2xl bg-[var(--bg-card)]/5 animate-pulse ${i % 3 === 0 ? 'row-span-2 aspect-[2/3]' : 'aspect-square'}`} />
        ))}
      </div>
    );
  }

  return (
    <>
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 mt-8"
      >
        {images.map((img, i) => (
          <motion.div 
            key={i} 
            variants={itemPop}
            className="break-inside-avoid rounded-2xl overflow-hidden cursor-zoom-in relative group"
            onClick={() => setSelectedImage(i)}
            layoutId={`gallery-img-${i}`}
          >
            <img 
              src={img.url} 
              alt={`${placeName} by ${img.author}`} 
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" 
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-xs font-medium">Photo by {img.author}</p>
              <p className="text-white/60 text-[10px] uppercase tracking-wider">{img.source}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center"
          >
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-[var(--bg-card)]/10 hover:bg-[var(--bg-card)]/20 text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            {selectedImage > 0 && (
              <button 
                onClick={() => setSelectedImage(selectedImage - 1)}
                className="absolute left-6 p-4 rounded-full bg-[var(--bg-card)]/5 hover:bg-[var(--bg-card)]/10 text-white transition-colors"
              >
                <ChevronLeft size={32} />
              </button>
            )}

            <motion.img 
              layoutId={`gallery-img-${selectedImage}`}
              src={images[selectedImage].url} 
              alt="Expanded"
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -10000 && selectedImage < images.length - 1) {
                  setSelectedImage(selectedImage + 1);
                } else if (swipe > 10000 && selectedImage > 0) {
                  setSelectedImage(selectedImage - 1);
                }
              }}
            />

            {selectedImage < images.length - 1 && (
              <button 
                onClick={() => setSelectedImage(selectedImage + 1)}
                className="absolute right-6 p-4 rounded-full bg-[var(--bg-card)]/5 hover:bg-[var(--bg-card)]/10 text-white transition-colors"
              >
                <ChevronRight size={32} />
              </button>
            )}
            
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <p className="text-white/80 font-medium">Photo by {images[selectedImage].author}</p>
              <p className="text-white/50 text-sm">{images[selectedImage].source}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};
