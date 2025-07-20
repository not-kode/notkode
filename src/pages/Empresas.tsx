import React from 'react';
import { 
  Building, 
  Rocket, 
  Bot, 
  Workflow, 
  Figma, 
  Smartphone, 
  ShoppingCart, 
  Globe,
  CheckCircle,
  Target,
  Zap,
  Brain,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import WhatsAppButton from '@/components/WhatsAppButton';

const Empresas: React.FC = () => {
  const { t } = useLanguage();

  const services = [
    {
      icon: Building,
      title: t('empresas.services.internal'),
      description: 'Sistemas de gestão, CRM, ERP e ferramentas específicas para seu negócio'
    },
    {
      icon: Rocket,
      title: t('empresas.services.saas'),
      description: 'Plataformas escaláveis para comercializar como produto'
    },
    {
      icon: Bot,
      title: t('empresas.services.ai'),
      description: 'Chatbots inteligentes e assistentes virtuais personalizados'
    },
    {
      icon: Workflow,
      title: t('empresas.services.automation'),
      description: 'Automação de processos e integrações entre sistemas'
    },
    {
      icon: Figma,
      title: t('empresas.services.figma'),
      description: 'Prototipagem e design de interfaces antes do desenvolvimento'
    },
    {
      icon: Globe,
      title: t('empresas.services.websites'),
      description: 'Sites institucionais e aplicações web responsivas'
    },
    {
      icon: Smartphone,
      title: t('empresas.services.mobile'),
      description: 'Apps nativos e híbridos para iOS e Android'
    },
    {
      icon: ShoppingCart,
      title: t('empresas.services.ecommerce'),
      description: 'Lojas virtuais otimizadas para conversão'
    }
  ];

  const differentials = [
    {
      icon: Target,
      title: t('empresas.differential.experience'),
      description: 'Mais de 3 anos desenvolvendo soluções que geram resultados reais'
    },
    {
      icon: CheckCircle,
      title: t('empresas.differential.diagnosis'),
      description: 'Analisamos seu negócio para identificar as melhores oportunidades'
    },
    {
      icon: Zap,
      title: t('empresas.differential.tools'),
      description: 'Escolhemos as tecnologias ideais para cada tipo de projeto'
    },
    {
      icon: TrendingUp,
      title: t('empresas.differential.value'),
      description: 'Priorizamos entregas que impactam diretamente nos seus resultados'
    },
    {
      icon: Brain,
      title: t('empresas.differential.knowledge'),
      description: 'Combinamos conhecimento técnico com experiência em negócios'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Mais criativo */}
      <section className="relative hero-gradient py-24 px-4 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-primary/5 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center glass-card px-4 py-2 mb-8 animate-fade-in-up">
              <Sparkles className="w-4 h-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Soluções Tecnológicas Sob Medida</span>
            </div>
            
            {/* Main Title */}
            <h1 className="font-sora font-bold text-4xl md:text-6xl lg:text-7xl mb-8 animate-fade-in-up leading-tight">
              Independente de qual o seu{' '}
              <span className="text-gradient relative">
                desafio
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary rounded-full opacity-50"></div>
              </span>
              , desenvolvemos tecnologia{' '}
              <span className="text-gradient">sobre medida</span> que acelera sua empresa em{' '}
              <span className="text-gradient">tempo recorde</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 animate-fade-in-up max-w-3xl mx-auto leading-relaxed">
              Transformamos ideias complexas em soluções simples que impulsionam o crescimento do seu negócio
            </p>
            
            {/* CTA Button - Preenchido e destacado */}
            <div className="animate-fade-in-up">
            <WhatsAppButton 
              text="Acelerar Minha Empresa"
              className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-primary/25 hover:scale-105 transition-all duration-300 border-0"
            />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="font-sora font-bold text-3xl md:text-4xl text-center mb-16">
            <span className="text-gradient">{t('empresas.services.title')}</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div key={index} className="glass-card group hover:scale-105">
                <div className="flex items-center justify-center mb-4">
                  <service.icon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="font-sora font-semibold text-lg mb-3 text-center min-h-[56px] flex items-center justify-center">
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

      {/* Differentials Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto">
          <h2 className="font-sora font-bold text-3xl md:text-4xl text-center mb-16">
            <span className="text-gradient">{t('empresas.differential.title')}</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {differentials.map((differential, index) => (
              <div key={index} className="glass-card group">
                <div className="flex items-center mb-4">
                  <differential.icon className="w-8 h-8 text-primary mr-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-sora font-semibold text-lg">{differential.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  {differential.description}
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
            Nosso <span className="text-gradient">Processo</span>
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="glass-card text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="font-sora font-semibold text-lg mb-3">Diagnóstico</h3>
              <p className="text-muted-foreground text-sm">
                Entendemos seu negócio e identificamos oportunidades
              </p>
            </div>
            
            <div className="glass-card text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="font-sora font-semibold text-lg mb-3">Planejamento</h3>
              <p className="text-muted-foreground text-sm">
                Definimos estratégia e escolhemos as melhores tecnologias
              </p>
            </div>
            
            <div className="glass-card text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="font-sora font-semibold text-lg mb-3">Desenvolvimento</h3>
              <p className="text-muted-foreground text-sm">
                Criamos a solução com acompanhamento em tempo real
              </p>
            </div>
            
            <div className="glass-card text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl group-hover:scale-110 transition-transform">
                4
              </div>
              <h3 className="font-sora font-semibold text-lg mb-3">Entrega</h3>
              <p className="text-muted-foreground text-sm">
                Lançamos sua solução e oferecemos suporte contínuo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Numbers */}
      <section className="py-20 px-4 bg-gradient-to-br from-secondary/5 to-primary/5">
        <div className="container mx-auto">
          <h2 className="font-sora font-bold text-3xl md:text-4xl text-center mb-16">
            Resultados <span className="text-gradient">Comprovados</span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="glass-card text-center group hover:scale-105">
              <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                50+
              </div>
              <div className="text-sm text-muted-foreground">
                Projetos Entregues
              </div>
            </div>
            
            <div className="glass-card text-center group hover:scale-105">
              <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                R$ 300k+
              </div>
              <div className="text-sm text-muted-foreground">
                Faturamento dos Clientes
              </div>
            </div>
            
            <div className="glass-card text-center group hover:scale-105">
              <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                100%
              </div>
              <div className="text-sm text-muted-foreground">
                Satisfação dos Clientes
              </div>
            </div>
            
            <div className="glass-card text-center group hover:scale-105">
              <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                3
              </div>
              <div className="text-sm text-muted-foreground">
                Anos de Experiência
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="glass-card max-w-3xl mx-auto">
            <h2 className="font-sora font-bold text-3xl md:text-4xl mb-6">
              Pronto para <span className="text-gradient">acelerar</span> sua empresa?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Entre em contato conosco e descubra como podemos transformar sua ideia em uma solução tecnológica de sucesso.
            </p>
            <WhatsAppButton 
              text="Entrar em Contato"
              className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-primary/25 hover:scale-105 transition-all duration-300 border-0" 
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Empresas;
