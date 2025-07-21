import React, { useEffect, useRef, useState } from 'react';
import { Building, Rocket, Bot, Workflow, Figma, Smartphone, ShoppingCart, Globe, CheckCircle, Target, Zap, Brain, TrendingUp, Award, Sparkles, ArrowRight, Star, Quote, Users, ThumbsUp, Calendar, DollarSign, Shield, Headphones, Heart, Timer } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import WhatsAppButton from '@/components/WhatsAppButton';
import Portfolio from '@/components/Portfolio';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const Empresas: React.FC = () => {
  const { t } = useLanguage();
  const processRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  const testimonials = [
    {
      text: "A Notkode foi primordial para o rápido lançamento do meu projeto. Desde o primeiro contato com a Camila, tive uma atenção fora da curva, desde a negociação, durante o projeto e a entrega do site em si. Altíssima qualidade, técnica, agilidade e seriedade. Recomendo fortemente!",
      author: "Bruno Coimbra",
      company: "Azure Assessoria de Investimentos"
    },
    {
      text: "Atendimento mega atencioso, atentos a cada detalhe e ideia, sempre com contrapontos lógicos e eficientes. O projeto foi entregue dentro do prazo e a qualidade foi perfeita. Indico com toda certeza.",
      author: "Rodrigo Nascimento", 
      company: "LTS Corretagem de Seguros"
    },
    {
      text: "Gostei muito de todo o processo, foi tudo muito profissional e podemos transformar rapidamente as ideias que tinha em realidade. Estou muito feliz com o resultado.",
      author: "Fernando Freitas",
      company: "Mark Tech"
    },
    {
      text: "A NotKode foi fundamental para o lançamento da ZapInside. Em pouco tempo já haviamos começado a desenvolver a ideia e em três semanas já estavamos recebendo o primeiro cliente. Super recomendo para todos os empreendedores que precisarem colocar usa ideia no ar!",
      author: "Giovanna Pretti",
      company: "ZapInside"
    },
    {
      text: "Depois que você atinge os primeiros 10 mil de faturamento com o seu SaaS, você precisa ir melhorando todo o seu funil, desde o site até o produto, para poder continuar crescendo e obtendo um bom LTV. A Notkode foi fundamental para otimizar toda a jornada do cliente e desenvolver o software ideal para conseguirmos superar o nosso desafio.",
      author: "Walter Neto",
      company: "AutoAgentes"
    }
  ];

  const services = [{
    icon: Building,
    title: t('empresas.services.internal'),
    description: 'Sistemas de gestão, CRM, ERP e ferramentas específicas para seu negócio'
  }, {
    icon: Rocket,
    title: t('empresas.services.saas'),
    description: 'Plataformas escaláveis para comercializar como produto'
  }, {
    icon: Bot,
    title: t('empresas.services.ai'),
    description: 'Chatbots inteligentes e assistentes virtuais personalizados'
  }, {
    icon: Workflow,
    title: t('empresas.services.automation'),
    description: 'Automação de processos e integrações entre sistemas'
  }, {
    icon: Figma,
    title: t('empresas.services.figma'),
    description: 'Prototipagem e design de interfaces antes do desenvolvimento'
  }, {
    icon: Globe,
    title: t('empresas.services.websites'),
    description: 'Sites institucionais e aplicações web responsivas'
  }, {
    icon: Smartphone,
    title: t('empresas.services.mobile'),
    description: 'Apps nativos e híbridos para iOS e Android'
  }, {
    icon: ShoppingCart,
    title: t('empresas.services.ecommerce'),
    description: 'Lojas virtuais otimizadas para conversão'
  }];

  const whyChooseUs = [
    {
      icon: DollarSign,
      title: "Custo-Benefício",
      description: "Projetos entregues em até 50% menos tempo, com economia de até 60% comparado ao desenvolvimento tradicional."
    },
    {
      icon: Bot,
      title: "Especialistas em Inteligência Artificial",
      description: "Trabalhamos com IA muito antes dela estar no hype (na moda), dominamos as mais avançadas tecnologias de IA para criar soluções realmente inteligentes."
    },
    {
      icon: Shield,
      title: "Escalabilidade",
      description: "Soluções que crescem junto com seu negócio, contando com protocolos de segurança avançados e atualizações automáticas."
    },
    {
      icon: Headphones,
      title: "Suporte Dedicado",
      description: "Acompanhamento completo durante e após o desenvolvimento. Estamos a uma mensagem de distância, com canal de contato 100% disponível. Precisou? É só nos chamar no Whatsapp!"
    }
  ];

  const processSteps = [
    {
      title: "Diagnóstico do Negócio",
      description: "Mergulhamos no seu negócio para entender desafios, oportunidades e objetivos. Mapeamos processos atuais e identificamos como a solução desejada vai impactar diretamente nos resultados.",
      icon: "🔍"
    },
    {
      title: "Estratégia Inteligente",
      description: "Definimos a arquitetura ideal, escolhemos as tecnologias mais adequadas e criamos nosso plano de ação onde cada decisão é pensada para obter o melhor tempo de entrega possível e maximizar o retorno do seu investimento.",
      icon: "🎯"
    },
    {
      title: "Desenvolvimento Ágil",
      description: "Ao utilizar as abordagens mais modernas, construímos sua solução em tempo recorde. Entregas incrementais permitem o seu acompanhamento em tempo real, garantindo que você veja o progresso e possa ajustar o rumo quando necessário.",
      icon: "⚡"
    },
    {
      title: "Lançamento & Crescimento",
      description: "Hora de decolar! Nossa estratégia de lançamento (go-live), conta com suporte contínuo, monitoramento de performance e melhorias baseadas em dados reais de uso, tudo pensado para que sua nova solução inicie seu ciclo com o pé direito.",
      icon: "🚀"
    },
    {
      title: "=",
      description: "A fórmula perfeita que entrega soluções tecnológicas que realmente impactam seus resultados, da forma que sua empresa precisa, em tempo recorde.",
      icon: "="
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!processRef.current) return;
      
      const rect = processRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementTop = rect.top;
      const elementHeight = rect.height;

      const scrollProgress = Math.max(0, Math.min(1, (windowHeight * 0.7 - elementTop) / (elementHeight * 0.8)));
      const stepIndex = Math.min(Math.floor(scrollProgress * processSteps.length), processSteps.length - 1);
      
      setActiveStep(stepIndex);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-20 px-8 overflow-hidden bg-background">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-primary/5 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center py-[40px]">
            <div className="relative inline-block mb-8 animate-fade-in-up">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 blur-md rounded-full animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 border border-primary/40 rounded-full px-6 py-2 backdrop-blur-sm">
                <div className="flex items-center">
                  <span className="inline-block w-2 h-2 bg-primary rounded-full mr-3 animate-pulse"></span>
                  <Sparkles className="w-4 h-4 text-primary mr-2" />
                  <span className="text-sm font-medium text-primary/90 tracking-wide font-mono">Soluções Tecnológicas Sob Medida</span>
                </div>
              </div>
            </div>
            
            <h1 className="font-sora font-bold text-4xl mb-8 animate-fade-in-up leading-tight">
              Desenvolvemos tecnologia{' '}
              <span className="text-gradient">sobre medida</span> que acelera sua empresa em{' '}
              <span className="text-gradient">tempo recorde</span>
            </h1>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm animate-fade-in-up mb-8">
              <div className="flex items-center text-muted-foreground group">
                <Building className="w-4 h-4 text-primary mr-2" />
                <div className="text-lg font-bold text-primary mr-2">+50</div>
                <span className="relative">
                  Projetos Entregues
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </span>
              </div>
              <div className="flex items-center text-muted-foreground group">
                <Star className="w-4 h-4 text-secondary mr-2" />
                <div className="text-lg font-bold text-secondary mr-2">9.8</div>
                <span className="relative">
                  Nota de Avaliação
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-secondary to-primary rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </span>
              </div>
              <div className="flex items-center text-muted-foreground group">
                <Calendar className="w-4 h-4 text-primary mr-2" />
                <div className="text-lg font-bold text-primary mr-2">+4</div>
                <span className="relative">
                  Anos de Experiência
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </span>
              </div>
            </div>
            
            <div className="animate-fade-in-up">
              <WhatsAppButton text="Acelerar Minha Empresa" className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 text-base font-semibold rounded-full shadow-2xl hover:shadow-primary/25 hover:scale-105 transition-all duration-300 border-0" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-8 bg-background">
        <div className="container mx-auto">
          <h2 className="font-sora font-bold text-4xl text-center mb-16">
            <span className="text-gradient">{t('empresas.services.title')}</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <section id="portfolio" className="py-20 bg-background">
        <div className="px-8">
          <Portfolio />
        </div>
      </section>

      <section className="py-20 px-8 bg-background">
        <div className="container mx-auto">
          <h2 className="font-sora font-bold text-4xl text-center mb-8">
            Por que escolher a <span className="text-gradient">NotKode?</span>
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
            Desenvolvemos soluções modernas que oferecem vantagens reais para seu negócio
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="glass-card group hover:scale-105">
                <div className="flex items-center mb-4">
                  <item.icon className="w-8 h-8 text-primary mr-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-sora font-semibold text-xl">{item.title}</h3>
                </div>
                <p className="text-muted-foreground text-base">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-8 bg-background">
        <div className="container mx-auto">
          <h2 className="font-sora font-bold text-4xl text-center mb-16">
            O que nossos <span className="text-gradient">clientes dizem</span>
          </h2>
          
          <div className="max-w-6xl mx-auto">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <div className="glass-card h-full group hover:scale-105">
                      <div className="flex items-center justify-center mb-4">
                        <Quote className="w-8 h-8 text-primary opacity-60" />
                      </div>
                      
                      <p className="text-muted-foreground text-base mb-6 leading-relaxed">
                        "{testimonial.text}"
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-sora font-semibold text-sm mb-1">
                            {testimonial.author}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {testimonial.company}
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-primary fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0 md:-left-12" />
              <CarouselNext className="right-0 md:-right-12" />
            </Carousel>
          </div>
        </div>
      </section>

      <section ref={processRef} className="relative py-20 px-8 overflow-hidden min-h-screen bg-background">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="font-sora font-bold text-4xl mb-6">
              Nosso <span className="text-gradient">Passo a Passo</span> para o Sucesso
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Uma metodologia validada que transforma suas ideias em soluções de sucesso
            </p>
          </div>
          
          <div className="relative max-w-6xl mx-auto my-[80px] px-4">
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-primary/30 via-secondary/30 to-primary/30 hidden lg:block" style={{
              height: 'calc(100% - 4rem)'
            }}></div>
            
            {processSteps.map((step, index) => {
              const isActive = activeStep >= index;
              const isLeft = index % 2 === 0;
              const isEqualsStep = step.title === "=";

              if (isEqualsStep) {
                return (
                  <div key={index} className="flex justify-center mb-32 relative px-8">
                    <div className={`transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-4'}`}>
                      <div className="glass-card max-w-4xl mx-auto text-center bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20 relative overflow-hidden">
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
                            <span className="text-gradient">Conhecimento em Negócios + Desenvolvimento + IA</span>
                          </h3>
                          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                            {step.description}
                          </p>
                          <div className="flex flex-wrap justify-center gap-4 text-sm">
                            <div className="flex items-center bg-primary/10 px-4 py-2 rounded-full">
                              <CheckCircle className="w-4 h-4 text-primary mr-2" />
                              <span>Solução Sob Medida</span>
                            </div>
                            <div className="flex items-center bg-secondary/10 px-4 py-2 rounded-full">
                              <Zap className="w-4 h-4 text-secondary mr-2" />
                              <span>Tempo Recorde</span>
                            </div>
                            <div className="flex items-center bg-primary/10 px-4 py-2 rounded-full">
                              <TrendingUp className="w-4 h-4 text-primary mr-2" />
                              <span>Resultados Garantidos</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={index} className="flex items-center mb-32 relative group px-8">
                  <div className={`absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full shadow-lg border-4 border-background z-10 hidden lg:block transition-all duration-500 ${isActive ? 'bg-primary scale-125 shadow-primary/50' : 'bg-muted scale-100'}`}></div>
                  
                  <div className={`w-full lg:w-1/2 ${isLeft ? 'lg:pr-32' : 'lg:pl-32 lg:ml-auto'} transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-4'} relative`}>
                    <div className={`glass-card group hover:scale-105 transition-all duration-300 hover:shadow-2xl transform ${isActive ? 'translate-x-0 opacity-100 scale-100' : 'opacity-70 scale-95'} ${isLeft ? 'translate-x-16' : '-translate-x-16'}`}>
                      <div className="flex items-center mb-6">
                        <div className={`w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white font-bold text-2xl group-hover:scale-110 transition-transform shadow-lg ${isActive ? 'animate-pulse shadow-primary/50' : ''}`}>
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        <div className="ml-6">
                          <h3 className="font-sora font-bold text-xl mb-2">{step.title}</h3>
                          <div className={`w-20 h-1 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 ${isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-50'}`}></div>
                        </div>
                      </div>
                      
                      <div className={`lg:hidden transition-all duration-500 mt-4 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-6">
                          <div className="flex items-center mb-3">
                            <div className="text-4xl opacity-80 mr-3">
                              {step.icon}
                            </div>
                            <div className="flex-1">
                              <p className="text-muted-foreground text-sm leading-relaxed">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`hidden lg:block w-1/2 ${isLeft ? 'pl-20' : 'pr-20'} transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="glass rounded-3xl p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 shadow-lg shadow-primary/10 transform translate-x-8">
                      <div className="flex items-center mb-4">
                        <div className="text-6xl opacity-80 mr-4">
                          {step.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-muted-foreground text-base leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-8 bg-gradient-to-br from-primary to-secondary">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto p-8 rounded-3xl">
            <h2 className="font-sora font-bold text-4xl mb-6 text-white">
              {t('cta.empresas.title')}
            </h2>
            <p className="text-xl text-white/90 mb-12">
              {t('cta.empresas.subtitle')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mb-12">
              <div className="flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-4 text-white/90 group hover:bg-white/20 transition-all duration-300">
                <Sparkles className="w-5 h-5 mr-3" />
                <div>
                  <div className="text-lg font-bold text-white">Diagnóstico Gratuito</div>
                  <span className="text-white/80">Análise completa do seu negócio</span>
                </div>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-4 text-white/90 group hover:bg-white/20 transition-all duration-300">
                <Timer className="w-5 h-5 mr-3" />
                <div>
                  <div className="text-lg font-bold text-white">Entrega Rápida</div>
                  <span className="text-white/80">Projetos em tempo recorde</span>
                </div>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-4 text-white/90 group hover:bg-white/20 transition-all duration-300">
                <Heart className="w-5 h-5 mr-3" />
                <div>
                  <div className="text-lg font-bold text-white">Suporte Dedicado</div>
                  <span className="text-white/80">Acompanhamento total do projeto</span>
                </div>
              </div>
            </div>
            
            <WhatsAppButton text="Entrar em Contato" className="bg-white text-primary px-8 py-4 text-base font-semibold rounded-full shadow-2xl hover:shadow-white/25 hover:scale-105 transition-all duration-300 border-0 hover:bg-white/90" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Empresas;
