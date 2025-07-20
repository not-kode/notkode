import React from 'react';
import { Building, Rocket, Bot, Workflow, Figma, Smartphone, ShoppingCart, Globe, CheckCircle, Target, Zap, Brain, TrendingUp, Award, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import WhatsAppButton from '@/components/WhatsAppButton';
import Portfolio from '@/components/Portfolio';
const Empresas: React.FC = () => {
  const {
    t
  } = useLanguage();
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
  const differentials = [{
    icon: Target,
    title: t('empresas.differential.experience'),
    description: 'Mais de 3 anos desenvolvendo soluções que geram resultados reais'
  }, {
    icon: CheckCircle,
    title: t('empresas.differential.diagnosis'),
    description: 'Analisamos seu negócio para identificar as melhores oportunidades'
  }, {
    icon: Zap,
    title: t('empresas.differential.tools'),
    description: 'Escolhemos as tecnologias ideais para cada tipo de projeto'
  }, {
    icon: TrendingUp,
    title: t('empresas.differential.value'),
    description: 'Priorizamos entregas que impactam diretamente nos seus resultados'
  }, {
    icon: Brain,
    title: t('empresas.differential.knowledge'),
    description: 'Combinamos conhecimento técnico com experiência em negócios'
  }, {
    icon: Bot,
    title: 'Especialistas em Inteligência Artificial',
    description: 'Dominamos as mais avançadas tecnologias de IA para criar soluções inteligentes'
  }];
  return <div className="min-h-screen">
      {/* Hero Section - Mais criativo */}
      <section className="relative hero-gradient py-24 px-4 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-primary/5 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center py-[40px]">
            {/* Badge */}
            <div className="inline-flex items-center glass-card px-4 py-2 mb-8 animate-fade-in-up">
              <Sparkles className="w-4 h-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Soluções Tecnológicas Sob Medida</span>
            </div>
            
            {/* Main Title */}
            <h1 className="font-sora font-bold text-4xl md:text-6xl lg:text-7xl mb-8 animate-fade-in-up leading-tight">
              Desenvolvemos tecnologia{' '}
              <span className="text-gradient">sobre medida</span> que acelera sua empresa em{' '}
              <span className="text-gradient">tempo recorde</span>
            </h1>
            
            {/* Subtitle */}
            
            
            {/* CTA Button - Preenchido e destacado */}
            <div className="animate-fade-in-up">
            <WhatsAppButton text="Acelerar Minha Empresa" className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-primary/25 hover:scale-105 transition-all duration-300 border-0" />
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
            {services.map((service, index) => <div key={index} className="glass-card group hover:scale-105">
                <div className="flex items-center justify-center mb-4">
                  <service.icon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="font-sora font-semibold text-lg mb-3 text-center min-h-[56px] flex items-center justify-center">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-center text-sm">
                  {service.description}
                </p>
              </div>)}
          </div>
        </div>
      </section>

      {/* Portfolio Section - Moved after Services */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <Portfolio />
      </section>

      {/* Differentials Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto">
          <h2 className="font-sora font-bold text-3xl md:text-4xl text-center mb-8">
            Nossa <span className="text-gradient">Receita</span> para o Sucesso
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
            A combinação perfeita de elementos que transformam desafios em resultados extraordinários
          </p>
          
          {/* Recipe Formula */}
          <div className="max-w-6xl mx-auto">
            {/* Individual Ingredients */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {differentials.slice(0, 5).map((differential, index) => (
                <div key={index} className="glass-card group relative">
                  <div className="flex items-center mb-4">
                    <differential.icon className="w-8 h-8 text-primary mr-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-sora font-semibold text-lg">{differential.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {differential.description}
                  </p>
                  {/* Plus symbol for visual addition */}
                  {index < 4 && (
                    <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-lg hidden lg:flex">
                      +
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Equals Symbol */}
            <div className="flex justify-center mb-8">
              <div className="glass-card px-8 py-4">
                <div className="text-4xl font-bold text-primary text-center">=</div>
              </div>
            </div>

            {/* Final Result */}
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
                  <span className="text-gradient">Conhecimento em Negócios + Desenvolvimento + IA</span>
                </h3>
                <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                  A fórmula perfeita que entrega soluções tecnológicas que realmente impactam seus resultados, 
                  da forma que sua empresa precisa, em tempo recorde.
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
      </section>

      {/* Process Section - Creative Design */}
      <section className="relative py-32 px-4 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/3 to-secondary/3 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="font-sora font-bold text-4xl md:text-6xl mb-6">
              Nosso <span className="text-gradient">Processo</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Uma metodologia comprovada que transforma ideias em soluções de sucesso
            </p>
          </div>
          
          {/* Process Steps - Creative Timeline */}
          <div className="relative max-w-6xl mx-auto">
            {/* Central connecting line */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary via-secondary to-primary opacity-30 hidden lg:block"></div>
            
            {/* Step 1 */}
            <div className="flex items-center mb-24 relative">
              <div className="lg:w-1/2 lg:pr-12 w-full">
                <div className="glass-card group hover:scale-105 transition-all duration-500 hover:shadow-2xl">
                  <div className="flex items-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white font-bold text-2xl group-hover:scale-110 transition-transform shadow-lg">
                      01
                    </div>
                    <div className="ml-6">
                      <h3 className="font-sora font-bold text-2xl mb-2">Diagnóstico Profundo</h3>
                      <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Mergulhamos no seu negócio para entender desafios, oportunidades e objetivos. Mapeamos processos atuais e identificamos pontos de melhoria que impactarão diretamente nos resultados.
                  </p>
                </div>
              </div>
              <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-primary rounded-full shadow-lg border-4 border-background"></div>
              <div className="lg:w-1/2 lg:pl-12 hidden lg:block">
                <div className="glass rounded-3xl p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                  <div className="text-6xl opacity-20 text-primary">🔍</div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center mb-24 relative lg:flex-row-reverse">
              <div className="lg:w-1/2 lg:pl-12 w-full">
                <div className="glass-card group hover:scale-105 transition-all duration-500 hover:shadow-2xl">
                  <div className="flex items-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-secondary to-primary rounded-2xl flex items-center justify-center text-white font-bold text-2xl group-hover:scale-110 transition-transform shadow-lg">
                      02
                    </div>
                    <div className="ml-6">
                      <h3 className="font-sora font-bold text-2xl mb-2">Estratégia Inteligente</h3>
                      <div className="w-20 h-1 bg-gradient-to-r from-secondary to-primary rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Definimos a arquitetura ideal, escolhemos as tecnologias mais adequadas e criamos um roadmap detalhado. Cada decisão é pensada para maximizar ROI e escalabilidade.
                  </p>
                </div>
              </div>
              <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-secondary rounded-full shadow-lg border-4 border-background"></div>
              <div className="lg:w-1/2 lg:pr-12 hidden lg:block">
                <div className="glass rounded-3xl p-8 bg-gradient-to-br from-secondary/10 to-primary/10 border border-secondary/20">
                  <div className="text-6xl opacity-20 text-secondary">🎯</div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-center mb-24 relative">
              <div className="lg:w-1/2 lg:pr-12 w-full">
                <div className="glass-card group hover:scale-105 transition-all duration-500 hover:shadow-2xl">
                  <div className="flex items-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white font-bold text-2xl group-hover:scale-110 transition-transform shadow-lg">
                      03
                    </div>
                    <div className="ml-6">
                      <h3 className="font-sora font-bold text-2xl mb-2">Desenvolvimento Ágil</h3>
                      <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Construímos sua solução com acompanhamento em tempo real. Entregas incrementais garantem que você veja o progresso e possa ajustar o rumo quando necessário.
                  </p>
                </div>
              </div>
              <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-primary rounded-full shadow-lg border-4 border-background"></div>
              <div className="lg:w-1/2 lg:pl-12 hidden lg:block">
                <div className="glass rounded-3xl p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                  <div className="text-6xl opacity-20 text-primary">⚡</div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-center relative lg:flex-row-reverse">
              <div className="lg:w-1/2 lg:pl-12 w-full">
                <div className="glass-card group hover:scale-105 transition-all duration-500 hover:shadow-2xl">
                  <div className="flex items-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-secondary to-primary rounded-2xl flex items-center justify-center text-white font-bold text-2xl group-hover:scale-110 transition-transform shadow-lg">
                      04
                    </div>
                    <div className="ml-6">
                      <h3 className="font-sora font-bold text-2xl mb-2">Lançamento & Crescimento</h3>
                      <div className="w-20 h-1 bg-gradient-to-r from-secondary to-primary rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Implantamos sua solução com estratégia de lançamento. Oferecemos suporte contínuo, monitoramento de performance e melhorias baseadas em dados reais de uso.
                  </p>
                </div>
              </div>
              <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-secondary rounded-full shadow-lg border-4 border-background"></div>
              <div className="lg:w-1/2 lg:pr-12 hidden lg:block">
                <div className="glass rounded-3xl p-8 bg-gradient-to-br from-secondary/10 to-primary/10 border border-secondary/20">
                  <div className="text-6xl opacity-20 text-secondary">🚀</div>
                </div>
              </div>
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
            <WhatsAppButton text="Entrar em Contato" className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-primary/25 hover:scale-105 transition-all duration-300 border-0" />
          </div>
        </div>
      </section>
    </div>;
};
export default Empresas;