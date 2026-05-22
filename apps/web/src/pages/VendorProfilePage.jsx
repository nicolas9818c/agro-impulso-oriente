
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const VendorProfilePage = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    contact: '',
    bankDetails: ''
  });

  useEffect(() => {
    if (currentUser?.vendorProfile) {
      setFormData({
        name: currentUser.vendorProfile.name || '',
        location: currentUser.vendorProfile.location || '',
        description: currentUser.vendorProfile.description || '',
        contact: currentUser.vendorProfile.contact || '',
        bankDetails: currentUser.vendorProfile.bankDetails || ''
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await pb.collection('users').update(currentUser.id, {
        vendorProfile: formData
      }, { $autoCancel: false });
      toast.success('Perfil de vendedor actualizado');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Perfil de Vendedor | AGRO IMPULSO ORIENTE</title>
      </Helmet>
      <Header />

      <main className="flex-grow container-custom py-12">
        <Link to="/vendedor" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Panel
        </Link>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl mb-2">Perfil Público de Vendedor</h1>
          <p className="text-muted-foreground mb-8">Esta información será visible para los compradores en tus productos.</p>

          <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Nombre de la Finca o Productor</Label>
                <Input
                  id="name" name="name" required
                  value={formData.name} onChange={handleChange}
                  className="mt-2 bg-background text-foreground"
                  placeholder="Ej: Finca El Paraíso"
                />
              </div>

              <div>
                <Label htmlFor="location">Ubicación (Vereda/Municipio)</Label>
                <Input
                  id="location" name="location" required
                  value={formData.location} onChange={handleChange}
                  className="mt-2 bg-background text-foreground"
                  placeholder="Ej: Vereda La Esperanza, Puerto Carreño"
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción de tu producción</Label>
                <Textarea
                  id="description" name="description" required rows={4}
                  value={formData.description} onChange={handleChange}
                  className="mt-2 bg-background text-foreground"
                  placeholder="Cuéntale a los compradores sobre tus métodos de cultivo, historia..."
                />
              </div>

              <div>
                <Label htmlFor="contact">Teléfono de Contacto Público</Label>
                <Input
                  id="contact" name="contact" required
                  value={formData.contact} onChange={handleChange}
                  className="mt-2 bg-background text-foreground"
                />
              </div>

              <div className="pt-6 border-t border-border">
                <h3 className="text-lg font-semibold mb-4 font-sans">Información de Pagos (Privado)</h3>
                <Label htmlFor="bankDetails">Datos Bancarios o Nequi/Daviplata</Label>
                <Textarea
                  id="bankDetails" name="bankDetails" rows={3}
                  value={formData.bankDetails} onChange={handleChange}
                  className="mt-2 bg-background text-foreground"
                  placeholder="Ej: Nequi: 3001234567"
                />
                <p className="text-xs text-muted-foreground mt-2">Esta información solo la usaremos para transferirte el dinero de tus ventas.</p>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 text-base btn-transition bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Guardar Perfil</>}
              </Button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VendorProfilePage;
