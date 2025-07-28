import React, { useEffect, useRef, useState } from 'react';
import { Building, Rocket, Bot, Workflow, Figma, Smartphone, ShoppingCart, Globe, CheckCircle, Target, Zap, Brain, TrendingUp, Award, Sparkles, ArrowRight, Star, Quote, Users, ThumbsUp, Calendar, DollarSign, Shield, Headphones, Heart, Timer } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import WhatsAppButton from '@/components/WhatsAppButton';
import Portfolio from '@/components/Portfolio';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
const Empresas: React.FC = () => {
  const {
    t
  } = useLanguage();
  const processRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const testimonials = [{
    text: "testimonial.bruno.text",
    author: "Bruno Coimbra",
    company: "Azure Assessoria de Investimentos"
  }, {
    text: "testimonial.rodrigo.text",
    author: "Rodrigo Nascimento",
    company: "LTS Corretagem de Seguros"
  }, {
    text: "testimonial.fernando.text",
    author: "Fernando Freitas",
    company: "Mark Tech"
  }, {
    text: "testimonial.giovanna.text",
    author: "Giovanna Pretti",
    company: "ZapInside"
  }, {
    text: "testimonial.walter.text",
    author: "Walter Neto",
    company: "AutoAgentes"
  }];
  const services = [{
    icon: Building,
    title: t('empresas.services.internal'),
    description: 'Management systems, CRM, ERP and specific tools for your business'
  }, {
    icon: Rocket,
    title: t('empresas.services.saas'),
    description: 'Scalable platforms to commercialize as a product'
  }, {
    icon: Bot,
    title: t('empresas.services.ai'),
    description: 'Intelligent chatbots and personalized virtual assistants'
  }, {
    icon: Workflow,
    title: t('empresas.services.automation'),
    description: 'Process automation and system integrations'
  }, {
    icon: Figma,
    title: t('empresas.services.figma'),
    description: 'Prototyping and interface design before development'
  }, {
    icon: Globe,
    title: t('empresas.services.websites'),
    description: 'Institutional websites and responsive web applications'
  }, {
    icon: Smartphone,
    title: t('empresas.services.mobile'),
    description: 'Native and hybrid apps for iOS and Android'
  }, {
    icon: ShoppingCart,
    title: t('empresas.services.ecommerce'),
    description: 'Virtual stores optimized for conversion'
  }];
  const whyChooseUs = [{
    icon: DollarSign,
    title: t('empresas.why.cost_benefit.title'),
    description: t('empresas.why.cost_benefit.desc')
  }, {
    icon: Bot,
    title: t('empresas.why.ai_experts.title'),
    description: t('empresas.why.ai_experts.desc')
  }, {
    icon: Shield,
    title: t('empresas.why.scalability.title'),
    description: t('empresas.why.scalability.desc')
  }, {
    icon: Headphones,
    title: t('empresas.why.support.title'),
    description: t('empresas.why.support.desc')
  }];
  const processSteps = [{
    title: "process.step1.title",
    description: "process.step1.description",
    icon: "🔍"
  }, {
    title: "process.step2.title",
    description: "process.step2.description",
    icon: "🎯"
  }, {
    title: "process.step3.title",
    description: "process.step3.description",
    icon: "⚡"
  }, {
    title: "process.step4.title",
    description: "process.step4.description",
    icon: "🚀"
  }, {
    title: "=",
    description: "process.step5.description",
    icon: "="
  }];
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
  return <div className="min-h-screen bg-background">
      <section className="relative pt-[100px] pb-[80px] px-[20px] md:py-[120px] md:px-8 overflow-hidden bg-background">
        <div className="absolute inset-0 overflow-hidden">
          {/* Organic fluid shapes similar to the reference image */}
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-gradient-to-br from-[#4BD2E5] via-[#8EE2E5] to-[#4BD2E5] rounded-[50%] blur-3xl opacity-30 animate-pulse transform rotate-45"></div>
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-tl from-[#4BD2E5] via-[#8EE2E5] to-[#4BD2E5] rounded-[60%] blur-3xl opacity-25 animate-pulse delay-1000 transform -rotate-12"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-[#8EE2E5] via-[#4BD2E5] to-[#8EE2E5] rounded-[70%] blur-3xl opacity-20 animate-pulse delay-500 transform rotate-12"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-bl from-[#4BD2E5] to-[#8EE2E5] rounded-[80%] blur-2xl opacity-15 animate-pulse delay-1500 transform -rotate-45"></div>
        </div>
        
        <div className="w-full md:container md:mx-auto relative z-10">
  <div className="w-full md:max-w-4xl md:mx-auto text-center py-[20px] md:py-[40px]">
            <div className="relative inline-block mb-8 animate-fade-in-up">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 blur-md rounded-full animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 border border-primary/40 rounded-full px-6 py-2 backdrop-blur-sm">
                <div className="flex items-center">
                  <span className="inline-block w-2 h-2 bg-primary rounded-full mr-3 animate-pulse"></span>
                  <Sparkles className="w-4 h-4 text-primary mr-2" />
                  <span className="text-xs md:text-sm font-medium text-[#272B37] dark:text-primary/90 tracking-wide font-mono">{t('empresas.hero.new_title')}</span>
                </div>
              </div>
            </div>
            
            <h1 className="font-sora font-bold text-[26px] md:text-4xl mb-8 animate-fade-in-up leading-tight">
              {t('empresas.hero.new_subtitle')}
            </h1>
            
            <div className="flex flex-wrap justify-center gap-6 text-base animate-fade-in-up mb-8">
              <div className="flex items-center text-muted-foreground group">
                <Building className="w-4 h-4 text-primary mr-2" />
                <div className="text-lg font-bold text-primary mr-2">+50</div>
                <span className="relative text-white md:text-muted-foreground">
                  {t('empresas.stats.projects')}
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </span>
              </div>
              <div className="flex items-center text-muted-foreground group">
                <Star className="w-4 h-4 text-secondary mr-2" />
                <div className="text-lg font-bold text-secondary mr-2">9.8</div>
                <span className="relative text-white md:text-muted-foreground">
                  {t('empresas.stats.rating')}
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-secondary to-primary rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </span>
              </div>
              <div className="flex items-center text-muted-foreground group">
                <Calendar className="w-4 h-4 text-primary mr-2" />
                <div className="text-xl font-bold text-primary mr-2">+4</div>
                <span className="relative text-white md:text-muted-foreground">
                  {t('empresas.stats.experience')}
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </span>
              </div>
            </div>
            
            <div className="animate-fade-in-up">
              <WhatsAppButton text={t('empresas.cta.accelerate')} className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 text-base font-semibold rounded-full shadow-2xl hover:shadow-primary/25 hover:scale-105 transition-all duration-300 border-0" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-8 bg-background">
        <div className="w-full md:container md:mx-auto">
          <h2 className="font-sora font-bold text-4xl text-center mb-16">
            <span className="text-gradient text-slate-900">{t('empresas.services.title')}</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => <div key={index} className="glass-card group hover:scale-105">
                <div className="flex items-center justify-center mb-4">
                  <service.icon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="font-sora text-xl mb-3 text-center min-h-[56px] flex items-center justify-center font-medium">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-center text-base">
                  {service.description}
                </p>
              </div>)}
          </div>
        </div>
      </section>

      <section id="portfolio" className="py-[60px] md:py-20 bg-background">
  <Portfolio />
</section>

      <section className="py-[60px] px-[20px] md:py-20 md:px-8 bg-background relative overflow-hidden">
        {/* Organic fluid shapes - flowing animation */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#C4F7FF] dark:bg-[#033239] opacity-25 rounded-full blur-3xl animate-glass-float"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-[#C4F7FF] dark:bg-[#033239] opacity-20 rounded-full blur-2xl animate-glass-float delay-1000"></div>
          <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-[#C4F7FF] dark:bg-[#033239] opacity-30 rounded-full blur-xl animate-glass-float delay-500"></div>
          <div className="absolute bottom-1/4 right-1/3 w-68 h-68 bg-[#C4F7FF] dark:bg-[#033239] opacity-25 rounded-full blur-2xl animate-glass-float delay-1500"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-[#C4F7FF] dark:bg-[#033239] opacity-15 rounded-full blur-2xl animate-glass-float delay-2000"></div>
        </div>
        <div className="w-full md:container md:mx-auto relative z-10">
          <h2 className="font-sora font-bold text-4xl text-center mb-8">
            {t('empresas.why.title')}
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
            {t('empresas.why.subtitle')}
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {whyChooseUs.map((item, index) => <div key={index} className="glass-card group hover:scale-105">
                <div className="flex items-center mb-4">
                  <item.icon className="w-8 h-8 text-primary mr-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-sora font-semibold text-xl">{item.title}</h3>
                </div>
                <p className="text-muted-foreground text-base">
                  {item.description}
                </p>
              </div>)}
          </div>
        </div>
      </section>

      <section className="py-[60px] px-[20px] md:py-20 md:px-8 bg-background">
        <div className="w-full md:container md:mx-auto">
          <h2 className="font-sora font-bold text-4xl text-center mb-16">
            {t('empresas.testimonials.title')}
          </h2>
          
          <div className="max-w-[1400px] mx-auto">
            <Carousel opts={{
            align: "start",
            loop: true
          }} className="w-full overflow-visible">
              <CarouselContent className="-ml-8 overflow-visible">
                {testimonials.map((testimonial, index) => <CarouselItem key={index} className="pl-8 md:basis-1/2 lg:basis-1/3">
                    <div className="glass-card h-full group hover:scale-105 border border-[#C4F7FF] shadow-[0_8px_20px_rgba(0,0,0,0.05)] dark:shadow-none">
                      <div className="flex items-center justify-center mb-4">
                        <Quote className="w-8 h-8 text-primary opacity-60" />
                      </div>
                      
                       <p className="text-muted-foreground text-base mb-6 leading-relaxed">
                         "{t(testimonial.text)}"
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
                          {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-primary fill-current" />)}
                        </div>
                      </div>
                    </div>
                  </CarouselItem>)}
              </CarouselContent>
              <CarouselPrevious className="left-0 md:-left-12" />
              <CarouselNext className="right-0 md:-right-12" />
            </Carousel>
          </div>
        </div>
      </section>

      <section ref={processRef} className="relative py-[60px] px-[20px] md:py-20 md:px-8 overflow-hidden min-h-screen bg-background">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="w-full md:container md:mx-auto relative z-10">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="font-sora font-bold text-4xl mb-6">
              {t('empresas.process.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Uma metodologia validada que transforma suas ideias em soluções de sucesso
            </p>
          </div>
          
          <div className="relative w-full md:max-w-6xl md:mx-auto my-[40px] md:my-[80px] px-0 md:px-4">
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-primary/30 via-secondary/30 to-primary/30 hidden lg:block" style={{
            height: 'calc(100% - 4rem)'
          }}></div>
            
            {processSteps.map((step, index) => {
            const isActive = activeStep >= index;
            const isLeft = index % 2 === 0;
            const isEqualsStep = step.title === "=";
            if (isEqualsStep) {
              return <div key={index} className="flex justify-center mb-8 md:mb-32 relative px-0 md:px-8">
                    <div className={`transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-4'}`}>
                      <div className="glass-card max-w-[1000px] mx-auto text-center bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-3xl"></div>
                        <div className="absolute top-4 right-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-4 left-4 w-16 h-16 bg-secondary/10 rounded-full blur-xl"></div>
                        
                        <div className="relative z-10 p-8">
                          <div className="flex items-center justify-center mb-6">
                            <Brain className="w-12 h-12 text-primary mr-4" />
                            <Award className="w-12 h-12 text-secondary mx-2" />
                            <Bot className="w-12 h-12 text-primary ml-4" />
                          </div>
                          <h3 className="font-sora font-bold text-2xl md:text-3xl mb-4 text-[#101420] dark:text-[#ffffff]">
                            <span className="text-gradient">{t('process.business_knowledge_title')}</span>
                          </h3>
                          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                            {t(step.description)}
                          </p>
                          <div className="flex flex-wrap justify-center gap-4 text-sm">
                            <div className="flex items-center bg-primary/10 px-4 py-2 rounded-full">
                              <CheckCircle className="w-4 h-4 text-primary mr-2" />
                              <span>{t('process.custom_solution')}</span>
                            </div>
                            <div className="flex items-center bg-secondary/10 px-4 py-2 rounded-full">
                              <Zap className="w-4 h-4 text-secondary mr-2" />
                              <span>{t('process.record_time')}</span>
                            </div>
                            <div className="flex items-center bg-primary/10 px-4 py-2 rounded-full">
                              <TrendingUp className="w-4 h-4 text-primary mr-2" />
                              <span>{t('process.guaranteed_results')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>;
            }
            return <div key={index} className="flex items-start mb-8 md:mb-32 relative group px-0 md:px-8">
                  <div className={`absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full shadow-lg border-4 border-background z-10 hidden lg:block transition-all duration-500 ${isActive ? 'bg-primary scale-125 shadow-primary/50' : 'bg-muted scale-100'}`}></div>
                  
                  <div className={`w-full lg:w-1/2 lg:pr-8 transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-4'} relative`}>
                    <div className={`glass-card group hover:scale-105 transition-all duration-300 hover:shadow-2xl transform ${isActive ? 'translate-x-0 opacity-100 scale-100' : 'opacity-70 scale-95'}`}>
                      <div className="flex items-center mb-6">
                        <div className={`w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white font-bold text-lg md:text-2xl group-hover:scale-110 transition-transform shadow-lg ${isActive ? 'animate-pulse shadow-primary/50' : ''}`}>
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        <div className="ml-6">
                          <h3 className="font-sora font-bold text-lg md:text-xl mb-2">{t(step.title)}</h3>
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
                                {t(step.description)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`hidden lg:block w-1/2 pl-8 transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="glass rounded-3xl p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 shadow-lg shadow-primary/10">
                      <div className="flex items-center mb-4">
                        <div className="text-6xl opacity-80 mr-4">
                          {step.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-muted-foreground text-base leading-relaxed">
                            {t(step.description)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>;
          })}
          </div>
        </div>
      </section>

      <section className="py-[60px] px-[20px] md:py-20 md:px-8 bg-gradient-to-br from-primary to-secondary">
  <div className="w-full md:container md:mx-auto text-center">
    <div className="max-w-[1440px] mx-auto p-8 rounded-3xl">
      <h2 className="font-sora font-bold text-4xl mb-6 text-white">
        {t('cta.empresas.title')}
      </h2>
      <p className="text-xl text-white/90 mb-12">
        {t('cta.empresas.subtitle')}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mb-12">
        <div className="flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-4 text-white/90 group hover:bg-white/20 transition-all duration-300">
          <Sparkles className="w-6 h-6 mr-3 text-[#111320]" />
          <div className="text-left">
            <div className="text-lg font-bold text-[#111320]">{t('cta.feature1.title')}</div>
            <span className="text-gray-700">{t('cta.feature1.desc')}</span>
          </div>
        </div>
        <div className="flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-4 text-white/90 group hover:bg-white/20 transition-all duration-300">
          <Timer className="w-6 h-6 mr-3 text-[#111320]" />
          <div className="text-left">
            <div className="text-lg font-bold text-[#111320]">{t('cta.feature2.title')}</div>
            <span className="text-gray-700">{t('cta.feature2.desc')}</span>
          </div>
        </div>
        <div className="flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-4 text-white/90 group hover:bg-white/20 transition-all duration-300">
          <Heart className="w-6 h-6 mr-3 text-[#111320]" />
          <div className="text-left">
            <div className="text-lg font-bold text-[#111320]">{t('cta.feature3.title')}</div>
            <span className="text-gray-700">{t('cta.feature3.desc')}</span>
          </div>
        </div>
      </div>
      
      <WhatsAppButton text={t('common.contact')} className="bg-white text-primary px-8 py-4 text-base font-semibold rounded-full shadow-2xl hover:shadow-white/25 hover:scale-105 transition-all duration-300 border-0 hover:bg-white/90" />
    </div>
  </div>
</section>
    </div>;
};
export default Empresas;