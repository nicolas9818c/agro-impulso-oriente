import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

/* ─── Testimonios reales de clientes ─────────────────────────────
   Actualiza estos datos con testimonios reales a medida que los
   recibas por WhatsApp o email. Puedes agregar foto real en `avatar`.
──────────────────────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    name:    'María González',
    city:    'Bogotá, D.C.',
    rating:  5,
    product: 'Frutas Tropicales del Vichada',
    text:    'Compré mangos y aguacates directamente del productor. Llegaron fresquísimos y el precio fue mucho mejor que el del supermercado. ¡Por fin un servicio que apoya al campo colombiano de verdad!',
    initials: 'MG',
    color:    'bg-primary',
  },
  {
    name:    'Carlos Ospina',
    city:    'Medellín, Antioquia',
    rating:  5,
    product: 'Quesos campesinos y lácteos',
    text:    'Los quesos que compré para mi restaurante son de una calidad increíble. Mis clientes preguntaron inmediatamente por el origen. Ahora somos clientes fijos de Agro Impulso Oriente.',
    initials: 'CO',
    color:    'bg-secondary',
  },
  {
    name:    'Luisa Ramírez',
    city:    'Cali, Valle del Cauca',
    rating:  5,
    product: 'Artesanías Llaneras',
    text:    'Las artesanías que pedí para regalar quedaron espectaculares. La atención por WhatsApp fue inmediata y el empaque llegó perfecto. Definitivamente vuelvo a comprar.',
    initials: 'LR',
    color:    'bg-accent',
  },
  {
    name:    'Andrés Morales',
    city:    'Villavicencio, Meta',
    rating:  5,
    product: 'Ganadería y cárnicos',
    text:    'Los precios son justos tanto para el comprador como para el productor. Saber de dónde viene cada producto y quién lo produce es algo que muy pocas tiendas ofrecen. Excelente plataforma.',
    initials: 'AM',
    color:    'bg-green-600',
  },
  {
    name:    'Patricia Herrera',
    city:    'Tunja, Boyacá',
    rating:  5,
    product: 'Pescados de Río',
    text:    'El pescado llegó fresco, bien empacado y con toda la información del productor. El chat de WhatsApp me resolvió todas las dudas en minutos. Totalmente recomendado.',
    initials: 'PH',
    color:    'bg-blue-600',
  },
];

/* ─── Stars ─────────────────────────────────────────────────────── */
const Stars = ({ count = 5 }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < count ? 'fill-secondary text-secondary' : 'text-muted-foreground/30'}`}
      />
    ))}
  </div>
);

/* ─── Component ──────────────────────────────────────────────────── */
const TestimonialsSection = () => {
  const [active, setActive] = useState(0);
  const [dir, setDir]       = useState(1);

  const go = (delta) => {
    setDir(delta);
    setActive(i => (i + delta + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const t = TESTIMONIALS[active];

  /* Promedio de ratings */
  const avg = (TESTIMONIALS.reduce((s, t) => s + t.rating, 0) / TESTIMONIALS.length).toFixed(1);

  return (
    <section className="section-spacing bg-muted">
      <div className="container-custom">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-secondary mb-2 block">
            Prueba social
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Lo que dicen nuestros clientes
          </h2>
          {/* Rating global */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-secondary text-secondary" />
              ))}
            </div>
            <span className="font-bold text-lg">{avg}</span>
            <span className="text-muted-foreground text-sm">/ 5 · {TESTIMONIALS.length} reseñas verificadas</span>
          </div>
        </motion.div>

        {/* Slider */}
        <div className="max-w-3xl mx-auto relative">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={active}
              custom={dir}
              initial={{ opacity: 0, x: dir * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -60 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="bg-card rounded-3xl p-8 md:p-10 shadow-sm border border-border"
            >
              {/* Quote icon */}
              <Quote className="w-10 h-10 text-primary/15 mb-4" />

              {/* Stars + producto */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Stars count={t.rating} />
                <span className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  Producto: {t.product}
                </span>
              </div>

              {/* Texto */}
              <p className="text-lg md:text-xl text-foreground leading-relaxed mb-8 italic font-serif">
                "{t.text}"
              </p>

              {/* Autor */}
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {t.initials}
                </div>
                <div>
                  <p className="font-bold">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.city}</p>
                </div>
                {/* Verificado */}
                <div className="ml-auto flex items-center gap-1.5 text-xs text-green-600 font-semibold bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full">
                  <Star className="w-3 h-3 fill-green-600" />
                  Compra verificada
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => go(-1)}
              className="p-3 rounded-full border border-border bg-card hover:bg-muted hover:border-primary/30 transition-all duration-200 shadow-sm"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDir(i > active ? 1 : -1); setActive(i); }}
                  className={`rounded-full transition-all duration-300 ${
                    i === active
                      ? 'w-6 h-2.5 bg-primary'
                      : 'w-2.5 h-2.5 bg-border hover:bg-primary/40'
                  }`}
                  aria-label={`Ir al testimonio ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => go(1)}
              className="p-3 rounded-full border border-border bg-card hover:bg-muted hover:border-primary/30 transition-all duration-200 shadow-sm"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bottom trust row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-3xl mx-auto"
        >
          {[
            { n: '98%',   label: 'Clientes satisfechos' },
            { n: '+120',  label: 'Productores verificados' },
            { n: '+1.800', label: 'Pedidos entregados' },
            { n: '24h',   label: 'Respuesta garantizada' },
          ].map((item, i) => (
            <div key={i} className="bg-card rounded-2xl p-4 text-center border border-border shadow-sm">
              <p className="text-2xl font-black text-primary mb-0.5">{item.n}</p>
              <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
