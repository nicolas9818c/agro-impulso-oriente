import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, MapPin, Store, ArrowLeft, ShieldCheck,
  Truck, Star, Info, Minus, Plus, AlertCircle,
  Share2, MessageCircle, ChevronRight, Award, Sparkles, TrendingUp, Tag,
  Loader2, CheckCircle2, User
} from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ─── ReviewForm component ──────────────────────────────────────────────────────
const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(s => (
      <button
        key={s}
        type="button"
        onClick={() => onChange(s)}
        className="focus:outline-none"
      >
        <Star
          className={`w-7 h-7 transition-colors ${
            s <= value ? 'fill-warning text-warning' : 'text-muted hover:text-warning/60'
          }`}
        />
      </button>
    ))}
  </div>
);

const ReviewsTab = ({ product }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pb.collection('reviews').getList(1, 50, {
        filter: `productId = "${product.id}"`,
        sort: '-created',
        expand: 'userId',
        $autoCancel: false,
      });
      setReviews(res.items);
    } catch {
      // collection may not exist yet
    } finally {
      setLoading(false);
    }
  }, [product.id]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) { toast.error('Escribe un comentario'); return; }
    setSubmitting(true);
    try {
      await pb.collection('reviews').create({
        productId: product.id,
        userId: currentUser.id,
        rating,
        comment: comment.trim(),
      }, { $autoCancel: false });

      // Recalculate product rating
      const allReviews = await pb.collection('reviews').getList(1, 200, {
        filter: `productId = "${product.id}"`,
        fields: 'rating',
        $autoCancel: false,
      });
      const avgRating = allReviews.items.reduce((s, r) => s + r.rating, 0) / allReviews.totalItems;
      await pb.collection('products').update(product.id, {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.totalItems,
      }, { $autoCancel: false });

      toast.success('¡Reseña publicada!');
      setComment('');
      setRating(5);
      setSubmitted(true);
      fetchReviews();
    } catch (err) {
      toast.error('Error al publicar la reseña. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Summary */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-6 pb-6 border-b border-border">
          <div className="text-center">
            <div className="text-5xl font-black text-foreground">
              {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
            </div>
            <div className="flex items-center gap-0.5 justify-center mt-1">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`w-4 h-4 ${s <= Math.round(reviews.reduce((a,r)=>a+r.rating,0)/reviews.length) ? 'fill-warning text-warning' : 'text-muted'}`} />
              ))}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{reviews.length} reseña{reviews.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
      )}

      {/* Review list */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <Star className="w-12 h-12 text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-1">Aún no hay reseñas</h3>
          <p className="text-muted-foreground text-sm">Sé el primero en calificar este producto.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-muted/40 rounded-2xl p-5 border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-semibold">
                    {r.expand?.userId?.name || 'Comprador verificado'}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(r.created)}</span>
              </div>
              <div className="flex items-center gap-0.5 mb-2">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-warning text-warning' : 'text-muted'}`} />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed">{r.comment}</p>
            </div>
          ))}
        </div>
      )}

      {/* Review form */}
      {isAuthenticated && !submitted ? (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-4 mt-4">
          <h4 className="font-bold text-base">Deja tu reseña</h4>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Tu calificación:</p>
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <Textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Comparte tu experiencia con este producto..."
            rows={3}
            required
            maxLength={500}
            className="resize-none"
          />
          <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publicando...</> : 'Publicar Reseña'}
          </Button>
        </form>
      ) : submitted ? (
        <div className="flex items-center gap-3 bg-success/10 border border-success/20 rounded-xl p-4">
          <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
          <p className="text-sm font-medium text-success">¡Gracias por tu reseña!</p>
        </div>
      ) : (
        <div className="bg-muted/50 rounded-xl p-4 text-center border border-border">
          <p className="text-sm text-muted-foreground">
            <Link to="/login" className="text-primary font-semibold hover:underline">Inicia sesión</Link> para dejar una reseña.
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────
const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const record = await pb.collection('products').getOne(id, {
          expand: 'vendorId',
          $autoCancel: false
        });
        setProduct(record);
        // Fetch related products same category
        if (record.category) {
          const rel = await pb.collection('products').getList(1, 6, {
            filter: `category = "${record.category}" && id != "${record.id}" && available = true`,
            sort: '-soldCount',
            $autoCancel: false
          });
          setRelated(rel.items);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Producto no encontrado');
        navigate('/productos');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!product) return;
    const discount = product.discount || 0;
    const currentPrice = product.price * (1 - discount / 100);
    const pseudoVariant = {
      id: product.id, title: 'Default',
      price_in_cents: currentPrice * 100,
      currency_info: { code: 'COP', symbol: '$' },
      manage_inventory: true,
      inventory_quantity: product.stock
    };
    const pseudoProduct = {
      id: product.id, title: product.name,
      image: product.images?.length > 0 ? pb.files.getUrl(product, product.images[0]) : null,
    };
    try {
      addToCart(pseudoProduct, pseudoVariant, quantity, product.stock);
      toast.success('Agregado al carrito');
    } catch (error) {
      toast.error(error.message || 'Error al agregar al carrito');
    }
  };

  const handleShareWhatsApp = () => {
    const url = window.location.href;
    const text = `¡Mira este producto en Agro Impulso Oriente! ${product.name} - ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareGeneral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url: window.location.href });
      } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
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
  const imageUrl = product.images?.length > 0 ? pb.files.getUrl(product, product.images[0]) : '';
  const savings = discount > 0 ? product.price - currentPrice : 0;

  // Schema.org Product JSON-LD para Google Shopping
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": imageUrl,
    "sku": product.id,
    "brand": { "@type": "Brand", "name": "Agro Impulso Oriente" },
    "offers": {
      "@type": "Offer",
      "url": `https://agroimpulsooriente.store/producto/${product.id}`,
      "priceCurrency": "COP",
      "price": currentPrice,
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      "seller": { "@type": "Organization", "name": "Agro Impulso Oriente" }
    },
    ...(product.rating > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.rating,
        "reviewCount": product.reviewCount || 1,
        "bestRating": 5,
        "worstRating": 1
      }
    } : {})
  };

  // Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://agroimpulsooriente.store" },
      { "@type": "ListItem", "position": 2, "name": "Catálogo", "item": "https://agroimpulsooriente.store/productos" },
      { "@type": "ListItem", "position": 3, "name": product.name, "item": `https://agroimpulsooriente.store/producto/${product.id}` }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>{product.name} — Agro Impulso Oriente</title>
        <meta name="description" content={`${product.description?.slice(0, 155)}... Compra en Agro Impulso Oriente.`} />
        <meta property="og:title" content={`${product.name} | Agro Impulso Oriente`} />
        <meta property="og:description" content={product.description?.slice(0, 200)} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:type" content="product" />
        <meta property="product:price:amount" content={String(currentPrice)} />
        <meta property="product:price:currency" content="COP" />
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>
      <Header />

      <main className="flex-grow container-custom py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/productos" className="hover:text-primary transition-colors">Catálogo</Link>
          {product.category && (<>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={`/productos?category=${encodeURIComponent(product.category)}`} className="hover:text-primary transition-colors">
              {product.category}
            </Link>
          </>)}
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
        </nav>

        <div className="bg-card rounded-3xl p-6 md:p-10 border border-border shadow-sm mb-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">

            {/* ── Galería de imágenes ── */}
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
                      alt={`${product.name} — ${product.category || 'Producto campesino'} en ${product.location || 'Vichada'}`}
                      className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform duration-500"
                    />
                  </AnimatePresence>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ShoppingCart className="w-16 h-16 opacity-20" />
                  </div>
                )}
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {discount > 0 && <span className="badge-secondary text-sm px-3 py-1 shadow-md">-{discount}% OFF</span>}
                  {product.isNew && <span className="badge-primary text-sm px-3 py-1 shadow-md flex items-center gap-1"><Sparkles className="w-3 h-3" /> Nuevo</span>}
                  {product.isTrending && <span className="badge-accent text-sm px-3 py-1 shadow-md flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Popular</span>}
                  {(product.soldCount || 0) > 50 && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-orange-500 text-white shadow-md"><Award className="w-3 h-3" /> Más vendido</span>}
                </div>
              </div>

              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${activeImage === idx ? 'border-primary ring-2 ring-primary/30' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img src={pb.files.getUrl(product, img)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Detalles del producto ── */}
            <div className="flex flex-col">
              {/* Categoría + Rating */}
              <div className="flex items-center justify-between mb-3">
                <Link
                  to={`/productos?category=${encodeURIComponent(product.category || '')}`}
                  className="text-sm font-bold tracking-wider text-primary uppercase hover:underline flex items-center gap-1"
                >
                  <Tag className="w-3.5 h-3.5" /> {product.category}
                </Link>
                {product.rating > 0 && (
                  <div className="flex items-center gap-1 bg-warning/10 text-warning px-2.5 py-1 rounded-full text-sm font-medium">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(product.rating) ? 'fill-current' : 'opacity-30'}`} />
                    ))}
                    <span className="ml-1 text-foreground font-semibold">{product.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({product.reviewCount})</span>
                  </div>
                )}
              </div>

              <h1 className="text-3xl lg:text-4xl mb-4 font-bold text-foreground leading-tight">{product.name}</h1>

              {/* Precio */}
              <div className="flex items-end gap-3 mb-2 pb-4 border-b border-border">
                <span className="text-4xl font-extrabold text-foreground tabular-nums">
                  ${currentPrice.toLocaleString('es-CO')}
                </span>
                {discount > 0 && (
                  <>
                    <span className="text-xl text-muted-foreground line-through tabular-nums mb-1">
                      ${product.price.toLocaleString('es-CO')}
                    </span>
                    <span className="text-sm font-bold text-success bg-success/10 px-2 py-0.5 rounded-lg mb-1">
                      Ahorras ${savings.toLocaleString('es-CO')}
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-6">Precio en pesos colombianos (COP) · IVA incluido</p>

              <div className="prose prose-sm text-muted-foreground mb-6">
                <p className="leading-relaxed">{product.description}</p>
              </div>

              {/* Indicadores de confianza */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl">
                  <ShieldCheck className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="text-xs font-medium">Compra Segura</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl">
                  <Award className="w-4 h-4 text-secondary flex-shrink-0" />
                  <span className="text-xs font-medium">Productor Verificado</span>
                </div>
                {product.freeShipping && (
                  <div className="flex items-center gap-2 p-3 bg-success/5 rounded-xl border border-success/20 col-span-2">
                    <Truck className="w-4 h-4 text-success flex-shrink-0" />
                    <span className="text-xs font-bold text-success">¡Envío Gratis!</span>
                  </div>
                )}
              </div>

              <div className="mt-auto space-y-5">
                {/* Disponibilidad */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-muted-foreground">Disponibilidad</span>
                    <span className={product.stock < 5 ? 'text-destructive flex items-center gap-1' : 'text-success font-semibold'}>
                      {product.stock < 5 && product.stock > 0 && <AlertCircle className="w-3.5 h-3.5" />}
                      {product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${product.stock < 5 ? 'bg-destructive' : 'bg-success'}`}
                      style={{ width: `${Math.min(100, Math.max(5, (product.stock / 50) * 100))}%` }}
                    />
                  </div>
                  {product.stock < 5 && product.stock > 0 && (
                    <p className="text-xs text-destructive font-semibold">⚡ ¡Solo quedan {product.stock} unidades!</p>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex gap-3">
                  <div className="flex items-center border-2 border-border rounded-xl bg-card h-14 px-2">
                    <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-muted-foreground hover:text-foreground">
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-10 text-center font-bold text-lg tabular-nums">{quantity}</span>
                    <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="text-muted-foreground hover:text-foreground">
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

                {/* Compartir */}
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Share2 className="w-3.5 h-3.5" /> Compartir:
                  </span>
                  <button
                    onClick={handleShareWhatsApp}
                    className="flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </button>
                  <button
                    onClick={handleShareGeneral}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Copiar enlace
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de especificaciones y reseñas */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Tabs defaultValue="specs" className="w-full">
              <TabsList className="w-full bg-transparent border-b border-border rounded-none h-auto p-0 justify-start gap-8 mb-6">
                <TabsTrigger value="specs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-base font-semibold">
                  Especificaciones
                </TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-base font-semibold">
                  Reseñas ({product.reviewCount || 0})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="specs" className="p-6 bg-card rounded-2xl border border-border text-muted-foreground leading-relaxed">
                {product.specifications ? (
                  <div className="whitespace-pre-line">{product.specifications}</div>
                ) : (
                  <p className="flex items-center gap-2"><Info className="w-4 h-4" /> No hay especificaciones adicionales.</p>
                )}
              </TabsContent>
              <TabsContent value="reviews" className="p-6 bg-card rounded-2xl border border-border">
                <ReviewsTab product={product} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Info vendedor */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" /> Acerca del Vendedor
              </h3>
              {vendor ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Store className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{vendor.vendorProfile?.name || vendor.name || 'Productor Local'}</h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="w-3 h-3" /> {vendor.vendorProfile?.location || product.location || 'Vichada, Colombia'}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success mt-1">
                        <ShieldCheck className="w-3 h-3" /> Vendedor verificado
                      </span>
                    </div>
                  </div>
                  {vendor.vendorProfile?.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed pt-3 border-t border-border">
                      {vendor.vendorProfile.description}
                    </p>
                  )}
                  <a
                    href={`https://wa.me/573125268451?text=${encodeURIComponent(`Hola, me interesa el producto: ${product.name}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> Consultar por WhatsApp
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Producto de productor local de la Orinoquía colombiana.</p>
                  <a
                    href={`https://wa.me/573125268451?text=${encodeURIComponent(`Hola, me interesa el producto: ${product.name}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> Consultar por WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── También te puede interesar (estilo Amazon) ── */}
        {related.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                También te puede interesar
              </h2>
              <Link
                to={`/productos?category=${encodeURIComponent(product.category || '')}`}
                className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Ver todos <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
