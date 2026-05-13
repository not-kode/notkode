
import React from 'react';
import { Heart, MapPin, Building2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-background py-4 px-4 md:px-8 w-full">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 text-center md:text-left">
          {/* Copyright */}
          <div className="text-muted-foreground">
            <p className="text-sm">{t('footer.copyright')}</p>
            <p className="text-sm">{t('footer.rights')}</p>
          </div>

          {/* Built with love */}
          <div className="flex items-center space-x-2 text-muted-foreground whitespace-nowrap">
            <span className="text-sm">{t('footer.made_with')}</span>
            <Heart className="w-4 h-4 text-blue-500 fill-current" />
            <span className="text-sm">{t('footer.by_notkode')}</span>
          </div>

          {/* CNPJ and Location */}
          <div className="flex flex-col items-center md:items-end space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2 whitespace-nowrap">
              <MapPin className="w-4 h-4" />
              <span>{t('footer.location')}</span>
            </div>
            <div className="flex items-center space-x-2 whitespace-nowrap">
              <Building2 className="w-4 h-4" />
              <span>{t('footer.cnpj')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
