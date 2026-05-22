
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import pb from '@/lib/pocketbaseClient';
import { Skeleton } from '@/components/ui/skeleton';

const ProductorDetail = () => {
  const { id } = useParams();
  const [productor, setProductor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductor = async () => {
      try {
        const record = await pb.collection('productores').getOne(id, { $autoCancel: false });
        setProductor(record);
      } catch (err) {
        setError('No se pudo cargar la información del productor');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductor();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-custom py-12">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid md:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !productor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error || 'Productor no encontrado'}</p>
          <Link to="/productores" className="text-primary hover:underline">
            Volver a productores
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = productor.imagen 
    ? pb.files.getUrl(productor, productor.imagen)
    : 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200';

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-12">
        <Link 
          to="/productores" 
          className="inline-flex items-center gap-2 text-primary hover:underline mb-8 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a productores
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-12 items-start"
        >
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <img 
              src={imageUrl} 
              alt={productor.nombre}
              className="w-full aspect-square object-cover"
            />
          </div>

          <div>
            <h1 className="mb-4">{productor.nombre}</h1>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-foreground">Productos</p>
                  <p className="text-muted-foreground">{productor.productos}</p>
                </div>
              </div>

              {productor.ubicacion && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Ubicación</p>
                    <p className="text-muted-foreground">{productor.ubicacion}</p>
                  </div>
                </div>
              )}

              {productor.contacto && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Contacto</p>
                    <p className="text-muted-foreground">{productor.contacto}</p>
                  </div>
                </div>
              )}
            </div>

            {productor.historia && (
              <div className="bg-muted rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 text-foreground">Historia</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {productor.historia}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductorDetail;
