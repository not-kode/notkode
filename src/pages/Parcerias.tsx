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
  Handshake
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import WhatsAppButton from '@/components/WhatsAppButton';
import Portfolio from '@/components/Portfolio';

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
    },
    {
      icon: Bot,
      title: 'Especialistas em Inteligência Artificial',
      description: 'Equipe especializada nas mais avançadas tecnologias de IA e automação'
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
      {/* Hero Section - Mais criativo */}
      <section className="relative hero-gradient py-24 px-4 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-secondary/5 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center glass-card px-4 py-2 mb-8 animate-fade-in-up">
              <Handshake className="w-4 h-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Parceria Estratégica</span>
            </div>
            
            {/* Main Title */}
            <h1 className="font-sora font-bold text-4xl md:text-6xl lg:text-7xl mb-8 animate-fade-in-up leading-tight">
              <span className="text-gradient relative">
                Multiplique
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary rounded-full opacity-50"></div>
              </span>{' '}
              sua receita oferecendo{' '}
              <span className="text-gradient">desenvolvimento</span> e{' '}
              <span className="text-gradient">design</span> sem contratar{' '}
              <span className="text-gradient">ninguém</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 animate-fade-in-up max-w-3xl mx-auto leading-relaxed">
              Torne-se uma agência completa com nossa expertise como seu braço técnico
            </p>
            
            {/* CTA Button - Preenchido e destacado */}
            <div className="animate-fade-in-up">
              <WhatsAppButton 
                text="Quero Ser Parceiro"
                className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-primary/25 hover:scale-105 transition-all duration-300 border-0"
              />
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              <div className="glass-card text-center">
                <div className="text-2xl font-bold text-gradient mb-1">50+</div>
                <div className="text-sm text-muted-foreground">Projetos Entregues</div>
              </div>
              <div className="glass-card text-center">
                <div className="text-2xl font-bold text-gradient mb-1">100%</div>
                <div className="text-sm text-muted-foreground">Satisfação</div>
              </div>
              <div className="glass-card text-center">
                <div className="text-2xl font-bold text-gradient mb-1">24h</div>
                <div className="text-sm text-muted-foreground">Resposta</div>
              </div>
            </div>
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

      {/* Portfolio Section - Moved after Services */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <Portfolio />
      </section>

      {/* Process Section - Creative Design */}
      <section className="relative py-32 px-4 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-secondary/3 to-primary/3 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="font-sora font-bold text-4xl md:text-6xl mb-6">
              Como <span className="text-gradient">Funciona</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Um processo simples e transparente para escalar sua agência
            </p>
          </div>
          
          {/* Process Steps - Creative horizontal flow */}
          <div className="relative max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Step 1 */}
              <div className="relative">
                <div className="glass-card group hover:scale-105 transition-all duration-500 hover:shadow-2xl text-center">
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                      01
                    </div>
                  </div>
                  <div className="pt-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl">
                      📋
                    </div>
                    <h3 className="font-sora font-bold text-2xl mb-4">Apresente o Projeto</h3>
                    <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Compartilhe os detalhes do projeto do seu cliente conosco. Analisamos requisitos, objetivos e expectativas para criar a proposta ideal.
                    </p>
                  </div>
                </div>
                {/* Arrow */}
                <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 text-primary text-3xl">
                  →
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="glass-card group hover:scale-105 transition-all duration-500 hover:shadow-2xl text-center">
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <div className="w-16 h-16 bg-gradient-to-br from-secondary to-primary rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                      02
                    </div>
                  </div>
                  <div className="pt-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl">
                      💡
                    </div>
                    <h3 className="font-sora font-bold text-2xl mb-4">Receba Proposta</h3>
                    <div className="w-20 h-1 bg-gradient-to-r from-secondary to-primary rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Elaboramos cronograma detalhado, valores transparentes e especificações técnicas completas. Tudo personalizado para o projeto específico.
                    </p>
                  </div>
                </div>
                {/* Arrow */}
                <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 text-secondary text-3xl">
                  →
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="glass-card group hover:scale-105 transition-all duration-500 hover:shadow-2xl text-center">
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                      03
                    </div>
                  </div>
                  <div className="pt-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl">
                      🚀
                    </div>
                    <h3 className="font-sora font-bold text-2xl mb-4">Entregamos Pronto</h3>
                    <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Você recebe o projeto finalizado com qualidade Notkode. Suporte completo durante a entrega e implementação para garantir o sucesso.
                    </p>
                  </div>
                </div>
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
              Pronto para <span className="text-gradient">escalar</span> sua agência?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Entre em contato conosco e descubra como podemos ajudar você a oferecer mais serviços aos seus clientes sem aumentar seus custos.
            </p>
            <WhatsAppButton className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-primary/25 hover:scale-105 transition-all duration-300 border-0" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Parcerias;
