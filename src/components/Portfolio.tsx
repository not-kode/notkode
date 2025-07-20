import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Portfolio: React.FC = () => {
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
    <section id="portfolio" className="py-20 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto">
        <h2 className="font-sora font-bold text-3xl md:text-4xl text-center mb-16">
          <span className="text-gradient">Portfolio de Sucesso</span>
        </h2>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {portfolio.map((project, index) => (
            <div key={index} className="portfolio-card group hover:scale-105 transition-all duration-300">
              {/* Project Header */}
              <div className="flex items-start justify-between mb-6 border-b border-border/20 pb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-sora font-bold text-xl leading-tight mb-2">{project.name}</h3>
                  <span className="px-3 py-1.5 bg-secondary/10 text-secondary text-xs font-medium rounded-full border border-secondary/20 inline-block">
                    {project.category}
                  </span>
                </div>
                <div className="text-right ml-4 flex-shrink-0 space-y-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20">
                    <span>🚀</span>
                    <span>{t('language') === 'pt' ? 'Lançamento do Projeto:' : 'Project Launch:'}</span>
                    <span className="font-semibold">{project.year}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-green-500">
                    <span className="text-xs text-muted-foreground">{t('language') === 'pt' ? 'Faturamento:' : 'Revenue:'}</span>
                    <span>{project.revenue}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                {project.description}
              </p>

              {/* Technologies */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm mb-2 text-primary">
                  Tecnologias utilizadas:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.split(', ').map((tech, techIndex) => (
                    <span 
                      key={techIndex}
                      className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Link */}
              <div className="flex items-center justify-between">
                <a 
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors font-semibold text-sm group-hover:scale-105 transition-transform"
                >
                  <span>Ver projeto</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${project.gradient} opacity-60`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;