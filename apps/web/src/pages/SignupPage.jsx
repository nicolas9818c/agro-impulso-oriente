
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Sprout, Loader2, Store, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: 'buyer' // 'buyer' or 'seller'
  });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await signup(formData);
      toast.success('Cuenta creada exitosamente');
      navigate(formData.role === 'seller' ? '/vendedor/perfil' : '/mi-cuenta');
    } catch (error) {
      toast.error(error.message || 'Error al crear la cuenta. Verifica tus datos.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Registro | AGRO IMPULSO ORIENTE</title>
      </Helmet>
      
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 hover:bg-primary/20 transition-colors">
              <Sprout className="w-8 h-8 text-primary" />
            </Link>
            <h1 className="text-3xl mb-2">Crea tu cuenta</h1>
            <p className="text-muted-foreground">Únete a nuestra red de comercio justo</p>
          </div>

          <div className="bg-card rounded-3xl p-8 shadow-xl border border-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'buyer'})}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${formData.role === 'buyer' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}
                >
                  <User className="w-6 h-6 mb-2" />
                  <span className="font-medium text-sm">Comprador</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'seller'})}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${formData.role === 'seller' ? 'border-accent bg-accent/5 text-accent' : 'border-border text-muted-foreground hover:border-accent/50'}`}
                >
                  <Store className="w-6 h-6 mb-2" />
                  <span className="font-medium text-sm">Vendedor</span>
                </button>
              </div>

              <div>
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name" name="name" type="text" required
                  value={formData.name} onChange={handleChange}
                  className="mt-2 bg-background text-foreground"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email" name="email" type="email" required
                  value={formData.email} onChange={handleChange}
                  className="mt-2 bg-background text-foreground"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password" name="password" type="password" required minLength={8}
                  value={formData.password} onChange={handleChange}
                  className="mt-2 bg-background text-foreground"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              <div>
                <Label htmlFor="passwordConfirm">Confirmar Contraseña</Label>
                <Input
                  id="passwordConfirm" name="passwordConfirm" type="password" required minLength={8}
                  value={formData.passwordConfirm} onChange={handleChange}
                  className="mt-2 bg-background text-foreground"
                  placeholder="Repite tu contraseña"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className={`w-full h-12 text-base btn-transition ${formData.role === 'seller' ? 'bg-accent hover:bg-accent/90 text-accent-foreground' : ''}`}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Crear Cuenta'}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Ingresa aquí
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
