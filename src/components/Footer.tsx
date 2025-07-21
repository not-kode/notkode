
import React from 'react';
import { Heart, MapPin, Building2 } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border/10 py-6 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Copyright */}
          <p className="text-muted-foreground">
            © {currentYear} Notkode. Todos os direitos reservados.
          </p>

          {/* Built with love */}
          <div className="flex items-center space-x-2 text-muted-foreground">
            <span>Feito com</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>pela Notkode</span>
          </div>

          {/* CNPJ and Location */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span>CNPJ: 12.345.678/0001-90</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>São Paulo, SP - Brasil</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
