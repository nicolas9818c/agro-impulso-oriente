
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Filter, Search, SlidersHorizontal, PackageX, Tag, Flame, Star, ArrowUpDown } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import ProductCard from '@/components/ProductCard';

// ─── Categorías con emoji e ícono ────────────────────────────────────────────
const CATEGORIES = [
  { id: 'Frutas Tropicales',       label: 'Frutas',        emoji: '🍍', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 'Hortalizas y Verduras',   label: 'Hortalizas',    emoji: '🥬', color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'Plátano y Yuca',          label: 'Plátano/Yuca',  emoji: '🌿', color: 'bg-lime-100 text-lime-700 border-lime-200' },
  { id: 'Ganadería y Cárnicos',    label: 'Ganadería',     emoji: '🐄', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'Lácteos y Derivados',     label: 'Lácteos',       emoji: '🥛', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'Pescados de Río',         label: 'Pescados',      emoji: '🐟', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  { id: 'Miel y Apicultura',       label: 'Miel',          emoji: '🍯', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { id: 'Granos y Cereales',       label: 'Granos',        emoji: '🌾', color: 'bg-stone-100 text-stone-700 border-stone-200' },
  { id: 'Artesanías Llaneras',     label: 'Artesanías',    emoji: '🧺', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { id: 'Insumos Agropecuarios',   label: 'Insumos',       emoji: '🌱', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  { id: 'Productos Transformados', label: 'Procesados',    emoji: '🫙', color: 'bg-violet-100 text-violet-700 border-violet-200' },
];

const LOCATIONS = ['Puerto Carreño', 'Cumaribo', 'La Primavera', 'Santa Rosalía', 'Regional'];

// ─── Componente principal ─────────────────────────────────────────────────────
const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery    = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'all';

  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialQuery);

  // Filters
  const [category,       setCategory]       = useState(initialCategory);
  const [location,       setLocation]       = useState('all');
  const [sortBy,         setSortBy]         = useState('-created');
  const [onlyInStock,    setOnlyInStock]    = useState(false);
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [minPrice,       setMinPrice]       = useState('');
  const [maxPrice,       setMaxPrice]       = useState('');

  // ─── Fetch ─────────────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let filterString = 'available = true';
      const q = searchParams.get('q');

      if (q)                         filterString += ` && (name ~ "${q}" || description ~ "${q}")`;
      if (category !== 'all')        filterString += ` && category = "${category}"`;
      if (location !== 'all')        filterString += ` && location = "${location}"`;
      if (onlyInStock)               filterString += ` && stock > 0`;
      if (onlyDiscounted)            filterString += ` && discount > 0`;
      if (minPrice !== '' && !isNaN(Number(minPrice))) filterString += ` && price >= ${Number(minPrice)}`;
      if (maxPrice !== '' && !isNaN(Number(maxPrice))) filterString += ` && price <= ${Number(maxPrice)}`;

      const records = await pb.collection('products').getList(1, 60, {
        filter: filterString,
        sort: sortBy,
        expand: 'vendorId',
        $autoCancel: false
      });

      setProducts(records.items);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [searchParams, category, location, sortBy, onlyInStock, onlyDiscounted, minPrice, maxPrice]);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  // Sync category from URL
  useEffect(() => {
    const urlCat = searchParams.get('category') || 'all';
    setCategory(urlCat);
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchTerm) { next.set('q', searchTerm); } else { next.delete('q'); }
    setSearchParams(next);
  };

  const handleCategoryClick = (catId) => {
    const next = new URLSearchParams(searchParams);
    if (catId === 'all') { next.delete('category'); } else { next.set('category', catId); }
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setCategory('all');
    setLocation('all');
    setSortBy('-created');
    setOnlyInStock(false);
    setOnlyDiscounted(false);
    setMinPrice('');
    setMaxPrice('');
    setSearchTerm('');
    setSearchParams({});
  };

  const activeFiltersCount = [
    category !== 'all',
    location !== 'all',
    onlyInStock,
    onlyDiscounted,
    minPrice !== '',
    maxPrice !== '',
  ].filter(Boolean).length;

  // ─── Sidebar filter panel ───────────────────────────────────────────────────
  const FilterContent = () => (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={['categories', 'price', 'filters']} className="w-full">

        {/* Categorías */}
        <AccordionItem value="categories" className="border-border">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline font-sans">
            Categorías
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1">
              <button
                onClick={() => handleCategoryClick('all')}
                className={`w-full text-left text-sm py-1.5 px-2 rounded-md transition-colors ${
                  category === 'all' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                Todas las categorías
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`w-full text-left text-sm py-1.5 px-2 rounded-md transition-colors flex items-center gap-2 ${
                    category === cat.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <span>{cat.emoji}</span> {cat.id}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Precio */}
        <AccordionItem value="price" className="border-border">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline font-sans">
            Rango de Precio (COP)
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Mínimo</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="$ 0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Máximo</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Sin límite"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            {/* Quick price chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: 'Hasta $20k',   min: '',      max: '20000'  },
                { label: '$20k–$50k',    min: '20000', max: '50000'  },
                { label: '$50k–$100k',   min: '50000', max: '100000' },
                { label: '+$100k',       min: '100000',max: ''       },
              ].map(({ label, min, max }) => {
                const active = minPrice === min && maxPrice === max;
                return (
                  <button
                    key={label}
                    onClick={() => { setMinPrice(min); setMaxPrice(max); }}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      active ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Filtros avanzados */}
        <AccordionItem value="filters" className="border-border">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline font-sans">
            Filtros Avanzados
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ubicación</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Cualquier ubicación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las ubicaciones</SelectItem>
                  {LOCATIONS.map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center space-x-2">
                <Checkbox id="in-stock" checked={onlyInStock} onCheckedChange={setOnlyInStock} />
                <label htmlFor="in-stock" className="text-sm font-medium leading-none cursor-pointer">
                  Solo en stock
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="discounted" checked={onlyDiscounted} onCheckedChange={setOnlyDiscounted} />
                <label htmlFor="discounted" className="text-sm font-medium leading-none cursor-pointer flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-destructive" /> Con descuento
                </label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button
        variant="outline"
        className="w-full"
        onClick={clearAllFilters}
      >
        Limpiar Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}
      </Button>
    </div>
  );

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Catálogo de Productos Agropecuarios | AGRO IMPULSO ORIENTE</title>
        <meta name="description" content="Compra frutas tropicales, ganadería, lácteos, artesanías llaneras y más directamente a productores del Vichada y la Orinoquía colombiana." />
      </Helmet>
      <Header />

      {/* ── Banner / header ───────────────────────────────────────────────── */}
      <div className="bg-card border-b border-border py-6 shadow-sm">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">Catálogo de Productos</h1>
              <p className="text-sm text-muted-foreground">
                Directo del campo — productores del Vichada y los Llanos Orientales.
              </p>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 text-sm whitespace-nowrap">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[190px] h-9">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-created">Más recientes</SelectItem>
                  <SelectItem value="-soldCount">Más vendidos</SelectItem>
                  <SelectItem value="price">Precio: menor a mayor</SelectItem>
                  <SelectItem value="-price">Precio: mayor a menor</SelectItem>
                  <SelectItem value="-rating">Mejor calificados</SelectItem>
                  <SelectItem value="-discount">Mayor descuento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Category icon grid (Amazon/Mercado Libre style) ───────────────── */}
      <div className="bg-card border-b border-border">
        <div className="container-custom py-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar snap-x snap-mandatory">
            {/* "Todos" chip */}
            <button
              onClick={() => handleCategoryClick('all')}
              className={`flex-shrink-0 flex flex-col items-center gap-1.5 snap-start px-4 py-2.5 rounded-2xl border-2 transition-all duration-200 min-w-[72px] ${
                category === 'all'
                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                  : 'border-transparent bg-muted/60 text-muted-foreground hover:border-border hover:bg-muted'
              }`}
            >
              <span className="text-2xl leading-none">🛒</span>
              <span className="text-[11px] font-medium leading-tight text-center whitespace-nowrap">Todos</span>
            </button>

            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex-shrink-0 flex flex-col items-center gap-1.5 snap-start px-4 py-2.5 rounded-2xl border-2 transition-all duration-200 min-w-[72px] ${
                  category === cat.id
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-transparent bg-muted/60 text-muted-foreground hover:border-border hover:bg-muted'
                }`}
              >
                <span className="text-2xl leading-none">{cat.emoji}</span>
                <span className="text-[11px] font-medium leading-tight text-center whitespace-nowrap">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main layout ───────────────────────────────────────────────────── */}
      <main className="flex-grow container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h2 className="text-lg font-bold font-sans mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" /> Filtros
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">{activeFiltersCount}</Badge>
                )}
              </h2>
              <FilterContent />
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-grow min-w-0">
            {/* Search bar + mobile filter trigger */}
            <div className="flex gap-2 mb-4">
              <form onSubmit={handleSearch} className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar productos..."
                  className="pl-9 h-11 bg-card shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden px-3 h-11 shadow-sm relative">
                    <SlidersHorizontal className="w-5 h-5" />
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-primary-foreground rounded-full text-[10px] flex items-center justify-center font-bold">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-y-auto">
                  <SheetHeader className="mb-6">
                    <SheetTitle>Filtros</SheetTitle>
                  </SheetHeader>
                  <FilterContent />
                </SheetContent>
              </Sheet>
            </div>

            {/* Active filter chips */}
            {(category !== 'all' || location !== 'all' || onlyInStock || onlyDiscounted || minPrice || maxPrice) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {category !== 'all' && (
                  <button onClick={() => handleCategoryClick('all')} className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20 hover:bg-primary/20 transition-colors flex items-center gap-1">
                    {CATEGORIES.find(c => c.id === category)?.emoji} {category} ×
                  </button>
                )}
                {location !== 'all' && (
                  <button onClick={() => setLocation('all')} className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20 hover:bg-primary/20 transition-colors">
                    📍 {location} ×
                  </button>
                )}
                {(minPrice || maxPrice) && (
                  <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20 hover:bg-primary/20 transition-colors">
                    💰 {minPrice ? `$${Number(minPrice).toLocaleString('es-CO')}` : '$0'} – {maxPrice ? `$${Number(maxPrice).toLocaleString('es-CO')}` : '∞'} ×
                  </button>
                )}
                {onlyInStock && (
                  <button onClick={() => setOnlyInStock(false)} className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20 hover:bg-primary/20 transition-colors">
                    En stock ×
                  </button>
                )}
                {onlyDiscounted && (
                  <button onClick={() => setOnlyDiscounted(false)} className="text-xs px-3 py-1 bg-destructive/10 text-destructive rounded-full border border-destructive/20 hover:bg-destructive/20 transition-colors">
                    <Tag className="w-3 h-3 inline mr-0.5" /> Con descuento ×
                  </button>
                )}
              </div>
            )}

            {/* Skeleton / empty / grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[4/3] rounded-2xl" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-3xl border border-border px-6">
                <PackageX className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
                <h3 className="text-xl font-bold mb-2">Sin resultados</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-2">
                  No encontramos productos con los filtros seleccionados.
                  Prueba ajustando la búsqueda o limpia los filtros.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                  <Button onClick={clearAllFilters}>
                    Ver todos los productos
                  </Button>
                  <Button variant="outline" asChild>
                    <a
                      href="https://wa.me/573125268451?text=Hola%2C+quiero+publicar+mis+productos+en+Agro+Impulso+Oriente"
                      target="_blank" rel="noopener noreferrer"
                    >
                      Soy productor — quiero publicar
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                  <span className="font-medium text-foreground">{products.length}</span> productos encontrados
                  {category !== 'all' && (
                    <span className="text-muted-foreground">
                      en <span className="text-foreground font-medium">{category}</span>
                    </span>
                  )}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductsPage;
