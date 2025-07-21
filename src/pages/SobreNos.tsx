
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

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
                      Percebemos o movimento revolucionário que as plataformas No-Code estavam criando globalmente. Ainda era território inexplorado, o conceito de desenvolver sem escrever código.
                    </p>
                  </div>
                </div>
              </div>

              {/* Item 3 */}
              <div className="relative flex items-start md:items-center">
                <div className="absolute left-6 md:left-1/2 md:transform md:-translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background z-10"></div>
                <div className="ml-16 md:ml-0 md:w-1/2 md:pr-12">
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="text-primary text-sm font-medium mb-2">Final de 2021</div>
                    <h3 className="font-sora font-bold text-xl mb-3">A Transformação Total</h3>
                    <p className="text-muted-foreground">
                      Fizemos a transição completa para No-Code, revolucionando nossa forma de trabalhar e entregando soluções mais rápidas e eficientes para nossos clientes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SobreNos;
