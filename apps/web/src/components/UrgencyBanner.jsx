import React, { useState, useEffect } from 'react';
import { X, Zap, Truck, Tag } from 'lucide-react';

/* ─── Mensajes rotativos de urgencia / incentivo ──────────────────
   Cambia el texto cada 6 segundos para crear variedad y captar atención.
   Edita estos mensajes desde aquí para campañas o temporadas.
──────────────────────────────────────────────────────────────────── */
const MESSAGES = [
  { icon: Truck, text: '🚚 Envío gratis en tu primer pedido — usa el código ', highlight: 'BIENVENIDO', color: 'bg-green-600' },
  { icon: Zap,   text: '⚡ Stock limitado en productos frescos —', highlight: '¡Reserva el tuyo hoy!', color: 'bg-secondary' },
  { icon: Tag,   text: '🌿 Productos 100% del campo colombiano, sin intermediarios —', highlight: 'precios justos', color: 'bg-primary' },
];

const UrgencyBanner = () => {
  const [idx, setIdx]         = useState(0);
  const [visible, setVisible] = useState(true);
  const [fading, setFading]   = useState(false);

  /* Rota mensajes cada 6 segundos */
  useEffect(() => {
    const t = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIdx(i => (i + 1) % MESSAGES.length);
        setFading(false);
      }, 300);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  if (!visible) return null;

  const msg = MESSAGES[idx];

  return (
    <div
      className={`${msg.color} text-white text-xs sm:text-sm font-medium py-2.5 px-4 relative z-[51] transition-all duration-300`}
      style={{ opacity: fading ? 0 : 1 }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 pr-8">
        <msg.icon className="w-4 h-4 flex-shrink-0 hidden sm:block" />
        <span>
          {msg.text}{' '}
          <strong className="underline underline-offset-2 decoration-white/60">{msg.highlight}</strong>
        </span>
      </div>
      <button
        onClick={() => setVisible(false)}
        aria-label="Cerrar"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/20 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default UrgencyBanner;
