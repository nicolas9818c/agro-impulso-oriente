
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';

const SHIPPING_COST = 15000; // tarifa plana estimada — misma que en CheckoutPage

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((total, item) => {
    const price = item.variant.price_in_cents / 100;
    return total + (price * item.quantity);
  }, 0);

  const total = subtotal + (cartItems.length > 0 ? SHIPPING_COST : 0);

  const cop = (n) => `$${Number(n).toLocaleString('es-CO')} COP`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Carrito de Compras | AGRO IMPULSO ORIENTE</title>
      </Helmet>
      <Header />

      <main className="flex-grow container-custom py-12">
        <h1 className="text-3xl md:text-4xl mb-8">Tu Carrito</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-50" />
            <h2 className="text-2xl mb-4">Tu carrito está vacío</h2>
            <p className="text-muted-foreground mb-8">Parece que aún no has agregado productos a tu carrito.</p>
            <Link to="/productos">
              <Button size="lg" className="btn-transition">Explorar Productos</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => (
                <div key={item.variant.id} className="flex flex-col sm:flex-row gap-6 bg-card p-6 rounded-2xl border border-border">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    {item.product.image ? (
                      <img src={item.product.image} alt={item.product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Sin img</div>
                    )}
                  </div>
                  
                  <div className="flex-grow flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg font-sans text-card-foreground">{item.product.title}</h3>
                        <p className="text-primary font-medium">{cop(item.variant.price_in_cents / 100)}</p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.variant.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-2"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-border rounded-lg bg-background">
                        <button 
                          onClick={() => updateQuantity(item.variant.id, Math.max(1, item.quantity - 1))}
                          className="px-3 py-1 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                          className="px-3 py-1 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <div className="font-bold text-foreground">
                        {cop((item.variant.price_in_cents / 100) * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl p-6 border border-border sticky top-24">
                <h3 className="text-xl font-semibold mb-6 font-sans">Resumen de Compra</h3>
                
                <div className="space-y-4 mb-6 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-medium text-foreground">{cop(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Envío estimado</span>
                    <span className="font-medium text-foreground">{cop(SHIPPING_COST)}</span>
                  </div>
                  <div className="border-t border-border pt-4 flex justify-between font-bold text-lg text-foreground">
                    <span>Total Estimado</span>
                    <span className="text-primary">{cop(total)}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">El valor del envío puede variar según tu ubicación al finalizar el pedido.</p>
                </div>

                <Button 
                  className="w-full h-12 text-base btn-transition mb-4"
                  onClick={() => navigate('/checkout')}
                >
                  Proceder al Pago <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                <Link to="/productos">
                  <Button variant="outline" className="w-full h-12 text-base btn-transition">
                    Continuar Comprando
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;
