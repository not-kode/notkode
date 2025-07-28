import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import WhatsAppButton from '@/components/WhatsAppButton';
import { CheckCircle, Globe, TrendingUp, MessageCircle, Mail, MapPin } from 'lucide-react';
const SobreNos: React.FC = () => {
  const {
    t
  } = useLanguage();
  const timelineItems = t('about.timeline.items') as Array<{
    date: string;
    title: string;
    description: string;
  }>;
  const ctaFeatures = t('about.cta.features') as Array<{
    title: string;
    description: string;
  }>;
  return <div className="min-h-screen pt-20 md:pt-16 bg-background">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-[1100px] text-center">
          <div className="relative inline-block mb-8 animate-fade-in-up">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 blur-md rounded-full animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 border border-primary/40 rounded-full px-6 py-2 backdrop-blur-sm">
              <div className="flex items-center">
                <span className="inline-block w-2 h-2 bg-primary rounded-full mr-3 animate-pulse"></span>
                <span className="text-sm font-medium text-primary/90 tracking-wide font-mono">{t('about.hero.badge')}</span>
              </div>
            </div>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed">
            {t('about.hero.description')}
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-[1400px] mx-auto">
           <div className="glass-card flex items-center gap-4 p-[18px] py-[8px]">
  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
    <MessageCircle className="w-5 h-5 text-primary" />
  </div>
  <div className="text-left">
    <h3 className="font-sora font-bold text-lg mb-1 text-primary">{t('about.contact.whatsapp')}</h3>
    <p className="text-muted-foreground">+55 11 95138-1254</p>
  </div>
          </div>
            <div className="glass-card flex items-center gap-4 px-[18px] py-[8px]">
  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
    <Mail className="w-6 h-6 text-primary" />
  </div>
  <div className="text-left">
    <h3 className="font-sora font-bold text-lg mb-1 text-primary">{t('about.contact.email')}</h3>
    <p className="text-muted-foreground">camila@notkode.com.br</p>
  </div>
          </div>
            <div className="glass-card flex items-center gap-4 px-[18px] py-[8px]">
  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
    <MapPin className="w-6 h-6 text-primary" />
  </div>
  <div className="text-left">
    <h3 className="font-sora font-bold text-lg mb-1 text-primary">{t('about.contact.location')}</h3>
    <p className="text-muted-foreground">{t('about.contact.locationValue')}</p>
  </div>
          </div>
          </div>
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
              {timelineItems.map((item: any, index: number) => <div key={index} className="relative flex items-start md:items-center">
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
                </div>)}
            </div>
          </div>
        </div>
      </section>

   {/* Founders Section */}
<section className="py-12 md:py-20 px-4 relative" style={{ backgroundColor: 'var(--background)' }}>
  <div className="absolute inset-0 dark:bg-[#111320] dark:block hidden"></div>
  {/* Simple animated circles for dark mode only */}
  <div className="absolute inset-0 pointer-events-none z-0 dark:block hidden">
    <div className="absolute top-1/4 left-1/4 w-36 h-36 bg-[#8EE2E5] opacity-30 rounded-full blur-xl animate-pulse"></div>
    <div className="absolute bottom-1/3 right-1/4 w-28 h-28 bg-[#8EE2E5] opacity-25 rounded-full blur-lg animate-pulse delay-1000"></div>
  </div>

  <div className="container mx-auto max-w-6xl relative z-10">
    <h2 className="font-sora font-bold text-2xl md:text-4xl mb-6 md:mb-16 text-center">
      <span className="text-[#101420] dark:text-white">{t('about.founders.title')}</span>
    </h2>
    
    <div className="grid md:grid-cols-2 gap-8 md:gap-12">
      {/* Camila */}
      <div className="glass-card text-center bg-white/[0.42]">
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-primary/20">
            <img src="https://media.licdn.com/dms/image/v2/D4D03AQHN8KBb8CeCTw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1719845395227?e=1755734400&v=beta&t=P1DLP0YNtGKxQehMREushPTcxLNYH31ym6pb4KbZ2kM" alt="Camila Tonelotto" className="w-full h-full object-cover" />
          </div>
          <h3 className="font-sora font-bold text-xl mb-1" style={{
            color: '#101420'
          }}>{t('about.founders.camila.name')}</h3>
          <div className="text-primary text-sm font-medium mb-4 bg-white/[0.99] rounded-md px-3 py-1.5">{t('about.founders.camila.role')}</div>
          <p className="text-muted-foreground dark:text-[#111320] mb-6 leading-relaxed">
            {t('about.founders.camila.description')}
          </p>
          <a href="https://www.linkedin.com/in/gregoriocamila/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-[#101420] px-4 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105 border border-primary/20">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            {t('about.founders.camila.linkedin')}
          </a>
        </div>
      </div>

      {/* Matheus */}
      <div className="glass-card text-center bg-white/50">
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-primary/20">
            <img src="https://media.licdn.com/dms/image/v2/C4D03AQGd8lA9yG-Mqw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1534949512919?e=1755734400&v=beta&t=2w9hliqnKjhoZPhLo6MDYCD1-StXXGu9Z7dBRh2gjP8" alt="Matheus Tonelotto" className="w-full h-full object-cover" />
          </div>
          <h3 className="font-sora font-bold text-xl mb-1" style={{
            color: '#101420'
          }}>{t('about.founders.matheus.name')}</h3>
          <div className="text-primary text-sm font-medium mb-4 bg-white/[0.99] rounded-md px-3 py-1.5">{t('about.founders.matheus.role')}</div>
          <p className="text-muted-foreground dark:text-[#111320] mb-6 leading-relaxed">
            {t('about.founders.matheus.description')}
          </p>
          <a href="https://www.linkedin.com/in/matheustonelotto/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-[#101420] px-4 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105 border border-primary/20">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            {t('about.founders.matheus.linkedin')}
          </a>
        </div>
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
            {ctaFeatures.map((feature: any, index: number) => <div key={index} className="glass-card text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  {index === 0 && <CheckCircle className="w-8 h-8 text-primary" />}
                  {index === 1 && <TrendingUp className="w-8 h-8 text-primary" />}
                  {index === 2 && <Globe className="w-8 h-8 text-primary" />}
                </div>
                <h3 className="font-sora font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>)}
          </div>
          
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
              {t('about.cta.description')}
            </p>
            
            <WhatsAppButton className="glass-button bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105" text={t('about.cta.button')} />
          </div>
        </div>
      </section>
    </div>;
};
export default SobreNos;