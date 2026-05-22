
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Trash2, Edit, Plus, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';

const AdminPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [articles, setArticles] = useState([]);
  const [productores, setProductores] = useState([]);
  const [contactos, setContactos] = useState([]);
  const [producerRequests, setProducerRequests] = useState([]);
  const [buyerRequests, setBuyerRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [articleForm, setArticleForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: '',
    category: ''
  });
  const [productorForm, setProductorForm] = useState({
    nombre: '',
    productos: '',
    ubicacion: '',
    contacto: '',
    historia: '',
    tipo_producto: ''
  });
  const [editingArticle, setEditingArticle] = useState(null);
  const [editingProductor, setEditingProductor] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [articlesData, productoresData, contactosData, producerReqData, buyerReqData] = await Promise.all([
        pb.collection('articles').getFullList({ sort: '-created', $autoCancel: false }),
        pb.collection('productores').getFullList({ sort: '-created', $autoCancel: false }),
        pb.collection('contactos').getFullList({ sort: '-created', $autoCancel: false }),
        pb.collection('productores_solicitudes').getFullList({ sort: '-created', $autoCancel: false }),
        pb.collection('compradores_solicitudes').getFullList({ sort: '-created', $autoCancel: false })
      ]);
      setArticles(articlesData);
      setProductores(productoresData);
      setContactos(contactosData);
      setProducerRequests(producerReqData);
      setBuyerRequests(buyerReqData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleArticleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingArticle) {
        await pb.collection('articles').update(editingArticle, articleForm, { $autoCancel: false });
        toast.success('Artículo actualizado');
      } else {
        await pb.collection('articles').create(articleForm, { $autoCancel: false });
        toast.success('Artículo creado');
      }
      setArticleForm({ title: '', content: '', excerpt: '', author: '', category: '' });
      setEditingArticle(null);
      fetchData();
    } catch (error) {
      toast.error('Error al guardar el artículo');
      console.error(error);
    }
  };

  const handleProductorSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProductor) {
        await pb.collection('productores').update(editingProductor, productorForm, { $autoCancel: false });
        toast.success('Productor actualizado');
      } else {
        await pb.collection('productores').create(productorForm, { $autoCancel: false });
        toast.success('Productor creado');
      }
      setProductorForm({ nombre: '', productos: '', ubicacion: '', contacto: '', historia: '', tipo_producto: '' });
      setEditingProductor(null);
      fetchData();
    } catch (error) {
      toast.error('Error al guardar el productor');
      console.error(error);
    }
  };

  const deleteArticle = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este artículo?')) {
      try {
        await pb.collection('articles').delete(id, { $autoCancel: false });
        toast.success('Artículo eliminado');
        fetchData();
      } catch (error) {
        toast.error('Error al eliminar el artículo');
        console.error(error);
      }
    }
  };

  const deleteProductor = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este productor?')) {
      try {
        await pb.collection('productores').delete(id, { $autoCancel: false });
        toast.success('Productor eliminado');
        fetchData();
      } catch (error) {
        toast.error('Error al eliminar el productor');
        console.error(error);
      }
    }
  };

  const editArticle = (article) => {
    setArticleForm({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || '',
      author: article.author || '',
      category: article.category || ''
    });
    setEditingArticle(article.id);
  };

  const editProductor = (productor) => {
    setProductorForm({
      nombre: productor.nombre,
      productos: productor.productos,
      ubicacion: productor.ubicacion || '',
      contacto: productor.contacto || '',
      historia: productor.historia || '',
      tipo_producto: productor.tipo_producto || ''
    });
    setEditingProductor(productor.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Panel de Administración - AGRO IMPULSO ORIENTE</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <div className="container-custom py-12">
          <div className="flex items-center justify-between mb-8">
            <h1>Panel de Administración</h1>
            <Button 
              onClick={() => navigate('/')} 
              variant="outline"
              className="btn-transition active:scale-[0.98]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al sitio
            </Button>
          </div>

          <Tabs defaultValue="articles" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="articles">Artículos</TabsTrigger>
              <TabsTrigger value="productores">Productores</TabsTrigger>
              <TabsTrigger value="contactos">Mensajes</TabsTrigger>
              <TabsTrigger value="producer-requests">Solicitudes Productores</TabsTrigger>
              <TabsTrigger value="buyer-requests">Solicitudes Compradores</TabsTrigger>
            </TabsList>

            <TabsContent value="articles">
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-card rounded-2xl p-6 shadow-lg">
                  <h2 className="text-xl font-semibold mb-6 text-card-foreground">
                    {editingArticle ? 'Editar Artículo' : 'Crear Artículo'}
                  </h2>
                  <form onSubmit={handleArticleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={articleForm.title}
                        onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                        required
                        className="mt-2 text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="excerpt">Extracto</Label>
                      <Textarea
                        id="excerpt"
                        value={articleForm.excerpt}
                        onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                        rows={2}
                        className="mt-2 text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="content">Contenido</Label>
                      <Textarea
                        id="content"
                        value={articleForm.content}
                        onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                        required
                        rows={8}
                        className="mt-2 text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="author">Autor</Label>
                      <Input
                        id="author"
                        value={articleForm.author}
                        onChange={(e) => setArticleForm({ ...articleForm, author: e.target.value })}
                        className="mt-2 text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Categoría</Label>
                      <Input
                        id="category"
                        value={articleForm.category}
                        onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                        className="mt-2 text-foreground"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1 btn-transition active:scale-[0.98]">
                        {editingArticle ? 'Actualizar' : 'Crear'}
                      </Button>
                      {editingArticle && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setEditingArticle(null);
                            setArticleForm({ title: '', content: '', excerpt: '', author: '', category: '' });
                          }}
                          className="btn-transition active:scale-[0.98]"
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">Artículos Publicados</h2>
                  {articles.length === 0 ? (
                    <p className="text-muted-foreground">No hay artículos publicados</p>
                  ) : (
                    articles.map((article) => (
                      <div key={article.id} className="bg-card rounded-xl p-4 shadow border border-border">
                        <h3 className="font-semibold mb-2 text-card-foreground">{article.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{article.excerpt}</p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => editArticle(article)}
                            className="btn-transition active:scale-[0.98]"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => deleteArticle(article.id)}
                            className="btn-transition active:scale-[0.98]"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="productores">
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-card rounded-2xl p-6 shadow-lg">
                  <h2 className="text-xl font-semibold mb-6 text-card-foreground">
                    {editingProductor ? 'Editar Productor' : 'Crear Productor'}
                  </h2>
                  <form onSubmit={handleProductorSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input
                        id="nombre"
                        value={productorForm.nombre}
                        onChange={(e) => setProductorForm({ ...productorForm, nombre: e.target.value })}
                        required
                        className="mt-2 text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="productos">Productos</Label>
                      <Input
                        id="productos"
                        value={productorForm.productos}
                        onChange={(e) => setProductorForm({ ...productorForm, productos: e.target.value })}
                        required
                        className="mt-2 text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tipo_producto">Tipo de Producto</Label>
                      <Select 
                        value={productorForm.tipo_producto} 
                        onValueChange={(value) => setProductorForm({ ...productorForm, tipo_producto: value })}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="granos">Granos</SelectItem>
                          <SelectItem value="frutas">Frutas</SelectItem>
                          <SelectItem value="verduras">Verduras</SelectItem>
                          <SelectItem value="lacteos">Lácteos</SelectItem>
                          <SelectItem value="otros">Otros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="ubicacion">Ubicación</Label>
                      <Input
                        id="ubicacion"
                        value={productorForm.ubicacion}
                        onChange={(e) => setProductorForm({ ...productorForm, ubicacion: e.target.value })}
                        className="mt-2 text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contacto">Contacto</Label>
                      <Input
                        id="contacto"
                        value={productorForm.contacto}
                        onChange={(e) => setProductorForm({ ...productorForm, contacto: e.target.value })}
                        className="mt-2 text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="historia">Historia</Label>
                      <Textarea
                        id="historia"
                        value={productorForm.historia}
                        onChange={(e) => setProductorForm({ ...productorForm, historia: e.target.value })}
                        rows={4}
                        className="mt-2 text-foreground"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1 btn-transition active:scale-[0.98]">
                        {editingProductor ? 'Actualizar' : 'Crear'}
                      </Button>
                      {editingProductor && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setEditingProductor(null);
                            setProductorForm({ nombre: '', productos: '', ubicacion: '', contacto: '', historia: '', tipo_producto: '' });
                          }}
                          className="btn-transition active:scale-[0.98]"
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">Productores Registrados</h2>
                  {productores.length === 0 ? (
                    <p className="text-muted-foreground">No hay productores registrados</p>
                  ) : (
                    productores.map((productor) => (
                      <div key={productor.id} className="bg-card rounded-xl p-4 shadow border border-border">
                        <h3 className="font-semibold mb-2 text-card-foreground">{productor.nombre}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{productor.productos}</p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => editProductor(productor)}
                            className="btn-transition active:scale-[0.98]"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => deleteProductor(productor.id)}
                            className="btn-transition active:scale-[0.98]"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contactos">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Mensajes de Contacto</h2>
                {contactos.length === 0 ? (
                  <p className="text-muted-foreground">No hay mensajes</p>
                ) : (
                  contactos.map((contacto) => (
                    <div key={contacto.id} className="bg-card rounded-xl p-6 shadow border border-border">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-card-foreground">{contacto.nombre}</h3>
                          <p className="text-sm text-muted-foreground">{contacto.email}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(contacto.created).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      {contacto.asunto && (
                        <p className="text-sm font-medium mb-2 text-card-foreground">Asunto: {contacto.asunto}</p>
                      )}
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{contacto.mensaje}</p>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="producer-requests">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Solicitudes de Productores</h2>
                {producerRequests.length === 0 ? (
                  <p className="text-muted-foreground">No hay solicitudes</p>
                ) : (
                  producerRequests.map((request) => (
                    <div key={request.id} className="bg-card rounded-xl p-6 shadow border border-border">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-card-foreground">{request.nombre}</h3>
                          <p className="text-sm text-muted-foreground">{request.email}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(request.created).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="text-card-foreground"><span className="font-medium">Productos:</span> {request.productos}</p>
                        {request.ubicacion && <p className="text-muted-foreground"><span className="font-medium">Ubicación:</span> {request.ubicacion}</p>}
                        {request.contacto && <p className="text-muted-foreground"><span className="font-medium">Contacto:</span> {request.contacto}</p>}
                        {request.historia && (
                          <p className="text-muted-foreground mt-3 whitespace-pre-line">
                            <span className="font-medium">Historia:</span><br />{request.historia}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="buyer-requests">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Solicitudes de Compradores</h2>
                {buyerRequests.length === 0 ? (
                  <p className="text-muted-foreground">No hay solicitudes</p>
                ) : (
                  buyerRequests.map((request) => (
                    <div key={request.id} className="bg-card rounded-xl p-6 shadow border border-border">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-card-foreground">{request.nombre}</h3>
                          <p className="text-sm text-muted-foreground">{request.email}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(request.created).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        {request.interes && <p className="text-card-foreground"><span className="font-medium">Interés:</span> {request.interes}</p>}
                        {request.cantidad_aproximada && <p className="text-muted-foreground"><span className="font-medium">Cantidad:</span> {request.cantidad_aproximada}</p>}
                        {request.contacto && <p className="text-muted-foreground"><span className="font-medium">Contacto:</span> {request.contacto}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default AdminPage;
