
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Sprout, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Inicio de sesión exitoso');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error('Credenciales incorrectas. Por favor intenta de nuevo.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Ingresar | AGRO IMPULSO ORIENTE</title>
      </Helmet>
      
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 hover:bg-primary/20 transition-colors">
              <Sprout className="w-8 h-8 text-primary" />
            </Link>
            <h1 className="text-3xl mb-2">Bienvenido de nuevo</h1>
            <p className="text-muted-foreground">Ingresa a tu cuenta para continuar</p>
          </div>

          <div className="bg-card rounded-3xl p-8 shadow-xl border border-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2 bg-background text-foreground"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-2 bg-background text-foreground"
                  placeholder="••••••••"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 text-base btn-transition"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ingresar'}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              ¿No tienes una cuenta?{' '}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Regístrate aquí
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
