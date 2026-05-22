import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
  User, Package, Lock, ChevronRight,
  Clock, CheckCircle, Truck, XCircle,
  Loader2, AlertCircle, ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const STATUS_CONFIG = {
  pending:   { label: 'Pendiente',   icon: Clock,         color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  confirmed: { label: 'Confirmado',  icon: CheckCircle,   color: 'bg-blue-100 text-blue-800 border-blue-200' },
  shipped:   { label: 'En camino',   icon: Truck,         color: 'bg-purple-100 text-purple-800 border-purple-200' },
  delivered: { label: 'Entregado',   icon: CheckCircle,   color: 'bg-green-100 text-green-800 border-green-200' },
  cancelled: { label: 'Cancelado',   icon: XCircle,       color: 'bg-red-100 text-red-800 border-red-200' },
};

const TABS = [
  { id: 'pedidos',  label: 'Mis Pedidos',   icon: Package },
  { id: 'perfil',   label: 'Mi Perfil',     icon: User },
  { id: 'password', label: 'Contraseña',    icon: Lock },
];

export default function MiCuentaPage() {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pedidos');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    password: '',
    passwordConfirm: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/mi-cuenta');
      return;
    }
    fetchOrders();
  }, [isAuthenticated]);

  useEffect(() => {
    setProfileData({ name: currentUser?.name || '' });
  }, [currentUser]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const records = await pb.collection('orders').getList(1, 50, {
        filter: `buyerId = "${currentUser?.id}"`,
        sort: '-created',
        $autoCancel: false,
      });
      setOrders(records.items);
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await pb.collection('users').update(currentUser.id, profileData, { $autoCancel: false });
      toast.success('Perfil actualizado correctamente');
    } catch (err) {
      toast.error('Error al actualizar el perfil');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.password !== passwordData.passwordConfirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (passwordData.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    setSavingPassword(true);
    try {
      await pb.collection('users').update(currentUser.id, passwordData, { $autoCancel: false });
      toast.success('Contraseña actualizada. Vuelve a iniciar sesión.');
      pb.authStore.clear();
      navigate('/login');
    } catch (err) {
      toast.error('Error: verifica tu contraseña actual');
    } finally {
      setSavingPassword(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const formatCOP = (amount) =>
    `$${Number(amount || 0).toLocaleString('es-CO')}`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Mi Cuenta | Agro Impulso Oriente</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Header />

      <main className="flex-grow container-custom py-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center gap-4"
          >
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {currentUser?.name || 'Mi Cuenta'}
              </h1>
              <p className="text-muted-foreground text-sm">{currentUser?.email}</p>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <nav className="lg:col-span-1">
              <div className="bg-card rounded-2xl border border-border p-3 space-y-1">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Content */}
            <div className="lg:col-span-3">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* PEDIDOS */}
                {activeTab === 'pedidos' && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold mb-4">Mis Pedidos</h2>
                    {loadingOrders ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="bg-card rounded-2xl border border-border p-12 text-center">
                        <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="font-semibold text-lg mb-2">Aún no tienes pedidos</p>
                        <p className="text-muted-foreground text-sm mb-6">
                          Explora nuestra tienda y realiza tu primera compra.
                        </p>
                        <Button onClick={() => navigate('/productos')}>
                          Ver Productos
                        </Button>
                      </div>
                    ) : (
                      orders.map((order) => {
                        const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                        const StatusIcon = status.icon;
                        const items = Array.isArray(order.items) ? order.items : [];
                        return (
                          <div
                            key={order.id}
                            className="bg-card rounded-2xl border border-border p-6 space-y-4"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="font-bold text-base">{order.orderNumber}</p>
                                <p className="text-muted-foreground text-sm mt-0.5">
                                  {formatDate(order.created)}
                                </p>
                              </div>
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${status.color}`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {status.label}
                              </span>
                            </div>

                            {items.length > 0 && (
                              <div className="space-y-1.5 text-sm border-t border-border pt-3">
                                {items.map((item, i) => (
                                  <div key={i} className="flex justify-between text-muted-foreground">
                                    <span>{item.name || item.productId} × {item.quantity}</span>
                                    <span className="font-medium text-foreground">
                                      {formatCOP(item.price * item.quantity)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex justify-between items-center border-t border-border pt-3">
                              <span className="text-sm text-muted-foreground">Total pagado</span>
                              <span className="font-extrabold text-lg text-primary">
                                {formatCOP(order.totalAmount)}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* PERFIL */}
                {activeTab === 'perfil' && (
                  <div className="bg-card rounded-2xl border border-border p-8">
                    <h2 className="text-xl font-bold mb-6">Datos de Perfil</h2>
                    <form onSubmit={handleSaveProfile} className="space-y-5 max-w-md">
                      <div>
                        <Label htmlFor="name">Nombre completo</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="mt-1"
                          placeholder="Tu nombre"
                        />
                      </div>
                      <div>
                        <Label>Correo electrónico</Label>
                        <Input
                          value={currentUser?.email || ''}
                          disabled
                          className="mt-1 opacity-60"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          El correo no se puede cambiar.
                        </p>
                      </div>
                      <div>
                        <Label>Tipo de cuenta</Label>
                        <div className="mt-1">
                          <Badge variant="outline" className="capitalize">
                            {currentUser?.role || 'buyer'}
                          </Badge>
                        </div>
                      </div>
                      <Button type="submit" disabled={savingProfile} className="mt-2">
                        {savingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Guardar Cambios
                      </Button>
                    </form>
                  </div>
                )}

                {/* CONTRASEÑA */}
                {activeTab === 'password' && (
                  <div className="bg-card rounded-2xl border border-border p-8">
                    <h2 className="text-xl font-bold mb-2">Cambiar Contraseña</h2>
                    <p className="text-muted-foreground text-sm mb-6">
                      Después de cambiar la contraseña deberás volver a iniciar sesión.
                    </p>
                    <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                      <div>
                        <Label htmlFor="oldPassword">Contraseña actual</Label>
                        <Input
                          id="oldPassword"
                          type="password"
                          value={passwordData.oldPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Nueva contraseña</Label>
                        <Input
                          id="password"
                          type="password"
                          value={passwordData.password}
                          onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                          className="mt-1"
                          required
                          minLength={8}
                        />
                      </div>
                      <div>
                        <Label htmlFor="passwordConfirm">Confirmar nueva contraseña</Label>
                        <Input
                          id="passwordConfirm"
                          type="password"
                          value={passwordData.passwordConfirm}
                          onChange={(e) => setPasswordData({ ...passwordData, passwordConfirm: e.target.value })}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-yellow-700">
                          La contraseña debe tener mínimo 8 caracteres.
                        </p>
                      </div>
                      <Button type="submit" disabled={savingPassword} variant="destructive">
                        {savingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Cambiar Contraseña
                      </Button>
                    </form>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
