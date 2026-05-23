import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './hooks/useCart';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import WhatsAppButton from './components/WhatsAppButton';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VendorDashboardPage from './pages/VendorDashboardPage';
import VendorProfilePage from './pages/VendorProfilePage';
import SobreNosotrosPage from './pages/SobreNosotrosPage';
import ContactoPage from './pages/ContactoPage';
import EditorDashboardPage from './pages/EditorDashboardPage';
import MiCuentaPage from './pages/MiCuentaPage';
import Header from './components/Header';
import Footer from './components/Footer';
import AdminPage from './pages/AdminPage';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-4xl">🌿</span>
      </div>
      <h1 className="text-7xl font-black text-primary mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-3">Página no encontrada</h2>
      <p className="text-muted-foreground max-w-sm mb-8">
        Lo sentimos, la página que buscas no existe o fue movida.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link to="/" className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors">
          Volver al inicio
        </Link>
        <Link to="/productos" className="px-6 py-3 border border-border rounded-xl font-semibold hover:bg-muted transition-colors">
          Ver Productos
        </Link>
      </div>
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Toaster position="top-center" richColors />
          <WhatsAppButton />
          
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/productos" element={<ProductsPage />} />
            <Route path="/producto/:id" element={<ProductDetailPage />} />
            <Route path="/carrito" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Protected Seller Routes */}
            <Route 
              path="/vendedor" 
              element={
                <ProtectedRoute requireSeller={true}>
                  <VendorDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/vendedor/perfil" 
              element={
                <ProtectedRoute requireSeller={true}>
                  <VendorProfilePage />
                </ProtectedRoute>
              } 
            />

            {/* Protected Buyer Routes */}
            <Route
              path="/mi-cuenta"
              element={
                <ProtectedRoute>
                  <MiCuentaPage />
                </ProtectedRoute>
              }
            />

            {/* Info Pages */}
            <Route path="/sobre-nosotros" element={<SobreNosotrosPage />} />
            <Route path="/contacto" element={<ContactoPage />} />

            {/* Editor / Digitador Route */}
            <Route
              path="/editor"
              element={
                <ProtectedRoute requireEditor={true}>
                  <EditorDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Route */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            
            {/* Catch all 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;