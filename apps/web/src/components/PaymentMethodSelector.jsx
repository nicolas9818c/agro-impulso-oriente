
import React from 'react';
import { CreditCard, Landmark, Banknote, Wallet, CalendarClock, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

const PAYMENT_METHODS = [
  {
    id: 'stripe',
    name: 'Tarjeta de Crédito / Débito',
    description: 'Pago seguro en línea procesado por Stripe',
    icon: CreditCard,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    tooltip: 'Aceptamos Visa, Mastercard, American Express'
  },
  {
    id: 'transfer',
    name: 'Transferencia Bancaria',
    description: 'Bancolombia, Davivienda, etc.',
    icon: Landmark,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    tooltip: 'Aprobación en 24h hábiles tras enviar comprobante'
  },
  {
    id: 'cod',
    name: 'Pago Contra Entrega',
    description: 'Paga en efectivo al recibir tu pedido',
    icon: Banknote,
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
    tooltip: 'Disponible en zonas urbanas y rurales seleccionadas'
  },
  {
    id: 'wallet',
    name: 'Billetera Digital',
    description: 'Nequi, Daviplata, Dale!',
    icon: Wallet,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    tooltip: 'Transferencia rápida desde tu celular'
  },
  {
    id: 'installments',
    name: 'Pago a Cuotas',
    description: 'Compra ahora, paga después',
    icon: CalendarClock,
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    tooltip: 'Sujeto a aprobación de crédito'
  }
];

const PaymentMethodSelector = ({ selectedMethod, onSelect }) => {
  return (
    <div className="space-y-4">
      {PAYMENT_METHODS.map((method) => {
        const Icon = method.icon;
        const isSelected = selectedMethod === method.id;

        return (
          <motion.div
            key={method.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelect(method.id)}
            className={`
              relative cursor-pointer rounded-2xl p-5 border-2 transition-all duration-300
              ${isSelected ? 'border-primary bg-primary/5 shadow-md' : 'border-border bg-card hover:border-primary/50'}
            `}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${method.bgColor}`}>
                <Icon className={`w-6 h-6 ${method.color}`} />
              </div>
              
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground font-sans">{method.name}</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground transition-colors" type="button" onClick={(e) => e.stopPropagation()}>
                          <Info className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">{method.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
              </div>

              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'border-primary' : 'border-muted-foreground/30'}`}>
                {isSelected && <div className="w-3 h-3 rounded-full bg-primary" />}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default PaymentMethodSelector;
