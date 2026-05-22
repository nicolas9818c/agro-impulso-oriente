import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

/* ─── WhatsApp flotante — estilo Agropaisa ────────────────
   ⚠️  Actualiza WHATSAPP_NUMBER con tu número real (sin +)
──────────────────────────────────────────────────────────── */
const WHATSAPP_NUMBER  = '573125268451';
const WHATSAPP_MESSAGE = encodeURIComponent(
  '¡Hola! Me comunico desde agroimpulsooriente.store. Quisiera más información sobre sus productos 🌿'
);

export const WhatsAppButton = () => {
  const [visible, setVisible]   = useState(false);
  const [tooltip, setTooltip]   = useState(true);
  const [dismissed, setDismiss] = useState(false);

  /* Muestra el botón después de 1.5 s */
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  /* Oculta el tooltip después de 6 s */
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setTooltip(false), 6000);
    return () => clearTimeout(t);
  }, [visible]);

  if (!visible) return null;

  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2
        transition-all duration-500
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
    >
      {/* Tooltip */}
      {tooltip && !dismissed && (
        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 max-w-[220px] mr-1">
          {/* Close */}
          <button
            onClick={() => setDismiss(true)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-gray-400 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-3 h-3" />
          </button>
          {/* Arrow */}
          <div className="absolute bottom-[-8px] right-5 w-4 h-4 bg-white border-r border-b border-gray-100 rotate-45" />
          <p className="text-xs font-semibold text-gray-800 leading-snug">
            ¿Tienes alguna pregunta? 👋
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Escríbenos por WhatsApp, te respondemos al instante.
          </p>
        </div>
      )}

      {/* Main button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="
          group relative w-14 h-14 bg-green-500 hover:bg-green-600
          rounded-full shadow-2xl flex items-center justify-center
          transition-all duration-300 hover:scale-110 active:scale-95
        "
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30" />
        <MessageCircle className="w-7 h-7 text-white relative z-10" />
      </a>
    </div>
  );
};

export default WhatsAppButton;
