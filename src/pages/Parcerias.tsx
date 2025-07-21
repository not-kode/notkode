
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
  Zap
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
    <div className="min-h-screen bg-background">
      {/* Hero Section - Padronizado com página de Empresas */}
      <section className="relative py-20 px-8 overflow-hidden bg-background">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-primary/5 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center py-[40px]">
            {/* Badge - Padronizado com estilo Lovable */}
            <div className="relative inline-block mb-8 animate-fade-in-up">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 blur-md rounded-full animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 border border-primary/40 rounded-full px-6 py-2 backdrop-blur-sm">
                <div className="flex items-center">
                  <span className="inline-block w-2 h-2 bg-primary rounded-full mr-3 animate-pulse"></span>
                  <Handshake className="w-4 h-4 text-primary mr-2" />
                  <span className="text-sm font-medium text-primary/90 tracking-wide font-mono">Parceria Estratégica</span>
                </div>
              </div>
            </div>
            
            {/* Main Title */}
            <h1 className="font-sora font-bold text-4xl mb-8 animate-fade-in-up leading-tight">
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
            <p className="text-xl text-muted-foreground mb-8 animate-fade-in-up max-w-3xl mx-auto leading-relaxed">
              Torne-se uma agência completa com nossa expertise como seu braço técnico
            </p>
            
            {/* Social Proof Tags - Adicionado para consistência */}
            <div className="flex flex-wrap justify-center gap-6 text-sm animate-fade-in-up mb-8">
              <div className="flex items-center text-muted-foreground group">
                <Handshake className="w-4 h-4 text-primary mr-2" />
                <div className="text-lg font-bold text-primary mr-2">+20</div>
                <span className="relative">
                  Parcerias Ativas
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </span>
              </div>
              <div className="flex items-center text-muted-foreground group">
                <Star className="w-4 h-4 text-secondary mr-2" />
                <div className="text-lg font-bold text-secondary mr-2">95%</div>
                <span className="relative">
                  Taxa de Sucesso
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-secondary to-primary rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </span>
              </div>
              <div className="flex items-center text-muted-foreground group">
                <Calendar className="w-4 h-4 text-primary mr-2" />
                <div className="text-lg font-bold text-primary mr-2">24h</div>
                <span className="relative">
                  Tempo de Resposta
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </span>
              </div>
            </div>
            
            {/* CTA Button */}
            <div className="animate-fade-in-up">
              <WhatsAppButton 
                text="Quero Ser Parceiro"
                className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 text-base font-semibold rounded-full shadow-2xl hover:shadow-primary/25 hover:scale-105 transition-all duration-300 border-0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Padronizado */}
      <section className="py-20 px-8 bg-background">
        <div className="container mx-auto">
          <h2 className="font-sora font-bold text-4xl text-center mb-8">
            Por que <span className="text-gradient">escolher nossa parceria?</span>
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
            Vantagens exclusivas que transformam sua agência em uma operação completa
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
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

      {/* Services Section - Padronizado */}
      <section className="py-20 px-8 bg-background">
        <div className="container mx-auto">
          <h2 className="font-sora font-bold text-4xl text-center mb-8">
            <span className="text-gradient">{t('parcerias.services.title')}</span>
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
            Serviços completos que você pode oferecer aos seus clientes
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div key={index} className="glass-card group hover:scale-105">
                <div className="flex items-center justify-center mb-4">
                  <service.icon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="font-sora font-semibold text-xl mb-3 text-center min-h-[56px] flex items-center justify-center">
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

      {/* Portfolio Section */}
      <section id="portfolio" className="py-20 bg-background">
        <div className="px-8">
          <Portfolio />
        </div>
      </section>

      {/* Process Section - Redesenhado com estilo da página de Empresas */}
      <section className="relative py-20 px-8 overflow-hidden bg-background">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-secondary/3 to-primary/3 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="font-sora font-bold text-4xl mb-6">
              Como <span className="text-gradient">Funciona</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Um processo simples e transparente para escalar sua agência
            </p>
          </div>
          
          {/* Process Steps - Redesenhado */}
          <div className="relative max-w-6xl mx-auto my-[80px]">
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
                    <p className="text-muted-foreground text-base leading-relaxed">
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
                    <p className="text-muted-foreground text-base leading-relaxed">
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
                    <p className="text-muted-foreground text-base leading-relaxed">
                      Você recebe o projeto finalizado com qualidade Notkode. Suporte completo durante a entrega e implementação para garantir o sucesso.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resultado Final - Seção especial */}
            <div className="flex justify-center mt-20">
              <div className="glass-card max-w-4xl mx-auto text-center bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-3xl"></div>
                <div className="absolute top-4 right-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-secondary/10 rounded-full blur-xl"></div>
                
                <div className="relative z-10 p-8">
                  <div className="flex items-center justify-center mb-6">
                    <Brain className="w-12 h-12 text-primary mr-4" />
                    <Award className="w-12 h-12 text-secondary mx-2" />
                    <Bot className="w-12 h-12 text-primary ml-4" />
                  </div>
                  <h3 className="font-sora font-bold text-2xl md:text-3xl mb-4">
                    <span className="text-gradient">Expertise + Parceria + Resultados</span>
                  </h3>
                  <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                    A fórmula perfeita que transforma sua agência em uma operação completa, oferecendo soluções de alta qualidade sem os custos de contratação.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 text-sm">
                    <div className="flex items-center bg-primary/10 px-4 py-2 rounded-full">
                      <CheckCircle className="w-4 h-4 text-primary mr-2" />
                      <span>Margem Garantida</span>
                    </div>
                    <div className="flex items-center bg-secondary/10 px-4 py-2 rounded-full">
                      <Zap className="w-4 h-4 text-secondary mr-2" />
                      <span>Entrega Rápida</span>
                    </div>
                    <div className="flex items-center bg-primary/10 px-4 py-2 rounded-full">
                      <TrendingUp className="w-4 h-4 text-primary mr-2" />
                      <span>Crescimento Sustentável</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Padronizado */}
      <section className="py-12 px-8 bg-gradient-to-br from-primary to-secondary">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto p-8 rounded-3xl">
            <h2 className="font-sora font-bold text-4xl mb-6 text-white">
              Pronto para <span className="text-white/90">escalar</span> sua agência?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Entre em contato conosco e descubra como podemos ajudar você a oferecer mais serviços aos seus clientes sem aumentar seus custos.
            </p>
            <WhatsAppButton 
              text="Entrar em Contato" 
              className="bg-white text-primary px-8 py-4 text-base font-semibold rounded-full shadow-2xl hover:shadow-white/25 hover:scale-105 transition-all duration-300 border-0 hover:bg-white/90" 
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Parcerias;
