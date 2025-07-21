
import React from 'react';
import { 
  Users, 
  TrendingUp, 
  Shield, 
  Award, 
  Lightbulb,
  Bot,
  Workflow,
  Rocket,
  Globe,
  ShoppingCart,
  Palette,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Handshake,
  Star,
  Calendar,
  Brain,
  Zap,
  Timer,
  Heart,
  Building
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import WhatsAppButton from '@/components/WhatsAppButton';
import Portfolio from '@/components/Portfolio';

const Parcerias: React.FC = () => {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: Users,
      title: t('parcerias.benefit1.title'),
      description: t('parcerias.benefit1.desc')
    },
    {
      icon: Bot,
      title: t('parcerias.benefit2.title'),
      description: t('parcerias.benefit2.desc')
    },
    {
      icon: Award,
      title: t('parcerias.benefit3.title'),
      description: t('parcerias.benefit3.desc')
    }
  ];

  const services = [
    {
      icon: Bot,
      title: t('parcerias.services.ai'),
      description: t('parcerias.service1.desc')
    },
    {
      icon: Workflow,
      title: t('parcerias.services.automation'),
      description: t('parcerias.service2.desc')
    },
    {
      icon: Rocket,
      title: t('parcerias.services.saas'),
      description: t('parcerias.service3.desc')
    },
    {
      icon: Globe,
      title: t('parcerias.services.apps'),
      description: t('parcerias.service4.desc')
    },
    {
      icon: ShoppingCart,
      title: t('parcerias.services.ecommerce'),
      description: t('parcerias.service5.desc')
    },
    {
      icon: Palette,
      title: t('parcerias.services.design'),
      description: t('parcerias.service6.desc')
    }
  ];

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-8 overflow-hidden bg-background">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-primary/5 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>
        
        <div className="w-full max-w-7xl mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center py-[40px]">
            {/* Badge */}
            <div className="relative inline-block mb-8 animate-fade-in-up">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 blur-md rounded-full animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 border border-primary/40 rounded-full px-4 md:px-6 py-2 backdrop-blur-sm">
                <div className="flex items-center">
                  <span className="inline-block w-2 h-2 bg-primary rounded-full mr-3 animate-pulse"></span>
                  <Handshake className="w-4 h-4 text-primary mr-2" />
                  <span className="text-sm font-medium text-primary/90 tracking-wide font-mono">{t('parcerias.hero.badge')}</span>
                </div>
              </div>
            </div>
            
            {/* Main Title */}
            <h1 className="font-sora font-bold text-3xl md:text-4xl mb-8 animate-fade-in-up leading-tight px-4">
              {t('parcerias.hero.title')}
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in-up max-w-3xl mx-auto leading-relaxed px-4">
              {t('parcerias.hero.subtitle')}
            </p>
            
            {/* Social Proof Tags */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm animate-fade-in-up mb-8 px-4">
              <div className="flex items-center text-muted-foreground group">
                <Building className="w-4 h-4 text-primary mr-2" />
                <div className="text-lg font-bold text-primary mr-2">+50</div>
                <span className="relative">
                  {t('empresas.stats.projects')}
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </span>
              </div>
              <div className="flex items-center text-muted-foreground group">
                <Star className="w-4 h-4 text-secondary mr-2" />
                <div className="text-lg font-bold text-secondary mr-2">9.8</div>
                <span className="relative">
                  {t('empresas.stats.rating')}
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-secondary to-primary rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </span>
              </div>
              <div className="flex items-center text-muted-foreground group">
                <Calendar className="w-4 h-4 text-primary mr-2" />
                <div className="text-lg font-bold text-primary mr-2">+4</div>
                <span className="relative">
                  {t('empresas.stats.experience')}
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </span>
              </div>
            </div>
            
            {/* CTA Button */}
            <div className="animate-fade-in-up px-4">
              <WhatsAppButton 
                text={t('parcerias.hero.cta')}
                className="bg-gradient-to-r from-primary to-secondary text-white px-6 md:px-8 py-3 md:py-4 text-sm md:text-base font-semibold rounded-full shadow-2xl hover:shadow-primary/25 hover:scale-105 transition-all duration-300 border-0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 md:px-8 bg-background">
        <div className="w-full max-w-7xl mx-auto">
          <h2 className="font-sora font-bold text-3xl md:text-4xl text-center mb-8">
            {t('parcerias.benefits.main_title')}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto px-4">
            {t('parcerias.benefits.main_subtitle')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="glass-card group hover:scale-105">
                <div className="flex items-center mb-4">
                  <benefit.icon className="w-8 h-8 text-primary mr-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-sora font-semibold text-lg">{benefit.title}</h3>
                </div>
                <p className="text-muted-foreground text-base">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-20 bg-background">
        <div className="px-4 md:px-8">
          <Portfolio />
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 md:px-8 bg-background">
        <div className="w-full max-w-7xl mx-auto">
          <h2 className="font-sora font-bold text-3xl md:text-4xl text-center mb-8">
            <span className="text-gradient">{t('parcerias.services.main_title')}</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto px-4">
            {t('parcerias.services.main_subtitle')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div key={index} className="glass-card group hover:scale-105">
                <div className="flex items-center justify-center mb-4">
                  <service.icon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="font-sora font-semibold text-lg md:text-xl mb-3 text-center min-h-[56px] flex items-center justify-center">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-center text-base">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="relative py-20 px-4 md:px-8 overflow-hidden bg-background">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-secondary/3 to-primary/3 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="w-full max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="font-sora font-bold text-3xl md:text-4xl mb-6">
              {t('parcerias.process.title')}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              {t('parcerias.process.subtitle')}
            </p>
          </div>
          
          {/* Process Steps */}
          <div className="relative max-w-4xl mx-auto">
            <div className="flex flex-col items-center space-y-12 md:space-y-16">
              {/* Step 1 */}
              <div className="w-full max-w-2xl">
                <div className="glass-card group hover:scale-105 transition-all duration-500 hover:shadow-2xl text-center">
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                      📋
                    </div>
                  </div>
                  <div className="pt-12">
                    <h3 className="font-sora font-bold text-xl md:text-2xl mb-4">{t('parcerias.process.step1.title')}</h3>
                    <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      {t('parcerias.process.step1.desc')}
                    </p>
                  </div>
                </div>
                {/* Vertical Arrow */}
                <div className="flex justify-center my-6 md:my-8">
                  <div className="text-primary text-2xl md:text-3xl transform rotate-90">
                    →
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="w-full max-w-2xl">
                <div className="glass-card group hover:scale-105 transition-all duration-500 hover:shadow-2xl text-center">
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <div className="w-16 h-16 bg-gradient-to-br from-secondary to-primary rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                      💡
                    </div>
                  </div>
                  <div className="pt-12">
                    <h3 className="font-sora font-bold text-xl md:text-2xl mb-4">{t('parcerias.process.step2.title')}</h3>
                    <div className="w-20 h-1 bg-gradient-to-r from-secondary to-primary rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      {t('parcerias.process.step2.desc')}
                    </p>
                  </div>
                </div>
                {/* Vertical Arrow */}
                <div className="flex justify-center my-6 md:my-8">
                  <div className="text-secondary text-2xl md:text-3xl transform rotate-90">
                    →
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="w-full max-w-2xl">
                <div className="glass-card group hover:scale-105 transition-all duration-500 hover:shadow-2xl text-center">
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                      ⚙️
                    </div>
                  </div>
                  <div className="pt-12">
                    <h3 className="font-sora font-bold text-xl md:text-2xl mb-4">{t('parcerias.process.step3.title')}</h3>
                    <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      {t('parcerias.process.step3.desc')}
                    </p>
                  </div>
                </div>
                {/* Vertical Arrow */}
                <div className="flex justify-center my-6 md:my-8">
                  <div className="text-primary text-2xl md:text-3xl transform rotate-90">
                    →
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="w-full max-w-2xl">
                <div className="glass-card group hover:scale-105 transition-all duration-500 hover:shadow-2xl text-center">
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <div className="w-16 h-16 bg-gradient-to-br from-secondary to-primary rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                      🚀
                    </div>
                  </div>
                  <div className="pt-12">
                    <h3 className="font-sora font-bold text-xl md:text-2xl mb-4">{t('parcerias.process.step4.title')}</h3>
                    <div className="w-20 h-1 bg-gradient-to-r from-secondary to-primary rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      {t('parcerias.process.step4.desc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resultado Final */}
            <div className="flex justify-center mt-16 md:mt-20">
              <div className="glass-card max-w-4xl mx-auto text-center bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-3xl"></div>
                <div className="absolute top-4 right-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-secondary/10 rounded-full blur-xl"></div>
                
                <div className="relative z-10 p-6 md:p-8">
                  <div className="flex items-center justify-center mb-6">
                    <Brain className="w-10 md:w-12 h-10 md:h-12 text-primary mr-2 md:mr-4" />
                    <Award className="w-10 md:w-12 h-10 md:h-12 text-secondary mx-1 md:mx-2" />
                    <Bot className="w-10 md:w-12 h-10 md:h-12 text-primary ml-2 md:ml-4" />
                  </div>
                  <h3 className="font-sora font-bold text-xl md:text-2xl lg:text-3xl mb-4">
                    <span className="text-gradient">{t('parcerias.process.result.title')}</span>
                  </h3>
                  <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                    {t('parcerias.process.result.desc')}
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 md:gap-4 text-sm">
                    <div className="flex items-center bg-primary/10 px-3 md:px-4 py-2 rounded-full">
                      <CheckCircle className="w-4 h-4 text-primary mr-2" />
                      <span>{t('parcerias.process.result.tag1')}</span>
                    </div>
                    <div className="flex items-center bg-secondary/10 px-3 md:px-4 py-2 rounded-full">
                      <Zap className="w-4 h-4 text-secondary mr-2" />
                      <span>{t('parcerias.process.result.tag2')}</span>
                    </div>
                    <div className="flex items-center bg-primary/10 px-3 md:px-4 py-2 rounded-full">
                      <TrendingUp className="w-4 h-4 text-primary mr-2" />
                      <span>{t('parcerias.process.result.tag3')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 bg-gradient-to-br from-primary to-secondary">
        <div className="w-full max-w-7xl mx-auto text-center">
          <div className="max-w-4xl mx-auto p-6 md:p-8 rounded-3xl">
            <h2 className="font-sora font-bold text-3xl md:text-4xl mb-6 text-white px-4">
              {t('cta.parcerias.title')}
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-12 px-4">
              {t('cta.parcerias.subtitle')}
            </p>
            
            {/* Three Topics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-sm mb-12">
              <div className="flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 md:px-6 py-4 text-white/90 group hover:bg-white/20 transition-all duration-300">
                <Sparkles className="w-5 h-5 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <div className="text-base md:text-lg font-bold text-white">{t('parcerias.cta.feature1.title')}</div>
                  <span className="text-white/80 text-sm">{t('parcerias.cta.feature1.desc')}</span>
                </div>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 md:px-6 py-4 text-white/90 group hover:bg-white/20 transition-all duration-300">
                <Heart className="w-5 h-5 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <div className="text-base md:text-lg font-bold text-white">{t('parcerias.cta.feature2.title')}</div>
                  <span className="text-white/80 text-sm">{t('parcerias.cta.feature2.desc')}</span>
                </div>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 md:px-6 py-4 text-white/90 group hover:bg-white/20 transition-all duration-300">
                <Zap className="w-5 h-5 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <div className="text-base md:text-lg font-bold text-white">{t('parcerias.cta.feature3.title')}</div>
                  <span className="text-white/80 text-sm">{t('parcerias.cta.feature3.desc')}</span>
                </div>
              </div>
            </div>
            
            <WhatsAppButton 
              text={t('common.contact')}
              className="bg-white text-primary px-6 md:px-8 py-3 md:py-4 text-sm md:text-base font-semibold rounded-full shadow-2xl hover:shadow-white/25 hover:scale-105 transition-all duration-300 border-0 hover:bg-white/90" 
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Parcerias;
