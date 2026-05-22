import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, MapPin, Store, ArrowLeft, ShieldCheck, Truck, Star, Info, Minus, Plus, AlertCircle } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const record = await pb.collection('products').getOne(id, {
          expand: 'vendorId',
          $autoCancel: false
        });
        setProduct(record);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Producto no encontrado');
        navigate('/productos');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!product) return;
    
    const discount = product.discount || 0;
    const currentPrice = product.price * (1 - discount / 100);

    const pseudoVariant = {
      id: product.id,
      title: 'Default',
      price_in_cents: currentPrice * 100,
      currency_info: { code: 'COP', symbol: '$' },
      manage_inventory: true,
      inventory_quantity: product.stock
    };

    const pseudoProduct = {
      id: product.id,
      title: product.name,
      image: product.images?.length > 0 ? pb.files.getUrl(product, product.images[0]) : null,
    };

    try {
      addToCart(pseudoProduct, pseudoVariant, quantity, product.stock);
      toast.success('Agregado al carrito');
    } catch (error) {
      toast.error(error.message || 'Error al agregar al carrito');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="container-custom py-12">
          <div className="grid lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-3xl" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) return null;

  const discount = product.discount || 0;
  const currentPrice = product.price * (1 - discount / 100);
  const vendor = product.expand?.vendorId;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>{product.name} | AGRO IMPULSO ORIENTE</title>
      </Helmet>
      <Header />

      <main className="flex-grow container-custom py-8">
        <Link to="/productos" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Volver al catálogo
        </Link>

        <div className="bg-card rounded-3xl p-6 md:p-10 border border-border shadow-sm mb-12">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
            
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border">
                {product.images && product.images.length > 0 ? (
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={activeImage}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      src={pb.files.getUrl(product, product.images[activeImage])} 
                      alt={`${product.name} - ${product.category || 'Producto campesino'} en ${product.location || 'Vichada, Colombia'} | Agro Impulso Oriente`}
                      className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform duration-500"
                    />
                  </AnimatePresence>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    Sin imagen
                  </div>
                )}
                
                {/* Badges on large image */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {discount > 0 && <span className="badge-secondary text-sm px-3 py-1 shadow-md">-{discount}% OFF</span>}
                  {product.isNew && <span className="badge-primary text-sm px-3 py-1 shadow-md">Nuevo</span>}
                </div>
              </div>
              
              {product.images && product.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                  {product.images.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`w-24 h-24 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${activeImage === idx ? 'border-primary ring-2 ring-primary/30 ring-offset-1' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img src={pb.files.getUrl(product, img)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold tracking-wider text-primary uppercase">{product.category}</span>
                {product.rating > 0 && (
                  <div className="flex items-center gap-1 bg-warning/10 text-warning px-2.5 py-1 rounded-full text-sm font-medium">
                    <Star className="w-4 h-4 fill-current" />
                    {product.rating.toFixed(1)} <span className="text-warning/70">({product.reviewCount})</span>
                  </div>
                )}
              </div>
              
              <h1 className="text-3xl lg:text-4xl mb-4 font-bold text-foreground leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-end gap-3 mb-6 pb-6 border-b border-border">
                <span className="text-4xl font-extrabold text-foreground tabular-nums">
                  ${currentPrice.toLocaleString()}
                </span>
                {discount > 0 && (
                  <span className="text-xl text-muted-foreground line-through tabular-nums mb-1">
                    ${product.price.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="prose prose-sm md:prose-base text-muted-foreground mb-8">
                <p className="leading-relaxed">{product.description}</p>
              </div>

              {/* Status/Trust Indicators */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                  <ShieldCheck className="w-5 h-5 text-success" />
                  <span className="text-sm font-medium">Compra Segura</span>
                </div>
                {product.freeShipping && (
                  <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                    <Truck className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-primary">Envío Gratis</span>
                  </div>
                )}
              </div>

              <div className="mt-auto space-y-6">
                {/* Stock Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-muted-foreground">Disponibilidad</span>
                    <span className={product.stock < 5 ? 'text-destructive flex items-center gap-1' : 'text-foreground'}>
                      {product.stock < 5 && <AlertCircle className="w-4 h-4" />}
                      {product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${product.stock < 5 ? 'bg-destructive' : 'bg-primary'}`}
                      style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <div className="flex items-center border-2 border-border rounded-xl bg-card h-14 px-2">
                    <Button 
                      variant="ghost" size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-10 text-center font-bold text-lg tabular-nums">{quantity}</span>
                    <Button 
                      variant="ghost" size="icon"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button 
                    size="lg" 
                    className="flex-grow h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {product.stock <= 0 ? 'Sin Stock' : 'Agregar al Carrito'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="specs" className="w-full">
              <TabsList className="w-full bg-transparent border-b border-border rounded-none h-auto p-0 justify-start gap-8 mb-6">
                <TabsTrigger 
                  value="specs" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-base font-semibold"
                >
                  Especificaciones
                </TabsTrigger>
                <TabsTrigger 
                  value="reviews"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-base font-semibold"
                >
                  Reseñas ({product.reviewCount || 0})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="specs" className="p-6 bg-card rounded-2xl border border-border text-muted-foreground leading-relaxed">
                {product.specifications ? (
                  <div className="whitespace-pre-line">{product.specifications}</div>
                ) : (
                  <p className="flex items-center gap-2"><Info className="w-4 h-4" /> No hay especificaciones adicionales para este producto.</p>
                )}
              </TabsContent>
              <TabsContent value="reviews" className="p-6 bg-card rounded-2xl border border-border">
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-muted mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aún no hay reseñas</h3>
                  <p className="text-muted-foreground">Sé el primero en calificar este producto después de comprarlo.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
              <h3 className="text-lg font-bold font-sans mb-6">Acerca del Vendedor</h3>
              {vendor ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Store className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{vendor.vendorProfile?.name || 'Productor Local'}</h4>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                        <MapPin className="w-3.5 h-3.5" /> {vendor.vendorProfile?.location || product.location}
                      </div>
                    </div>
                  </div>
                  {vendor.vendorProfile?.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed pt-4 border-t border-border">
                      {vendor.vendorProfile.description}
                    </p>
                  )}
                  <Button variant="outline" className="w-full mt-2">Ver perfil completo</Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Información del vendedor no disponible.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;