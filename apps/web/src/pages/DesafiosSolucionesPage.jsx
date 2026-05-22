
import React from 'react';
import { Helmet } from 'react-helmet';
import { AlertCircle, TrendingDown, Truck, DollarSign, Users, Link as LinkIcon, Info, MapPin } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectionHero from '@/components/SectionHero';
import ChallengeCard from '@/components/ChallengeCard';

const DesafiosSolucionesPage = () => {
  const challenges = [
    {
      icon: AlertCircle,
      title: 'Acceso limitado a insumos',
      description: 'Los productores enfrentan dificultades para conseguir semillas, fertilizantes y herramientas a precios accesibles.'
    },
    {
      icon: Truck,
      title: 'Dificultades de transporte',
      description: 'Las largas distancias y la falta de infraestructura vial encarecen el traslado de productos al mercado.'
    },
    {
      icon: TrendingDown,
      title: 'Intermediarios reducen ganancias',
      description: 'Los intermediarios se quedan con gran parte del valor final del producto, dejando poco margen para el productor.'
    },
    {
      icon: DollarSign,
      title: 'Falta de mercados justos',
      description: 'No existen suficientes espacios donde los productores puedan vender directamente a precios justos.'
    }
  ];

  const solutions = [
    {
      icon: LinkIcon,
      title: 'Conexión directa productor-comprador',
      description: 'Facilitamos el contacto directo entre productores y compradores, eliminando intermediarios innecesarios.'
    },
    {
      icon: Users,
      title: 'Red de apoyo comunitario',
      description: 'Organizamos a los productores para compartir recursos, conocimientos y fortalecer su poder de negociación.'
    },
    {
      icon: Info,
      title: 'Información de precios justos',
      description: 'Proporcionamos datos sobre precios de mercado para que los productores negocien en condiciones equitativas.'
    },
    {
      icon: MapPin,
      title: 'Transporte coordinado',
      description: 'Coordinamos el transporte colectivo de productos para reducir costos y mejorar la logística.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Desafíos y Soluciones - AGRO IMPULSO ORIENTE</title>
        <meta name="description" content="Conoce los desafíos que enfrentan los productores de Puerto Carreño y las soluciones que AGRO IMPULSO ORIENTE ofrece para superarlos." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <SectionHero 
          title="Desafíos y Soluciones"
          subtitle="Identificamos los obstáculos y construimos alternativas concretas"
          backgroundImage="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200"
        />

        <section className="section-spacing">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h2 className="mb-8 text-destructive">Desafíos que enfrentamos</h2>
                <div className="space-y-6">
                  {challenges.map((challenge, index) => (
                    <ChallengeCard key={index} {...challenge} index={index} />
                  ))}
                </div>
              </div>

              <div>
                <h2 className="mb-8 text-primary">Nuestras soluciones</h2>
                <div className="space-y-6">
                  {solutions.map((solution, index) => (
                    <ChallengeCard key={index} {...solution} index={index} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-spacing bg-muted">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="mb-6">Un enfoque integral</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                No basta con identificar los problemas. AGRO IMPULSO ORIENTE trabaja en múltiples frentes: organización comunitaria, incidencia política, educación y construcción de mercados alternativos. Creemos que solo con un enfoque integral podemos transformar la realidad del campo colombiano.
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default DesafiosSolucionesPage;
