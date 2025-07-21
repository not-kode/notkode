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
    // Navigation
    nav: {
      empresas: "Empresas",
      parcerias: "Parcerias",
      sobre: "Sobre Nós",
      blog: "Blog"
    },
    // Footer
    footer: {
      copyright: "© 2024 Notkode. Todos os direitos reservados.",
      rights: "Todos os direitos reservados.",
      made_with: "Feito com",
      by_notkode: "pela Notkode",
      location: "São Paulo - SP, Brasil",
      cnpj: "CNPJ: 00.000.000/0001-00"
    },
    // Home page
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
      }
    },
    // Companies page
    empresas: {
      hero: {
        new_title: "Transforme sua empresa com IA e No-Code",
        new_subtitle: "Soluções digitais inteligentes para empresas que querem crescer",
        title: "Soluções digitais inteligentes para empresas que querem crescer",
        description: "Desenvolvemos produtos digitais personalizados que automatizam processos, otimizam operações e impulsionam o crescimento do seu negócio usando as mais avançadas tecnologias de IA e No-Code.",
        primaryButton: "Começar Agora",
        secondaryButton: "Ver Cases de Sucesso"
      },
      stats: {
        projects: "Projetos Entregues",
        rating: "Avaliação Média",
        experience: "Anos de Experiência"
      },
      cta: {
        accelerate: "Acelerar Meu Negócio"
      },
      services: {
        title: "Nossos Serviços",
        internal: "Sistemas Internos",
        saas: "Plataformas SaaS",
        ai: "Agentes de IA",
        automation: "Automação",
        figma: "Prototipagem",
        websites: "Sites e Apps Web",
        mobile: "Apps Mobile",
        ecommerce: "E-commerce"
      },
      why: {
        title: "Por que escolher a Notkode?",
        subtitle: "Combinamos tecnologia de ponta com estratégia de negócios para entregar resultados excepcionais",
        cost_benefit: {
          title: "Custo-Benefício Imbatível",
          desc: "Entregamos soluções profissionais a uma fração do custo tradicional"
        },
        ai_experts: {
          title: "Especialistas em IA",
          desc: "Somos pioneiros na aplicação de IA para resolver problemas reais de negócio"
        },
        scalability: {
          title: "Escalabilidade Garantida",
          desc: "Suas soluções crescem junto com seu negócio sem limitações técnicas"
        },
        support: {
          title: "Suporte Completo",
          desc: "Acompanhamento contínuo para garantir o sucesso da sua implementação"
        }
      },
      testimonials: {
        title: "O que nossos clientes dizem"
      },
      process: {
        title: "Nosso Processo Comprovado"
      }
    },
    // Agencies page
    parcerias: {
      hero: {
        badge: "Parceria Estratégica",
        new_title: "Expanda sua agência com nossa parceria",
        title: "Parceria estratégica para agências que querem oferecer mais",
        subtitle: "Transforme sua agência em líder de inovação com nosso suporte técnico completo",
        description: "Amplie seu portfólio de serviços com soluções de IA e No-Code. Oferecemos suporte técnico completo para que sua agência possa entregar projetos inovadores e de alta qualidade aos seus clientes.",
        primaryButton: "Tornar-se Parceiro",
        secondaryButton: "Conhecer Benefícios",
        cta: "Tornar-se Parceiro Estratégico"
      },
      benefits: {
        main_title: "Vantagens da Parceria",
        main_subtitle: "Transforme sua agência com benefícios exclusivos que só a Notkode oferece"
      },
      benefit1: {
        title: "Suporte Técnico Completo",
        desc: "Nossa equipe trabalha lado a lado com você durante todo o projeto"
      },
      benefit2: {
        title: "Tecnologia de Ponta",
        desc: "Acesso às mais avançadas ferramentas de IA e No-Code do mercado"
      },
      benefit3: {
        title: "Margens Atrativas",
        desc: "Estrutura de comissionamento que garante lucratividade em cada projeto"
      },
      services: {
        main_title: "Portfólio de Serviços",
        main_subtitle: "Amplie suas possibilidades com nossa gama completa de soluções",
        ai: "Agentes de IA",
        automation: "Automação de Processos",
        saas: "Plataformas SaaS",
        apps: "Apps e Websites",
        ecommerce: "E-commerce",
        design: "Design e UX"
      },
      service1: {
        desc: "Chatbots inteligentes e assistentes virtuais personalizados"
      },
      service2: {
        desc: "Integração e automação de sistemas e processos empresariais"
      },
      service3: {
        desc: "Plataformas escaláveis para comercializar como produto"
      },
      service4: {
        desc: "Aplicações web e mobile responsivas e otimizadas"
      },
      service5: {
        desc: "Lojas virtuais completas com foco em conversão"
      },
      service6: {
        desc: "Prototipagem e design de interfaces profissionais"
      },
      process: {
        title: "Como Funciona a Parceria",
        subtitle: "Um processo simples e eficiente para começarmos a trabalhar juntos",
        step1: {
          title: "Cadastro e Qualificação",
          desc: "Análise do perfil da sua agência e definição da estrutura de parceria ideal"
        },
        step2: {
          title: "Capacitação e Treinamento",
          desc: "Workshop completo sobre nossas soluções e metodologias de vendas"
        },
        step3: {
          title: "Suporte na Prospecção",
          desc: "Materiais exclusivos e suporte ativo para apresentações e propostas"
        },
        step4: {
          title: "Execução Conjunta",
          desc: "Desenvolvimento colaborativo com nossa equipe técnica especializada"
        },
        result: {
          title: "Agência + Notkode = Resultados Excepcionais",
          desc: "A combinação perfeita entre relacionamento comercial e excelência técnica",
          tag1: "Projetos de Sucesso",
          tag2: "Clientes Satisfeitos",
          tag3: "Crescimento Sustentável"
        }
      }
    },
    // About page
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
          role: "Maga da UX",
          description: "Desde criança, Camila sempre teve uma paixão pela arte - passava horas pintando quadros. Essa veia artística a levou naturalmente ao design, depois ao UX, e finalmente ao desenvolvimento de software. Hoje, ela lidera a Notkode com foco em criar experiências que realmente facilitam a vida dos usuários, transformando sua visão artística em valor real para os negócios.",
          linkedin: "Conectar no LinkedIn"
        },
        matheus: {
          name: "Matheus Tonelotto",
          role: "Nosso Estrategista",
          description: "Com experiência sólida em multinacionais de software e nas startups brasileiras mais bem-sucedidas, Matheus traz uma visão técnica excepcional para a empresa. Especialista em Inteligência Artificial, já liderou projetos para empresas no Canadá, Estados Unidos e Inglaterra. Ele é o estrategista por trás de cada solução, sempre focado em entregar o máximo valor no menor tempo possível.",
          linkedin: "Conectar no LinkedIn"
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
    },
    // Testimonials
    testimonial: {
      bruno: {
        text: "A Notkode transformou completamente nossa abordagem de negócios. A solução de IA que desenvolveram aumentou nossa eficiência em 300% e nos permitiu focar no que realmente importa: nossos clientes."
      },
      rodrigo: {
        text: "Parceria excepcional! A equipe da Notkode entendeu perfeitamente nossas necessidades e entregou uma solução que superou todas as expectativas. Recomendo sem hesitação."
      },
      fernando: {
        text: "A implementação do sistema foi surpreendentemente rápida e os resultados apareceram imediatamente. Nossa produtividade aumentou significativamente desde a primeira semana."
      },
      giovanna: {
        text: "O que mais me impressiona é o suporte contínuo. Não é apenas desenvolvimento, é uma verdadeira parceria estratégica para o crescimento do nosso negócio."
      },
      walter: {
        text: "A solução de automação que a Notkode criou revolucionou nossos processos. Conseguimos reduzir o tempo de resposta aos clientes em 80% e aumentar nossa capacidade de atendimento."
      }
    },
    // Process steps
    process: {
      step1: {
        title: "Análise e Planejamento",
        description: "Mapeamento detalhado das suas necessidades e definição da estratégia mais eficaz"
      },
      step2: {
        title: "Design e Prototipagem", 
        description: "Criação de protótipos visuais para validação antes do desenvolvimento"
      },
      step3: {
        title: "Desenvolvimento Ágil",
        description: "Implementação utilizando as melhores tecnologias No-Code e IA"
      },
      step4: {
        title: "Testes e Validação",
        description: "Testes rigorosos para garantir qualidade e performance otimizada"
      },
      step5: {
        description: "O resultado é uma solução robusta, escalável e perfeitamente alinhada com seus objetivos de negócio"
      }
    }
  },
  en: {
    // Navigation
    nav: {
      empresas: "Companies",
      parcerias: "Partnerships",
      sobre: "About Us",
      blog: "Blog"
    },
    // Footer
    footer: {
      copyright: "© 2024 Notkode. All rights reserved.",
      rights: "All rights reserved.",
      made_with: "Made with",
      by_notkode: "by Notkode",
      location: "São Paulo - SP, Brazil",
      cnpj: "CNPJ: 00.000.000/0001-00"
    },
    // Home page
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
      }
    },
    // Companies page
    empresas: {
      hero: {
        new_title: "Transform your company with AI and No-Code",
        new_subtitle: "Smart digital solutions for companies that want to grow",
        title: "Smart digital solutions for companies that want to grow",
        description: "We develop customized digital products that automate processes, optimize operations and boost your business growth using the most advanced AI and No-Code technologies.",
        primaryButton: "Get Started",
        secondaryButton: "See Success Cases"
      },
      stats: {
        projects: "Projects Delivered",
        rating: "Average Rating",
        experience: "Years of Experience"
      },
      cta: {
        accelerate: "Accelerate My Business"
      },
      services: {
        title: "Our Services",
        internal: "Internal Systems",
        saas: "SaaS Platforms",
        ai: "AI Agents",
        automation: "Automation",
        figma: "Prototyping",
        websites: "Websites & Web Apps",
        mobile: "Mobile Apps",
        ecommerce: "E-commerce"
      },
      why: {
        title: "Why choose Notkode?",
        subtitle: "We combine cutting-edge technology with business strategy to deliver exceptional results",
        cost_benefit: {
          title: "Unbeatable Cost-Benefit",
          desc: "We deliver professional solutions at a fraction of traditional cost"
        },
        ai_experts: {
          title: "AI Specialists",
          desc: "We are pioneers in applying AI to solve real business problems"
        },
        scalability: {
          title: "Guaranteed Scalability",
          desc: "Your solutions grow with your business without technical limitations"
        },
        support: {
          title: "Complete Support",
          desc: "Continuous follow-up to ensure your implementation success"
        }
      },
      testimonials: {
        title: "What our clients say"
      },
      process: {
        title: "Our Proven Process"
      }
    },
    // Agencies page
    parcerias: {
      hero: {
        badge: "Strategic Partnership",
        new_title: "Expand your agency with our partnership",
        title: "Strategic partnership for agencies that want to offer more",
        subtitle: "Transform your agency into an innovation leader with our complete technical support",
        description: "Expand your service portfolio with AI and No-Code solutions. We offer complete technical support so your agency can deliver innovative and high-quality projects to your clients.",
        primaryButton: "Become a Partner",
        secondaryButton: "Learn Benefits",
        cta: "Become Strategic Partner"
      },
      benefits: {
        main_title: "Partnership Advantages",
        main_subtitle: "Transform your agency with exclusive benefits that only Notkode offers"
      },
      benefit1: {
        title: "Complete Technical Support",
        desc: "Our team works side by side with you throughout the entire project"
      },
      benefit2: {
        title: "Cutting-edge Technology",
        desc: "Access to the most advanced AI and No-Code tools in the market"
      },
      benefit3: {
        title: "Attractive Margins",
        desc: "Commission structure that guarantees profitability in every project"
      },
      services: {
        main_title: "Service Portfolio",
        main_subtitle: "Expand your possibilities with our complete range of solutions",
        ai: "AI Agents",
        automation: "Process Automation",
        saas: "SaaS Platforms",
        apps: "Apps & Websites",
        ecommerce: "E-commerce",
        design: "Design & UX"
      },
      service1: {
        desc: "Intelligent chatbots and personalized virtual assistants"
      },
      service2: {
        desc: "Integration and automation of business systems and processes"
      },
      service3: {
        desc: "Scalable platforms to commercialize as products"
      },
      service4: {
        desc: "Responsive and optimized web and mobile applications"
      },
      service5: {
        desc: "Complete virtual stores with focus on conversion"
      },
      service6: {
        desc: "Professional interface prototyping and design"
      },
      process: {
        title: "How the Partnership Works",
        subtitle: "A simple and efficient process to start working together",
        step1: {
          title: "Registration and Qualification",
          desc: "Analysis of your agency profile and definition of the ideal partnership structure"
        },
        step2: {
          title: "Capacity Building and Training",
          desc: "Complete workshop on our solutions and sales methodologies"
        },
        step3: {
          title: "Prospecting Support",
          desc: "Exclusive materials and active support for presentations and proposals"
        },
        step4: {
          title: "Joint Execution",
          desc: "Collaborative development with our specialized technical team"
        },
        result: {
          title: "Agency + Notkode = Exceptional Results",
          desc: "The perfect combination of commercial relationship and technical excellence",
          tag1: "Successful Projects",
          tag2: "Satisfied Clients",
          tag3: "Sustainable Growth"
        }
      }
    },
    // About page
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
          role: "UX Wizard",
          description: "Since childhood, Camila has always had a passion for art - she spent hours painting. This artistic vein naturally led her to design, then UX, and finally software development. Today, she leads Notkode with a focus on creating experiences that truly make users' lives easier, transforming her artistic vision into real business value.",
          linkedin: "Connect on LinkedIn"
        },
        matheus: {
          name: "Matheus Tonelotto",
          role: "Our Strategist",
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
    },
    // Testimonials
    testimonial: {
      bruno: {
        text: "Notkode completely transformed our business approach. The AI solution they developed increased our efficiency by 300% and allowed us to focus on what really matters: our customers."
      },
      rodrigo: {
        text: "Exceptional partnership! The Notkode team perfectly understood our needs and delivered a solution that exceeded all expectations. I recommend without hesitation."
      },
      fernando: {
        text: "The system implementation was surprisingly fast and results appeared immediately. Our productivity increased significantly from the first week."
      },
      giovanna: {
        text: "What impresses me most is the continuous support. It's not just development, it's a true strategic partnership for our business growth."
      },
      walter: {
        text: "The automation solution that Notkode created revolutionized our processes. We managed to reduce client response time by 80% and increase our service capacity."
      }
    },
    // Process steps
    process: {
      step1: {
        title: "Analysis and Planning",
        description: "Detailed mapping of your needs and definition of the most effective strategy"
      },
      step2: {
        title: "Design and Prototyping", 
        description: "Creation of visual prototypes for validation before development"
      },
      step3: {
        title: "Agile Development",
        description: "Implementation using the best No-Code and AI technologies"
      },
      step4: {
        title: "Testing and Validation",
        description: "Rigorous testing to ensure quality and optimized performance"
      },
      step5: {
        description: "The result is a robust, scalable solution perfectly aligned with your business objectives"
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