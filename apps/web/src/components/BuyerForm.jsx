
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';

const BuyerForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    interes: '',
    cantidad_aproximada: '',
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
      await pb.collection('compradores_solicitudes').create(formData, { $autoCancel: false });
      toast.success('Solicitud enviada correctamente. Te contactaremos pronto.');
      setFormData({ nombre: '', email: '', interes: '', cantidad_aproximada: '', contacto: '' });
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
        <Label htmlFor="nombre">Nombre o empresa</Label>
        <Input
          id="nombre"
          name="nombre"
          type="text"
          value={formData.nombre}
          onChange={handleChange}
          required
          className="mt-2 text-foreground"
          placeholder="Tu nombre o empresa"
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
        <Label htmlFor="interes">Productos de interés</Label>
        <Textarea
          id="interes"
          name="interes"
          value={formData.interes}
          onChange={handleChange}
          rows={3}
          className="mt-2 text-foreground"
          placeholder="¿Qué productos te interesan?"
        />
      </div>

      <div>
        <Label htmlFor="cantidad_aproximada">Cantidad aproximada</Label>
        <Input
          id="cantidad_aproximada"
          name="cantidad_aproximada"
          type="text"
          value={formData.cantidad_aproximada}
          onChange={handleChange}
          className="mt-2 text-foreground"
          placeholder="Ej: 500 kg mensuales"
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

export default BuyerForm;
