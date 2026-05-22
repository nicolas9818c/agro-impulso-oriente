import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flame, Sparkles, TrendingUp, Tag } from 'lucide-react';
import ProductCard from './ProductCard';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';

const ProductCarousel = ({ title, products, carouselType = 'recommended' }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start',
    skipSnaps: false,
    dragFree: true
  });

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  const getIcon = () => {
    switch (carouselType) {
      case 'flash-sale': return <Flame className="w-6 h-6 text-destructive" />;
      case 'trending': return <TrendingUp className="w-6 h-6 text-secondary" />;
      case 'new': return <Sparkles className="w-6 h-6 text-primary" />;
      default: return <Tag className="w-6 h-6 text-accent" />;
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="relative py-8">
      <div className="flex justify-between items-end mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center shadow-sm">
            {getIcon()}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
        </div>
        <div className="flex gap-2 hidden sm:flex">
          <Button variant="outline" size="icon" onClick={scrollPrev} className="rounded-full">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={scrollNext} className="rounded-full">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden -mx-4 px-4 pb-8 pt-4" ref={emblaRef}>
        <div className="flex gap-6">
          {products.map((product, index) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex-[0_0_85%] sm:flex-[0_0_45%] md:flex-[0_0_30%] lg:flex-[0_0_23%] min-w-0"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCarousel;