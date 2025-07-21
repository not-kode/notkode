
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

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

      {/* Founders Section */}
      <section className="py-12 md:py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-sora font-bold text-2xl md:text-4xl mb-6 md:mb-8">
            <span className="text-primary">{t('sobre.founders.main_title')}</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-12">
            {t('sobre.founders.description')}
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-2xl">LG</span>
              </div>
              <h3 className="font-sora font-bold text-xl mb-2">{t('sobre.founders.lucas.name')}</h3>
              <p className="text-primary font-medium mb-2">{t('sobre.founders.lucas.role')}</p>
              <p className="text-muted-foreground text-sm">{t('sobre.founders.lucas.description')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-r from-secondary to-primary flex items-center justify-center">
                <span className="text-white font-bold text-2xl">GS</span>
              </div>
              <h3 className="font-sora font-bold text-xl mb-2">{t('sobre.founders.gustavo.name')}</h3>
              <p className="text-primary font-medium mb-2">{t('sobre.founders.gustavo.role')}</p>
              <p className="text-muted-foreground text-sm">{t('sobre.founders.gustavo.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-sora font-bold text-2xl md:text-4xl mb-6 md:mb-8 text-center">
            <span className="text-gradient">{t('sobre.timeline.title')}</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto leading-relaxed">
            {t('sobre.timeline.subtitle')}
          </p>
          
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold">1</span>
              </div>
              <div>
                <h3 className="font-sora font-bold text-xl mb-2">{t('sobre.timeline.step1.title')}</h3>
                <p className="text-muted-foreground">{t('sobre.timeline.step1.description')}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-white font-bold">2</span>
              </div>
              <div>
                <h3 className="font-sora font-bold text-xl mb-2">{t('sobre.timeline.step2.title')}</h3>
                <p className="text-muted-foreground">{t('sobre.timeline.step2.description')}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold">3</span>
              </div>
              <div>
                <h3 className="font-sora font-bold text-xl mb-2">{t('sobre.timeline.step3.title')}</h3>
                <p className="text-muted-foreground">{t('sobre.timeline.step3.description')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SobreNos;
