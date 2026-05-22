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

// Placeholder generic route
const PlaceholderPage = ({ title }) => (
  <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
    <h1 className="text-3xl font-bold">{title} - Próximamente</h1>
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
                  <PlaceholderPage title="Mi Cuenta" />
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
            
            {/* Catch all */}
            <Route path="*" element={
              <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
                <h1 className="text-6xl font-black text-primary mb-4">404</h1>
                <p className="text-xl text-muted-foreground mb-8">Página no encontrada</p>
                <a href="/" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors">
                  Volver al inicio
                </a>
              </div>
            } />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;