
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, MapPin, CreditCard, ShoppingBag, ShieldCheck, ArrowRight } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import PaymentMethodSelector from '@/components/PaymentMethodSelector';
import BankTransferInfo from '@/components/BankTransferInfo';

const STEPS = [
  { id: 1, title: 'Carrito', icon: ShoppingBag },
  { id: 2, title: 'Envío', icon: MapPin },
  { id: 3, title: 'Pago', icon: CreditCard },
  { id: 4, title: 'Confirmación', icon: CheckCircle2 }
];

const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(2); // Skip cart step visually
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    address: '',
    city: 'Puerto Carreño',
    department: 'Vichada',
    phone: '',
    notes: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('wompi');

  const subtotal = cartItems.reduce((total, item) => {
    const price = item.variant.price_in_cents / 100;
    return total + (price * item.quantity);
  }, 0);

  const shippingCost = 15000; // Flat rate mock
  const total = subtotal + shippingCost;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = (e) => {
    e?.preventDefault();
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para continuar');
      navigate('/login?redirect=/checkout');
      return;
    }
    setCurrentStep(3);
  };

  const saveOrderAndProceed = async (extraStatus = 'pending') => {
    const vendorId = cartItems[0]?.product?.vendorId || 'unknown';
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    const orderData = {
      orderNumber,
      buyerId: currentUser.id,
      vendorId,
      items: cartItems.map(item => ({
        productId: item.product.id,
        name: item.product.title || item.product.name,
        quantity: item.quantity,
        price: item.variant?.price_in_cents ? item.variant.price_in_cents / 100 : (item.product.price || 0)
      })),
      totalAmount: total,
      shippingAddress: formData,
      paymentMethod,
      status: extraStatus
    };
    const record = await pb.collection('orders').create(orderData, { $autoCancel: false });
    return record;
  };

  const processOrder = async () => {
    setLoading(true);
    try {
      if (paymentMethod === 'wompi') {
        // Guardar pedido como pendiente, luego redirigir a Wompi
        const record = await saveOrderAndProceed('pending');
        setOrderId(record.orderNumber);

        // Wompi checkout widget / link de pago
        // Reemplaza WOMPI_PUBLIC_KEY con tu llave pública de Wompi
        const WOMPI_PUBLIC_KEY = import.meta.env.VITE_WOMPI_PUBLIC_KEY || 'pub_test_XXXXXXXX';
        const wompiUrl = `https://checkout.wompi.co/p/?public-key=${WOMPI_PUBLIC_KEY}` +
          `&currency=COP` +
          `&amount-in-cents=${Math.round(total * 100)}` +
          `&reference=${record.orderNumber}` +
          `&redirect-url=${encodeURIComponent(window.location.origin + '/checkout?step=success&order=' + record.orderNumber)}`;

        clearCart();
        window.location.href = wompiUrl;
        return;
      }

      // Otros métodos (transferencia, contra entrega, billetera, cuotas)
      const record = await saveOrderAndProceed('pending');
      setOrderId(record.orderNumber);
      setCurrentStep(4);
      clearCart();

    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Error al procesar el pedido. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Check URL params for Stripe success return
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('step') === 'success') {
      setCurrentStep(4);
      setOrderId(params.get('session_id') || 'STRIPE-OK');
      clearCart();
    }
  }, []);

  if (cartItems.length === 0 && currentStep !== 4) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center py-12">
          <div className="text-center p-8">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold mb-4">No hay productos para pagar</h2>
            <Button onClick={() => navigate('/productos')}>Volver a la tienda</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Checkout | AGRO IMPULSO ORIENTE</title>
      </Helmet>
      <Header />

      <main className="flex-grow container-custom py-12">
        {/* Progress Bar */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10 rounded-full"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-500" 
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            ></div>
            
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep >= step.id;
              const isCurrent = currentStep === step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-background transition-colors duration-300 ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-xs mt-2 font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {currentStep === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-card rounded-3xl p-8 border border-border shadow-sm"
                >
                  <h2 className="text-2xl font-bold mb-6 font-sans">Datos de Envío</h2>
                  <form id="shipping-form" onSubmit={handleNextStep} className="space-y-5">
                    <div>
                      <Label>Nombre Completo</Label>
                      <Input name="fullName" required value={formData.fullName} onChange={handleInputChange} className="mt-1" />
                    </div>
                    <div>
                      <Label>Dirección</Label>
                      <Input name="address" required value={formData.address} onChange={handleInputChange} className="mt-1" placeholder="Calle/Carrera/Vereda" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Ciudad/Municipio</Label>
                        <Input name="city" required value={formData.city} onChange={handleInputChange} className="mt-1" />
                      </div>
                      <div>
                        <Label>Departamento</Label>
                        <Input name="department" required value={formData.department} onChange={handleInputChange} className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label>Teléfono Celular</Label>
                      <Input name="phone" required type="tel" value={formData.phone} onChange={handleInputChange} className="mt-1" />
                    </div>
                    <div>
                      <Label>Indicaciones de entrega (Opcional)</Label>
                      <Input name="notes" value={formData.notes} onChange={handleInputChange} className="mt-1" />
                    </div>
                    <div className="pt-4 flex justify-end">
                      <Button type="submit" size="lg" className="px-8 font-bold">Continuar al Pago <ArrowRight className="w-4 h-4 ml-2" /></Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-card rounded-3xl p-8 border border-border shadow-sm"
                >
                  <h2 className="text-2xl font-bold mb-6 font-sans">Método de Pago</h2>
                  
                  <PaymentMethodSelector 
                    selectedMethod={paymentMethod} 
                    onSelect={setPaymentMethod} 
                  />

                  {paymentMethod === 'transfer' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6">
                      <BankTransferInfo />
                    </motion.div>
                  )}

                  <div className="mt-10 flex items-center justify-between">
                    <Button variant="ghost" onClick={() => setCurrentStep(2)}>Volver a Envío</Button>
                    <Button 
                      onClick={processOrder} 
                      size="lg" 
                      className="px-8 font-bold bg-success hover:bg-success/90 text-success-foreground"
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ShieldCheck className="w-5 h-5 mr-2" />}
                      {loading ? 'Procesando...' : `Pagar $${total.toLocaleString()}`}
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card rounded-3xl p-10 border border-border text-center shadow-lg"
                >
                  <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-12 h-12 text-success" />
                  </div>
                  <h1 className="text-3xl font-bold mb-4 font-sans">¡Compra Exitosa!</h1>
                  <p className="text-muted-foreground mb-2 text-lg">
                    Tu número de orden es: <span className="font-bold text-foreground">{orderId}</span>
                  </p>
                  <p className="text-muted-foreground mb-8">
                    Hemos enviado un comprobante a tu correo. El vendedor preparará tu pedido pronto.
                  </p>
                  <Button onClick={() => navigate('/productos')} size="lg" className="font-bold px-8">
                    Seguir Comprando
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          {currentStep < 4 && (
            <div className="lg:col-span-1">
              <div className="bg-card rounded-3xl p-6 border border-border sticky top-24 shadow-sm">
                <h3 className="text-xl font-bold mb-6 font-sans">Resumen de tu pedido</h3>
                
                <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {cartItems.map(item => (
                    <div key={item.variant.id} className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0 border border-border">
                        {item.product.image && <img src={item.product.image} alt={item.product.title} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium text-sm line-clamp-2 leading-snug">{item.product.title}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-muted-foreground text-sm">Cant: {item.quantity}</span>
                          <span className="font-bold text-sm">
                            ${((item.variant.price_in_cents / 100) * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-3 mb-6">
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>Subtotal</span>
                    <span className="font-medium text-foreground">${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>Envío Estimado</span>
                    <span className="font-medium text-foreground">${shippingCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-xl pt-3 border-t border-border">
                    <span>Total</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-xl p-4 flex items-start gap-3 border border-primary/10">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Tu compra está protegida. Al realizar el pago confirmas que aceptas nuestros Términos de Servicio y Políticas de Privacidad.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
