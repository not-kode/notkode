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
      copyright: "© 2025 Notkode. Todos os direitos reservados.",
      rights: "Todos os direitos reservados.",
      made_with: "Feito com",
      by_notkode: "pela Notkode",
      location: "São Paulo - SP, Brasil",
      cnpj: "CNPJ: 46.733.108/0001-94"
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
        new_title: "Soluções Tecnológicas Sob Medida",
        new_subtitle: "Desenvolvemos tecnologia que acelera sua empresa em tempo recorde",
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
          title: "Custo-Benefício",
          desc: "Projetos entregues em até 50% menos tempo, com economia de até 60% comparado ao desenvolvimento tradicional."
        },
        ai_experts: {
          title: "Especialistas em Inteligência Artificial",
          desc: "Trabalhamos com IA muito antes dela estar no hype (na moda), dominamos as mais avançadas tecnologias de IA para criar soluções realmente inteligentes."
        },
        scalability: {
          title: "Escalabilidade",
          desc: "Soluções que crescem junto com seu negócio, contando com protocolos de segurança avançados e atualizações automáticas."
        },
        support: {
          title: "Suporte Dedicado",
          desc: "Acompanhamento completo durante e após o desenvolvimento. Estamos a uma mensagem de distância, com canal de contato 100% disponível. Precisou? É só nos chamar no Whatsapp!"
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
        new_title: "Multiplique sua receita terceirizando serviços de desenvolvimento",
        title: "Parceria estratégica para agências que querem oferecer mais",
        subtitle: "",
        description: "Amplie seu portfólio de serviços com soluções de IA e No-Code. Oferecemos suporte técnico completo para que sua agência possa entregar projetos inovadores e de alta qualidade aos seus clientes.",
        primaryButton: "Tornar-se Parceiro",
        secondaryButton: "Conhecer Benefícios",
        cta: "Tornar-se Parceiro Estratégico"
      },
      benefits: {
        main_title: "Por que escolher nossa parceria?",
        main_subtitle: "Vantagens exclusivas que transformam sua agência em uma operação completa"
      },
      benefit1: {
        title: "Ofereça mais serviços aos seus clientes",
        desc: "Agregue os nossos serviços ao seu portfolio, oferecendo soluções completas sem precisar contratar desenvolvedores ou designers internos"
      },
      benefit2: {
        title: "Especialistas em Inteligência Artificial",
        desc: "Equipe especializada nas mais avançadas tecnologias de IA e automação"
      },
      benefit3: {
        title: "Entrega garantida com qualidade Notkode",
        desc: "Não corra riscos técnicos, garantimos qualidade premium da entrega e a satisfação do seu cliente com nosso track record comprovado"
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
          title: "Apresente o Projeto",
          desc: "Compartilhe os detalhes do projeto do seu cliente conosco. Analisamos requisitos, objetivos e expectativas para criar a proposta ideal."
        },
        step2: {
          title: "Receba Proposta",
          desc: "Elaboramos cronograma detalhado, valores transparentes e especificações técnicas completas. Tudo pensado para que você fique no controle de todo o processo e sempre saiba o que está acontecendo."
        },
        step3: {
          title: "Alinhamento da entrega",
          desc: "Combinamos quem irá gerenciar o projeto, aqui você escolhe se o seu cliente saberá que existimos ou você prefere realizar toda interface com o cliente e contar com nosso trabalho via bastidores."
        },
        step4: {
          title: "Desenvolvimento FastForge™",
          desc: "Nossa metodologia de entrega validada, garante que semana a semana o projeto progrida, com você acompanhando o desenvolvimento em tempo real e podendo ajustar a direção do projeto enquanto ele ainda está nascendo."
        },
        result: {
          title: "Agência + Notkode = Resultados Excepcionais",
          desc: "A combinação perfeita entre relacionamento comercial e excelência técnica",
          tag1: "Projetos de Sucesso",
          tag2: "Clientes Satisfeitos",
          tag3: "Crescimento Sustentável"
        }
      },
      cta: {
        feature1: {
          title: "Orçamento Gratuito",
          desc: "Análise completa sem compromisso"
        },
        feature2: {
          title: "Consultoria Inclusa",
          desc: "Orientação estratégica para seu projeto"
        },
        feature3: {
          title: "Entrega Rápida",
          desc: "Projetos entregues em tempo recorde"
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
        text: "A Notkode foi primordial para o rápido lançamento do meu projeto. Desde o primeiro contato com a Camila, tive uma atenção fora da curva, desde a negociação, durante o projeto e a entrega do site em si. Altíssima qualidade, técnica, agilidade e seriedade. Recomendo fortemente!"
      },
      rodrigo: {
        text: "Atendimento mega atencioso, atentos a cada detalhe e ideia, sempre com contrapontos lógicos e eficientes. O projeto foi entregue dentro do prazo e a qualidade foi perfeita. Indico com toda certeza."
      },
      fernando: {
        text: "Gostei muito de todo o processo, foi tudo muito profissional e podemos transformar rapidamente as ideias que tinha em realidade. Estou muito feliz com o resultado."
      },
      giovanna: {
        text: "A NotKode foi fundamental para o lançamento da ZapInside. Em pouco tempo já havíamos começado a desenvolver a ideia e em três semanas já estávamos recebendo o primeiro cliente. Super recomendo para todos os empreendedores que precisarem colocar usa ideia no ar!"
      },
      walter: {
        text: "Depois que você atinge os primeiros 10 mil de faturamento com o seu SaaS, você precisa ir melhorando todo o seu funil, desde o site até o produto, para poder continuar crescendo e obtendo um bom LTV. A Notkode foi fundamental para otimizar toda a jornada do cliente e desenvolver o software ideal para conseguirmos superar o nosso desafio."
      }
    },
    // Process steps
    process: {
      business_knowledge_title: "Conhecimento em Negócios + Desenvolvimento + IA",
      custom_solution: "Solução Sob Medida",
      record_time: "Tempo Recorde",
      guaranteed_results: "Resultados Garantidos",
      step1: {
        title: "Análise Estratégica",
        description: "Mergulhamos no seu negócio para entender desafios, oportunidades e objetivos. Mapeamos processos atuais e identificamos como a solução desejada vai impactar diretamente nos resultados."
      },
      step2: {
        title: "Estratégia Inteligente", 
        description: "Definimos a arquitetura ideal, escolhemos as tecnologias mais adequadas e criamos nosso plano de ação onde cada decisão é pensada para obter o melhor tempo de entrega possível e maximizar o retorno do seu investimento."
      },
      step3: {
        title: "Desenvolvimento Ágil",
        description: "Ao utilizar as abordagens mais modernas, construímos sua solução em tempo recorde. Entregas incrementais permitem o seu acompanhamento em tempo real, garantindo que você veja o progresso e possa ajustar o rumo quando necessário."
      },
      step4: {
        title: "Lançamento & Crescimento",
        description: "Hora de decolar! Nossa estratégia de lançamento (go-live), conta com suporte contínuo, monitoramento de performance e melhorias baseadas em dados reais de uso, tudo pensado para que sua nova solução inicie seu ciclo com o pé direito."
      },
      step5: {
        description: "A fórmula perfeita que entrega uma soluções tecnológica que realmente faz a diferença, da forma que sua empresa precisa, em tempo recorde."
      }
    },
    // Portfolio
    portfolio: {
      title: "Projetos de Destaque", 
      subtitle: "Explore alguns dos projetos que tivemos o prazer de desenvolver",
      filter_title: "Filtrar por categoria",
      filters: {
        all: "Todos os Projetos"
      },
      view_project: "Ver Projeto",
      no_projects: "Nenhum projeto encontrado para os filtros selecionados",
      autoagentes: {
        description: "SaaS de criação de Agentes de IA, focado em permitir com que donos de pequenas e médias empresas possam automatizar o atendimento dos clientes no whatsapp, substituindo a contratação de funcionários humanos e tornando sua empresa mais eficiente."
      },
      ativa: {
        description: "SaaS focado em permitir com que donos de pequenas e médias empresas aumentassem o resultado obtido através de campanhas (envios em massa) realizadas por e-mail e Whatsapp. A grande sacada deste produto é que todo o conteúdo enviado, é 100% personalizado pela IA da Ativa Clientes utilizando o contexto daquele respectivo contato, fazendo com que cada e-mail ou whatsapp seja muito mais relevante pela ótica do cliente."
      },
      zapinside: {
        description: "E se você pudesse ver tudo o que acontece nas conversas de WhatsApp do seu time que realiza atendimentos? É este desafio que este SaaS resolve, as conversas do WhatsApp revelam tudo o que você precisa saber sobre seus leads e sua equipe de vendas ou de atendimento. A gente analisa tudo pra você — e entrega insights acionáveis de forma clara, rápida e prática. Tudo com IA e zero esforço manual."
      },
      noodrops: {
        description: "E-commerce destinado a comercialização das Smart Pills da Noodrops, a opção perfeita pra você cuidar do seu cérebro, seja com performance, seja com saúde cerebral. Somos a Smart Pill Nº1 no Brasil, a mais querida e mais recomendada."
      },
      loss: {
        description: "Empresa de consultoria com mais de 20 anos de mercado, onde realizamos em colaboração com o time da Loss Prevention, toda a modernização do processo comercial: incluindo o desenvolvimento do novo site, estruturação de todo o processo comercial no AirTable com o envio de e-mail em massa já integrado no Sendgrid, garantindo um servidor de envio de e-mail focado em performance. Foi automatizado via formulário e n8n, quando o lead preenche o formulário de interesse o envio das condições dos respectivo curso e coleta automática da inscrição (venda) para o aluno."
      },
      solojet: {
        description: "A Solojet Aviação é o único grupo de aviação executiva no Brasil que oferece uma solução completa, desde a venda e compartilhamento de aeronaves até gestão e manutenção especializada. O embaixador da Solojet é Álvaro Garnero: empresário, apresentador de televisão, investidor e administrador de empresas brasileiro. A quatro mãos projetamos todo o novo site para garantir que independente da linha de produto ou serviço desejada, o cliente agora encontra facilmente as respostas que busca e consegue facilmente entrar em contato para prosseguir na sua jornada de compra com baixo esforço. Ao demonstrar interesse o lead preenche o formulário e a integração desenvolvida leva seus dados para o RD Station, avisando o responsável para realizar o atendimento da venda com o lead já triado."
      }
    },
    // Categories
    category: {
      saas: "SaaS",
      ecommerce: "E-commerce",
      website: "Website"
    },
    // Common terms
    common: {
      launch: "Lançamento",
      revenue: "Receita",
      technologies: "Tecnologias",
      contact: "Entrar em Contato"
    },
    // CTA sections
    cta: {
      empresas: {
        title: "Pronto para acelerar sua empresa?",
        subtitle: "Entre em contato conosco e descubra como podemos transformar sua ideia em uma solução tecnológica de sucesso."
      },
      parcerias: {
        title: "Pronto para escalar sua agência?",
        subtitle: "Entre em contato conosco e descubra como podemos ajudar você a oferecer mais serviços aos seus clientes sem aumentar seus custos."
      },
      feature1: {
        title: "Diagnóstico Gratuito",
        desc: "Análise completa do seu negócio"
      },
      feature2: {
        title: "Entrega Rápida", 
        desc: "Projetos em tempo recorde"
      },
      feature3: {
        title: "Suporte Dedicado",
        desc: "Acompanhamento total do projeto"
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
      copyright: "© 2025 Notkode. All rights reserved.",
      rights: "All rights reserved.",
      made_with: "Made with",
      by_notkode: "by Notkode",
      location: "São Paulo - SP, Brazil",
      cnpj: "CNPJ: 46.733.108/0001-94"
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
        new_title: "Custom Technology Solutions",
        new_subtitle: "We develop technology that accelerates your company in record time",
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
          title: "Cost-Benefit",
          desc: "Projects delivered up to 50% faster, with savings of up to 60% compared to traditional development."
        },
        ai_experts: {
          title: "Artificial Intelligence Specialists",
          desc: "We worked with AI long before it was hype (trending), we master the most advanced AI technologies to create truly intelligent solutions."
        },
        scalability: {
          title: "Scalability",
          desc: "Solutions that grow with your business, featuring advanced security protocols and automatic updates."
        },
        support: {
          title: "Dedicated Support",
          desc: "Complete follow-up during and after development. We are just a message away, with 100% available contact channel. Need help? Just call us on WhatsApp!"
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
        new_title: "Multiply your revenue by outsourcing development services",
        title: "Strategic partnership for agencies that want to offer more",
        subtitle: "",
        description: "Expand your service portfolio with AI and No-Code solutions. We offer complete technical support so your agency can deliver innovative and high-quality projects to your clients.",
        primaryButton: "Become a Partner",
        secondaryButton: "Learn Benefits",
        cta: "Become Strategic Partner"
      },
      benefits: {
        main_title: "Why choose our partnership?",
        main_subtitle: "Exclusive advantages that transform your agency into a complete operation"
      },
      benefit1: {
        title: "Offer more services to your clients",
        desc: "Add our services to your portfolio, offering complete solutions without needing to hire internal developers or designers"
      },
      benefit2: {
        title: "Artificial Intelligence Specialists",
        desc: "Team specialized in the most advanced AI and automation technologies"
      },
      benefit3: {
        title: "Guaranteed delivery with Notkode quality",
        desc: "Don't take technical risks, we guarantee premium delivery quality and your client's satisfaction with our proven track record"
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
          title: "Present the Project",
          desc: "Share your client's project details with us. We analyze requirements, objectives and expectations to create the ideal proposal."
        },
        step2: {
          title: "Receive Proposal",
          desc: "We elaborate detailed timeline, transparent values and complete technical specifications. Everything designed so you stay in control of the entire process and always know what's happening."
        },
        step3: {
          title: "Delivery Alignment",
          desc: "We agree on who will manage the project, here you choose if your client will know we exist or you prefer to handle all interface with the client and count on our behind-the-scenes work."
        },
        step4: {
          title: "FastForge™ Development",
          desc: "Our validated delivery methodology ensures that week by week the project progresses, with you following development in real time and being able to adjust the project direction while it's still being born."
        },
        result: {
          title: "Agency + Notkode = Exceptional Results",
          desc: "The perfect combination of commercial relationship and technical excellence",
          tag1: "Successful Projects",
          tag2: "Satisfied Clients",
          tag3: "Sustainable Growth"
        }
      },
      cta: {
        feature1: {
          title: "Continuous Innovation",
          desc: "Always at the forefront of technologies"
        },
        feature2: {
          title: "Long-lasting Relationship",
          desc: "Long-term partnership for mutual growth"
        },
        feature3: {
          title: "Proven Results",
          desc: "Track record of successful projects"
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
        text: "Notkode was essential for the rapid launch of my project. From the first contact with Camila, I received exceptional attention throughout the negotiation, during the project and the website delivery itself. Highest quality, technique, agility and seriousness. I strongly recommend!"
      },
      rodrigo: {
        text: "Super attentive service, attentive to every detail and idea, always with logical and efficient counterpoints. The project was delivered on time and the quality was perfect. I definitely recommend."
      },
      fernando: {
        text: "I really liked the whole process, everything was very professional and we were able to quickly transform the ideas I had into reality. I'm very happy with the result."
      },
      giovanna: {
        text: "NotKode was fundamental for ZapInside's launch. In a short time we had already started developing the idea and in three weeks we were already receiving our first client. I highly recommend it to all entrepreneurs who need to get their idea online!"
      },
      walter: {
        text: "After you reach your first 10k in revenue with your SaaS, you need to keep improving your entire funnel, from the website to the product, to continue growing and achieving good LTV. Notkode was fundamental to optimize the entire customer journey and develop the ideal software to overcome our challenge."
      }
    },
    // Process steps
    process: {
      business_knowledge_title: "Business Knowledge + Development + AI",
      custom_solution: "Custom Solution",
      record_time: "Record Time",
      guaranteed_results: "Guaranteed Results",
      step1: {
        title: "Strategic Analysis",
        description: "We dive deep into your business to understand challenges, opportunities and objectives. We map current processes and identify how the desired solution will directly impact results."
      },
      step2: {
        title: "Smart Strategy", 
        description: "We define the ideal architecture, choose the most suitable technologies and create our action plan where each decision is designed to achieve the best delivery time possible and maximize your investment return."
      },
      step3: {
        title: "Agile Development",
        description: "Using the most modern approaches, we build your solution in record time. Incremental deliveries allow you to track in real time, ensuring you see progress and can adjust course when needed."
      },
      step4: {
        title: "Launch & Growth",
        description: "Time to take off! Our go-live strategy features continuous support, performance monitoring and improvements based on real usage data, all designed so your new solution starts its cycle on the right foot."
      },
      step5: {
        description: "The perfect formula that delivers a technological solution that really makes a difference, the way your company needs, in record time."
      }
    },
    // Portfolio
    portfolio: {
      title: "Featured Projects", 
      subtitle: "Explore some of the projects we have had the pleasure of developing",
      filter_title: "Filter by category",
      filters: {
        all: "All Projects"
      },
      view_project: "View Project",
      no_projects: "No projects found for the selected filters",
      autoagentes: {
        description: "AI Agent creation SaaS, focused on enabling small and medium business owners to automate customer service on WhatsApp, replacing the need to hire human employees and making their company more efficient."
      },
      ativa: {
        description: "SaaS focused on enabling small and medium business owners to increase results obtained through campaigns (mass mailings) performed via email and WhatsApp. The great advantage of this product is that all content sent is 100% personalized by Ativa Clientes' AI using the context of that respective contact, making each email or WhatsApp much more relevant from the customer's perspective."
      },
      zapinside: {
        description: "What if you could see everything that happens in your customer service team's WhatsApp conversations? This is the challenge this SaaS solves. WhatsApp conversations reveal everything you need to know about your leads and your sales or customer service team. We analyze everything for you — and deliver actionable insights clearly, quickly and practically. All with AI and zero manual effort."
      },
      noodrops: {
        description: "E-commerce dedicated to selling Noodrops Smart Pills, the perfect option for you to take care of your brain, whether for performance or brain health. We are the #1 Smart Pill in Brazil, the most loved and most recommended."
      },
      loss: {
        description: "Consulting company with over 20 years in the market, where we performed in collaboration with the Loss Prevention team, a complete modernization of the commercial process: including the development of the new website, structuring the entire commercial process in AirTable with mass email sending already integrated into Sendgrid, ensuring a performance-focused email sending server. It was automated via form and n8n, when the lead fills out the interest form, the conditions of the respective course are sent and automatic collection of enrollment (sale) for the student."
      },
      solojet: {
        description: "Solojet Aviation is the only executive aviation group in Brazil that offers a complete solution, from aircraft sales and sharing to specialized management and maintenance. Solojet's ambassador is Álvaro Garnero: Brazilian businessman, television presenter, investor and business administrator. Together we designed the entire new website to ensure that regardless of the desired product line or service, the customer now easily finds the answers they seek and can easily get in touch to proceed in their purchasing journey with low effort. When showing interest, the lead fills out the form and the developed integration takes their data to RD Station, notifying the responsible person to handle the sales service with the lead already screened."
      }
    },
    // Categories
    category: {
      saas: "SaaS",
      ecommerce: "E-commerce",
      website: "Website"
    },
    // Common terms
    common: {
      launch: "Launch",
      revenue: "Revenue",
      technologies: "Technologies",
      contact: "Get In Touch"
    },
    // CTA sections
    cta: {
      empresas: {
        title: "Ready to accelerate your company?",
        subtitle: "Contact us and discover how we can transform your idea into a successful technological solution."
      },
      parcerias: {
        title: "Ready to scale your agency?",
        subtitle: "Contact us and discover how we can help you offer more services to your clients without increasing your costs."
      },
      feature1: {
        title: "Free Budget",
        desc: "Complete analysis without commitment"
      },
      feature2: {
        title: "Consulting Included", 
        desc: "Strategic guidance for your project"
      },
      feature3: {
        title: "Fast Delivery",
        desc: "Projects delivered in record time"
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