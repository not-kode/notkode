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
  CheckCircle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import WhatsAppButton from '@/components/WhatsAppButton';

const Parcerias: React.FC = () => {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: Users,
      title: t('parcerias.benefits.hiring'),
      description: 'Amplie seu portfólio sem os custos e complexidade de contratação'
    },
    {
      icon: TrendingUp,
      title: t('parcerias.benefits.services'),
      description: 'Torne-se uma agência full-service oferecendo soluções completas'
    },
    {
      icon: Shield,
      title: t('parcerias.benefits.margin'),
      description: 'Margens atrativas sem investimento em infraestrutura ou equipe'
    },
    {
      icon: Award,
      title: t('parcerias.benefits.delivery'),
      description: 'Qualidade premium garantida com nosso track record comprovado'
    },
    {
      icon: Lightbulb,
      title: t('parcerias.benefits.expertise'),
      description: 'Acesso a expertise em IA, no-code e tecnologias de ponta'
    }
  ];

  const services = [
    {
      icon: Bot,
      title: t('parcerias.services.ai'),
      description: 'Agentes conversacionais e automação inteligente'
    },
    {
      icon: Workflow,
      title: t('parcerias.services.automation'),
      description: 'Integrações e automações personalizadas'
    },
    {
      icon: Rocket,
      title: t('parcerias.services.saas'),
      description: 'Plataformas SaaS escaláveis e robustas'
    },
    {
      icon: Globe,
      title: t('parcerias.services.apps'),
      description: 'Sites responsivos e aplicativos modernos'
    },
    {
      icon: ShoppingCart,
      title: t('parcerias.services.ecommerce'),
      description: 'E-commerces otimizados para conversão'
    },
    {
      icon: Palette,
      title: t('parcerias.services.design'),
      description: 'UX/UI design focado em resultados de negócio'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="font-sora font-bold text-4xl md:text-6xl mb-8 animate-fade-in-up max-w-4xl mx-auto">
            <span className="text-gradient">{t('parcerias.hero.title')}</span>
          </h1>
          <div className="animate-fade-in-up">
            <WhatsAppButton className="text-lg px-8 py-4" />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="font-sora font-bold text-3xl md:text-4xl text-center mb-16">
            <span className="text-gradient">{t('parcerias.benefits.title')}</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="glass-card group">
                <div className="flex items-center mb-4">
                  <benefit.icon className="w-8 h-8 text-primary mr-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-sora font-semibold text-lg">{benefit.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto">
          <h2 className="font-sora font-bold text-3xl md:text-4xl text-center mb-16">
            <span className="text-gradient">{t('parcerias.services.title')}</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="glass-card group hover:scale-105">
                <div className="flex items-center justify-center mb-4">
                  <service.icon className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="font-sora font-semibold text-lg mb-3 text-center">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-center text-sm">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="font-sora font-bold text-3xl md:text-4xl text-center mb-16">
            Como <span className="text-gradient">Funciona</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="glass-card text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="font-sora font-semibold text-lg mb-3">Apresente o Projeto</h3>
              <p className="text-muted-foreground text-sm">
                Compartilhe os detalhes do projeto do seu cliente conosco
              </p>
            </div>
            
            <div className="glass-card text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="font-sora font-semibold text-lg mb-3">Receba Proposta</h3>
              <p className="text-muted-foreground text-sm">
                Elaboramos cronograma, valores e especificações técnicas
              </p>
            </div>
            
            <div className="glass-card text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="font-sora font-semibold text-lg mb-3">Entregamos Pronto</h3>
              <p className="text-muted-foreground text-sm">
                Você recebe o projeto finalizado com qualidade Notkode
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="glass-card max-w-3xl mx-auto">
            <h2 className="font-sora font-bold text-3xl md:text-4xl mb-6">
              Pronto para <span className="text-gradient">escalar</span> sua agência?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Entre em contato conosco e descubra como podemos ajudar você a oferecer mais serviços aos seus clientes sem aumentar seus custos.
            </p>
            <WhatsAppButton className="text-lg px-8 py-4" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Parcerias;