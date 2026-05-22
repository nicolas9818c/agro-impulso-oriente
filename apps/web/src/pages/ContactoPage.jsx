import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Clock, MessageCircle, Send, CheckCircle2, ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';

/* ─── Datos de contacto ──────────────────────────────────
   ⚠️  Actualiza el número de WhatsApp con tu número real:
       reemplaza 573001234567 por tu número sin + ni espacios
────────────────────────────────────────────────────────── */
const WHATSAPP_NUMBER  = '573125268451';
const WHATSAPP_MESSAGE = encodeURIComponent(
  '¡Hola! Me comunico desde la web de Agro Impulso Oriente. Quiero más información sobre sus productos 🌿'
);
const WHATSAPP_URL     = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

const INFO_CARDS = [
  {
    icon: MapPin,
    title: 'Ubicación',
    lines: ['Puerto Carreño, Vichada', 'Colombia'],
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Phone,
    title: 'Teléfono / WhatsApp',
    lines: ['+57 312 526 8451'],
    link: WHATSAPP_URL,
    linkLabel: 'Abrir WhatsApp',
    color: 'bg-green-100 text-green-700',
  },
  {
    icon: Mail,
    title: 'Correo Electrónico',
    lines: ['contacto@agroimpulsooriente.store'],
    link: 'mailto:contacto@agroimpulsooriente.store',
    linkLabel: 'Enviar correo',
    color: 'bg-secondary/10 text-secondary',
  },
  {
    icon: Clock,
    title: 'Horario de Atención',
    lines: ['Lunes a Viernes: 8 am – 6 pm', 'Sábado: 8 am – 1 pm'],
    color: 'bg-accent/10 text-accent',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

/* ─── Simple form hook ───────────────────────────────────── */
const useForm = (initial) => {
  const [values, setValues] = useState(initial);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));
  return { values, set, sending, setSending, sent, setSent };
};

/* ─── General contact form ───────────────────────────────── */
const GeneralForm = () => {
  const f = useForm({ nombre: '', email: '', asunto: '', mensaje: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!f.values.nombre || !f.values.email || !f.values.mensaje) {
      toast.error('Por favor completa los campos requeridos.');
      return;
    }
    f.setSending(true);
    try {
      await pb.collection('contactos').create({
        nombre:  f.values.nombre,
        email:   f.values.email,
        asunto:  f.values.asunto,
        mensaje: f.values.mensaje,
        tipo:    'general',
        $autoCancel: false,
      });
      f.setSent(true);
      toast.success('¡Mensaje enviado! Te responderemos en menos de 24 horas.');
    } catch {
      toast.error('Error al enviar. Por favor intenta de nuevo o escríbenos por WhatsApp.');
    } finally {
      f.setSending(false);
    }
  };

  if (f.sent) return <SuccessMessage />;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="nombre">Nombre completo *</Label>
          <Input id="nombre" placeholder="Tu nombre" value={f.values.nombre} onChange={f.set('nombre')} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Correo electrónico *</Label>
          <Input id="email" type="email" placeholder="tu@correo.com" value={f.values.email} onChange={f.set('email')} required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="asunto">Asunto</Label>
        <Input id="asunto" placeholder="¿En qué podemos ayudarte?" value={f.values.asunto} onChange={f.set('asunto')} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="mensaje">Mensaje *</Label>
        <Textarea id="mensaje" placeholder="Cuéntanos con más detalle..." rows={5} value={f.values.mensaje} onChange={f.set('mensaje')} required />
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={f.sending}>
        {f.sending ? 'Enviando...' : <><Send className="w-4 h-4 mr-2" />Enviar Mensaje</>}
      </Button>
    </form>
  );
};

/* ─── Producer form ──────────────────────────────────────── */
const ProductorForm = () => {
  const f = useForm({ nombre: '', telefono: '', municipio: '', productos: '', hectareas: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!f.values.nombre || !f.values.telefono || !f.values.productos) {
      toast.error('Por favor completa los campos requeridos.');
      return;
    }
    f.setSending(true);
    try {
      await pb.collection('productores_solicitudes').create({
        nombre:    f.values.nombre,
        telefono:  f.values.telefono,
        municipio: f.values.municipio,
        productos: f.values.productos,
        hectareas: f.values.hectareas,
        $autoCancel: false,
      });
      f.setSent(true);
      toast.success('¡Solicitud enviada! Nos contactaremos contigo muy pronto.');
    } catch {
      toast.error('Error al enviar. Escríbenos directamente por WhatsApp.');
    } finally {
      f.setSending(false);
    }
  };

  if (f.sent) return <SuccessMessage msg="¡Solicitud recibida! Te contactamos en las próximas 24 horas para conocer más sobre tu producción." />;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="p-nombre">Nombre completo *</Label>
          <Input id="p-nombre" placeholder="Tu nombre" value={f.values.nombre} onChange={f.set('nombre')} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-tel">Teléfono / WhatsApp *</Label>
          <Input id="p-tel" type="tel" placeholder="+57 300 000 0000" value={f.values.telefono} onChange={f.set('telefono')} required />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="p-municipio">Municipio / Vereda</Label>
          <Input id="p-municipio" placeholder="Puerto Carreño, Cumaribo..." value={f.values.municipio} onChange={f.set('municipio')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-hectareas">Área productiva (hectáreas)</Label>
          <Input id="p-hectareas" type="number" placeholder="Ej: 5" min="0" value={f.values.hectareas} onChange={f.set('hectareas')} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="p-productos">¿Qué produces? *</Label>
        <Textarea
          id="p-productos"
          placeholder="Describe tus productos: frutas, hortalizas, ganadería, lácteos, artesanías..."
          rows={4}
          value={f.values.productos}
          onChange={f.set('productos')}
          required
        />
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={f.sending}>
        {f.sending ? 'Enviando...' : <><Send className="w-4 h-4 mr-2" />Quiero Unirme</>}
      </Button>
    </form>
  );
};

/* ─── Buyer form ─────────────────────────────────────────── */
const CompradorForm = () => {
  const f = useForm({ nombre: '', email: '', telefono: '', interes: '', frecuencia: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!f.values.nombre || !f.values.email || !f.values.interes) {
      toast.error('Por favor completa los campos requeridos.');
      return;
    }
    f.setSending(true);
    try {
      await pb.collection('compradores_solicitudes').create({
        nombre:    f.values.nombre,
        email:     f.values.email,
        telefono:  f.values.telefono,
        interes:   f.values.interes,
        frecuencia: f.values.frecuencia,
        $autoCancel: false,
      });
      f.setSent(true);
      toast.success('¡Registro recibido! Te conectaremos con los mejores productos del Vichada.');
    } catch {
      toast.error('Error al enviar. Escríbenos directamente por WhatsApp.');
    } finally {
      f.setSending(false);
    }
  };

  if (f.sent) return <SuccessMessage msg="¡Perfecto! En breve te enviamos el catálogo actualizado y te conectamos con nuestros productores." />;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="c-nombre">Nombre completo *</Label>
          <Input id="c-nombre" placeholder="Tu nombre" value={f.values.nombre} onChange={f.set('nombre')} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-email">Correo electrónico *</Label>
          <Input id="c-email" type="email" placeholder="tu@correo.com" value={f.values.email} onChange={f.set('email')} required />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="c-tel">Teléfono / WhatsApp</Label>
          <Input id="c-tel" type="tel" placeholder="+57 300 000 0000" value={f.values.telefono} onChange={f.set('telefono')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-freq">Frecuencia de compra</Label>
          <Input id="c-freq" placeholder="Semanal, quincenal, mensual..." value={f.values.frecuencia} onChange={f.set('frecuencia')} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="c-interes">¿Qué productos te interesan? *</Label>
        <Textarea
          id="c-interes"
          placeholder="Frutas tropicales, cárnicos, lácteos, artesanías llaneras..."
          rows={4}
          value={f.values.interes}
          onChange={f.set('interes')}
          required
        />
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={f.sending}>
        {f.sending ? 'Enviando...' : <><Send className="w-4 h-4 mr-2" />Quiero Comprar Productos Locales</>}
      </Button>
    </form>
  );
};

/* ─── Success state ──────────────────────────────────────── */
const SuccessMessage = ({ msg = '¡Mensaje enviado! Te responderemos en menos de 24 horas.' }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
      <CheckCircle2 className="w-8 h-8 text-primary" />
    </div>
    <h3 className="text-xl font-bold mb-2">¡Listo!</h3>
    <p className="text-muted-foreground max-w-sm">{msg}</p>
  </div>
);

/* ─── Page ───────────────────────────────────────────────── */
const ContactoPage = () => (
  <>
    <Helmet>
      <title>Contacto | AGRO IMPULSO ORIENTE</title>
      <meta name="description" content="Contáctanos por WhatsApp, email o formulario. Estamos en Puerto Carreño, Vichada, listos para ayudarte." />
    </Helmet>

    <div className="min-h-screen bg-background">
      <Header />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative bg-primary py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1423345548800-9a50e6c3b7d2?w=1200&q=70')" }}
        />
        <div className="relative z-10 container-custom text-center">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-secondary mb-4 px-4 py-1.5 bg-secondary/15 rounded-full border border-secondary/25">
              Hablemos
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Estamos Aquí para Ti</h1>
            <p className="text-white/80 text-lg max-w-xl mx-auto">
              Escríbenos por WhatsApp, llámanos o usa el formulario. Respondemos en menos de 24 horas.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── WHATSAPP CTA — estilo Agropaisa ──────────────── */}
      <section className="py-8 bg-green-600">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-white">
              <MessageCircle className="w-8 h-8 flex-shrink-0" />
              <div>
                <p className="font-bold text-lg leading-tight">¡Realiza tu pedido por WhatsApp!</p>
                <p className="text-white/85 text-sm">Atención inmediata · Respuesta en minutos</p>
              </div>
            </div>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white text-green-700 font-bold px-6 py-3 rounded-xl hover:bg-green-50 transition shadow-lg text-sm whitespace-nowrap"
            >
              <MessageCircle className="w-5 h-5" />
              Chatear ahora
            </a>
          </div>
        </div>
      </section>

      {/* ── INFO CARDS ───────────────────────────────────── */}
      <section className="section-spacing bg-background">
        <div className="container-custom">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {INFO_CARDS.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-2xl p-7 text-center shadow-sm border border-border hover:shadow-md transition-shadow"
              >
                <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center ${c.color}`}>
                  <c.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-base mb-2">{c.title}</h3>
                {c.lines.map((l, j) => (
                  <p key={j} className="text-muted-foreground text-sm">{l}</p>
                ))}
                {c.link && (
                  <a
                    href={c.link}
                    target={c.link.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-xs font-semibold text-primary hover:underline"
                  >
                    {c.linkLabel} →
                  </a>
                )}
              </motion.div>
            ))}
          </div>

          {/* ── FORMS (tabs) ──────────────────────────────── */}
          <div className="max-w-3xl mx-auto">
            <motion.div initial="hidden" whileInView="show" variants={fadeUp} viewport={{ once: true }} className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">¿Cómo podemos ayudarte?</h2>
              <p className="text-muted-foreground">Selecciona la opción que mejor describe tu consulta.</p>
            </motion.div>

            <motion.div initial="hidden" whileInView="show" variants={fadeUp} viewport={{ once: true }}>
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8 h-auto p-1">
                  <TabsTrigger value="general" className="py-2.5 text-xs sm:text-sm">Consulta General</TabsTrigger>
                  <TabsTrigger value="productor" className="py-2.5 text-xs sm:text-sm">Soy Productor</TabsTrigger>
                  <TabsTrigger value="comprador" className="py-2.5 text-xs sm:text-sm">Soy Comprador</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                  <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
                    <h3 className="text-xl font-semibold mb-1">Envíanos un mensaje</h3>
                    <p className="text-muted-foreground text-sm mb-6">Para cualquier consulta, duda o sugerencia.</p>
                    <GeneralForm />
                  </div>
                </TabsContent>

                <TabsContent value="productor">
                  <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
                    <h3 className="text-xl font-semibold mb-1">Únete como Productor</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      Si produces en el Vichada o la Orinoquía, cuéntanos sobre tu producción y comenzamos juntos.
                    </p>
                    <ProductorForm />
                  </div>
                </TabsContent>

                <TabsContent value="comprador">
                  <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
                    <h3 className="text-xl font-semibold mb-1">Quiero Comprar</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      Regístrate y te conectamos con productores locales. Recibe el catálogo actualizado directamente.
                    </p>
                    <CompradorForm />
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── MAP ──────────────────────────────────────────── */}
      <section className="pb-16">
        <div className="container-custom">
          <motion.div initial="hidden" whileInView="show" variants={fadeUp} viewport={{ once: true }} className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Dónde Estamos</h2>
            <p className="text-muted-foreground text-sm">Puerto Carreño, Vichada — Colombia</p>
          </motion.div>
          <div className="rounded-3xl overflow-hidden shadow-xl border border-border h-72 sm:h-96">
            <iframe
              title="Puerto Carreño, Vichada"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63731.60756012928!2d-67.52499978039854!3d6.18921340649847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c1f1e8e6b8c7f8f%3A0x6e7f8e8e6b8c7f8f!2sPuerto+Carre%C3%B1o%2C+Vichada!5e0!3m2!1ses!2sco!4v1700000000000!5m2!1ses!2sco"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  </>
);

export default ContactoPage;
