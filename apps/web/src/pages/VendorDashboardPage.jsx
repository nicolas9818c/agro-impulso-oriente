import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  Package, ShoppingBag, TrendingUp, Plus, Edit, Trash2, Store,
  Save, X, Upload, AlertTriangle, ChevronDown, BarChart3, Eye
} from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ⚠️  Estas categorías DEBEN coincidir con las del catálogo (ProductsPage)
const CATEGORIES = [
  'Frutas Tropicales',
  'Hortalizas y Verduras',
  'Plátano y Yuca',
  'Ganadería y Cárnicos',
  'Lácteos y Derivados',
  'Pescados de Río',
  'Miel y Apicultura',
  'Granos y Cereales',
  'Artesanías Llaneras',
  'Insumos Agropecuarios',
  'Productos Transformados',
];

const LOCATIONS = ['Puerto Carreño', 'Cumaribo', 'La Primavera', 'Santa Rosalía', 'Regional'];

const ORDER_STATUSES = {
  pending:   { label: 'Pendiente',  cls: 'bg-amber-100 text-amber-800 border-amber-200' },
  confirmed: { label: 'Confirmado', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
  shipped:   { label: 'Enviado',    cls: 'bg-purple-100 text-purple-800 border-purple-200' },
  delivered: { label: 'Entregado',  cls: 'bg-green-100 text-green-800 border-green-200' },
  cancelled: { label: 'Cancelado',  cls: 'bg-red-100 text-red-800 border-red-200' },
};

const EMPTY_FORM = {
  name: '', description: '', category: '', price: '', stock: '',
  discount: '0', location: '', available: true, specifications: '',
};

/* ─── Edición inline: clic en precio/stock para editar en tabla ─── */
const InlineEdit = ({ value, onSave, prefix = '', suffix = '' }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(value));
  const ref = useRef(null);

  useEffect(() => { if (editing && ref.current) ref.current.select(); }, [editing]);

  const commit = () => {
    const n = parseFloat(val);
    if (!isNaN(n) && n >= 0) onSave(n);
    setEditing(false);
  };

  if (!editing) {
    return (
      <button
        onClick={() => { setVal(String(value)); setEditing(true); }}
        title="Clic para editar"
        className="group flex items-center gap-1 font-semibold text-foreground hover:text-primary transition-colors"
      >
        {prefix}{Number(value).toLocaleString('es-CO')}{suffix}
        <Edit className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        ref={ref}
        type="number"
        value={val}
        min={0}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
        onBlur={commit}
        className="h-7 w-24 text-sm px-2 py-0"
      />
    </div>
  );
};

/* ─── Stat card ─── */
const StatCard = ({ icon: Icon, label, value, sub, accent }) => (
  <div className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${accent}`}>
      <Icon className="w-5 h-5" />
    </div>
    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">{label}</p>
    <p className="text-2xl font-bold text-foreground font-sans">{value}</p>
    <p className="text-xs text-muted-foreground mt-1">{sub}</p>
  </div>
);

/* ══════════════════════════════════════════════════════════════════ */

const VendorDashboardPage = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal de producto
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [newImages, setNewImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [saving, setSaving] = useState(false);

  // Eliminar
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { fetchData(); }, [currentUser]);

  /* ── Carga de datos ── */
  const fetchData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [p, o] = await Promise.all([
        pb.collection('products').getFullList({
          filter: `vendorId = "${currentUser.id}"`, sort: '-created', $autoCancel: false,
        }),
        pb.collection('orders').getFullList({
          filter: `vendorId = "${currentUser.id}"`, sort: '-created', $autoCancel: false,
        }),
      ]);
      setProducts(p);
      setOrders(o);
    } catch {
      toast.error('Error al cargar los datos del panel');
    } finally {
      setLoading(false);
    }
  };

  /* ── Modal: nuevo producto ── */
  const openNew = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setNewImages([]);
    setPreviews([]);
    setModalOpen(true);
  };

  /* ── Modal: editar producto ── */
  const openEdit = (p) => {
    setEditingProduct(p);
    setForm({
      name: p.name || '',
      description: p.description || '',
      category: p.category || '',
      price: String(p.price ?? ''),
      stock: String(p.stock ?? ''),
      discount: String(p.discount ?? '0'),
      location: p.location || '',
      available: p.available ?? true,
      specifications: p.specifications || '',
    });
    setNewImages([]);
    setPreviews([]);
    setModalOpen(true);
  };

  /* ── Subir imágenes ── */
  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    const total = newImages.length + files.length + (editingProduct?.images?.length || 0);
    if (total > 5) { toast.error('Máximo 5 imágenes en total'); return; }
    setNewImages(prev => [...prev, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setPreviews(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(f);
    });
  };

  const removePreview = (i) => {
    setNewImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  /* ── Guardar producto ── */
  const handleSave = async () => {
    if (!form.name.trim())        { toast.error('El nombre es obligatorio'); return; }
    if (!form.description.trim()) { toast.error('La descripción es obligatoria'); return; }
    if (!form.price || isNaN(Number(form.price))) { toast.error('Ingresa un precio válido'); return; }
    if (form.stock === '' || isNaN(Number(form.stock))) { toast.error('Ingresa el stock disponible'); return; }

    setSaving(true);
    try {
      const data = new FormData();
      data.append('name',           form.name.trim());
      data.append('description',    form.description.trim());
      data.append('category',       form.category);
      data.append('price',          Number(form.price));
      data.append('stock',          Number(form.stock));
      data.append('discount',       Number(form.discount) || 0);
      data.append('location',       form.location);
      data.append('available',      form.available);
      data.append('specifications', form.specifications.trim());
      if (!editingProduct) data.append('vendorId', currentUser.id);
      newImages.forEach(f => data.append('images', f));

      if (editingProduct) {
        await pb.collection('products').update(editingProduct.id, data, { $autoCancel: false });
        toast.success('Producto actualizado correctamente');
      } else {
        await pb.collection('products').create(data, { $autoCancel: false });
        toast.success('Producto publicado en el catálogo');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar. Verifica los datos e inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Actualización rápida (precio, stock, etc.) ── */
  const quickUpdate = async (id, fields) => {
    try {
      await pb.collection('products').update(id, fields, { $autoCancel: false });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...fields } : p));
      toast.success('Guardado');
    } catch {
      toast.error('No se pudo actualizar');
    }
  };

  /* ── Eliminar producto ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await pb.collection('products').delete(deleteTarget, { $autoCancel: false });
      toast.success('Producto eliminado');
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error('Error al eliminar el producto');
    }
  };

  /* ── Cambiar estado de pedido ── */
  const updateOrder = async (id, status) => {
    try {
      await pb.collection('orders').update(id, { status }, { $autoCancel: false });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      toast.success('Estado del pedido actualizado');
    } catch {
      toast.error('Error al actualizar el pedido');
    }
  };

  /* ── Métricas ── */
  const revenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + (o.totalAmount || 0), 0);
  const activeCount   = products.filter(p => p.available).length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalSold     = products.reduce((s, p) => s + (p.soldCount || 0), 0);

  /* ════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Panel de Vendedor | AGRO IMPULSO ORIENTE</title>
      </Helmet>
      <Header />

      <main className="flex-grow container-custom py-10">

        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">
              Panel de Control
            </p>
            <h1 className="text-3xl md:text-4xl mb-1">
              {currentUser?.name ? `Hola, ${currentUser.name}` : 'Panel de Vendedor'}
            </h1>
            <p className="text-muted-foreground text-sm">
              Gestiona tus productos y pedidos en un solo lugar.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link to="/vendedor/perfil">
              <Button variant="outline" className="btn-transition">
                <Store className="w-4 h-4 mr-2" /> Mi Perfil
              </Button>
            </Link>
            <Button onClick={openNew} className="btn-transition shadow-md shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" /> Nuevo Producto
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            icon={Package}
            label="Mis Productos"
            value={products.length}
            sub={`${activeCount} activos en catálogo`}
            accent="bg-primary/10 text-primary"
          />
          <StatCard
            icon={ShoppingBag}
            label="Pedidos"
            value={orders.length}
            sub={`${pendingOrders} pendientes de atención`}
            accent="bg-secondary/10 text-secondary"
          />
          <StatCard
            icon={TrendingUp}
            label="Ingresos"
            value={`$${revenue.toLocaleString('es-CO')}`}
            sub="Pedidos confirmados"
            accent="bg-accent/10 text-accent"
          />
          <StatCard
            icon={BarChart3}
            label="Unidades Vendidas"
            value={totalSold}
            sub="Total acumulado"
            accent="bg-success/10 text-success"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products">
          <TabsList className="h-11 mb-6 bg-muted/60">
            <TabsTrigger value="products" className="px-6 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">
              Mis Productos ({products.length})
            </TabsTrigger>
            <TabsTrigger value="orders" className="px-6 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm">
              Pedidos ({orders.length})
            </TabsTrigger>
          </TabsList>

          {/* ── Pestaña: Productos ── */}
          <TabsContent value="products">
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              {loading ? (
                <div className="p-16 text-center text-muted-foreground">Cargando productos...</div>
              ) : products.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-muted-foreground opacity-40" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Aún no tienes productos</h3>
                  <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
                    Agrega tu primer producto al catálogo y empieza a vender directamente a compradores.
                  </p>
                  <Button onClick={openNew}>
                    <Plus className="w-4 h-4 mr-2" /> Agregar Primer Producto
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">
                        <th className="px-5 py-4">Producto</th>
                        <th className="px-5 py-4">Categoría</th>
                        <th className="px-5 py-4" title="Clic en el valor para editar">Precio (COP) ✏️</th>
                        <th className="px-5 py-4" title="Clic en el valor para editar">Stock ✏️</th>
                        <th className="px-5 py-4" title="Clic en el valor para editar">Dcto % ✏️</th>
                        <th className="px-5 py-4">Visible</th>
                        <th className="px-5 py-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {products.map(product => (
                        <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                          {/* Producto */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 border border-border">
                                {product.images?.length > 0 ? (
                                  <img
                                    src={pb.files.getUrl(product, product.images[0], { thumb: '44x44' })}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-foreground truncate max-w-[180px]">{product.name}</p>
                                <p className="text-xs text-muted-foreground">{product.location || 'Sin ubicación'}</p>
                              </div>
                            </div>
                          </td>

                          {/* Categoría */}
                          <td className="px-5 py-3.5">
                            <span className="category-tag">{product.category || '—'}</span>
                          </td>

                          {/* Precio — edición inline */}
                          <td className="px-5 py-3.5">
                            <InlineEdit
                              value={product.price || 0}
                              prefix="$"
                              onSave={v => quickUpdate(product.id, { price: v })}
                            />
                          </td>

                          {/* Stock — edición inline */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <InlineEdit
                                value={product.stock || 0}
                                onSave={v => quickUpdate(product.id, { stock: v })}
                              />
                              {product.stock < 5 && product.stock > 0 && (
                                <span className="text-xs font-bold text-warning">¡Bajo!</span>
                              )}
                              {product.stock === 0 && (
                                <span className="text-xs font-bold text-destructive">Agotado</span>
                              )}
                            </div>
                          </td>

                          {/* Descuento — edición inline */}
                          <td className="px-5 py-3.5">
                            <InlineEdit
                              value={product.discount || 0}
                              suffix="%"
                              onSave={v => quickUpdate(product.id, { discount: Math.min(100, v) })}
                            />
                          </td>

                          {/* Visible toggle */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={product.available}
                                onCheckedChange={v => quickUpdate(product.id, { available: v })}
                              />
                              <span className="text-xs text-muted-foreground">
                                {product.available ? 'Sí' : 'No'}
                              </span>
                            </div>
                          </td>

                          {/* Acciones */}
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost" size="icon"
                                onClick={() => openEdit(product)}
                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                title="Editar producto completo"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost" size="icon"
                                onClick={() => setDeleteTarget(product.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                title="Eliminar producto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-5 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
                    💡 Consejo: Haz clic en el precio, stock o descuento para editarlo directamente sin abrir el formulario completo.
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Pestaña: Pedidos ── */}
          <TabsContent value="orders">
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              {loading ? (
                <div className="p-16 text-center text-muted-foreground">Cargando pedidos...</div>
              ) : orders.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground opacity-40" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Aún no hay pedidos</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    Cuando los compradores realicen pedidos de tus productos aparecerán aquí para que los gestiones.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">
                        <th className="px-5 py-4"># Pedido</th>
                        <th className="px-5 py-4">Fecha</th>
                        <th className="px-5 py-4">Cliente</th>
                        <th className="px-5 py-4">Total</th>
                        <th className="px-5 py-4">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {orders.map(order => {
                        const s = ORDER_STATUSES[order.status] || {
                          label: order.status, cls: 'bg-muted text-muted-foreground border-border'
                        };
                        return (
                          <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-5 py-3.5 font-mono text-xs font-semibold text-muted-foreground">
                              #{(order.orderNumber || order.id.slice(0, 8)).toUpperCase()}
                            </td>
                            <td className="px-5 py-3.5 text-muted-foreground">
                              {new Date(order.created).toLocaleDateString('es-CO', {
                                day: '2-digit', month: 'short', year: 'numeric'
                              })}
                            </td>
                            <td className="px-5 py-3.5 font-medium text-foreground">
                              {order.shippingAddress?.fullName || 'Cliente'}
                            </td>
                            <td className="px-5 py-3.5 font-bold text-foreground">
                              ${(order.totalAmount || 0).toLocaleString('es-CO')}
                            </td>
                            <td className="px-5 py-3.5">
                              <Select value={order.status} onValueChange={v => updateOrder(order.id, v)}>
                                <SelectTrigger className="h-auto w-auto border-0 shadow-none p-0 bg-transparent focus:ring-0 gap-1.5">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${s.cls}`}>
                                    {s.label}
                                  </span>
                                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(ORDER_STATUSES).map(([val, { label }]) => (
                                    <SelectItem key={val} value={val} className="text-sm">{label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* ══ Modal: Crear / Editar Producto ══ */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader className="pb-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-4 h-4 text-primary" />
              </div>
              <DialogTitle className="text-xl">
                {editingProduct ? 'Editar Producto' : 'Publicar Nuevo Producto'}
              </DialogTitle>
            </div>
            <DialogDescription>
              {editingProduct
                ? 'Actualiza la información. Los cambios se verán de inmediato en el catálogo.'
                : 'Completa los datos básicos. Puedes editar precios y stock rápidamente desde la tabla después.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">

            {/* Nombre */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="f-name" className="font-semibold">
                Nombre del producto <span className="text-destructive">*</span>
              </Label>
              <Input
                id="f-name"
                placeholder="ej. Abono orgánico 50 kg — Cal Dolomita"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="text-base"
              />
            </div>

            {/* Descripción */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="f-desc" className="font-semibold">
                Descripción <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="f-desc"
                placeholder="Describe tu producto: para qué sirve, cómo se usa, por qué es bueno comprarlo..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Precio */}
            <div className="space-y-2">
              <Label htmlFor="f-price" className="font-semibold">
                Precio en pesos colombianos (COP) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">$</span>
                <Input
                  id="f-price"
                  type="number"
                  placeholder="25000"
                  className="pl-8 text-lg font-semibold"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  min={0}
                />
              </div>
              {form.price && (
                <p className="text-xs text-muted-foreground">
                  = ${Number(form.price).toLocaleString('es-CO')} COP
                </p>
              )}
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <Label htmlFor="f-stock" className="font-semibold">
                Cantidad disponible (stock) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="f-stock"
                type="number"
                placeholder="100"
                value={form.stock}
                onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                min={0}
              />
              <p className="text-xs text-muted-foreground">¿Cuántas unidades puedes vender ahora mismo?</p>
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <Label className="font-semibold">Categoría</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="¿Qué tipo de producto es?" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Ubicación */}
            <div className="space-y-2">
              <Label className="font-semibold">¿Desde dónde vendes?</Label>
              <Select value={form.location} onValueChange={v => setForm(f => ({ ...f, location: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar zona" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Descuento */}
            <div className="space-y-2">
              <Label htmlFor="f-discount" className="font-semibold">Descuento</Label>
              <div className="relative">
                <Input
                  id="f-discount"
                  type="number"
                  placeholder="0"
                  value={form.discount}
                  onChange={e => setForm(f => ({ ...f, discount: e.target.value }))}
                  min={0} max={100}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">%</span>
              </div>
              {Number(form.discount) > 0 && form.price && (
                <p className="text-xs text-success font-semibold">
                  Precio con descuento: ${(Number(form.price) * (1 - Number(form.discount) / 100)).toLocaleString('es-CO')} COP
                </p>
              )}
            </div>

            {/* Visible / disponible */}
            <div className="flex items-start gap-4 rounded-xl border border-border p-4 bg-muted/20">
              <Switch
                id="f-available"
                checked={form.available}
                onCheckedChange={v => setForm(f => ({ ...f, available: v }))}
              />
              <div>
                <Label htmlFor="f-available" className="cursor-pointer font-semibold text-base">
                  {form.available ? '✅ Visible en el catálogo' : '🔒 Oculto del catálogo'}
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {form.available
                    ? 'Los compradores pueden ver y hacer pedidos.'
                    : 'Solo tú puedes verlo en tu panel.'}
                </p>
              </div>
            </div>

            {/* Especificaciones */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="f-specs" className="font-semibold">
                Especificaciones técnicas{' '}
                <span className="text-muted-foreground text-xs font-normal">(opcional)</span>
              </Label>
              <Textarea
                id="f-specs"
                placeholder="Peso neto, presentación, ingredientes activos, modo de aplicación, registro ICA..."
                value={form.specifications}
                onChange={e => setForm(f => ({ ...f, specifications: e.target.value }))}
                rows={2}
              />
            </div>

            {/* Imágenes */}
            <div className="md:col-span-2 space-y-3">
              <Label className="font-semibold">
                Fotos del producto{' '}
                <span className="text-muted-foreground text-xs font-normal">(máx. 5 imágenes)</span>
              </Label>

              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors group">
                <Upload className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                  Haz clic aquí para subir fotos
                </span>
                <span className="text-xs text-muted-foreground/60 mt-1">JPG · PNG · WEBP · GIF — máx. 20 MB c/u</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
              </label>

              {/* Previews de nuevas imágenes */}
              {previews.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Nuevas fotos a subir:</p>
                  <div className="flex gap-2 flex-wrap">
                    {previews.map((src, i) => (
                      <div key={i} className="relative group">
                        <img src={src} alt="" className="w-20 h-20 object-cover rounded-xl border-2 border-primary/30" />
                        <button
                          onClick={() => removePreview(i)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Imágenes ya existentes al editar */}
              {editingProduct?.images?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Fotos actuales del producto:</p>
                  <div className="flex gap-2 flex-wrap">
                    {editingProduct.images.map((img, i) => (
                      <img
                        key={i}
                        src={pb.files.getUrl(editingProduct, img, { thumb: '80x80' })}
                        alt=""
                        className="w-20 h-20 object-cover rounded-xl border border-border"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botones del modal */}
          <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-border">
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} className="min-w-36 shadow-md shadow-primary/20">
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Guardando...
                </span>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editingProduct ? 'Guardar cambios' : 'Publicar producto'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ══ Confirmar eliminación ══ */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              ¿Eliminar este producto?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Esta acción <strong>no se puede deshacer</strong>. El producto desaparecerá del catálogo
              permanentemente y los compradores no podrán encontrarlo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Sí, eliminar definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default VendorDashboardPage;
