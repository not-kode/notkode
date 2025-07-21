import React, { createContext, useContext, useState } from 'react';

interface LanguageContextProps {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, options?: any) => any;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
}

const translations = {
  pt: {
    home: {
      title: "Notkode - Transforme sua visão em realidade com IA e No-Code",
      description: "Desenvolvimento de produtos digitais com Inteligência Artificial e No-Code. Crie soluções inovadoras e eficientes para o seu negócio.",
      whatsapp: "Fale com Nossa Equipe",
      hero: {
        title: "O futuro do desenvolvimento de produtos digitais chegou",
        subtitle: "Inteligência Artificial + No-Code",
        description: "A Notkode capacita empresas e agências a inovar e crescer com soluções digitais de ponta, combinando o poder da Inteligência Artificial com a agilidade do No-Code.",
        primaryButton: "Começar Agora",
        secondaryButton: "Ver Portfólio"
      },
      services: {
        title: "Nossos Serviços",
        description: "Oferecemos uma gama completa de serviços para impulsionar a sua transformação digital. Desde a consultoria estratégica até a implementação de soluções personalizadas, estamos prontos para atender às suas necessidades.",
        aiAgents: {
          title: "Agentes de IA",
          description: "Desenvolvemos agentes de IA personalizados para automatizar tarefas, otimizar processos e impulsionar a inteligência do seu negócio."
        },
        noCodeDevelopment: {
          title: "Desenvolvimento No-Code",
          description: "Criamos aplicações web e mobile de alta performance, sem a necessidade de código, garantindo agilidade, flexibilidade e redução de custos."
        },
        digitalTransformation: {
          title: "Transformação Digital",
          description: "Ajudamos você a repensar o seu negócio, implementando soluções digitais inovadoras que geram valor e vantagem competitiva."
        }
      },
      portfolio: {
        title: "Projetos de Destaque",
        description: "Explore alguns dos projetos que tivemos o prazer de desenvolver. Cada um deles é uma prova do nosso compromisso com a inovação, a qualidade e a satisfação do cliente."
      },
      testimonials: {
        title: "O que nossos clientes dizem",
        description: "Acreditamos que a melhor forma de demonstrar o valor do nosso trabalho é através das palavras de quem já experimentou a transformação digital com a Notkode."
      },
      contact: {
        title: "Vamos Inovar Juntos?",
        description: "Entre em contato conosco e descubra como a Notkode pode ajudar a sua empresa a alcançar novos patamares de sucesso com soluções digitais inovadoras e personalizadas."
      },
      footer: {
        copyright: "© 2024 Notkode. Todos os direitos reservados."
      }
    },
    about: {
      hero: {
        badge: "Onde ideias se transformam em soluções reais",
        description: "Nascemos em 2021 com a missão de democratizar a tecnologia, ajudando empresas e agências a crescerem sem as barreiras tradicionais do desenvolvimento."
      },
      timeline: {
        title: "Nossa jornada de transformação",
        items: [
          {
            date: "Início de 2021",
            title: "Os Primeiros Passos",
            description: "Começamos nossa trajetória utilizando tecnologias consolidadas do mercado como WordPress e Figma. Era nosso ponto de partida para entender as reais necessidades dos clientes."
          },
          {
            date: "Meio de 2021",
            title: "A Descoberta do No-Code",
            description: "Percebemos o movimento revolucionário que as plataformas No-Code estavam criando globalmente. Ainda era território inexplorado - o conceito de desenvolver sem escrever código diretamente estava apenas chegando ao mercado brasileiro. Vimos uma oportunidade única."
          },
          {
            date: "Dezembro de 2022",
            title: "O Momento Decisivo",
            description: "Tivemos acesso antecipado ao ChatGPT e nossa visão sobre o futuro da tecnologia mudou completamente. Era o início de uma nova era, e decidimos focar em nos tornar especialistas em aplicar Inteligência Artificial para otimizar negócios reais."
          },
          {
            date: "Janeiro de 2023",
            title: "Expandindo o Arsenal",
            description: "Mapeamos intensivamente o que o mercado oferecia de mais inovador. Expandimos nosso leque de ferramentas e criamos um plano estratégico para ter o melhor arsenal tecnológico disponível para nossos clientes."
          },
          {
            date: "Março de 2023",
            title: "Decolagem Internacional",
            description: "A Notkode alça voo além das fronteiras brasileiras. Começamos a atender empresas dos Estados Unidos, Canadá e Inglaterra, provando que nossa abordagem funciona em qualquer mercado."
          },
          {
            date: "2024",
            title: "A Era da IA",
            description: "A Inteligência Artificial ganha força inédita no mercado. Nos consolidamos entregando desenvolvimento pautado em IA e criando Agentes de IA de todos os tipos, sempre focados em resultados concretos para nossos clientes."
          },
          {
            date: "2025",
            title: "O Presente",
            description: "Estamos vivendo nosso melhor momento, com uma metodologia consolidada e tecnologias de ponta. Este é o ano em que você ainda pode se tornar nosso próximo case de sucesso e transformar suas ideias em resultados reais para seu negócio."
          }
        ]
      },
      founders: {
        title: "Quem está por trás da Notkode",
        camila: {
          name: "Camila Tonelotto",
          role: "CEO",
          description: "Desde criança, Camila sempre teve uma paixão pela arte - passava horas pintando quadros. Essa veia artística a levou naturalmente ao design, depois ao UX, e finalmente ao desenvolvimento de software. Hoje, ela lidera a Notkode com foco em criar experiências que realmente facilitam a vida dos usuários, transformando sua visão artística em valor real para os negócios.",
          linkedin: "Se conectar no LinkedIn"
        },
        matheus: {
          name: "Matheus Tonelotto",
          role: "CTO",
          description: "Com experiência sólida em multinacionais de software e nas startups brasileiras mais bem-sucedidas, Matheus traz uma visão técnica excepcional para a empresa. Especialista em Inteligência Artificial, já liderou projetos para empresas no Canadá, Estados Unidos e Inglaterra. Ele é o estrategista por trás de cada solução, sempre focado em entregar o máximo valor no menor tempo possível.",
          linkedin: "Se conectar no LinkedIn"
        }
      },
      contact: {
        title: "Informações de Contato",
        whatsapp: "WhatsApp",
        email: "E-mail",
        location: "Localização",
        locationValue: "Zona Sul, São Paulo - SP"
      },
      cta: {
        title: "Pronto para transformar sua empresa?",
        description: "Seja você uma empresa buscando crescer ou uma agência querendo expandir seus serviços, estamos aqui para ajudar você a escrever o próximo capítulo da sua história de sucesso.",
        button: "Falar com Nossa Equipe",
        features: [
          {
            title: "Solução Completa",
            description: "Desde a concepção até a implementação, cuidamos de toda a jornada do seu projeto tecnológico."
          },
          {
            title: "Resultados Mensuráveis",
            description: "Focamos em entregar valor real para o seu negócio, com métricas claras e resultados tangíveis."
          },
          {
            title: "Experiência Internacional",
            description: "Atendemos empresas no Brasil, Estados Unidos, Canadá e Inglaterra com a mesma excelência."
          }
        ]
      }
    }
  },
  en: {
    home: {
      title: "Notkode - Turn your vision into reality with AI and No-Code",
      description: "Digital product development with Artificial Intelligence and No-Code. Create innovative and efficient solutions for your business.",
      whatsapp: "Talk to Our Team",
      hero: {
        title: "The future of digital product development has arrived",
        subtitle: "Artificial Intelligence + No-Code",
        description: "Notkode empowers companies and agencies to innovate and grow with cutting-edge digital solutions, combining the power of Artificial Intelligence with the agility of No-Code.",
        primaryButton: "Get Started",
        secondaryButton: "See Portfolio"
      },
      services: {
        title: "Our Services",
        description: "We offer a complete range of services to boost your digital transformation. From strategic consulting to the implementation of customized solutions, we are ready to meet your needs.",
        aiAgents: {
          title: "AI Agents",
          description: "We develop personalized AI agents to automate tasks, optimize processes and boost the intelligence of your business."
        },
        noCodeDevelopment: {
          title: "No-Code Development",
          description: "We create high-performance web and mobile applications, without the need for code, ensuring agility, flexibility and cost reduction."
        },
        digitalTransformation: {
          title: "Digital Transformation",
          description: "We help you rethink your business, implementing innovative digital solutions that generate value and competitive advantage."
        }
      },
      portfolio: {
        title: "Featured Projects",
        description: "Explore some of the projects we have had the pleasure of developing. Each one is a proof of our commitment to innovation, quality and customer satisfaction."
      },
      testimonials: {
        title: "What our clients say",
        description: "We believe that the best way to demonstrate the value of our work is through the words of those who have already experienced digital transformation with Notkode."
      },
      contact: {
        title: "Let's Innovate Together?",
        description: "Get in touch with us and discover how Notkode can help your company reach new levels of success with innovative and personalized digital solutions."
      },
      footer: {
        copyright: "© 2024 Notkode. All rights reserved."
      }
    },
    about: {
      hero: {
        badge: "Where ideas transform into real solutions",
        description: "Founded in 2021 with the mission to democratize technology, helping companies and agencies grow without traditional development barriers."
      },
      timeline: {
        title: "Our transformation journey",
        items: [
          {
            date: "Early 2021",
            title: "The First Steps",
            description: "We started our journey using consolidated market technologies like WordPress and Figma. It was our starting point to understand real client needs."
          },
          {
            date: "Mid 2021",
            title: "The No-Code Discovery",
            description: "We recognized the revolutionary movement that No-Code platforms were creating globally. It was still uncharted territory - the concept of developing without writing code directly was just arriving in the Brazilian market. We saw a unique opportunity."
          },
          {
            date: "December 2022",
            title: "The Decisive Moment",
            description: "We gained early access to ChatGPT and our vision about the future of technology completely changed. It was the beginning of a new era, and we decided to focus on becoming experts in applying Artificial Intelligence to optimize real businesses."
          },
          {
            date: "January 2023",
            title: "Expanding the Arsenal",
            description: "We intensively mapped what the market offered in terms of innovation. We expanded our range of tools and created a strategic plan to have the best technological arsenal available for our clients."
          },
          {
            date: "March 2023",
            title: "International Takeoff",
            description: "Notkode takes flight beyond Brazilian borders. We began serving companies in the United States, Canada, and England, proving our approach works in any market."
          },
          {
            date: "2024",
            title: "The AI Era",
            description: "Artificial Intelligence gains unprecedented strength in the market. We consolidated our position delivering AI-driven development and creating AI Agents of all types, always focused on concrete results for our clients."
          },
          {
            date: "2025",
            title: "The Present",
            description: "We're living our best moment, with a consolidated methodology and cutting-edge technologies. This is the year you can still become our next success case and transform your ideas into real results for your business."
          }
        ]
      },
      founders: {
        title: "Who's behind Notkode",
        camila: {
          name: "Camila Tonelotto",
          role: "CEO",
          description: "Since childhood, Camila has always had a passion for art - she spent hours painting. This artistic vein naturally led her to design, then UX, and finally software development. Today, she leads Notkode with a focus on creating experiences that truly make users' lives easier, transforming her artistic vision into real business value.",
          linkedin: "Connect on LinkedIn"
        },
        matheus: {
          name: "Matheus Tonelotto",
          role: "CTO",
          description: "With solid experience in software multinationals and Brazil's most successful startups, Matheus brings exceptional technical vision to the company. An Artificial Intelligence specialist, he has led projects for companies in Canada, the United States, and England. He's the strategist behind every solution, always focused on delivering maximum value in the shortest time possible.",
          linkedin: "Connect on LinkedIn"
        }
      },
      contact: {
        title: "Contact Information",
        whatsapp: "WhatsApp",
        email: "Email",
        location: "Location",
        locationValue: "South Zone, São Paulo - SP"
      },
      cta: {
        title: "Ready to transform your company?",
        description: "Whether you're a company looking to grow or an agency wanting to expand your services, we're here to help you write the next chapter of your success story.",
        button: "Talk to Our Team",
        features: [
          {
            title: "Complete Solution",
            description: "From conception to implementation, we handle your entire technological project journey."
          },
          {
            title: "Measurable Results",
            description: "We focus on delivering real value to your business, with clear metrics and tangible results."
          },
          {
            title: "International Experience",
            description: "We serve companies in Brazil, United States, Canada, and England with the same excellence."
          }
        ]
      }
    }
  }
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState('pt');

  const t = (key: string, options?: any): any => {
    const keys = key.split('.');
    let value: any = translations[language as keyof typeof translations];
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Fallback to the key if translation is missing
      }
    }

    if (typeof value === 'string') {
      return value;
    } else if (typeof value === 'function') {
      return value(options);
    } else {
      return value; // Return the value as-is if it's an array or object
    }
  };

  const contextValue: LanguageContextProps = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
