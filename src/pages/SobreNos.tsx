
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import WhatsAppButton from '@/components/WhatsAppButton';
import { CheckCircle, Globe, TrendingUp, Linkedin } from 'lucide-react';

const SobreNos: React.FC = () => {
  const { t } = useLanguage();

  const timelineItems = t('about.timeline.items') as Array<{
    date: string;
    title: string;
    description: string;
  }>;

  const ctaFeatures = t('about.cta.features') as Array<{
    title: string;
    description: string;
  }>;

  return (
    <div className="min-h-screen pt-20 md:pt-16 bg-background">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-block glass rounded-full px-6 py-2 mb-6 animate-magical-pulse">
            <span className="text-gradient font-medium text-sm">
              • {t('about.hero.badge')}
            </span>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed">
            {t('about.hero.description')}
          </p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-sora font-bold text-2xl md:text-4xl mb-6 md:mb-16 text-center">
            <span className="text-gradient">{t('about.timeline.title')}</span>
          </h2>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 md:left-1/2 md:transform md:-translate-x-0.5 top-0 bottom-0 w-0.5 bg-primary/20"></div>
            
            {/* Timeline Items */}
            <div className="space-y-16 md:space-y-24">
              {timelineItems.map((item: any, index: number) => (
                <div key={index} className="relative flex items-start md:items-center">
                  <div className="absolute left-6 md:left-1/2 md:transform md:-translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background z-10"></div>
                  <div className={`ml-16 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:ml-auto md:pl-12'}`}>
                    <div className="glass-card">
                      <div className="text-primary text-sm font-medium mb-2">{item.date}</div>
                      <h3 className="font-sora font-bold text-xl mb-3">{item.title}</h3>
                      <p className="text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-12 md:py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-sora font-bold text-2xl md:text-4xl mb-6 md:mb-16 text-center">
            <span className="text-gradient">{t('about.founders.title')}</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* Camila */}
            <div className="glass-card text-center">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-primary/20">
                  <img 
                    src="https://media.licdn.com/dms/image/v2/D4D03AQHN8KBb8CeCTw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1719845395227?e=1755734400&v=beta&t=P1DLP0YNtGKxQehMREushPTcxLNYH31ym6pb4KbZ2kM"
                    alt="Camila Tonelotto"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-sora font-bold text-xl mb-1">{t('about.founders.camila.name')}</h3>
                <div className="text-primary text-sm font-medium mb-4">{t('about.founders.camila.role')}</div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {t('about.founders.camila.description')}
                </p>
                <a 
                  href="https://www.linkedin.com/in/gregoriocamila/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-medium transition-all duration-300 hover:scale-105"
                >
                  <Linkedin className="w-4 h-4" />
                  {t('about.founders.camila.linkedin')}
                </a>
              </div>
            </div>

            {/* Matheus */}
            <div className="glass-card text-center">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-primary/20">
                  <img 
                    src="https://media.licdn.com/dms/image/v2/C4D03AQGd8lA9yG-Mqw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1534949512919?e=1755734400&v=beta&t=2w9hliqnKjhoZPhLo6MDYCD1-StXXGu9Z7dBRh2gjP8"
                    alt="Matheus Tonelotto"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-sora font-bold text-xl mb-1">{t('about.founders.matheus.name')}</h3>
                <div className="text-primary text-sm font-medium mb-4">{t('about.founders.matheus.role')}</div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {t('about.founders.matheus.description')}
                </p>
                <a 
                  href="https://www.linkedin.com/in/matheustonelotto/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-medium transition-all duration-300 hover:scale-105"
                >
                  <Linkedin className="w-4 h-4" />
                  {t('about.founders.matheus.linkedin')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-sora font-bold text-2xl md:text-4xl mb-6 md:mb-16 text-center">
            <span className="text-gradient">{t('about.contact.title')}</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="glass-card text-center">
              <h3 className="font-sora font-bold text-lg mb-2 text-primary">{t('about.contact.whatsapp')}</h3>
              <p className="text-muted-foreground">+55 11 95138-1254</p>
            </div>
            <div className="glass-card text-center">
              <h3 className="font-sora font-bold text-lg mb-2 text-primary">{t('about.contact.email')}</h3>
              <p className="text-muted-foreground">camila@notkode.com.br</p>
            </div>
            <div className="glass-card text-center">
              <h3 className="font-sora font-bold text-lg mb-2 text-primary">{t('about.contact.location')}</h3>
              <p className="text-muted-foreground">{t('about.contact.locationValue')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-primary/10 via-secondary/5 to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-sora font-bold text-2xl md:text-4xl mb-6">
              <span className="text-gradient">{t('about.cta.title')}</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {ctaFeatures.map((feature: any, index: number) => (
              <div key={index} className="glass-card text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  {index === 0 && <CheckCircle className="w-8 h-8 text-primary" />}
                  {index === 1 && <TrendingUp className="w-8 h-8 text-primary" />}
                  {index === 2 && <Globe className="w-8 h-8 text-primary" />}
                </div>
                <h3 className="font-sora font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
              {t('about.cta.description')}
            </p>
            
            <WhatsAppButton 
              className="glass-button bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
              text={t('about.cta.button')}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default SobreNos;
