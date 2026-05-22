import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Facebook, Instagram, MessageCircle, Mail, MapPin, Phone } from 'lucide-react';

/* ─── WhatsApp config (mismo número que ContactoPage) ─────
   ⚠️  Actualiza 573001234567 con tu número real
──────────────────────────────────────────────────────────── */
const WA_URL = 'https://wa.me/573125268451?text=' +
  encodeURIComponent('¡Hola! Me comunico desde Agro Impulso Oriente. Quisiera más información.');

const Footer = () => (
  <footer className="bg-primary text-primary-foreground pt-16 pb-8">
    <div className="container-custom">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

        {/* ── Marca ──────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/15 flex items-center justify-center">
              <Sprout className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-serif tracking-tight">AGRO IMPULSO ORIENTE</span>
          </div>

          <p className="text-primary-foreground/75 leading-relaxed mb-6 max-w-sm text-sm">
            Plataforma de comercio justo que conecta directamente a productores campesinos
            de la Orinoquía con compradores en toda Colombia. Sin intermediarios, con precios
            justos y total transparencia.
          </p>

          {/* Redes y WhatsApp */}
          <div className="flex gap-3">
            <a
              href="https://facebook.com/AGROIMPULSOORIENTE"
              target="_blank" rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://instagram.com/AGROIMPULSOORIENTE"
              target="_blank" rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href={WA_URL}
              target="_blank" rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* ── Enlaces ────────────────────────────────────── */}
        <div>
          <h3 className="text-base font-semibold mb-5">Navegación</h3>
          <ul className="space-y-3 text-sm">
            {[
              { to: '/productos',      label: 'Catálogo de Productos' },
              { to: '/sobre-nosotros', label: 'Sobre Nosotros'        },
              { to: '/contacto',       label: 'Contacto'              },
              { to: '/login',          label: 'Iniciar Sesión'        },
              { to: '/signup',         label: 'Registrarse'           },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-primary-foreground/70 hover:text-secondary transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Contacto ───────────────────────────────────── */}
        <div>
          <h3 className="text-base font-semibold mb-5">Contacto</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3 text-primary-foreground/70">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-secondary" />
              <span>Puerto Carreño, Vichada<br />Colombia</span>
            </li>
            <li className="flex items-center gap-3 text-primary-foreground/70">
              <Phone className="w-4 h-4 flex-shrink-0 text-secondary" />
              <a href="tel:+573125268451" className="hover:text-secondary transition-colors">
                +57 312 526 8451
              </a>
            </li>
            <li className="flex items-center gap-3 text-primary-foreground/70">
              <Mail className="w-4 h-4 flex-shrink-0 text-secondary" />
              <a
                href="mailto:contacto@agroimpulsooriente.store"
                className="hover:text-secondary transition-colors break-all"
              >
                contacto@agroimpulsooriente.store
              </a>
            </li>
            <li className="flex items-start gap-3 text-primary-foreground/70">
              <MessageCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-400" />
              <a
                href={WA_URL}
                target="_blank" rel="noopener noreferrer"
                className="hover:text-secondary transition-colors"
              >
                WhatsApp disponible<br />
                <span className="text-xs text-primary-foreground/50">Lun–Vie 8 am–6 pm</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* ── Bottom bar ─────────────────────────────────────── */}
      <div className="border-t border-primary-foreground/15 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-primary-foreground/45">
        <p>© {new Date().getFullYear()} AGRO IMPULSO ORIENTE. Todos los derechos reservados.</p>
        <p>Comercio Justo para el Agro Colombiano 🌿</p>
      </div>
    </div>
  </footer>
);

export default Footer;
