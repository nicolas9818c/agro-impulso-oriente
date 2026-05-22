
import React from 'react';
import { motion } from 'framer-motion';

const SectionHero = ({ title, subtitle, backgroundImage }) => {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <img 
            src={backgroundImage} 
            alt="" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background"></div>
        </div>
      )}
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="mb-6">{title}</h1>
          {subtitle && (
            <p className="text-xl text-muted-foreground mx-auto">{subtitle}</p>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default SectionHero;
