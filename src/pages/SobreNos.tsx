import React from 'react';
import { 
  MapPin, 
  Calendar, 
  ExternalLink, 
  TrendingUp,
  Palette,
  Code,
  Brain,
  Users
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import WhatsAppButton from '@/components/WhatsAppButton';

const SobreNos: React.FC = () => {
  const { t } = useLanguage();

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
            <span className="text-gradient">{t('sobre.title')}</span>
          </h1>
        </div>
      </section>

      {/* Company History */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-sora font-bold text-3xl md:text-4xl text-center mb-16">
            <span className="text-gradient">{t('sobre.history.title')}</span>
          </h2>
          
          <div className="glass-card text-center">
            <div className="flex items-center justify-center space-x-6 mb-6">
              <div className="flex items-center space-x-2 text-primary">
                <Calendar className="w-5 h-5" />
                <span className="font-semibold">Fundada em 2021</span>
              </div>
              <div className="flex items-center space-x-2 text-primary">
                <MapPin className="w-5 h-5" />
                <span className="font-semibold">Zona Sul, São Paulo</span>
              </div>
            </div>
            <p className="text-lg text-muted-foreground">
              {t('sobre.history.desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto">
          <h2 className="font-sora font-bold text-3xl md:text-4xl text-center mb-16">
            <span className="text-gradient">{t('sobre.founders.title')}</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Camila */}
            <div className="glass-card group hover:scale-105">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mr-4">
                  <Palette className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-sora font-bold text-xl">Camila Tonelotto</h3>
                  <p className="text-primary font-semibold">{t('sobre.camila.role')}</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                {t('sobre.camila.desc')}
              </p>
            </div>

            {/* Matheus */}
            <div className="glass-card group hover:scale-105">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center mr-4">
                  <Code className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-sora font-bold text-xl">Matheus Tonelotto</h3>
                  <p className="text-primary font-semibold">{t('sobre.matheus.role')}</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                {t('sobre.matheus.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="font-sora font-bold text-3xl md:text-4xl text-center mb-16">
            <span className="text-gradient">{t('sobre.portfolio.title')}</span>
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {portfolio.map((project, index) => (
              <div key={index} className="portfolio-card">
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
                    {t('common.technologies')}:
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
                3+
              </div>
              <div className="text-xs text-muted-foreground">
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
              Pronto para ser nosso <span className="text-gradient">próximo case de sucesso</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Entre em contato conosco e descubra como podemos transformar sua ideia em um projeto de sucesso como os que você acabou de ver.
            </p>
            <WhatsAppButton className="text-lg px-8 py-4" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default SobreNos;