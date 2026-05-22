import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import {
  LayoutDashboard, Package, Home, Users, Phone,
  Plus, Pencil, Trash2, Save, X, ImagePlus, Eye,
  CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

/* ═══════════════════════════════════════════════════════
   CONSTANTES
═══════════════════════════════════════════════════════ */

const CATEGORIES = [
  'Frutas Tropicales', 'Hortalizas y Verduras', 'Plátano y Yuca',
  'Ganadería y Cárnicos', 'Lácteos y Derivados', 'Pescados de Río',
  'Miel y Apicultura', 'Granos y Cereales', 'Artesanías Llaneras',
  'Insumos Agropecuarios', 'Productos Transformados',
];

const LOCATIONS = ['Puerto Carreño', 'Cumaribo', 'La Primavera', 'Santa Rosalía', 'Regional'];

/* Bloques de contenido por sección — define qué textos son editables */
const CONTENT_BLOCKS = {
  inicio: [
    { clave: 'home.hero.badge',    etiqueta: 'Etiqueta del hero (texto pequeño arriba)', tipo: 'texto',   default: 'Comercio Justo · Orinoquía Colombiana' },
    { clave: 'home.hero.title',    etiqueta: 'Título principal del inicio',               tipo: 'texto',   default: 'Del Campo a tu Mesa, Sin Intermediarios' },
    { clave: 'home.hero.subtitle', etiqueta: 'Subtítulo / descripción del hero',          tipo: 'parrafo', default: 'Conectamos directamente a productores campesinos del Vichada con compradores en toda Colombia.' },
  ],
  nosotros: [
    { clave: 'about.mission.title', etiqueta: 'Título de la misión',       tipo: 'texto',   default: 'Misión' },
    { clave: 'about.mission.body',  etiqueta: 'Texto de la misión (1er párrafo)', tipo: 'parrafo', default: 'Conectar directamente a los productores campesinos de Puerto Carreño y la Orinoquía con compradores en toda Colombia, garantizando precios justos, transparencia total y desarrollo sostenible del campo colombiano.' },
    { clave: 'about.mission.body2', etiqueta: 'Texto de la misión (2do párrafo)', tipo: 'parrafo', default: 'Trabajamos para eliminar los intermediarios que históricamente han reducido los ingresos de las familias campesinas.' },
    { clave: 'about.vision.body',   etiqueta: 'Texto de la visión',         tipo: 'parrafo', default: 'Ser la plataforma de comercio justo líder de la Orinoquía colombiana para 2027.' },
    { clave: 'about.context.p1',    etiqueta: 'Contexto Puerto Carreño — párrafo 1', tipo: 'parrafo', default: 'Puerto Carreño, capital del Vichada, es una región de extraordinaria riqueza natural: ríos, llanos y tierras fértiles ideales para la agricultura y la ganadería.' },
    { clave: 'about.context.p2',    etiqueta: 'Contexto Puerto Carreño — párrafo 2', tipo: 'parrafo', default: 'Los intermediarios aprovecharon esa brecha durante décadas, pagando precios irrisorios a los campesinos.' },
    { clave: 'about.context.p3',    etiqueta: 'Contexto Puerto Carreño — párrafo 3', tipo: 'parrafo', default: 'AGRO IMPULSO ORIENTE surge para romper ese ciclo: tecnología, logística y comunidad al servicio de quien trabaja la tierra.' },
  ],
  contacto: [
    { clave: 'contact.address',        etiqueta: 'Dirección / Ubicación',      tipo: 'texto',   default: 'Puerto Carreño, Vichada, Colombia' },
    { clave: 'contact.phone',          etiqueta: 'Teléfono',                   tipo: 'texto',   default: '+57 312 526 8451' },
    { clave: 'contact.email',          etiqueta: 'Correo electrónico',         tipo: 'texto',   default: 'contacto@agroimpulsooriente.store' },
    { clave: 'contact.hours.weekday',  etiqueta: 'Horario semana',             tipo: 'texto',   default: 'Lunes a Viernes: 8 am – 6 pm' },
    { clave: 'contact.hours.saturday', etiqueta: 'Horario sábado',             tipo: 'texto',   default: 'Sábado: 8 am – 1 pm' },
    { clave: 'contact.hero.subtitle',  etiqueta: 'Subtítulo de la página de contacto', tipo: 'parrafo', default: 'Escríbenos por WhatsApp, llámanos o usa el formulario. Respondemos en menos de 24 horas.' },
  ],
};

/* ═══════════════════════════════════════════════════════
   HOOK — carga todos los registros de page_content
═══════════════════════════════════════════════════════ */
function useAllContent() {
  const [map, setMap]         = useState({});   // { clave: { id?, valor } }
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await pb.collection('page_content').getList(1, 500, {
        $autoCancel: false,
      });
      const m = {};
      res.items.forEach(r => { m[r.clave] = r; });
      setMap(m);
    } catch { /* PB no disponible */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { map, load, loading };
}

/* ═══════════════════════════════════════════════════════
   SUB-COMPONENTE — Panel de edición de contenido (texto)
═══════════════════════════════════════════════════════ */
const ContentEditor = ({ seccion, blocks, map, onReload }) => {
  const [drafts, setDrafts]   = useState({});
  const [saving, setSaving]   = useState({});
  const { currentUser } = useAuth();

  /* Inicializa borradores con valores actuales */
  useEffect(() => {
    const initial = {};
    blocks.forEach(b => {
      initial[b.clave] = map[b.clave]?.valor ?? b.default;
    });
    setDrafts(initial);
  }, [map, blocks]);

  const saveBlock = async (block) => {
    setSaving(s => ({ ...s, [block.clave]: true }));
    try {
      const existing = map[block.clave];
      const payload = {
        clave:      block.clave,
        etiqueta:   block.etiqueta,
        valor:      drafts[block.clave] ?? '',
        seccion,
        tipo_campo: block.tipo,
      };
      if (existing?.id) {
        await pb.collection('page_content').update(existing.id, payload, { $autoCancel: false });
      } else {
        await pb.collection('page_content').create(payload, { $autoCancel: false });
      }
      toast.success(`"${block.etiqueta}" guardado correctamente.`);
      onReload();
    } catch (e) {
      toast.error('Error al guardar. Verifica que PocketBase esté activo.');
    } finally {
      setSaving(s => ({ ...s, [block.clave]: false }));
    }
  };

  return (
    <div className="space-y-5">
      {blocks.map(block => {
        const isDirty = drafts[block.clave] !== (map[block.clave]?.valor ?? block.default);
        return (
          <div key={block.clave} className="bg-card border border-border rounded-2xl p-5 space-y-3 hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Label className="text-sm font-semibold">{block.etiqueta}</Label>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">{block.clave}</p>
              </div>
              {isDirty && (
                <Badge variant="outline" className="text-secondary border-secondary/40 text-[10px] flex-shrink-0">
                  Sin guardar
                </Badge>
              )}
            </div>

            {block.tipo === 'parrafo' ? (
              <Textarea
                rows={3}
                value={drafts[block.clave] ?? ''}
                onChange={e => setDrafts(d => ({ ...d, [block.clave]: e.target.value }))}
                className="text-sm resize-none"
                placeholder={block.default}
              />
            ) : (
              <Input
                value={drafts[block.clave] ?? ''}
                onChange={e => setDrafts(d => ({ ...d, [block.clave]: e.target.value }))}
                className="text-sm"
                placeholder={block.default}
              />
            )}

            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => saveBlock(block)}
                disabled={saving[block.clave] || !isDirty}
                className="gap-2"
              >
                {saving[block.clave]
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Guardando...</>
                  : <><Save className="w-3.5 h-3.5" />Guardar</>
                }
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   SUB-COMPONENTE — Panel de Productos
═══════════════════════════════════════════════════════ */
const EMPTY_PRODUCT = {
  name: '', description: '', category: '', location: '', price: '',
  stock: '', discount: '', freeShipping: false, available: true,
  isNew: true, specifications: '',
};

const ProductsEditor = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [modalOpen, setModal]   = useState(false);
  const [form, setForm]         = useState(EMPTY_PRODUCT);
  const [editId, setEditId]     = useState(null);
  const [saving, setSaving]     = useState(false);
  const [images, setImages]     = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileRef                 = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const q = search.trim();
      const filter = q ? `name ~ "${q}" || description ~ "${q}"` : '';
      const res = await pb.collection('products').getList(1, 100, {
        filter,
        sort: '-created',
        $autoCancel: false,
      });
      setProducts(res.items);
    } catch { toast.error('No se pudieron cargar los productos.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search]);

  const openNew = () => {
    setForm({ ...EMPTY_PRODUCT });
    setEditId(null);
    setImages([]);
    setPreviews([]);
    setModal(true);
  };

  const openEdit = (p) => {
    setForm({
      name: p.name, description: p.description, category: p.category,
      location: p.location, price: p.price, stock: p.stock,
      discount: p.discount ?? 0, freeShipping: p.freeShipping ?? false,
      available: p.available ?? true, isNew: p.isNew ?? false,
      specifications: p.specifications ?? '',
    });
    setEditId(p.id);
    setImages([]);
    setPreviews(p.images?.map(img => pb.files.getURL(p, img)) ?? []);
    setModal(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock) {
      toast.error('Nombre, precio y stock son obligatorios.');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name',          form.name);
      fd.append('description',   form.description);
      fd.append('category',      form.category);
      fd.append('location',      form.location);
      fd.append('price',         Number(form.price));
      fd.append('stock',         Number(form.stock));
      fd.append('discount',      Number(form.discount) || 0);
      fd.append('freeShipping',  form.freeShipping ? 'true' : 'false');
      fd.append('available',     form.available     ? 'true' : 'false');
      fd.append('isNew',         form.isNew         ? 'true' : 'false');
      fd.append('specifications', form.specifications);
      if (!editId) fd.append('vendorId', currentUser.id);
      images.forEach(img => fd.append('images', img));

      if (editId) {
        await pb.collection('products').update(editId, fd, { $autoCancel: false });
        toast.success('Producto actualizado.');
      } else {
        await pb.collection('products').create(fd, { $autoCancel: false });
        toast.success('Producto creado exitosamente.');
      }
      setModal(false);
      load();
    } catch (e) {
      toast.error('Error al guardar el producto.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await pb.collection('products').delete(id, { $autoCancel: false });
      toast.success('Producto eliminado.');
      load();
    } catch { toast.error('No se pudo eliminar el producto.'); }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          placeholder="Buscar productos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button onClick={openNew} className="gap-2 flex-shrink-0">
          <Plus className="w-4 h-4" />Agregar Producto
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-muted rounded-2xl">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="font-semibold text-muted-foreground mb-1">No hay productos todavía</p>
          <p className="text-sm text-muted-foreground/70 mb-4">Haz clic en "Agregar Producto" para empezar.</p>
          <Button onClick={openNew} size="sm"><Plus className="w-4 h-4 mr-2" />Primer Producto</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(p => {
            const imgUrl = p.images?.[0] ? pb.files.getURL(p, p.images[0], { thumb: '80x80' }) : null;
            return (
              <div key={p.id} className="flex items-center gap-4 bg-card rounded-xl border border-border p-3 hover:border-primary/30 transition-colors">
                <div className="w-14 h-14 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                  {imgUrl
                    ? <img src={imgUrl} alt={p.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-muted-foreground/50" /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category} · {p.location}</p>
                  <p className="text-xs font-bold text-primary mt-0.5">
                    ${Number(p.price).toLocaleString('es-CO')} COP
                    {p.stock <= 5 && <span className="ml-2 text-destructive">⚠️ Stock bajo ({p.stock})</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={p.available ? 'default' : 'secondary'} className="text-xs hidden sm:flex">
                    {p.available ? 'Disponible' : 'Oculto'}
                  </Badge>
                  <Button size="icon" variant="outline" onClick={() => openEdit(p)} className="w-8 h-8">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="outline" className="w-8 h-8 hover:border-destructive hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Se eliminará "<strong>{p.name}</strong>" permanentemente. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(p.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL — agregar/editar producto */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background z-10">
              <h2 className="text-lg font-bold">{editId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={() => setModal(false)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Imágenes */}
              <div>
                <Label className="mb-2 block font-semibold">Fotos del producto (máx. 5)</Label>
                <div
                  className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  {previews.length > 0 ? (
                    <div className="flex gap-2 flex-wrap justify-center">
                      {previews.map((src, i) => (
                        <img key={i} src={src} alt="" className="w-20 h-20 object-cover rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <div className="py-4">
                      <ImagePlus className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Haz clic o arrastra fotos aquí</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">JPG, PNG o WebP · máx. 20 MB por imagen</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
              </div>

              {/* Nombre */}
              <div className="space-y-1.5">
                <Label htmlFor="p-name" className="font-semibold">Nombre del producto *</Label>
                <Input id="p-name" placeholder="Ej: Mango tommy maduro Vichada" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>

              {/* Descripción */}
              <div className="space-y-1.5">
                <Label htmlFor="p-desc" className="font-semibold">Descripción</Label>
                <Textarea id="p-desc" rows={3} placeholder="Cuéntale al comprador sobre el producto, su origen, cómo se produce..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              {/* Categoría y Ubicación */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="font-semibold">Categoría</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    <option value="">-- Selecciona --</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="font-semibold">Municipio de origen</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  >
                    <option value="">-- Selecciona --</option>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Precio / Stock / Descuento */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="p-price" className="font-semibold">Precio COP *</Label>
                  <Input id="p-price" type="number" min="0" placeholder="15000" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                  {form.price > 0 && (
                    <p className="text-xs text-muted-foreground">${Number(form.price).toLocaleString('es-CO')}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-stock" className="font-semibold">Cantidad *</Label>
                  <Input id="p-stock" type="number" min="0" placeholder="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-disc" className="font-semibold">Descuento %</Label>
                  <Input id="p-disc" type="number" min="0" max="100" placeholder="0" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} />
                  {form.discount > 0 && form.price > 0 && (
                    <p className="text-xs text-green-600">
                      Precio final: ${Math.round(form.price * (1 - form.discount / 100)).toLocaleString('es-CO')}
                    </p>
                  )}
                </div>
              </div>

              {/* Especificaciones */}
              <div className="space-y-1.5">
                <Label htmlFor="p-specs" className="font-semibold">Especificaciones adicionales</Label>
                <Textarea id="p-specs" rows={2} placeholder="Peso, presentación, unidad de medida, etc." value={form.specifications} onChange={e => setForm(f => ({ ...f, specifications: e.target.value }))} />
              </div>

              {/* Switches */}
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { key: 'available',    label: 'Visible en tienda',   desc: 'Los compradores pueden verlo' },
                  { key: 'freeShipping', label: 'Envío gratis',        desc: 'Sin costo de envío' },
                  { key: 'isNew',        label: 'Producto nuevo',       desc: 'Muestra etiqueta NUEVO' },
                ].map(sw => (
                  <label key={sw.key} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${form[sw.key] ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'}`}>
                    <input
                      type="checkbox"
                      checked={form[sw.key]}
                      onChange={e => setForm(f => ({ ...f, [sw.key]: e.target.checked }))}
                      className="mt-0.5 accent-primary"
                    />
                    <div>
                      <p className="text-sm font-medium">{sw.label}</p>
                      <p className="text-xs text-muted-foreground">{sw.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-border sticky bottom-0 bg-background">
              <Button variant="outline" onClick={() => setModal(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</> : <><Save className="w-4 h-4" />Guardar Producto</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   PÁGINA PRINCIPAL DEL EDITOR
═══════════════════════════════════════════════════════ */
const TABS = [
  { id: 'productos', label: 'Productos',      icon: Package,        desc: 'Agrega, edita y elimina productos del catálogo' },
  { id: 'inicio',    label: 'Página de Inicio', icon: Home,           desc: 'Edita los textos del hero y la portada' },
  { id: 'nosotros',  label: 'Sobre Nosotros',  icon: Users,          desc: 'Actualiza la misión, visión e historia' },
  { id: 'contacto',  label: 'Contacto',        icon: Phone,          desc: 'Modifica los datos de contacto' },
];

const EditorDashboardPage = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('productos');
  const { map, load, loading } = useAllContent();

  const activeTabData = TABS.find(t => t.id === activeTab);

  return (
    <>
      <Helmet>
        <title>Panel de Digitación | AGRO IMPULSO ORIENTE</title>
      </Helmet>

      <div className="min-h-screen bg-muted/30">
        {/* ── Top bar ─────────────────────────────────── */}
        <header className="bg-primary text-primary-foreground sticky top-0 z-40 shadow-md">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-foreground/15 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">Panel de Digitación</p>
                <p className="text-xs text-primary-foreground/60">AGRO IMPULSO ORIENTE</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="hidden sm:flex items-center gap-1.5 text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                target="_blank"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Ver sitio
              </Link>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold">{currentUser?.name || currentUser?.email}</p>
                <p className="text-[10px] text-primary-foreground/60 capitalize">{currentUser?.role}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* ── Welcome ────────────────────────────────── */}
          <div className="mb-8 bg-card rounded-2xl p-6 border border-border shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold mb-1">
                  ¡Hola, {currentUser?.name?.split(' ')[0] || 'digitador'}! 👋
                </h1>
                <p className="text-muted-foreground text-sm">
                  Desde aquí puedes alimentar el catálogo, actualizar los textos de la web y
                  gestionar la información de contacto — <strong>sin tocar ningún código</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* ── Sidebar de navegación ──────────────────── */}
            <aside className="lg:col-span-1">
              <nav className="space-y-2 sticky top-24">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                        ${activeTab === tab.id
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'bg-card hover:bg-muted border border-border text-foreground'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold leading-tight">{tab.label}</p>
                        <p className={`text-[11px] leading-tight hidden lg:block ${activeTab === tab.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {tab.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}

                {/* Info card */}
                <div className="mt-4 bg-secondary/10 border border-secondary/20 rounded-xl p-4 hidden lg:block">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Los cambios en textos se reflejan en el sitio en pocos segundos. Los productos
                      nuevos aparecen inmediatamente al marcarlos como "Visible en tienda".
                    </p>
                  </div>
                </div>
              </nav>
            </aside>

            {/* ── Panel principal ────────────────────────── */}
            <main className="lg:col-span-3">
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-3">
                    {React.createElement(activeTabData.icon, { className: 'w-5 h-5 text-primary' })}
                    <div>
                      <h2 className="font-bold text-lg">{activeTabData.label}</h2>
                      <p className="text-xs text-muted-foreground">{activeTabData.desc}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {activeTab === 'productos' && <ProductsEditor />}

                  {(activeTab === 'inicio' || activeTab === 'nosotros' || activeTab === 'contacto') && (
                    loading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <ContentEditor
                        seccion={activeTab === 'inicio' ? 'inicio' : activeTab === 'nosotros' ? 'nosotros' : 'contacto'}
                        blocks={CONTENT_BLOCKS[activeTab === 'inicio' ? 'inicio' : activeTab === 'nosotros' ? 'nosotros' : 'contacto']}
                        map={map}
                        onReload={load}
                      />
                    )
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditorDashboardPage;
