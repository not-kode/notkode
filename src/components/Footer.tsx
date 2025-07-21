
import React from 'react';
import { Heart, MapPin, Building2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-background py-4 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Copyright */}
          <div className="text-muted-foreground text-center md:text-left">
            <p>{t('footer.copyright')}</p>
            <p>{t('footer.rights')}</p>
          </div>

          {/* Built with love */}
          <div className="flex items-center space-x-2 text-muted-foreground whitespace-nowrap">
            <span>{t('footer.made_with')}</span>
            <Heart className="w-4 h-4 text-blue-500 fill-current" />
            <span>{t('footer.by_notkode')}</span>
          </div>

          {/* CNPJ and Location */}
          <div className="flex flex-col items-end space-y-2 text-sm text-muted-foreground">
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
