
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import WhatsAppButton from '@/components/WhatsAppButton';
import { CheckCircle, Globe, TrendingUp } from 'lucide-react';

const SobreNos: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-20 md:pt-16 bg-background">
      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-block bg-primary/10 text-primary px-6 py-2 rounded-full text-sm font-medium mb-6">
            • Onde ideias se transformam em soluções reais
          </div>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed">
            Nascemos em 2021 com a missão de democratizar a tecnologia, ajudando
            empresas e agências a crescerem sem as barreiras tradicionais do
            desenvolvimento.
          </p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-sora font-bold text-2xl md:text-4xl mb-6 md:mb-16 text-center">
            <span className="text-gradient">Nossa jornada de transformação</span>
          </h2>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 md:left-1/2 md:transform md:-translate-x-0.5 top-0 bottom-0 w-0.5 bg-primary/20"></div>
            
            {/* Timeline Items */}
            <div className="space-y-16 md:space-y-24">
              {/* Item 1 */}
              <div className="relative flex items-start md:items-center">
                <div className="absolute left-6 md:left-1/2 md:transform md:-translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background z-10"></div>
                <div className="ml-16 md:ml-0 md:w-1/2 md:pr-12">
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="text-primary text-sm font-medium mb-2">Início de 2021</div>
                    <h3 className="font-sora font-bold text-xl mb-3">Os Primeiros Passos</h3>
                    <p className="text-muted-foreground">
                      Começamos nossa trajetória utilizando tecnologias consolidadas
                      do mercado como WordPress e Figma. Era nosso ponto de partida
                      para entender as reais necessidades dos clientes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Item 2 */}
              <div className="relative flex items-start md:items-center">
                <div className="absolute left-6 md:left-1/2 md:transform md:-translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background z-10"></div>
                <div className="ml-16 md:ml-0 md:w-1/2 md:ml-auto md:pl-12">
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="text-primary text-sm font-medium mb-2">Meio de 2021</div>
                    <h3 className="font-sora font-bold text-xl mb-3">A Descoberta do No-Code</h3>
                    <p className="text-muted-foreground">
                      Percebemos o movimento revolucionário que as plataformas No-Code estavam criando globalmente. 
                      Ainda era território inexplorado - o conceito de desenvolver sem escrever código diretamente 
                      estava apenas chegando ao mercado brasileiro. Vimos uma oportunidade única.
                    </p>
                  </div>
                </div>
              </div>

              {/* Item 3 */}
              <div className="relative flex items-start md:items-center">
                <div className="absolute left-6 md:left-1/2 md:transform md:-translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background z-10"></div>
                <div className="ml-16 md:ml-0 md:w-1/2 md:pr-12">
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="text-primary text-sm font-medium mb-2">Dezembro de 2022</div>
                    <h3 className="font-sora font-bold text-xl mb-3">O Momento Decisivo</h3>
                    <p className="text-muted-foreground">
                      Tivemos acesso antecipado ao ChatGPT e nossa visão sobre o futuro da tecnologia mudou completamente. 
                      Era o início de uma nova era, e decidimos focar em nos tornar especialistas em aplicar 
                      Inteligência Artificial para otimizar negócios reais.
                    </p>
                  </div>
                </div>
              </div>

              {/* Item 4 */}
              <div className="relative flex items-start md:items-center">
                <div className="absolute left-6 md:left-1/2 md:transform md:-translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background z-10"></div>
                <div className="ml-16 md:ml-0 md:w-1/2 md:ml-auto md:pl-12">
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="text-primary text-sm font-medium mb-2">Janeiro de 2023</div>
                    <h3 className="font-sora font-bold text-xl mb-3">Expandindo o Arsenal</h3>
                    <p className="text-muted-foreground">
                      Mapeamos intensivamente o que o mercado oferecia de mais inovador. Expandimos nosso leque 
                      de ferramentas e criamos um plano estratégico para ter o melhor arsenal tecnológico 
                      disponível para nossos clientes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Item 5 */}
              <div className="relative flex items-start md:items-center">
                <div className="absolute left-6 md:left-1/2 md:transform md:-translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background z-10"></div>
                <div className="ml-16 md:ml-0 md:w-1/2 md:pr-12">
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="text-primary text-sm font-medium mb-2">Março de 2023</div>
                    <h3 className="font-sora font-bold text-xl mb-3">Decolagem Internacional</h3>
                    <p className="text-muted-foreground">
                      A Notkode alça voo além das fronteiras brasileiras. Começamos a atender empresas 
                      dos Estados Unidos, Canadá e Inglaterra, provando que nossa abordagem funciona 
                      em qualquer mercado.
                    </p>
                  </div>
                </div>
              </div>

              {/* Item 6 */}
              <div className="relative flex items-start md:items-center">
                <div className="absolute left-6 md:left-1/2 md:transform md:-translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background z-10"></div>
                <div className="ml-16 md:ml-0 md:w-1/2 md:ml-auto md:pl-12">
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="text-primary text-sm font-medium mb-2">2024</div>
                    <h3 className="font-sora font-bold text-xl mb-3">A Era da IA</h3>
                    <p className="text-muted-foreground">
                      A Inteligência Artificial ganha força inédita no mercado. Nos consolidamos entregando 
                      desenvolvimento pautado em IA e criando Agentes de IA de todos os tipos, sempre 
                      focados em resultados concretos para nossos clientes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Item 7 */}
              <div className="relative flex items-start md:items-center">
                <div className="absolute left-6 md:left-1/2 md:transform md:-translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background z-10"></div>
                <div className="ml-16 md:ml-0 md:w-1/2 md:pr-12">
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="text-primary text-sm font-medium mb-2">2025</div>
                    <h3 className="font-sora font-bold text-xl mb-3">O Presente</h3>
                    <p className="text-muted-foreground">
                      Estamos vivendo nosso melhor momento, com uma metodologia consolidada e tecnologias 
                      de ponta. Este é o ano em que você ainda pode se tornar nosso próximo case de sucesso 
                      e transformar suas ideias em resultados reais para seu negócio.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-12 md:py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-sora font-bold text-2xl md:text-4xl mb-6 md:mb-16 text-center">
            <span className="text-gradient">Quem está por trás da Notkode</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* Camila */}
            <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full mb-6 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">CT</span>
                </div>
                <h3 className="font-sora font-bold text-xl mb-2">Camila Tonelotto</h3>
                <div className="text-primary text-sm font-medium mb-4">Maga do UX</div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Desde criança, Camila sempre teve uma paixão pela arte - passava horas pintando quadros. 
                  Essa veia artística a levou naturalmente ao design, depois ao UX, e finalmente ao 
                  desenvolvimento de software. Hoje, ela lidera a Notkode com foco em criar experiências 
                  que realmente facilitam a vida dos usuários, transformando sua visão artística em 
                  valor real para os negócios.
                </p>
                <a 
                  href="https://linkedin.com/in/camila-tonelotto" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Se conectar no LinkedIn
                </a>
              </div>
            </div>

            {/* Matheus */}
            <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full mb-6 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">MT</span>
                </div>
                <h3 className="font-sora font-bold text-xl mb-2">Matheus Tonelotto</h3>
                <div className="text-primary text-sm font-medium mb-4">Nosso Estrategista</div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Com experiência sólida em multinacionais de software e nas startups brasileiras mais 
                  bem-sucedidas, Matheus traz uma visão técnica excepcional para a empresa. Especialista 
                  em Inteligência Artificial, já liderou projetos para empresas no Canadá, Estados Unidos 
                  e Inglaterra. Ele é o estrategista por trás de cada solução, sempre focado em entregar 
                  o máximo valor no menor tempo possível.
                </p>
                <a 
                  href="https://linkedin.com/in/matheus-tonelotto" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Se conectar no LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-sora font-bold text-2xl md:text-4xl mb-6 md:mb-16 text-center">
            <span className="text-gradient">Informações de Contato</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <h3 className="font-sora font-bold text-lg mb-2">WhatsApp</h3>
              <p className="text-muted-foreground">+55 11 95138-1254</p>
            </div>
            <div className="text-center">
              <h3 className="font-sora font-bold text-lg mb-2">E-mail</h3>
              <p className="text-muted-foreground">camila@notkode.com.br</p>
            </div>
            <div className="text-center">
              <h3 className="font-sora font-bold text-lg mb-2">Localização</h3>
              <p className="text-muted-foreground">Zona Sul, São Paulo - SP</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-sora font-bold text-2xl md:text-4xl mb-6">
              <span className="text-gradient">Pronto para transformar sua empresa?</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-sora font-bold text-lg mb-2">Solução Completa</h3>
              <p className="text-muted-foreground">
                Desde a concepção até a implementação, cuidamos de toda a jornada do seu projeto tecnológico.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-sora font-bold text-lg mb-2">Resultados Mensuráveis</h3>
              <p className="text-muted-foreground">
                Focamos em entregar valor real para o seu negócio, com métricas claras e resultados tangíveis.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-sora font-bold text-lg mb-2">Experiência Internacional</h3>
              <p className="text-muted-foreground">
                Atendemos empresas no Brasil, Estados Unidos, Canadá e Inglaterra com a mesma excelência.
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
              Seja você uma empresa buscando crescer ou uma agência querendo expandir seus serviços, 
              estamos aqui para ajudar você a escrever o próximo capítulo da sua história de sucesso.
            </p>
            
            <WhatsAppButton 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-medium transition-colors"
              text="Falar com Nossa Equipe"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default SobreNos;
