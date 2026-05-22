import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Filter, Search, SlidersHorizontal, PackageX, ChevronDown } from 'lucide-react';
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
import ProductCard from '@/components/ProductCard';

const CATEGORIES = [
  'Frutas Tropicales',
  'Hortalizas y Verduras',
  'Plátano y Yuca',
  'Ganadería y Cárnicos',
  'Lácteos y Derivados',
  'Pescados de Río',
  'Miel y Apicultura',
  'Granos y Cereales',
  'Artesanías Llaneras',
  'Insumos Agropecuarios',
  'Productos Transformados',
];

const LOCATIONS = ['Puerto Carreño', 'Cumaribo', 'La Primavera', 'Santa Rosalía', 'Regional'];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'all';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  
  // Filters
  const [category, setCategory] = useState(initialCategory);
  const [location, setLocation] = useState('all');
  const [sortBy, setSortBy] = useState('-created');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [category, location, sortBy, onlyInStock, onlyDiscounted, searchParams.get('q')]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let filterString = 'available = true';
      const q = searchParams.get('q');
      
      if (q) filterString += ` && (name ~ "${q}" || description ~ "${q}")`;
      if (category !== 'all') filterString += ` && category = "${category}"`;
      if (location !== 'all') filterString += ` && location = "${location}"`;
      if (onlyInStock) filterString += ` && stock > 0`;
      if (onlyDiscounted) filterString += ` && discount > 0`;

      const records = await pb.collection('products').getList(1, 50, {
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
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm) {
      setSearchParams({ q: searchTerm });
    } else {
      setSearchParams({});
    }
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={['categories', 'filters']} className="w-full">
        <AccordionItem value="categories" className="border-border">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline font-sans">Categorías</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <button 
                onClick={() => setCategory('all')}
                className={`w-full text-left text-sm py-1.5 px-2 rounded-md transition-colors ${category === 'all' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}
              >
                Todas las categorías
              </button>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`w-full text-left text-sm py-1.5 px-2 rounded-md transition-colors ${category === cat ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="filters" className="border-border">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline font-sans">Filtros Avanzados</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ubicación</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-full">
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
                <label htmlFor="discounted" className="text-sm font-medium leading-none cursor-pointer">
                  Con descuento
                </label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => {
          setCategory('all');
          setLocation('all');
          setSortBy('-created');
          setOnlyInStock(false);
          setOnlyDiscounted(false);
          setSearchTerm('');
          setSearchParams({});
        }}
      >
        Limpiar Filtros
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Catálogo | AGRO IMPULSO ORIENTE</title>
      </Helmet>
      <Header />

      <div className="bg-card border-b border-border py-6 shadow-sm">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">Catálogo de Productos</h1>
              <p className="text-sm text-muted-foreground">Encuentra los mejores insumos y productos frescos.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm whitespace-nowrap">
                <span className="text-muted-foreground">Ordenar por:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="Más recientes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-created">Más recientes</SelectItem>
                    <SelectItem value="-soldCount">Más vendidos</SelectItem>
                    <SelectItem value="price">Precio: Menor a Mayor</SelectItem>
                    <SelectItem value="-price">Precio: Mayor a Menor</SelectItem>
                    <SelectItem value="-rating">Mejor calificados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-grow container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h2 className="text-lg font-bold font-sans mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" /> Filtros
              </h2>
              <FilterContent />
            </div>
          </aside>

          {/* Content */}
          <div className="flex-grow min-w-0">
            <div className="flex gap-2 mb-6">
              <form onSubmit={handleSearch} className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Buscar productos por nombre, marca o uso..." 
                  className="pl-9 h-11 bg-card shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden px-3 h-11 shadow-sm">
                    <SlidersHorizontal className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[350px]">
                  <SheetHeader className="mb-6">
                    <SheetTitle>Filtros</SheetTitle>
                  </SheetHeader>
                  <FilterContent />
                </SheetContent>
              </Sheet>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[4/3] rounded-2xl" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-3xl border border-border px-6">
                <PackageX className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
                <h3 className="text-xl font-bold mb-2">Catálogo en construcción</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-2">
                  Estamos incorporando los primeros productos de nuestros productores del Vichada.
                  Si eres productor y quieres publicar, contáctanos.
                </p>
                <p className="text-muted-foreground max-w-md mx-auto text-sm mb-6">
                  Si aplicaste filtros, prueba limpiarlos para ver todos los productos disponibles.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => {
                      setCategory('all');
                      setLocation('all');
                      setSearchTerm('');
                      setSearchParams({});
                    }}
                  >
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
                <p className="text-sm text-muted-foreground mb-4">
                  Mostrando {products.length} productos
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