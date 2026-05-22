import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
  Heart, Scale, Leaf, Shield, Users, CheckCircle2,
  MapPin, Sprout, ArrowRight, Briefcase, Package,
  TrendingUp, DollarSign, HeartHandshake, Building2,
  Target, Eye, Landmark, Globe,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

/* ─── Animaciones ─────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};
const slide = (dir = 'left') => ({
  hidden: { opacity: 0, x: dir === 'left' ? -30 : 30 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
});

/* ─── Equipo fundador ─────────────────────────────────────── */
const TEAM = [
  {
    name:    'Dairon Nicolás Camero Barreto',
    role:    'Gerente',
    age:     27,
    avatar:  'https://i.pravatar.cc/200?img=52',
    icon:    Briefcase,
    color:   'bg-primary/10 text-primary',
    desc:    'Lidera la estrategia comercial y la gestión organizativa de la asociación, articulando todas las áreas para el cumplimiento del objeto social.',
  },
  {
    name:    'Karen Yuliet Beltrán Miranda',
    role:    'Coordinadora Administrativa y Financiera',
    age:     27,
    avatar:  'https://i.pravatar.cc/200?img=25',
    icon:    DollarSign,
    color:   'bg-secondary/10 text-secondary',
    desc:    'Administra los recursos financieros y materiales, garantiza la transparencia contable y el manejo adecuado de los fondos de la asociación.',
  },
  {
    name:    'Laura Camila Dávila González',
    role:    'Coordinadora de Logística y Acopio',
    age:     28,
    avatar:  'https://i.pravatar.cc/200?img=44',
    icon:    Package,
    color:   'bg-accent/10 text-accent',
    desc:    'Gestiona el centro de acopio, las rutas de distribución rural hacia veredas y vegas, y el control de inventario y calidad del producto.',
  },
  {
    name:    'Jesús Camilo Novoa Escalona',
    role:    'Coordinador de Comercialización',
    age:     26,
    avatar:  'https://i.pravatar.cc/200?img=59',
    icon:    TrendingUp,
    color:   'bg-blue-50 text-blue-600 dark:bg-blue-900/20',
    desc:    'Desarrolla los canales de venta, atiende clientes mayoristas y minoristas, y gestiona el cumplimiento de contratos y acuerdos comerciales.',
  },
  {
    name:    'Adriana Sofía Colina Santos',
    role:    'Coordinadora Social, Comunitaria y Asociativa',
    age:     24,
    avatar:  'https://i.pravatar.cc/200?img=29',
    icon:    HeartHandshake,
    color:   'bg-rose-50 text-rose-600 dark:bg-rose-900/20',
    desc:    'Fortalece el vínculo con la comunidad campesina, gestiona proyectos sociales y vela por la participación activa de los asociados.',
  },
];

/* ─── Valores (principios estatutarios) ──────────────────── */
const VALUES = [
  {
    icon:  Heart,
    title: 'Solidaridad',
    desc:  'Apoyo mutuo entre asociados y con la comunidad. Trabajamos unidos para fortalecer las redes campesinas de la Orinoquía.',
    cls:   'bg-rose-50 text-rose-600 dark:bg-rose-900/20',
  },
  {
    icon:  Scale,
    title: 'Transparencia',
    desc:  'Manejo honesto y documentado de todos los recursos. Rendición de cuentas permanente ante los asociados y las comunidades.',
    cls:   'bg-secondary/10 text-secondary',
  },
  {
    icon:  Leaf,
    title: 'Sostenibilidad',
    desc:  'Producción en armonía con la naturaleza. Promovemos la agroecología y las buenas prácticas agrícolas del territorio.',
    cls:   'bg-primary/10 text-primary',
  },
  {
    icon:  Shield,
    title: 'Enfoque de Derechos',
    desc:  'El campesinado es sujeto de especial protección constitucional. Actuamos con enfoque diferencial, de género e intercultural.',
    cls:   'bg-blue-50 text-blue-600 dark:bg-blue-900/20',
  },
  {
    icon:  Users,
    title: 'Participación',
    desc:  'Las decisiones se construyen colectivamente con la base asociativa. Control social activo de los asociados sobre la gestión.',
    cls:   'bg-accent/10 text-accent',
  },
];

/* ─── Líneas estratégicas ─────────────────────────────────── */
const LINEAS = [
  { icon: Sprout,      label: 'Producción agropecuaria campesina con enfoque agroecológico' },
  { icon: Package,     label: 'Acopio, almacenamiento y comercialización asociativa de insumos' },
  { icon: TrendingUp,  label: 'Economía campesina, mercados locales y compras públicas locales' },
  { icon: HeartHandshake, label: 'Proyectos sociales y atención integral a familias rurales (ICBF)' },
  { icon: DollarSign,  label: 'Fortalecimiento agropecuario familiar con recursos públicos (ADR, SGR, FINAGRO)' },
  { icon: Building2,   label: 'Asistencia técnica, extensión rural y acompañamiento productivo' },
  { icon: Landmark,    label: 'Contratación pública con entidades del Estado (Ley 2046/2020)' },
  { icon: Globe,       label: 'Gestión ambiental, agroecología y defensa del territorio campesino' },
];

/* ─── Hitos ───────────────────────────────────────────────── */
const MILESTONES = [
  {
    year: '2025',
    title: 'La Idea',
    desc: 'Cinco jóvenes campesinos de Puerto Carreño identifican la brecha de abastecimiento en veredas y vegas del municipio, y deciden organizarse para resolverla.',
  },
  {
    year: 'Mar 2026',
    title: 'Constitución Legal',
    desc: 'Se formalizan los estatutos de la Asociación Campesina Agro Impulso Oriente ante Cámara de Comercio, con registro ante la DIAN en el Régimen Tributario Especial.',
  },
  {
    year: 'Mar 2026',
    title: 'Fondo Emprender SENA',
    desc: 'Se presenta el proyecto (ID 105232) a la convocatoria 155-1C "Jóvenes Emprendedores" del SENA por $523 millones COP para montar el centro de acopio.',
  },
  {
    year: '2026',
    title: 'Operación Comercial',
    desc: 'Inicio de operaciones: punto de acopio en Puerto Carreño, rutas programadas a veredas, y primera red de productores campesinos aliados.',
  },
  {
    year: '2027',
    title: 'Proyección Regional',
    desc: 'Meta: ser organización campesina de referencia en Vichada, articulando producción, comercialización, servicios sociales y gestión territorial en la Orinoquía.',
  },
];

/* ─── Estadísticas ────────────────────────────────────────── */
const STATS = [
  { n: '5',      label: 'Jóvenes fundadores campesinos' },
  { n: '$523M',  label: 'Proyecto Fondo Emprender SENA' },
  { n: '7',      label: 'Empleos directos a crear' },
  { n: '35%',    label: 'TIR proyectada a 5 años' },
];

/* ══════════════════════════════════════════════════════════ */

const SobreNosotrosPage = () => (
  <>
    <Helmet>
      <title>Quiénes Somos | Agro Impulso Oriente — Asociación Campesina Vichada</title>
      <meta
        name="description"
        content="Asociación Campesina Agro Impulso Oriente: jóvenes emprendedores de Puerto Carreño, Vichada, que organizan el acopio y comercialización de insumos agropecuarios para el campo colombiano."
      />
    </Helmet>

    <div className="min-h-screen bg-background">
      <Header />

      {/* ══ 1. HERO ════════════════════════════════════════ */}
      <section className="relative min-h-[72vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/93 via-primary/68 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent" />

        <div className="relative z-10 container-custom py-32">
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="max-w-2xl">

            {/* Badges institucionales */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-secondary px-4 py-1.5 bg-secondary/15 rounded-full border border-secondary/25">
                <Landmark className="w-3.5 h-3.5" /> ESAL Campesina · Reg. Cámara de Comercio
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/80 px-4 py-1.5 bg-white/10 rounded-full border border-white/20">
                <MapPin className="w-3.5 h-3.5" /> Puerto Carreño, Vichada · Colombia
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Jóvenes del Campo<br />
              <span className="text-secondary">Organizados para el Campo</span>
            </h1>

            <p className="text-lg text-white/85 leading-relaxed max-w-xl mb-8">
              Somos una asociación campesina sin ánimo de lucro nacida en Puerto Carreño para
              organizar el acopio y la distribución de insumos agropecuarios en veredas, vegas
              y comunidades rurales del Vichada — llevando el campo a sus manos.
            </p>

            {/* Mini stats hero */}
            <div className="flex flex-wrap gap-6 border-t border-white/20 pt-8">
              {[
                { n: '5', label: 'Fundadores jóvenes' },
                { n: '12.401 km²', label: 'Área rural que atendemos' },
                { n: '2026', label: 'Año de constitución' },
              ].map(({ n, label }) => (
                <div key={label}>
                  <p className="text-2xl font-black text-secondary">{n}</p>
                  <p className="text-white/65 text-xs font-semibold uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ 2. QUIÉNES SOMOS ══════════════════════════════ */}
      <section className="section-spacing bg-background">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-14 items-center">

            <motion.div initial="hidden" whileInView="show" variants={slide('left')} viewport={{ once: true }}>
              <span className="text-xs font-bold uppercase tracking-widest text-secondary mb-3 block">Quiénes somos</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-snug">
                Una asociación campesina<br />con propósito colectivo
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">AGRO IMPULSO ORIENTE</strong> es una persona
                  jurídica de derecho privado, sin ánimo de lucro, de carácter campesino,
                  productivo, social y comunitario, organizada conforme a la legislación
                  colombiana vigente y con domicilio en Puerto Carreño, Vichada.
                </p>
                <p>
                  Actuamos con enfoque diferencial de derechos, reconociendo al campesinado
                  como sujeto de especial protección constitucional conforme al artículo 64
                  de la Constitución Política de Colombia.
                </p>
                <p>
                  Nuestra cobertura es municipal con proyección departamental y regional en
                  la Orinoquía. Podemos desarrollar acciones en zonas rurales, vegas, áreas
                  ribereñas y territorios campesinos afines, y ejecutar proyectos en cualquier
                  municipio del territorio nacional.
                </p>
              </div>
            </motion.div>

            {/* Líneas estratégicas */}
            <motion.div initial="hidden" whileInView="show" variants={slide('right')} viewport={{ once: true }}>
              <span className="text-xs font-bold uppercase tracking-widest text-secondary mb-3 block">Nuestras líneas de acción</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Lo que hacemos</h2>
              <div className="space-y-3">
                {LINEAS.map(({ icon: Icon, label }, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.07 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3 bg-muted/50 rounded-xl px-4 py-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-sm text-foreground leading-relaxed font-medium">{label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ 3. MISIÓN / VISIÓN ════════════════════════════ */}
      <section className="section-spacing bg-muted">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-10 items-stretch">

            {/* Misión */}
            <motion.div
              initial="hidden" whileInView="show" variants={slide('left')} viewport={{ once: true }}
              className="bg-card rounded-3xl p-10 border border-border shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-secondary mb-2 block">Nuestro propósito</span>
                <h2 className="text-3xl font-bold mb-5">Misión</h2>
                <p className="text-muted-foreground leading-relaxed text-base mb-4">
                  Fortalecer la soberanía alimentaria, la economía campesina, el bienestar de
                  las familias rurales y el desarrollo rural integral en Puerto Carreño y la
                  Orinoquía colombiana.
                </p>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  Lo hacemos a través del acopio y comercialización de insumos agropecuarios,
                  la ejecución de proyectos sociales con familias campesinas, la asistencia
                  técnica y la articulación con entidades públicas y de cooperación internacional.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-border flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-xs text-muted-foreground">Marco: Art. 64 C.P. Colombia · Acto Legislativo 01/2023</span>
              </div>
            </motion.div>

            {/* Visión + Proyección */}
            <motion.div
              initial="hidden" whileInView="show" variants={slide('right')} viewport={{ once: true }}
              className="bg-primary rounded-3xl p-10 text-primary-foreground flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-6">
                  <Eye className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary-foreground/60 mb-2 block">Hacia dónde vamos</span>
                <h2 className="text-3xl font-bold mb-5">Visión</h2>
                <p className="text-primary-foreground/90 leading-relaxed text-base mb-6">
                  Ser la organización campesina de referencia en el departamento del Vichada,
                  capaz de articular producción, comercialización, servicios sociales y gestión
                  territorial en beneficio de los asociados y las comunidades rurales de la Orinoquía.
                </p>
                <div className="space-y-3">
                  {[
                    { phase: 'Corto plazo', desc: 'Consolidar operación comercial de insumos en Puerto Carreño' },
                    { phase: 'Mediano plazo', desc: 'Ampliar hacia proyectos sociales y agropecuarios con recursos públicos' },
                    { phase: 'Largo plazo', desc: 'Organización campesina de referencia en Vichada y la Orinoquía' },
                  ].map(({ phase, desc }) => (
                    <div key={phase} className="flex items-start gap-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-secondary bg-white/10 px-2 py-1 rounded-md mt-0.5 whitespace-nowrap">{phase}</span>
                      <p className="text-primary-foreground/80 text-sm leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 flex items-center gap-3 border-t border-primary-foreground/15 pt-6">
                <MapPin className="w-4 h-4 text-secondary flex-shrink-0" />
                <span className="text-primary-foreground/70 text-sm">Puerto Carreño, Vichada · Colombia</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ 4. EL EQUIPO ══════════════════════════════════ */}
      <section className="section-spacing bg-background">
        <div className="container-custom">
          <motion.div
            initial="hidden" whileInView="show" variants={fadeUp} viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-secondary mb-3 block">
              Las personas detrás del proyecto
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nuestro Equipo Fundador</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Cinco jóvenes campesinos de Puerto Carreño con menos de 30 años que decidieron
              organizarse para cambiar la realidad del campo del Vichada.
            </p>
          </motion.div>

          {/* Grid: 3 arriba, 2 abajo centrados */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {TEAM.slice(0, 3).map((member, i) => (
              <TeamCard key={member.name} member={member} delay={i * 0.1} />
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {TEAM.slice(3).map((member, i) => (
              <TeamCard key={member.name} member={member} delay={(i + 3) * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ 5. CONTEXTO (Puerto Carreño) ══════════════════ */}
      <section className="section-spacing bg-muted">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            <motion.div initial="hidden" whileInView="show" variants={fadeUp} viewport={{ once: true }}>
              <img
                src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&q=80"
                alt="Campo de la Orinoquía colombiana"
                className="rounded-3xl shadow-2xl w-full object-cover aspect-[4/3]"
              />
            </motion.div>

            <motion.div initial="hidden" whileInView="show" variants={slide('right')} viewport={{ once: true }}>
              <span className="text-xs font-bold uppercase tracking-widest text-secondary mb-2 block">El territorio</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Puerto Carreño y la Orinoquía</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Puerto Carreño tiene 12.409 km² — de los cuales 12.401 km² son zona rural —
                  y una población de 19.788 personas (DANE 2018). La distancia entre veredas
                  e inspecciones es extensa, y el deterioro de la malla vial encarece
                  constantemente el transporte y el precio de los insumos.
                </p>
                <p>
                  La pobreza extrema ronda el 15% en el municipio y la pobreza
                  multidimensional supera el 65% en el departamento del Vichada, lo que
                  refleja barreras estructurales en el acceso a ingresos, servicios y
                  condiciones de vida.
                </p>
                <p>
                  <strong className="text-foreground">AGRO IMPULSO ORIENTE</strong> surgió
                  para romper ese ciclo: llevamos los insumos hasta las veredas y vegas,
                  reducimos intermediarios y estabilizamos los precios con los que trabaja
                  el campesino.
                </p>
              </div>

              {/* Datos clave */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                {[
                  { n: '19.788', label: 'Habitantes (DANE 2018)' },
                  { n: '12.401 km²', label: 'Área rural del municipio' },
                  { n: '>65%', label: 'Pobreza multidimensional Vichada' },
                  { n: '3', label: 'Centros poblados rurales principales' },
                ].map(({ n, label }) => (
                  <div key={label} className="bg-card rounded-2xl p-4 border border-border">
                    <p className="text-2xl font-black text-primary">{n}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ 6. VALORES ════════════════════════════════════ */}
      <section className="section-spacing bg-background">
        <div className="container-custom">
          <motion.div
            initial="hidden" whileInView="show" variants={fadeUp} viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-secondary mb-2 block">Lo que nos guía</span>
            <h2 className="text-3xl md:text-4xl font-bold">Nuestros Valores</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {VALUES.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                viewport={{ once: true }}
                className="bg-card rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow duration-300 border border-border"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${v.cls}`}>
                  <v.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">{v.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 7. TIMELINE ═══════════════════════════════════ */}
      <section className="section-spacing bg-muted">
        <div className="container-custom">
          <motion.div
            initial="hidden" whileInView="show" variants={fadeUp} viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-secondary mb-2 block">Nuestra historia</span>
            <h2 className="text-3xl md:text-4xl font-bold">Cómo llegamos hasta aquí</h2>
          </motion.div>

          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />
            {MILESTONES.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`relative flex gap-6 md:gap-0 mb-10 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                <div className="absolute left-[26px] md:left-1/2 w-5 h-5 rounded-full bg-primary border-4 border-background shadow-md md:-translate-x-2.5 top-2" />
                <div className={`ml-16 md:ml-0 md:w-[46%] bg-card rounded-2xl p-5 shadow-sm border border-border ${i % 2 === 0 ? 'md:mr-[8%]' : 'md:ml-[8%]'}`}>
                  <span className="inline-block text-xs font-bold text-secondary bg-secondary/10 px-3 py-1 rounded-full mb-2 border border-secondary/20">
                    {m.year}
                  </span>
                  <h3 className="text-base font-bold mb-1">{m.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 8. ESTADÍSTICAS ═══════════════════════════════ */}
      <section className="section-spacing bg-primary text-primary-foreground">
        <div className="container-custom">
          <motion.div
            initial="hidden" whileInView="show" variants={fadeUp} viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">El Proyecto en Números</h2>
            <p className="text-primary-foreground/75 max-w-xl mx-auto">
              Avalado por el SENA Fondo Emprender, convocatoria Jóvenes Emprendedores 2026.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl md:text-5xl font-black text-secondary mb-2">{s.n}</div>
                <p className="text-primary-foreground/70 text-sm font-medium">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 9. CTA ════════════════════════════════════════ */}
      <section className="section-spacing bg-background">
        <div className="container-custom text-center max-w-2xl mx-auto">
          <motion.div initial="hidden" whileInView="show" variants={fadeUp} viewport={{ once: true }}>
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Sprout className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-4">¿Listo para ser parte del cambio?</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Ya sea que seas productor, comprador o simplemente quieras apoyar el campo
              colombiano, aquí tienes un lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/productos">Ver Catálogo de Productos <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/contacto">Contáctanos</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  </>
);

/* ─── TeamCard (subcomponente) ───────────────────────────── */
const TeamCard = ({ member, delay }) => {
  const Icon = member.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay }}
      viewport={{ once: true }}
      className="bg-card rounded-3xl border border-border shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
    >
      {/* Franja superior de color */}
      <div className="h-2 bg-gradient-to-r from-primary via-primary/70 to-secondary" />

      <div className="p-7">
        {/* Avatar + ícono de rol */}
        <div className="relative w-20 h-20 mb-5">
          <img
            src={member.avatar}
            alt={member.name}
            className="w-20 h-20 rounded-2xl object-cover shadow-md"
          />
          <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center shadow-md border-2 border-background ${member.color}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        {/* Nombre y edad */}
        <h3 className="text-base font-bold text-card-foreground leading-snug mb-0.5 group-hover:text-primary transition-colors">
          {member.name}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">{member.age} años · Campesino/a</p>

        {/* Rol badge */}
        <span className={`inline-block text-[11px] font-bold px-3 py-1 rounded-full mb-4 border ${member.color} border-current/20`}>
          {member.role}
        </span>

        {/* Descripción */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {member.desc}
        </p>
      </div>
    </motion.div>
  );
};

export default SobreNosotrosPage;
