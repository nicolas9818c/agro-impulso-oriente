
import React from 'react';
import { Copy, Building2, UserCircle, Hash, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const BankTransferInfo = () => {
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  return (
    <div className="bg-card p-6 rounded-2xl border border-border mt-4">
      <h3 className="text-lg font-bold mb-4 font-sans flex items-center gap-2">
        <Building2 className="w-5 h-5 text-primary" />
        Datos Bancarios AGRO IMPULSO
      </h3>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Banco</p>
            <p className="font-semibold text-foreground">Bancolombia</p>
          </div>
        </div>

        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Tipo de Cuenta</p>
            <p className="font-semibold text-foreground">Ahorros</p>
          </div>
        </div>

        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg group">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1 flex items-center gap-1">
              <Hash className="w-3 h-3" /> Número de Cuenta
            </p>
            <p className="font-semibold text-foreground text-lg">123-456789-00</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => copyToClipboard('12345678900', 'Número de cuenta')}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Copy className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>

        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg group">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1 flex items-center gap-1">
              <UserCircle className="w-3 h-3" /> Titular
            </p>
            <p className="font-semibold text-foreground">Asoc. Agro Impulso Oriente</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => copyToClipboard('Asoc. Agro Impulso Oriente', 'Titular')}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Copy className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-primary-foreground/90 mb-1">Instrucciones</p>
          <p className="text-muted-foreground">
            Realiza la transferencia y envía el comprobante al WhatsApp <strong>+57 300 123 4567</strong> 
            indicando tu número de pedido.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BankTransferInfo;
