
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import pb from '@/lib/pocketbaseClient';

const ArticleCard = ({ article, index }) => {
  const imageUrl = article.featured_image 
    ? pb.files.getUrl(article, article.featured_image)
    : 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800';

  const formattedDate = new Date(article.created).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/blog/${article.id}`} className="block group">
        <div className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 h-full flex flex-col">
          <div className="aspect-video overflow-hidden">
            <img 
              src={imageUrl} 
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="p-6 flex-1 flex flex-col">
            {article.category && (
              <div className="flex items-center gap-2 text-sm text-primary mb-3">
                <Tag className="w-4 h-4" />
                <span className="font-medium">{article.category}</span>
              </div>
            )}
            <h3 className="text-xl font-semibold mb-3 text-card-foreground group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            {article.excerpt && (
              <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                {article.excerpt}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-auto pt-4 border-t border-border">
              {article.author && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{article.author}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default ArticleCard;
