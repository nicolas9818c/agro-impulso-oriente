
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectionHero from '@/components/SectionHero';
import ProductorCard from '@/components/ProductorCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const ProductoresPage = () => {
  const [productores, setProductores] = useState([]);
  const [filteredProductores, setFilteredProductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('todos');

  const filters = [
    { value: 'todos', label: 'Todos' },
    { value: 'granos', label: 'Granos' },
    { value: 'frutas', label: 'Frutas' },
    { value: 'verduras', label: 'Verduras' },
    { value: 'lacteos', label: 'Lácteos' },
    { value: 'otros', label: 'Otros' }
  ];

  useEffect(() => {
    const fetchProductores = async () => {
      try {
        const records = await pb.collection('productores').getFullList({
          sort: '-created',
          $autoCancel: false
        });
        setProductores(records);
        setFilteredProductores(records);
      } catch (error) {
        console.error('Error fetching productores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductores();
  }, []);

  useEffect(() => {
    if (activeFilter === 'todos') {
      setFilteredProductores(productores);
    } else {
      const filtered = productores.filter(p => p.tipo_producto === activeFilter);
      setFilteredProductores(filtered);
    }
  }, [activeFilter, productores]);

  return (
    <>
      <Helmet>
        <title>Productores - AGRO IMPULSO ORIENTE</title>
        <meta name="description" content="Conoce a los productores locales de Puerto Carreño. Encuentra productos frescos directamente del campo." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <SectionHero 
          title="Nuestros Productores"
          subtitle="Conoce a las familias campesinas que alimentan nuestra región"
          backgroundImage="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200"
        />

        <section className="section-spacing">
          <div className="container-custom">
            <div className="flex flex-wrap gap-3 justify-center mb-12">
              {filters.map((filter) => (
                <Button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  variant={activeFilter === filter.value ? 'default' : 'outline'}
                  className="btn-transition active:scale-[0.98]"
                >
                  {filter.label}
                </Button>
              ))}
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-square rounded-2xl" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            ) : filteredProductores.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg mb-4">
                  {activeFilter === 'todos' 
                    ? 'No hay productores registrados aún' 
                    : `No hay productores en la categoría "${filters.find(f => f.value === activeFilter)?.label}"`}
                </p>
                <p className="text-sm text-muted-foreground">Vuelve pronto para conocer a nuestros productores</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProductores.map((productor, index) => (
                  <ProductorCard key={productor.id} productor={productor} index={index} />
                ))}
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default ProductoresPage;
