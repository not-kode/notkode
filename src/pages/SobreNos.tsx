
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Portfolio from '@/components/Portfolio';

const SobreNos: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-20 md:pt-16">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="font-sora font-bold text-3xl md:text-5xl lg:text-6xl mb-6 md:mb-8">
            <span className="text-gradient">{t('sobre.hero.title')}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed">
            {t('sobre.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-12 md:py-20">
        <Portfolio />
      </section>

      {/* Mission Section */}
      <section className="py-12 md:py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-sora font-bold text-2xl md:text-4xl mb-6 md:mb-8">
            <span className="text-primary">{t('sobre.founders.main_title')}</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('sobre.timeline.title')}
          </p>
        </div>
      </section>
    </div>
  );
};

export default SobreNos;
