
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import pb from '@/lib/pocketbaseClient';
import { Skeleton } from '@/components/ui/skeleton';

const BlogArticle = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const record = await pb.collection('articles').getOne(id, { $autoCancel: false });
        setArticle(record);
      } catch (err) {
        setError('No se pudo cargar el artículo');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-custom py-12">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <Skeleton className="aspect-video w-full rounded-2xl mb-8" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error || 'Artículo no encontrado'}</p>
          <Link to="/blog" className="text-primary hover:underline">
            Volver al blog
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = article.featured_image 
    ? pb.files.getUrl(article, article.featured_image)
    : 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200';

  const formattedDate = new Date(article.created).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-12">
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 text-primary hover:underline mb-8 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al blog
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <header className="mb-8">
            <h1 className="mb-6">{article.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {article.author && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{article.author}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>
              {article.category && (
                <div className="flex items-center gap-2 text-primary">
                  <Tag className="w-4 h-4" />
                  <span className="font-medium">{article.category}</span>
                </div>
              )}
            </div>
          </header>

          <div className="rounded-2xl overflow-hidden mb-8 shadow-xl">
            <img 
              src={imageUrl} 
              alt={article.title}
              className="w-full aspect-video object-cover"
            />
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="text-foreground leading-relaxed whitespace-pre-line">
              {article.content}
            </div>
          </div>
        </motion.article>
      </div>
    </div>
  );
};

export default BlogArticle;
