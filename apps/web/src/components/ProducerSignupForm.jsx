
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';

const ProducerSignupForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    productos: '',
    ubicacion: '',
    historia: '',
    contacto: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await pb.collection('productores_solicitudes').create(formData, { $autoCancel: false });
      toast.success('Solicitud enviada correctamente. Te contactaremos pronto.');
      setFormData({ nombre: '', email: '', productos: '', ubicacion: '', historia: '', contacto: '' });
    } catch (error) {
      toast.error('Error al enviar la solicitud. Por favor intenta de nuevo.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="nombre">Nombre del productor o finca</Label>
        <Input
          id="nombre"
          name="nombre"
          type="text"
          value={formData.nombre}
          onChange={handleChange}
          required
          className="mt-2 text-foreground"
          placeholder="Nombre"
        />
      </div>

      <div>
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="mt-2 text-foreground"
          placeholder="tu@email.com"
        />
      </div>

      <div>
        <Label htmlFor="productos">Productos que cultivas</Label>
        <Input
          id="productos"
          name="productos"
          type="text"
          value={formData.productos}
          onChange={handleChange}
          required
          className="mt-2 text-foreground"
          placeholder="Ej: Yuca, plátano, maíz"
        />
      </div>

      <div>
        <Label htmlFor="ubicacion">Ubicación</Label>
        <Input
          id="ubicacion"
          name="ubicacion"
          type="text"
          value={formData.ubicacion}
          onChange={handleChange}
          className="mt-2 text-foreground"
          placeholder="Vereda, municipio"
        />
      </div>

      <div>
        <Label htmlFor="contacto">Teléfono de contacto</Label>
        <Input
          id="contacto"
          name="contacto"
          type="tel"
          value={formData.contacto}
          onChange={handleChange}
          className="mt-2 text-foreground"
          placeholder="Número de teléfono"
        />
      </div>

      <div>
        <Label htmlFor="historia">Cuéntanos tu historia (opcional)</Label>
        <Textarea
          id="historia"
          name="historia"
          value={formData.historia}
          onChange={handleChange}
          rows={4}
          className="mt-2 text-foreground"
          placeholder="¿Cómo empezaste? ¿Qué te motiva?"
        />
      </div>

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full btn-transition active:scale-[0.98]"
      >
        {loading ? 'Enviando...' : 'Enviar solicitud'}
      </Button>
    </form>
  );
};

export default ProducerSignupForm;
