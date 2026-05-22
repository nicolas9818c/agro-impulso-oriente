
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import pb from '@/lib/pocketbaseClient';

const ProductorCard = ({ productor, index }) => {
  const imageUrl = productor.imagen 
    ? pb.files.getUrl(productor, productor.imagen)
    : 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/productores/${productor.id}`} className="block group">
        <div className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 h-full flex flex-col">
          <div className="aspect-square overflow-hidden">
            <img 
              src={imageUrl} 
              alt={productor.nombre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-xl font-semibold mb-2 text-card-foreground group-hover:text-primary transition-colors">
              {productor.nombre}
            </h3>
            <p className="text-sm font-medium text-primary mb-3">{productor.productos}</p>
            {productor.ubicacion && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{productor.ubicacion}</span>
              </div>
            )}
            {productor.contacto && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{productor.contacto}</span>
              </div>
            )}
            {productor.historia && (
              <p className="text-sm text-muted-foreground mt-4 line-clamp-3 leading-relaxed">
                {productor.historia}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductorCard;
