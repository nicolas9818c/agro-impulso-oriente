
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectionHero from '@/components/SectionHero';
import ArticleCard from '@/components/ArticleCard';
import { Skeleton } from '@/components/ui/skeleton';

const BlogPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const records = await pb.collection('articles').getFullList({
          sort: '-created',
          $autoCancel: false
        });
        setArticles(records);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <>
      <Helmet>
        <title>Blog - AGRO IMPULSO ORIENTE</title>
        <meta name="description" content="Lee nuestros artículos sobre soberanía alimentaria, historias de productores locales y noticias del campo en Puerto Carreño." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <SectionHero 
          title="Blog"
          subtitle="Historias, noticias y reflexiones sobre la soberanía alimentaria"
        />

        <section className="section-spacing">
          <div className="container-custom">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-video rounded-2xl" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg mb-4">No hay artículos publicados aún</p>
                <p className="text-sm text-muted-foreground">Vuelve pronto para leer nuestras historias</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article, index) => (
                  <ArticleCard key={article.id} article={article} index={index} />
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

export default BlogPage;
