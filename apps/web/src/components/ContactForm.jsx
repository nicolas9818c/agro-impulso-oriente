
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await pb.collection('contactos').create({
        ...formData,
        tipo: 'general'
      }, { $autoCancel: false });

      toast.success('Mensaje enviado correctamente');
      setFormData({ nombre: '', email: '', asunto: '', mensaje: '' });
    } catch (error) {
      toast.error('Error al enviar el mensaje. Por favor intenta de nuevo.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="nombre">Nombre completo</Label>
        <Input
          id="nombre"
          name="nombre"
          type="text"
          value={formData.nombre}
          onChange={handleChange}
          required
          className="mt-2 text-foreground"
          placeholder="Tu nombre"
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
        <Label htmlFor="asunto">Asunto</Label>
        <Input
          id="asunto"
          name="asunto"
          type="text"
          value={formData.asunto}
          onChange={handleChange}
          className="mt-2 text-foreground"
          placeholder="¿En qué podemos ayudarte?"
        />
      </div>

      <div>
        <Label htmlFor="mensaje">Mensaje</Label>
        <Textarea
          id="mensaje"
          name="mensaje"
          value={formData.mensaje}
          onChange={handleChange}
          required
          rows={6}
          className="mt-2 text-foreground"
          placeholder="Escribe tu mensaje aquí..."
        />
      </div>

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full btn-transition active:scale-[0.98]"
      >
        {loading ? 'Enviando...' : 'Enviar mensaje'}
      </Button>
    </form>
  );
};

export default ContactForm;
