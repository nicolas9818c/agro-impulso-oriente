import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Sprout, Tractor, Wheat, Truck,
  ShieldCheck, HeartHandshake, Search, ShoppingCart,
  Package, ChevronDown, Leaf, Users, Banknote,
  MapPin, CheckCircle2, ArrowUpRight, ChevronLeft, ChevronRight,
  LayoutGrid, SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UrgencyBanner from '@/components/UrgencyBanner';
import pb from '@/lib/pocketbaseClient';
import ProductCarousel from '@/components/ProductCarousel';
import ProductCard from '@/components/ProductCard';
import useEmblaCarousel from 'embla-carousel-react';
/* ─────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] } },
});

/* ─────────────────────────────────────────────────────────
   AutoCarousel — se monta con key={categoría} para reset
───────────────────────────────────────────────────────── */
const AutoCarousel = ({ products, paused }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    dragFree: false,
  });

  /* Autoplay */
  useEffect(() => {
    if (!emblaApi || paused) return;
    const id = setInterval(() => emblaApi.scrollNext(), 3200);
    return () => clearInterval(id);
  }, [emblaApi, paused]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="relative group/carousel">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 md:gap-5">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(i, 5) * 0.07 }}
              className="flex-[0_0_82%] sm:flex-[0_0_46%] md:flex-[0_0_31%] lg:flex-[0_0_23.5%] min-w-0"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Flechas — visibles al hacer hover sobre el carrusel */}
      <button
        onClick={scrollPrev}
        aria-label="Anterior"
        className="absolute -left-5 top-[38%] -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-background border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-all duration-200 opacity-0 group-hover/carousel:opacity-100 -translate-x-1 group-hover/carousel:translate-x-0"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={scrollNext}
        aria-label="Siguiente"
        className="absolute -right-5 top-[38%] -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-background border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-all duration-200 opacity-0 group-hover/carousel:opacity-100 translate-x-1 group-hover/carousel:translate-x-0"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   ProductShowcase — hero de productos al cargar la página
───────────────────────────────────────────────────────── */
const AUTOPLAY_MS = 3200;

const ProductShowcase = ({ products, loading }) => {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [paused, setPaused] = useState(false);

  const categories = useMemo(() => {
    const cats = products.map(p => p.category).filter(Boolean);
    return ['Todos', ...new Set(cats)];
  }, [products]);

  const filtered = useMemo(() =>
    activeCategory === 'Todos'
      ? products
      : products.filter(p => p.category === activeCategory),
  [products, activeCategory]);

  /* Skeletons mientras carga */
  if (loading) {
    return (
      <section className="py-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-44 bg-muted rounded-lg animate-pulse" />
            <div className="h-3 w-28 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="flex gap-2 mb-6">
          {[1,2,3,4].map(i => <div key={i} className="h-9 w-24 bg-muted rounded-full animate-pulse" />)}
        </div>
        <div className="flex gap-5 overflow-hidden">
          {[1,2,3,4].map(i => (
            <div key={i} className="flex-[0_0_23.5%] min-w-0 rounded-2xl bg-muted animate-pulse" style={{ height: 310 }} />
          ))}
        </div>
      </section>
    );
  }

  if (!products.length) return null;

  return (
    <section
      className="py-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Encabezado */}
      <div className="flex items-end justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
            <LayoutGrid className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight">
              Lo que tenemos para ti
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}{activeCategory !== 'Todos' ? ` en ${activeCategory}` : ' disponibles'}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          {/* Indicador de autoplay */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <motion.div
              animate={{ opacity: paused ? 0.3 : 1 }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
            {paused ? 'En pausa' : 'Desplazando'}
          </div>
          <Link
            to="/productos"
            className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Filtros de categoría */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 flex-shrink-0 ${
              activeCategory === cat
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
        <Link
          to="/productos"
          className="whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border border-dashed border-primary/40 text-primary hover:bg-primary/5 transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" /> Filtros avanzados
        </Link>
      </div>

      {/* Barra de progreso del autoplay */}
      <div className="h-[3px] bg-muted rounded-full overflow-hidden mb-5">
        <AnimatePresence mode="wait">
          {!paused ? (
            <motion.div
              key={`bar-${activeCategory}`}
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear', repeat: Infinity, repeatType: 'loop' }}
            />
          ) : (
            <motion.div
              key="bar-paused"
              className="h-full bg-muted-foreground/30 rounded-full w-full"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Carrusel — key fuerza re-montaje al cambiar categoría */}
      <AutoCarousel key={activeCategory} products={filtered} paused={paused} />

      {/* CTA móvil */}
      <div className="sm:hidden mt-6">
        <Link to="/productos">
          <Button variant="outline" className="w-full">
            Ver todos los productos <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────
   Category card — photo background with overlay
───────────────────────────────────────────────────────── */
const CategoryCard = ({ icon: Icon, title, description, color }) => (
  <Link to={`/productos?category=${encodeURIComponent(title)}`} className="block">
    <motion.div
      whileHover={{ y: -4, backgroundColor: 'rgba(255,255,255,0.18)' }}
      transition={{ duration: 0.25 }}
      className="relative rounded-2xl h-40 cursor-pointer group border border-white/20 bg-white/10 backdrop-blur-md flex flex-col justify-end p-5 overflow-hidden"
    >
      {/* subtle inner glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

      <div className="relative z-10">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3 shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-white font-bold text-base leading-tight mb-0.5">{title}</h3>
        <p className="text-white/70 text-xs font-medium">{description}</p>
      </div>

      <div className="absolute top-3 right-3 w-7 h-7 bg-white/15 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-1 group-hover:translate-x-0">
        <ArrowRight className="w-3.5 h-3.5 text-white" />
      </div>
    </motion.div>
  </Link>
);

/* ─────────────────────────────────────────────────────────
   How-it-works step
───────────────────────────────────────────────────────── */
const Step = ({ icon: Icon, number, title, desc, delay }) => (
  <motion.div
    variants={stagger(delay)}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true }}
    className="flex flex-col items-center text-center relative"
  >
    <div className="relative mb-5">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center shadow-sm group-hover:bg-primary/20 transition-colors">
        <Icon className="w-9 h-9 text-primary" />
      </div>
      <span className="absolute -top-2 -right-2 w-7 h-7 bg-secondary text-secondary-foreground text-xs font-black rounded-full flex items-center justify-center shadow-md">
        {number}
      </span>
    </div>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed max-w-[200px]">{desc}</p>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────
   Trust badge
───────────────────────────────────────────────────────── */
const TrustBadge = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    variants={stagger(delay)}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true }}
    className="flex flex-col items-center text-center p-6"
  >
    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-primary" />
    </div>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
const HomePage = () => {
  const [allProducts,       setAllProducts]       = useState([]);
  const [trendingProducts,  setTrendingProducts]  = useState([]);
  const [newProducts,       setNewProducts]       = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [loading,           setLoading]           = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [allRes, trendingRes, newRes, flashRes] = await Promise.all([
          pb.collection('products').getList(1, 32, {
            filter: 'available = true',
            sort: '-soldCount,-created', expand: 'vendorId', $autoCancel: false,
          }),
          pb.collection('products').getList(1, 8, {
            filter: 'available = true && isTrending = true',
            sort: '-soldCount', expand: 'vendorId', $autoCancel: false,
          }),
          pb.collection('products').getList(1, 8, {
            filter: 'available = true && isNew = true',
            sort: '-created', expand: 'vendorId', $autoCancel: false,
          }),
          pb.collection('products').getList(1, 8, {
            filter: 'available = true && discount > 0',
            sort: '-discount', expand: 'vendorId', $autoCancel: false,
          }),
        ]);
        setAllProducts(allRes.items);
        setTrendingProducts(trendingRes.items);
        setNewProducts(newRes.items);
        setFlashSaleProducts(flashRes.items);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Agro Impulso Oriente | Frutas Tropicales, Ganadería, Artesanías y Agro-Insumos del Vichada</title>
        <meta name="description" content="Compra directamente a familias campesinas del Vichada. Frutas tropicales, ganadería y cárnicos, artesanías llaneras, insumos agropecuarios y más. Precios justos, sin intermediarios." />
        <meta name="keywords" content="frutas tropicales Vichada, ganadería Orinoquía, artesanías llaneras, insumos agropecuarios Colombia, comercio justo campo colombiano, comprar campesino, Puerto Carreño, agroimpulsooriente" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://agroimpulsooriente.store" />
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="es_CO" />
        <meta property="og:site_name" content="Agro Impulso Oriente" />
        <meta property="og:url" content="https://agroimpulsooriente.store" />
        <meta property="og:title" content="Agro Impulso Oriente | Del Campo Colombiano a Tu Mesa" />
        <meta property="og:description" content="Comercio justo directo con productores campesinos del Vichada. Frutas tropicales, ganadería, artesanías llaneras. Sin intermediarios." />
        <meta property="og:image" content="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Campos de la Orinoquía colombiana — Agro Impulso Oriente" />
        {/* Twitter / X Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Agro Impulso Oriente | Del Campo Colombiano a Tu Mesa" />
        <meta name="twitter:description" content="Compra directamente a campesinos del Vichada. Precios justos, sin intermediarios." />
        <meta name="twitter:image" content="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80" />
        {/* Schema.org JSON-LD — LocalBusiness + Organization */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://agroimpulsooriente.store/#organization",
              "name": "Agro Impulso Oriente",
              "url": "https://agroimpulsooriente.store",
              "description": "Plataforma de comercio justo que conecta productores campesinos de la Orinoquía colombiana directamente con compradores, sin intermediarios.",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+57-312-526-8451",
                "contactType": "customer service",
                "availableLanguage": "Spanish"
              },
              "sameAs": [
                "https://facebook.com/AGROIMPULSOORIENTE",
                "https://instagram.com/AGROIMPULSOORIENTE"
              ]
            },
            {
              "@type": "LocalBusiness",
              "@id": "https://agroimpulsooriente.store/#local",
              "name": "Agro Impulso Oriente",
              "image": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80",
              "url": "https://agroimpulsooriente.store",
              "telephone": "+57-312-526-8451",
              "priceRange": "$$",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Puerto Carreño",
                "addressRegion": "Vichada",
                "addressCountry": "CO"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 6.1891,
                "longitude": -67.4847
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
                "opens": "08:00",
                "closes": "18:00"
              }
            }
          ]
        })}</script>
      </Helmet>

      {/* Header transparente sobre el hero */}
      <Header transparent />

      <main className="flex-grow">

        {/* ══════════════════════════════════
            0. URGENCY BANNER
        ══════════════════════════════════ */}
        <UrgencyBanner />

        {/* ══════════════════════════════════
            1. HERO — texto arriba, categorías
               ancladas al fondo (visibles
               sin hacer scroll)
        ══════════════════════════════════ */}
        <section className="relative h-[100dvh] flex flex-col overflow-hidden">
          {/* Imagen de fondo */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80&auto=format&fit=crop"
              alt="Campos de la Orinoquía colombiana"
              className="w-full h-full object-cover"
              fetchpriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/65 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
          </div>

          {/* ── Texto principal ── */}
          <div className="container-custom relative z-10 pt-20 pb-2 md:pt-24 flex-1 min-h-0 flex items-center">
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.12 } } }}
              className="max-w-2xl"
            >
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-secondary/20 text-secondary-foreground border border-secondary/30 text-sm font-bold mb-4 backdrop-blur-sm">
                  <Leaf className="w-4 h-4" />
                  Vichada · Colombia · Comercio Justo
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight mb-4 drop-shadow-md"
              >
                Del Campo a Tu Mesa,{' '}
                <span className="text-secondary">Sin Intermediarios</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-white/80 text-base md:text-lg leading-relaxed mb-6 max-w-xl font-medium"
              >
                Productos frescos y agro-insumos directo de productores campesinos del Vichada.
                Precio justo, calidad garantizada.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
                <Link to="/productos">
                  <Button size="lg" className="w-full sm:w-auto text-base px-8 h-14 bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-xl shadow-secondary/30 font-bold">
                    Ver Productos <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 h-14 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm font-semibold">
                    Quiero Vender Mis Productos
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* ── Categorías ancladas al fondo del hero ── */}
          <div className="relative z-10 container-custom pb-5 pt-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <ChevronDown className="w-3.5 h-3.5" /> ¿Qué estás buscando?
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { icon: Leaf,          title: 'Frutas Tropicales',      description: 'Mangos, aguacates y más del Vichada',    color: 'bg-secondary' },
                  { icon: Tractor,       title: 'Ganadería y Cárnicos',   description: 'Carne, leche y derivados bovinos',        color: 'bg-primary' },
                  { icon: HeartHandshake,title: 'Artesanías Llaneras',    description: 'Manualidades y procesados campesinos',   color: 'bg-accent' },
                  { icon: Sprout,        title: 'Insumos Agropecuarios',  description: 'Fertilizantes, semillas y herramientas', color: 'bg-primary' },
                ].map((cat, i) => (
                  <motion.div
                    key={cat.title}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 + i * 0.08, duration: 0.45 }}
                  >
                    <CategoryCard {...cat} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <div className="container-custom">

          {/* ══════════════════════════════════
              3. SHOWCASE — todos los productos
                 con autoplay y filtros
          ══════════════════════════════════ */}
          <ProductShowcase products={allProducts} loading={loading} />

          {/* ══════════════════════════════════
              4. FLASH SALE
          ══════════════════════════════════ */}
          {!loading && flashSaleProducts.length > 0 && (
            <ProductCarousel
              title="Ofertas Relámpago"
              products={flashSaleProducts}
              carouselType="flash-sale"
            />
          )}

          {/* ══════════════════════════════════
              5. CÓMO FUNCIONA
          ══════════════════════════════════ */}
          <section className="py-16 border-t border-border">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-left mb-12"
            >
              <span className="text-xs font-bold text-secondary uppercase tracking-widest mb-3 block">
                Simple y rápido
              </span>
              <h2>¿Cómo funciona Agro Impulso?</h2>
              <p className="text-muted-foreground mt-3">
                Tres pasos para conectar directamente con el campo colombiano.
              </p>
            </motion.div>

            {/* Steps con línea conectora */}
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
              {/* Línea decorativa — solo desktop */}
              <div className="absolute top-10 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 hidden md:block" />

              <Step
                icon={Search}
                number="01"
                title="Explora el catálogo"
                desc="Navega por cientos de productos frescos y agro-insumos de productores verificados."
                delay={0}
              />
              <Step
                icon={ShoppingCart}
                number="02"
                title="Selecciona y paga"
                desc="Agrega al carrito, elige tu método de pago y confirma en pocos minutos."
                delay={0.15}
              />
              <Step
                icon={Truck}
                number="03"
                title="Recibe en tu puerta"
                desc="El productor prepara y envía tu pedido directo. Sin intermediarios ni sorpresas."
                delay={0.3}
              />
            </div>
          </section>

          {/* ══════════════════════════════════
              6. MÁS VENDIDOS
          ══════════════════════════════════ */}
          {!loading && trendingProducts.length > 0 && (
            <ProductCarousel
              title="Más Vendidos"
              products={trendingProducts}
              carouselType="trending"
            />
          )}
        </div>

        {/* ══════════════════════════════════
            7. BANNER CTA VENDEDORES
        ══════════════════════════════════ */}
        <section className="py-12">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary via-secondary to-secondary/80 p-10 md:p-14"
            >
              {/* Decoración */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-xl text-center md:text-left">
                  <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">
                    <Users className="w-3.5 h-3.5" /> Para productores
                  </div>
                  <h2 className="text-white text-3xl md:text-4xl font-bold mb-3 leading-snug">
                    ¿Eres campesino o productor?
                    <span className="block text-white/80 text-2xl md:text-3xl font-semibold mt-1">
                      Vende directo, sin intermediarios.
                    </span>
                  </h2>
                  <p className="text-white/80 text-base leading-relaxed mb-0">
                    Publica tus productos, fija tu precio y llega a compradores en toda la región.
                    La plataforma es gratuita para los productores.
                  </p>
                </div>

                <div className="flex flex-col items-center gap-4 shrink-0">
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    {[
                      { icon: Banknote, label: 'Sin comisión', sub: 'para el campesino' },
                      { icon: Package, label: 'Fácil publicar', sub: 'en minutos' },
                      { icon: MapPin, label: 'Toda la región', sub: 'Vichada · Orinoquía' },
                      { icon: CheckCircle2, label: 'Gratis', sub: 'siempre' },
                    ].map(({ icon: Icon, label, sub }) => (
                      <div key={label} className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                        <Icon className="w-5 h-5 text-white mx-auto mb-1" />
                        <p className="text-white text-xs font-bold">{label}</p>
                        <p className="text-white/60 text-[10px]">{sub}</p>
                      </div>
                    ))}
                  </div>
                  <Link to="/signup">
                    <Button
                      size="lg"
                      className="bg-white text-secondary hover:bg-white/90 font-black text-base h-13 px-8 shadow-xl w-full"
                    >
                      Registrarme como Productor
                      <ArrowUpRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="container-custom">

          {/* ══════════════════════════════════
              8. NUEVOS INGRESOS
          ══════════════════════════════════ */}
          {!loading && newProducts.length > 0 && (
            <ProductCarousel
              title="Nuevos Ingresos"
              products={newProducts}
              carouselType="new"
            />
          )}

          {/* ══════════════════════════════════
              9. POR QUÉ ELEGIRNOS
          ══════════════════════════════════ */}
          <section className="py-20 border-t border-border">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-left mb-12"
            >
              <span className="text-xs font-bold text-primary uppercase tracking-widest mb-3 block">
                Nuestra promesa
              </span>
              <h2>¿Por qué elegir Agro Impulso?</h2>
              <p className="text-muted-foreground mt-3">
                Construimos una cadena de suministro transparente, eficiente y justa para todos
                los actores del agro colombiano.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TrustBadge
                icon={HeartHandshake}
                title="Comercio 100% Justo"
                description="Sin intermediarios que encarecen el producto. El precio que pones es el precio que cobra el campesino."
                delay={0}
              />
              <TrustBadge
                icon={ShieldCheck}
                title="Productores Verificados"
                description="Revisamos que cada vendedor sea un productor real. Sistema de calificaciones para garantizar calidad."
                delay={0.1}
              />
              <TrustBadge
                icon={Truck}
                title="Logística Regional"
                description="Coordinamos envíos desde Puerto Carreño a nivel departamental y regional con seguimiento en tiempo real."
                delay={0.2}
              />
            </div>
          </section>
        </div>

        {/* ══════════════════════════════════
            11. FRANJA FINAL — llamada a comprar
        ══════════════════════════════════ */}
        <section className="bg-primary/5 border-t border-border py-16">
          <div className="container-custom text-center">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <Sprout className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="mb-3">Empieza a comprar hoy</h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                Únete a cientos de compradores que ya consumen productos frescos y agro-insumos
                directamente del campo colombiano.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/productos">
                  <Button size="lg" className="px-10 h-13 text-base shadow-lg shadow-primary/20">
                    Explorar el Catálogo <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/sobre-nosotros">
                  <Button size="lg" variant="outline" className="px-10 h-13 text-base">
                    Conocer el Impacto
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
