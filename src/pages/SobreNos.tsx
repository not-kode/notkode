
import React from 'react';
import { 
  MapPin, 
  Calendar, 
  ExternalLink, 
  TrendingUp,
  Palette,
  Code,
  Brain,
  Users,
  Mail,
  Phone
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import WhatsAppButton from '@/components/WhatsAppButton';

const SobreNos: React.FC = () => {
  const { t } = useLanguage();

  const timeline = [
    {
      period: "Início de 2021",
      title: "Os Primeiros Passos",
      description: "Começamos nossa trajetória utilizando tecnologias consolidadas do mercado como WordPress e Figma. Era nosso ponto de partida para entender as reais necessidades dos clientes."
    },
    {
      period: "Meio de 2021",
      title: "A Descoberta do No-Code",
      description: "Percebemos o movimento revolucionário que as plataformas No-Code estavam criando globalmente. Ainda era território inexplorado - o conceito de desenvolver sem escrever código diretamente estava apenas chegando ao mercado brasileiro. Vimos uma oportunidade única."
    },
    {
      period: "Dezembro de 2022",
      title: "O Momento Decisivo",
      description: "Tivemos acesso antecipado ao ChatGPT e nossa visão sobre o futuro da tecnologia mudou completamente. Era o início de uma nova era, e decidimos focar em nos tornar especialistas em aplicar Inteligência Artificial para otimizar negócios reais."
    },
    {
      period: "Janeiro de 2023",
      title: "Expandindo o Arsenal",
      description: "Mapeamos intensivamente o que o mercado oferecia de mais inovador. Expandimos nosso leque de ferramentas e criamos um plano estratégico para ter o melhor arsenal tecnológico disponível para nossos clientes."
    },
    {
      period: "Março de 2023",
      title: "Decolagem Internacional",
      description: "A Notkode alça voo além das fronteiras brasileiras. Começamos a atender empresas dos Estados Unidos, Canadá e Inglaterra, provando que nossa abordagem funciona em qualquer mercado."
    },
    {
      period: "2024",
      title: "A Era da IA",
      description: "A Inteligência Artificial ganha força inédita no mercado. Nos consolidamos entregando desenvolvimento pautado em IA e criando Agentes de IA de todos os tipos, sempre focados em resultados concretos para nossos clientes."
    },
    {
      period: "2025",
      title: "O Presente",
      description: "Estamos vivendo nosso melhor momento, com uma metodologia consolidada e tecnologias de ponta. Este é o ano em que você ainda pode se tornar nosso próximo case de sucesso e transformar suas ideias em resultados reais para seu negócio."
    }
  ];

  const portfolio = [
    {
      name: "AutoAgentes",
      category: "SaaS (Desenvolvimento de software)",
      description: "SaaS de criação de Agentes de IA, focado em permitir com que donos de pequenas e médias empresas possam automatizar o atendimento dos clientes no whatsapp, substituindo a contratação de funcionários humanos e tornando sua empresa mais eficiente.",
      revenue: "+70 mil reais",
      year: "2025",
      technologies: "WeWeb, Xano, ASAAS, Posthog, OpenAI, Anthropic (Claude), n8n, Sendgrid, MegaAPI",
      link: "https://www.autoagentes.com.br/",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      name: "Ativa Clientes",
      category: "SaaS (Desenvolvimento de software)",
      description: "SaaS focado em permitir com que donos de pequenas e médias empresas aumentassem o resultado obtido através de campanhas (envios em massa) realizadas por e-mail e Whatsapp. A grande sacada deste produto é que todo o conteúdo enviado, é 100% personalizado pela IA da Ativa Clientes utilizando o contexto daquele respectivo contato, fazendo com que cada e-mail ou whatsapp seja muito mais relevante pela ótica do cliente.",
      revenue: "+40 mil reais",
      year: "2024",
      technologies: "WeWeb, Xano, Stripe, Posthog, OpenAI, Gemini, Postmark, APIBrasil",
      link: "https://www.youtube.com/watch?v=D4rfmBY5_UQ&t=312s",
      gradient: "from-green-500 to-teal-600"
    },
    {
      name: "ZapInside",
      category: "SaaS (Desenvolvimento de software)",
      description: "E se você pudesse ver tudo o que acontece nas conversas de WhatsApp do seu time que realiza atendimentos? É este desafio que este SaaS resolve, as conversas do WhatsApp revelam tudo o que você precisa saber sobre seus leads e sua equipe de vendas ou de atendimento. A gente analisa tudo pra você — e entrega insights acionáveis de forma clara, rápida e prática. Tudo com IA e zero esforço manual.",
      revenue: "+2 mil reais",
      year: "2025",
      technologies: "WeWeb, Xano, ASAAS, Posthog, OpenAI, Anthropic (Claude), MegaApi",
      link: "https://www.zapinside.com.br/",
      gradient: "from-orange-500 to-red-600"
    },
    {
      name: "Noodrops",
      category: "E-commerce",
      description: "E-commerce destinado a comercialização das Smart Pills da Noodrops, a opção perfeita pra você cuidar do seu cérebro, seja com performance, seja com saúde cerebral. Somos a Smart Pill Nº1 no Brasil, a mais querida e mais recomendada.",
      revenue: "+80 mil reais / mês",
      year: "2023",
      technologies: "WooCommerce, Wordpress, GA4, Pagar.me, Yampi, Voxuy, Microsoft Clarity",
      link: "https://noodrops.com.br/",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      name: "Loss Prevention",
      category: "Website",
      description: "Empresa de consultoria com mais de 20 anos de mercado, onde realizamos em colaboração com o time da Loss Prevention, toda a modernização do processo comercial: incluindo o desenvolvimento do novo site, estruturação de todo o processo comercial no AirTable com o envio de e-mail em massa já integrado no Sendgrid, garantindo um servidor de envio de e-mail focado em performance. Foi automatizado via formulário e n8n, quando o lead preenche o formulário de interesse o envio das condições dos respectivo curso e coleta automática da inscrição (venda) para o aluno.",
      revenue: "+100 mil reais / mês",
      year: "2023",
      technologies: "Framer, GA4, Typeform, AirTable, SendGrid, n8n",
      link: "https://www.lossprevention.com.br/",
      gradient: "from-indigo-500 to-blue-600"
    },
    {
      name: "Solojet",
      category: "Website",
      description: "A Solojet Aviação é o único grupo de aviação executiva no Brasil que oferece uma solução completa, desde a venda e compartilhamento de aeronaves até gestão e manutenção especializada. O embaixador da Solojet é Álvaro Garnero: empresário, apresentador de televisão, investidor e administrador de empresas brasileiro. A quatro mãos projetamos todo o novo site para garantir que independente da linha de produto ou serviço desejada, o cliente agora encontra facilmente as respostas que busca e consegue facilmente entrar em contato para prosseguir na sua jornada de compra com baixo esforço. Ao demonstrar interesse o lead preenche o formulário e a integração desenvolvida leva seus dados para o RD Station, avisando o responsável para realizar o atendimento da venda com o lead já triado.",
      revenue: "Empresa multinacional de médio porte",
      year: "2024",
      technologies: "WeWeb, Google Maps API (GCP), Google Sheets, PostHog, RD Station, n8n",
      link: "https://www.solojetaviacao.com.br/pt/",
      gradient: "from-cyan-500 to-blue-600"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="font-sora font-bold text-4xl md:text-6xl mb-8 animate-fade-in-up">
            <span className="text-gradient">Somos a Notkode: onde ideias se transformam em soluções reais</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto">
            Nascemos em 2021 com a missão de democratizar a tecnologia, ajudando empresas e agências a crescerem sem as barreiras tradicionais do desenvolvimento.
          </p>
        </div>
      </section>

      {/* Timeline History */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-sora font-bold text-3xl md:text-4xl text-center mb-16">
            <span className="text-gradient">Nossa jornada de transformação</span>
          </h2>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-primary to-secondary"></div>
            
            {timeline.map((item, index) => (
              <div key={index} className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                {/* Timeline dot */}
                <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background z-10"></div>
                
                {/* Content */}
                <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                  <div className="glass-card">
                    <div className="text-primary font-semibold text-sm mb-2">{item.period}</div>
                    <h3 className="font-sora font-bold text-xl mb-3">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto">
          <h2 className="font-sora font-bold text-3xl md:text-4xl text-center mb-16">
            <span className="text-gradient">Quem está por trás da Notkode</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Camila */}
            <div className="glass-card group hover:scale-105">
              <div className="flex items-start mb-6">
                <div className="w-20 h-20 rounded-full overflow-hidden mr-4 flex-shrink-0">
                  <img 
                    src="https://media.licdn.com/dms/image/v2/D4D03AQHN8KBb8CeCTw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1719845395227?e=1755734400&v=beta&t=P1DLP0YNtGKxQehMREushPTcxLNYH31ym6pb4KbZ2kM"
                    alt="Camila Tonelotto"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-sora font-bold text-xl">Camila Tonelotto</h3>
                  <p className="text-primary font-semibold">CEO</p>
                  <a 
                    href="https://www.linkedin.com/in/gregoriocamila/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
              <p className="text-muted-foreground">
                Desde criança, Camila sempre teve uma paixão pela arte - passava horas pintando quadros. Essa veia artística a levou naturalmente ao design, depois ao UX, e finalmente ao desenvolvimento de software. Hoje, ela lidera a Notkode com foco em criar experiências que realmente facilitam a vida dos usuários, transformando sua visão artística em valor real para os negócios.
              </p>
            </div>

            {/* Matheus */}
            <div className="glass-card group hover:scale-105">
              <div className="flex items-start mb-6">
                <div className="w-20 h-20 rounded-full overflow-hidden mr-4 flex-shrink-0">
                  <img 
                    src="https://media.licdn.com/dms/image/v2/C4D03AQGd8lA9yG-Mqw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1534949512919?e=1755734400&v=beta&t=2w9hliqnKjhoZPhLo6MDYCD1-StXXGu9Z7dBRh2gjP8"
                    alt="Matheus Tonelotto"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-sora font-bold text-xl">Matheus Tonelotto</h3>
                  <p className="text-primary font-semibold">CTO</p>
                  <a 
                    href="https://www.linkedin.com/in/matheustonelotto/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
              <p className="text-muted-foreground">
                Com experiência sólida em multinacionais de software e nas startups brasileiras mais bem-sucedidas, Matheus traz uma visão técnica excepcional para a empresa. Especialista em Inteligência Artificial, já liderou projetos para empresas no Canadá, Estados Unidos e Inglaterra. Ele é o estrategista por trás de cada solução, sempre focado em entregar o máximo valor no menor tempo possível.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="font-sora font-bold text-3xl md:text-4xl text-center mb-16">
            <span className="text-gradient">Nosso Portfólio</span>
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {portfolio.map((project, index) => (
              <div key={index} className="portfolio-card group">
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-sora font-bold text-xl mb-1">{project.name}</h3>
                    <span className="text-sm text-primary font-semibold">{project.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">{project.year}</div>
                    <div className="font-semibold text-green-500">{project.revenue}</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {project.description}
                </p>

                {/* Technologies */}
                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2 text-primary">
                    Tecnologias:
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {project.technologies}
                  </p>
                </div>

                {/* Link */}
                <div className="flex items-center justify-between">
                  <a 
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors group"
                  >
                    <span className="text-sm font-semibold">Ver projeto</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${project.gradient}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-secondary/5 to-primary/5">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="glass-card text-center group hover:scale-105">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold text-gradient mb-1">
                R$ 300k+
              </div>
              <div className="text-xs text-muted-foreground">
                Faturamento Total dos Projetos
              </div>
            </div>
            
            <div className="glass-card text-center group hover:scale-105">
              <Users className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold text-gradient mb-1">
                6
              </div>
              <div className="text-xs text-muted-foreground">
                Projetos Principais
              </div>
            </div>
            
            <div className="glass-card text-center group hover:scale-105">
              <Brain className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold text-gradient mb-1">
                100%
              </div>
              <div className="text-xs text-muted-foreground">
                Focado em IA
              </div>
            </div>
            
            <div className="glass-card text-center group hover:scale-105">
              <Calendar className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold text-gradient mb-1">
                4+
              </div>
              <div className="text-xs text-muted-foreground">
                Anos de Experiência
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-sora font-bold text-3xl md:text-4xl text-center mb-16">
            <span className="text-gradient">Informações de Contato</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card text-center group hover:scale-105">
              <Phone className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-sora font-bold text-lg mb-2">WhatsApp</h3>
              <p className="text-muted-foreground">+55 11 95138-1254</p>
            </div>
            
            <div className="glass-card text-center group hover:scale-105">
              <Mail className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-sora font-bold text-lg mb-2">E-mail</h3>
              <p className="text-muted-foreground">camila@notkode.com.br</p>
            </div>
            
            <div className="glass-card text-center group hover:scale-105">
              <MapPin className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-sora font-bold text-lg mb-2">Localização</h3>
              <p className="text-muted-foreground">Zona Sul, São Paulo - SP</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto text-center">
          <div className="glass-card max-w-3xl mx-auto">
            <h2 className="font-sora font-bold text-3xl md:text-4xl mb-6">
              <span className="text-gradient">Pronto para transformar sua empresa?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Seja você uma empresa buscando crescer ou uma agência querendo expandir seus serviços, estamos aqui para ajudar você a escrever o próximo capítulo da sua história de sucesso.
            </p>
            <WhatsAppButton 
              className="text-lg px-8 py-4" 
              text="Falar com Nossa Equipe"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default SobreNos;
