import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, TrendingUp, Sparkles, AlertCircle, Truck, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const discount     = product.discount || 0;
  const currentPrice = product.price * (1 - discount / 100);
  const stockPct     = Math.min(100, ((product.stock || 0) / 50) * 100);
  const isOutOfStock = (product.stock || 0) <= 0;
  const isLowStock   = product.stock > 0 && product.stock < 5;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (isOutOfStock) { toast.error('Producto agotado'); return; }

    const pseudoVariant = {
      id: product.id,
      title: 'Default',
      price_in_cents: currentPrice * 100,
      currency_info: { code: 'COP', symbol: '$' },
      manage_inventory: true,
      inventory_quantity: product.stock,
    };

    const pseudoProduct = {
      id: product.id,
      title: product.name,
      image: product.images?.length > 0 ? pb.files.getUrl(product, product.images[0]) : null,
    };

    try {
      addToCart(pseudoProduct, pseudoVariant, 1, product.stock);
      toast.success(`${product.name} agregado al carrito`);
    } catch (err) {
      toast.error(err.message || 'Error al agregar al carrito');
    }
  };

  return (
    <Link to={`/producto/${product.id}`} className="block h-full">
      <motion.article
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2 }}
        className="news-card h-full group"
      >
        {/* ── Imagen ── */}
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          {product.images?.length > 0 ? (
            <img
              src={pb.files.getUrl(product, product.images[0])}
              alt={`${product.name} - ${product.category || 'Producto campesino'} en ${product.location || 'Vichada, Colombia'} | Agro Impulso Oriente`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
              <ShoppingCart className="w-10 h-10 opacity-20" />
              <span className="text-xs">Sin imagen</span>
            </div>
          )}

          {/* Overlay suave */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges — esquina superior izquierda */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            {discount > 0 && (
              <span className="badge-secondary text-[11px] shadow-md">
                -{discount}% OFF
              </span>
            )}
            {product.isNew && (
              <span className="badge-primary text-[11px] shadow-md flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Nuevo
              </span>
            )}
            {product.isTrending && (
              <span className="badge-accent text-[11px] shadow-md flex items-center gap-1">
                <TrendingUp className="w-2.5 h-2.5" /> Popular
              </span>
            )}
            {(product.soldCount || 0) > 50 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-500 text-white shadow-md">
                <Award className="w-2.5 h-2.5" /> Más vendido
              </span>
            )}
          </div>

          {/* Envío gratis — esquina inferior izquierda */}
          {product.freeShipping && (
            <div className="absolute bottom-3 left-3 bg-success/90 backdrop-blur-sm text-success-foreground px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Truck className="w-3 h-3" /> Envío gratis
            </div>
          )}

          {/* Botón agregar al carrito — hover */}
          <div className="absolute bottom-3 right-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-250">
            <Button
              size="icon"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="rounded-full shadow-lg h-11 w-11 bg-primary hover:bg-primary/90"
              title="Agregar al carrito"
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* ── Contenido — estilo tarjeta de noticia ── */}
        <div className="p-5 flex flex-col flex-grow">

          {/* Fila de metadatos: categoría + rating */}
          <div className="flex items-center justify-between gap-2 mb-3">
            {product.category ? (
              <span className="category-tag">{product.category}</span>
            ) : (
              <span />
            )}
            {product.rating > 0 && (
              <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground shrink-0">
                <Star className="w-3 h-3 fill-warning text-warning" />
                <span>{product.rating.toFixed(1)}</span>
                {product.reviewCount > 0 && (
                  <span className="font-normal">({product.reviewCount})</span>
                )}
              </div>
            )}
          </div>

          {/* Título del producto — fuente serif como noticias presidencia */}
          <h3 className="text-[17px] leading-snug font-bold text-card-foreground mb-1.5 line-clamp-2 font-serif group-hover:text-primary transition-colors duration-200">
            {product.name}
          </h3>

          {/* Vendedor */}
          <p className="text-xs text-muted-foreground mb-4">
            Por{' '}
            <span className="font-semibold text-foreground">
              {product.expand?.vendorId?.vendorProfile?.name || 'Productor Local'}
            </span>
            {product.location && ` · ${product.location}`}
          </p>

          {/* Precio + stock — empujado al fondo */}
          <div className="mt-auto space-y-3">
            {/* Precio */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-foreground font-sans tabular-nums">
                ${currentPrice.toLocaleString('es-CO')}
              </span>
              {discount > 0 && (
                <span className="text-sm text-muted-foreground line-through tabular-nums">
                  ${product.price.toLocaleString('es-CO')}
                </span>
              )}
              <span className="text-xs text-muted-foreground ml-auto">COP</span>
            </div>

            {/* Barra de stock */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className={
                  isOutOfStock ? 'text-destructive flex items-center gap-1' :
                  isLowStock   ? 'text-warning flex items-center gap-1' :
                  'text-muted-foreground'
                }>
                  {(isOutOfStock || isLowStock) && <AlertCircle className="w-3 h-3" />}
                  {isOutOfStock ? 'Agotado'
                   : isLowStock ? `¡Solo ${product.stock} disponibles!`
                   : `${product.stock} disponibles`}
                </span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isOutOfStock ? 'bg-muted-foreground/30' :
                    isLowStock   ? 'bg-warning' :
                    'bg-success'
                  }`}
                  style={{ width: `${isOutOfStock ? 0 : Math.max(5, stockPct)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  );
};

export default ProductCard;
