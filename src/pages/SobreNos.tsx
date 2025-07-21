
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
  Phone,
  ArrowRight
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 blur-md rounded-full animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 border border-primary/40 rounded-full px-8 py-4 backdrop-blur-sm">
              <h1 className="relative text-xl md:text-2xl font-semibold text-primary/90 tracking-wide font-sora">
                <span className="inline-block w-2 h-2 bg-primary rounded-full mr-3 animate-pulse"></span>
                Onde ideias se transformam em soluções reais
              </h1>
            </div>
          </div>
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
            <div className="glass-card group hover:scale-105 relative">
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
                  <p className="text-primary font-semibold">Maga do UX</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                Desde criança, Camila sempre teve uma paixão pela arte - passava horas pintando quadros. Essa veia artística a levou naturalmente ao design, depois ao UX, e finalmente ao desenvolvimento de software. Hoje, ela lidera a Notkode com foco em criar experiências que realmente facilitam a vida dos usuários, transformando sua visão artística em valor real para os negócios.
              </p>
              <div className="flex justify-end">
                <a 
                  href="https://www.linkedin.com/in/gregoriocamila/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                  <span>Se conectar no LinkedIn</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Matheus */}
            <div className="glass-card group hover:scale-105 relative">
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
                  <p className="text-primary font-semibold">Nosso Estrategista</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                Com experiência sólida em multinacionais de software e nas startups brasileiras mais bem-sucedidas, Matheus traz uma visão técnica excepcional para a empresa. Especialista em Inteligência Artificial, já liderou projetos para empresas no Canadá, Estados Unidos e Inglaterra. Ele é o estrategista por trás de cada solução, sempre focado em entregar o máximo valor no menor tempo possível.
              </p>
              <div className="flex justify-end">
                <a 
                  href="https://www.linkedin.com/in/matheustonelotto/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                  <span>Se conectar no LinkedIn</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
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
          <h2 className="font-sora font-bold text-3xl md:text-4xl mb-8">
            <span className="text-gradient">{t('cta.sobre.title')}</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            <div className="glass-card text-center group hover:scale-105">
              <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-sora font-bold text-lg mb-2">{t('cta.sobre.complete')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('cta.sobre.complete_desc')}
              </p>
            </div>
            
            <div className="glass-card text-center group hover:scale-105">
              <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-sora font-bold text-lg mb-2">{t('cta.sobre.measurable')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('cta.sobre.measurable_desc')}
              </p>
            </div>
            
            <div className="glass-card text-center group hover:scale-105">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-sora font-bold text-lg mb-2">{t('cta.sobre.international')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('cta.sobre.international_desc')}
              </p>
            </div>
          </div>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            {t('cta.sobre.final_text')}
          </p>
          
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-primary/40 to-primary/30 blur-lg rounded-full animate-pulse"></div>
            <div className="relative">
              <WhatsAppButton 
                className="text-lg px-8 py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-2xl hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105" 
                text="Falar com Nossa Equipe"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SobreNos;
