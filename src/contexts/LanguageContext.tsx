import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  pt: {
    // Navigation
    'nav.empresas': 'Empresas',
    'nav.parcerias': 'Parcerias',
    'nav.sobre': 'Sobre Nós',
    'nav.blog': 'Blog',
    
    // Home Page
    'home.title': 'Transformamos suas ideias em realidade em tempo record',
    'home.company.title': 'Sou uma empresa',
    'home.company.desc': 'Preciso de soluções tecnológicas para meu negócio',
    'home.agency.title': 'Sou uma agência',
    'home.agency.desc': 'Quero terceirizar desenvolvimento e design',
    'home.whatsapp': 'Falar com especialista',
    
    // Empresas Page
    'empresas.hero.title': 'Independente de qual o seu desafio, desenvolvemos tecnologia sobre medida que acelera sua empresa em tempo recorde.',
    'empresas.services.title': 'Nossos Serviços',
    'empresas.services.internal': 'Software para uso interno de empresas',
    'empresas.services.saas': 'Software para comercializar (SaaS)',
    'empresas.services.ai': 'Agentes de IA',
    'empresas.services.automation': 'Automações (n8n e outras)',
    'empresas.services.figma': 'Protótipos no Figma',
    'empresas.services.websites': 'Websites responsivos',
    'empresas.services.mobile': 'Aplicativos mobile',
    'empresas.services.ecommerce': 'E-commerces',
    'empresas.services.landing': 'Landing Pages',
    'empresas.differential.title': 'Nosso Diferencial',
    'empresas.differential.experience': 'Experiência real em negócios',
    'empresas.differential.diagnosis': 'Diagnóstico preciso de necessidades',
    'empresas.differential.tools': 'Seleção de ferramentas otimizadas',
    'empresas.differential.value': 'Foco em entregar valor rapidamente',
    'empresas.differential.knowledge': 'Conhecimento em negócios + desenvolvimento + IA',
    
    // Empresas Page - Hero Section
    'empresas.hero.new_title': 'Soluções Tecnológicas Sob Medida',
    'empresas.hero.new_subtitle': 'Desenvolvemos tecnologia sobre medida que acelera sua empresa em tempo recorde',
    'empresas.stats.projects': 'Projetos Entregues',
    'empresas.stats.rating': 'Nota de Avaliação',
    'empresas.stats.experience': 'Anos de Experiência',
    'empresas.cta.accelerate': 'Acelerar Minha Empresa',
    
    // Portfolio Filters
    'portfolio.filters.all': 'Todas as Categorias',
    'portfolio.filters.saas': 'SaaS (Desenvolvimento de software)',
    'portfolio.filters.ecommerce': 'E-commerce',
    'portfolio.filters.website': 'Website',
    
    // Why Choose Section
    'empresas.why.title': 'Por que escolher a NotKode?',
    'empresas.why.subtitle': 'Desenvolvemos soluções modernas que oferecem vantagens reais para seu negócio',
    'empresas.why.cost_benefit.title': 'Custo-Benefício',
    'empresas.why.cost_benefit.desc': 'Projetos entregues em até 50% menos tempo, com economia de até 60% comparado ao desenvolvimento tradicional.',
    'empresas.why.ai_experts.title': 'Especialistas em Inteligência Artificial',
    'empresas.why.ai_experts.desc': 'Trabalhamos com IA muito antes dela estar no hype (na moda), dominamos as mais avançadas tecnologias de IA para criar soluções realmente inteligentes.',
    'empresas.why.scalability.title': 'Escalabilidade',
    'empresas.why.scalability.desc': 'Soluções que crescem junto com seu negócio, contando com protocolos de segurança avançados e atualizações automáticas.',
    'empresas.why.support.title': 'Suporte Dedicado',
    'empresas.why.support.desc': 'Acompanhamento completo durante e após o desenvolvimento. Estamos a uma mensagem de distância, com canal de contato 100% disponível. Precisou? É só nos chamar no Whatsapp!',
    
    // Testimonials Section
    'empresas.testimonials.title': 'O que nossos clientes dizem',
    
    // Process Section
    'empresas.process.title': 'Nosso Passo a Passo para o Sucesso',
    
    // Parcerias Page
    'parcerias.hero.title': 'Multiplique sua receita oferecendo desenvolvimento e design sem contratar ninguém',
    'parcerias.benefits.title': 'Benefícios para Agências',
    'parcerias.benefits.hiring': 'Não precisam contratar desenvolvedores ou designers internos',
    'parcerias.benefits.services': 'Podem oferecer mais serviços aos clientes',
    'parcerias.benefits.margin': 'Margem de lucro sem overhead',
    'parcerias.benefits.delivery': 'Entrega garantida com qualidade Notkode',
    'parcerias.benefits.expertise': 'Expertise em tecnologias modernas e design',
    'parcerias.services.title': 'Serviços Disponíveis para Terceirização',
    'parcerias.services.ai': 'Desenvolvimento de Agentes de IA',
    'parcerias.services.automation': 'Criação de automações',
    'parcerias.services.saas': 'Desenvolvimento de SaaS',
    'parcerias.services.apps': 'Sites e aplicativos',
    'parcerias.services.ecommerce': 'E-commerces completos',
    'parcerias.services.design': 'Design de interfaces e experiência do usuário',
    
    // Sobre Nós Page
    'sobre.title': 'Sobre Nós',
    'sobre.history.title': 'Nossa História',
    'sobre.history.desc': 'Fundada em 2021, iniciamos com desenvolvimento de websites e evoluímos para soluções tecnológicas completas. Localizada na Zona Sul de São Paulo.',
    'sobre.founders.title': 'Fundadores',
    'sobre.camila.role': 'CEO',
    'sobre.camila.desc': 'Background artístico desde a infância, carreira em design → UX → desenvolvimento. Especialista em experiências do usuário que facilitam a vida, focada em transformar arte em valor real.',
    'sobre.matheus.role': 'CTO',
    'sobre.matheus.desc': 'Experiência em multinacionais de software e startups brasileiras de sucesso. Especialista em IA com projetos internacionais (Canadá, EUA, Inglaterra). Expert em planejamento de soluções tecnológicas.',
    'sobre.portfolio.title': 'Portfolio de Sucesso',
    
    // Blog Page
    'blog.subtitle': 'Insights, tendências e conhecimento sobre tecnologia, IA e desenvolvimento no-code',
    'blog.loading': 'Carregando posts...',
    'blog.no_posts': 'Nenhum post encontrado com os filtros selecionados.',
    'blog.read_more': 'Ler mais',
    'blog.back_to_blog': 'Voltar ao Blog',
    'blog.post_loading': 'Carregando post...',
    'blog.post_not_found': 'Post não encontrado',
    'blog.post_not_found_desc': 'O post que você procura não existe ou foi removido.',
    'blog.search_placeholder': 'Buscar posts...',
    'blog.posts_found': 'posts encontrados',
    'blog.views': 'visualizações',
    'blog.share': 'Compartilhar',
    'blog.cta_title': 'Gostou do conteúdo?',
    'blog.cta_desc': 'Entre em contato conosco e descubra como podemos ajudar seu negócio com tecnologia.',
    'blog.related_posts': 'Posts Relacionados',
    
    // Portfolio
    'portfolio.title': 'Nosso Portfólio',
    'portfolio.subtitle': 'Projetos que entregamos resultados extraordinários para nossos clientes',
    'portfolio.filter_title': 'Filtrar por Categoria',
    'portfolio.view_project': 'Ver projeto',
    'portfolio.no_projects': 'Nenhum projeto encontrado com os filtros selecionados.',
    
    // Footer
    'footer.copyright': '© 2025 Notkode.',
    'footer.rights': 'Todos os direitos reservados.',
    'footer.made_with': 'Feito com',
    'footer.by_notkode': 'pela Notkode',
    'footer.location': 'São Paulo, SP - Brasil',
    'footer.cnpj': 'CNPJ: 12.345.678/0001-90',
    
    // CTA Section
    'cta.empresas.title': 'Pronto para acelerar sua empresa?',
    'cta.empresas.subtitle': 'Entre em contato conosco e descubra como podemos transformar sua ideia em uma solução tecnológica de sucesso.',
    'cta.parcerias.title': 'Pronto para escalar sua agência?',
    'cta.parcerias.subtitle': 'Entre em contato conosco e descubra como podemos ajudar você a oferecer mais serviços aos seus clientes sem aumentar seus custos.',
    'cta.sobre.title': 'Pronto para transformar sua empresa?',
    'cta.sobre.complete': 'Solução Completa',
    'cta.sobre.complete_desc': 'Desde a concepção até a implementação, cuidamos de toda a jornada do seu projeto tecnológico.',
    'cta.sobre.agility': 'Agilidade',
    'cta.sobre.agility_desc': 'Entregamos resultados rápidos sem comprometer a qualidade, usando as melhores práticas de desenvolvimento.',
    'cta.sobre.support': 'Suporte Contínuo',
    'cta.sobre.support_desc': 'Acompanhamos o crescimento do seu projeto com suporte técnico e melhorias constantes.',
    'cta.sobre.measurable': 'Resultados Mensuráveis',
    'cta.sobre.measurable_desc': 'Focamos em entregar valor real para o seu negócio, com métricas claras e resultados tangíveis.',
    'cta.sobre.international': 'Experiência Internacional',
    'cta.sobre.international_desc': 'Atendemos empresas no Brasil, Estados Unidos, Canadá e Inglaterra com a mesma excelência.',
    'cta.sobre.final_text': 'Seja você uma empresa buscando crescer ou uma agência querendo expandir seus serviços, estamos aqui para ajudar você a escrever o próximo capítulo da sua história de sucesso.',
    'cta.button': 'Começar agora',

    // Common
    'common.contact': 'Entre em contato',
    'common.learn_more': 'Saiba mais',
    'common.technologies': 'Tecnologias utilizadas',
    'common.revenue': 'Faturamento',
    'common.year': 'Ano',
    'common.category': 'Categoria',
    'common.description': 'Descrição',
    'common.link': 'Link do projeto',
    
    // Portfolio Projects
    'portfolio.autoagentes.description': 'SaaS de criação de Agentes de IA, focado em permitir com que donos de pequenas e médias empresas possam automatizar o atendimento dos clientes no whatsapp, substituindo a contratação de funcionários humanos e tornando sua empresa mais eficiente.',
    'portfolio.ativa.description': 'SaaS focado em permitir com que donos de pequenas e médias empresas aumentassem o resultado obtido através de campanhas (envios em massa) realizadas por e-mail e Whatsapp. A grande sacada deste produto é que todo o conteúdo enviado, é 100% personalizado pela IA da Ativa Clientes utilizando o contexto daquele respectivo contato, fazendo com que cada e-mail ou whatsapp seja muito mais relevante pela ótica do cliente.',
    'portfolio.zapinside.description': 'E se você pudesse ver tudo o que acontece nas conversas de WhatsApp do seu time que realiza atendimentos? É este desafio que este SaaS resolve, as conversas do WhatsApp revelam tudo o que você precisa saber sobre seus leads e sua equipe de vendas ou de atendimento. A gente analisa tudo pra você — e entrega insights acionáveis de forma clara, rápida e prática. Tudo com IA e zero esforço manual.',
    'portfolio.noodrops.description': 'E-commerce destinado a comercialização das Smart Pills da Noodrops, a opção perfeita pra você cuidar do seu cérebro, seja com performance, seja com saúde cerebral. Somos a Smart Pill Nº1 no Brasil, a mais querida e mais recomendada.',
    'portfolio.loss.description': 'Empresa de consultoria com mais de 20 anos de mercado, onde realizamos em colaboração com o time da Loss Prevention, toda a modernização do processo comercial: incluindo o desenvolvimento do novo site, estruturação de todo o processo comercial no AirTable com o envio de e-mail em massa já integrado no Sendgrid, garantindo um servidor de envio de e-mail focado em performance. Foi automatizado via formulário e n8n, quando o lead preenche o formulário de interesse o envio das condições dos respectivo curso e coleta automática da inscrição (venda) para o aluno.',
    'portfolio.solojet.description': 'A Solojet Aviação é o único grupo de aviação executiva no Brasil que oferece uma solução completa, desde a venda e compartilhamento de aeronaves até gestão e manutenção especializada. O embaixador da Solojet é Álvaro Garnero: empresário, apresentador de televisão, investidor e administrador de empresas brasileiro. A quatro mãos projetamos todo o novo site para garantir que independente da linha de produto ou serviço desejada, o cliente agora encontra facilmente as respostas que busca e consegue facilmente entrar em contato para prosseguir na sua jornada de compra com baixo esforço. Ao demonstrar interesse o lead preenche o formulário e a integração desenvolvida leva seus dados para o RD Station, avisando o responsável para realizar o atendimento da venda com o lead já triado.',
    
    // Categories
    'category.saas': 'SaaS (Desenvolvimento de software)',
    'category.ecommerce': 'E-commerce',
    'category.website': 'Website',
    
    // Testimonials
    'testimonial.bruno.text': 'A Notkode foi primordial para o rápido lançamento do meu projeto. Desde o primeiro contato com a Camila, tive uma atenção fora da curva, desde a negociação, durante o projeto e a entrega do site em si. Altíssima qualidade, técnica, agilidade e seriedade. Recomendo fortemente!',
    'testimonial.rodrigo.text': 'Atendimento mega atencioso, atentos a cada detalhe e ideia, sempre com contrapontos lógicos e eficientes. O projeto foi entregue dentro do prazo e a qualidade foi perfeita. Indico com toda certeza.',
    'testimonial.fernando.text': 'Gostei muito de todo o processo, foi tudo muito profissional e podemos transformar rapidamente as ideias que tinha em realidade. Estou muito feliz com o resultado.',
    'testimonial.giovanna.text': 'A NotKode foi fundamental para o lançamento da ZapInside. Em pouco tempo já haviamos começado a desenvolver a ideia e em três semanas já estavamos recebendo o primeiro cliente. Super recomendo para todos os empreendedores que precisarem colocar usa ideia no ar!',
    'testimonial.walter.text': 'Depois que você atinge os primeiros 10 mil de faturamento com o seu SaaS, você precisa ir melhorando todo o seu funil, desde o site até o produto, para poder continuar crescendo e obtendo um bom LTV. A Notkode foi fundamental para otimizar toda a jornada do cliente e desenvolver o software ideal para conseguirmos superar o nosso desafio.',
    
    // Process Steps
    'process.step1.title': 'Diagnóstico do Negócio',
    'process.step1.description': 'Mergulhamos no seu negócio para entender desafios, oportunidades e objetivos. Mapeamos processos atuais e identificamos como a solução desejada vai impactar diretamente nos resultados.',
    'process.step2.title': 'Estratégia Inteligente',
    'process.step2.description': 'Definimos a arquitetura ideal, escolhemos as tecnologias mais adequadas e criamos nosso plano de ação onde cada decisão é pensada para obter o melhor tempo de entrega possível e maximizar o retorno do seu investimento.',
    'process.step3.title': 'Desenvolvimento Ágil',
    'process.step3.description': 'Ao utilizar as abordagens mais modernas, construímos sua solução em tempo recorde. Entregas incrementais permitem o seu acompanhamento em tempo real, garantindo que você veja o progresso e possa ajustar o rumo quando necessário.',
    'process.step4.title': 'Lançamento & Crescimento',
    'process.step4.description': 'Hora de decolar! Nossa estratégia de lançamento (go-live), conta com suporte contínuo, monitoramento de performance e melhorias baseadas em dados reais de uso, tudo pensado para que sua nova solução inicie seu ciclo com o pé direito.',
    'process.step5.description': 'A fórmula perfeita que entrega soluções tecnológicas que realmente impactam seus resultados, da forma que sua empresa precisa, em tempo recorde.',
    
    // CTA Features
    'cta.feature1.title': 'Diagnóstico Gratuito',
    'cta.feature1.desc': 'Análise completa do seu negócio',
    'cta.feature2.title': 'Entrega Rápida',
    'cta.feature2.desc': 'Projetos em tempo recorde',
    'cta.feature3.title': 'Suporte Dedicado',
    'cta.feature3.desc': 'Acompanhamento total do projeto',
    
    // Common Labels
    'common.launch': 'Lançamento do Projeto',
  },
  en: {
    // Navigation
    'nav.empresas': 'Companies',
    'nav.parcerias': 'Partnerships',
    'nav.sobre': 'About Us',
    'nav.blog': 'Blog',
    
    // Home Page
    'home.title': 'We transform your ideas into reality in record time',
    'home.company.title': 'I am a company',
    'home.company.desc': 'I need technology solutions for my business',
    'home.agency.title': 'I am an agency',
    'home.agency.desc': 'I want to outsource development and design',
    'home.whatsapp': 'Talk to a specialist',
    
    // Empresas Page
    'empresas.hero.title': 'Regardless of your challenge, we develop custom technology that accelerates your company in record time.',
    'empresas.services.title': 'Our Services',
    'empresas.services.internal': 'Internal company software',
    'empresas.services.saas': 'Software to commercialize (SaaS)',
    'empresas.services.ai': 'AI Agents',
    'empresas.services.automation': 'Automations (n8n and others)',
    'empresas.services.figma': 'Figma prototypes',
    'empresas.services.websites': 'Responsive websites',
    'empresas.services.mobile': 'Mobile applications',
    'empresas.services.ecommerce': 'E-commerce',
    'empresas.services.landing': 'Landing Pages',
    'empresas.differential.title': 'Our Differential',
    'empresas.differential.experience': 'Real business experience',
    'empresas.differential.diagnosis': 'Precise needs diagnosis',
    'empresas.differential.tools': 'Optimized tool selection',
    'empresas.differential.value': 'Focus on delivering value quickly',
    'empresas.differential.knowledge': 'Knowledge in business + development + AI',
    
    // Empresas Page - Hero Section
    'empresas.hero.new_title': 'Custom Technology Solutions',
    'empresas.hero.new_subtitle': 'We develop custom technology that accelerates your company in record time',
    'empresas.stats.projects': 'Delivered Projects',
    'empresas.stats.rating': 'Rating Score',
    'empresas.stats.experience': 'Years of Experience',
    'empresas.cta.accelerate': 'Accelerate My Company',
    
    // Portfolio Filters
    'portfolio.filters.all': 'All Categories',
    'portfolio.filters.saas': 'SaaS (Software Development)',
    'portfolio.filters.ecommerce': 'E-commerce',
    'portfolio.filters.website': 'Website',
    
    // Why Choose Section
    'empresas.why.title': 'Why choose NotKode?',
    'empresas.why.subtitle': 'We develop modern solutions that offer real advantages for your business',
    'empresas.why.cost_benefit.title': 'Cost-Benefit',
    'empresas.why.cost_benefit.desc': 'Projects delivered up to 50% faster, with savings up to 60% compared to traditional development.',
    'empresas.why.ai_experts.title': 'Artificial Intelligence Experts',
    'empresas.why.ai_experts.desc': 'We worked with AI long before it was trendy, we master the most advanced AI technologies to create truly intelligent solutions.',
    'empresas.why.scalability.title': 'Scalability',
    'empresas.why.scalability.desc': 'Solutions that grow with your business, featuring advanced security protocols and automatic updates.',
    'empresas.why.support.title': 'Dedicated Support',
    'empresas.why.support.desc': 'Complete follow-up during and after development. We are just a message away, with 100% available contact channel. Need help? Just call us on WhatsApp!',
    
    // Testimonials Section
    'empresas.testimonials.title': 'What our clients say',
    
    // Process Section
    'empresas.process.title': 'Our Step by Step to Success',
    
    // Parcerias Page
    'parcerias.hero.title': 'Multiply your revenue by offering development and design without hiring anyone',
    'parcerias.benefits.title': 'Benefits for Agencies',
    'parcerias.benefits.hiring': 'No need to hire internal developers or designers',
    'parcerias.benefits.services': 'Can offer more services to clients',
    'parcerias.benefits.margin': 'Profit margin without overhead',
    'parcerias.benefits.delivery': 'Guaranteed delivery with Notkode quality',
    'parcerias.benefits.expertise': 'Expertise in modern technologies and design',
    'parcerias.services.title': 'Services Available for Outsourcing',
    'parcerias.services.ai': 'AI Agents Development',
    'parcerias.services.automation': 'Automation creation',
    'parcerias.services.saas': 'SaaS Development',
    'parcerias.services.apps': 'Websites and applications',
    'parcerias.services.ecommerce': 'Complete e-commerce',
    'parcerias.services.design': 'Interface and user experience design',
    
    // Sobre Nós Page
    'sobre.title': 'About Us',
    'sobre.history.title': 'Our History',
    'sobre.history.desc': 'Founded in 2021, we started with website development and evolved to complete technology solutions. Located in South Zone, São Paulo.',
    'sobre.founders.title': 'Founders',
    'sobre.camila.role': 'CEO',
    'sobre.camila.desc': 'Artistic background since childhood, career in design → UX → development. Specialist in user experiences that make life easier, focused on transforming art into real value.',
    'sobre.matheus.role': 'CTO',
    'sobre.matheus.desc': 'Experience in software multinationals and successful Brazilian startups. AI specialist with international projects (Canada, USA, England). Expert in technology solution planning.',
    'sobre.portfolio.title': 'Success Portfolio',
    
    // Blog Page
    'blog.subtitle': 'Insights, trends and knowledge about technology, AI and no-code development',
    'blog.loading': 'Loading posts...',
    'blog.no_posts': 'No posts found with the selected filters.',
    'blog.read_more': 'Read more',
    'blog.back_to_blog': 'Back to Blog',
    'blog.post_loading': 'Loading post...',
    'blog.post_not_found': 'Post not found',
    'blog.post_not_found_desc': 'The post you are looking for does not exist or has been removed.',
    'blog.search_placeholder': 'Search posts...',
    'blog.posts_found': 'posts found',
    'blog.views': 'views',
    'blog.share': 'Share',
    'blog.cta_title': 'Did you like the content?',
    'blog.cta_desc': 'Contact us and discover how we can help your business with technology.',
    'blog.related_posts': 'Related Posts',
    
    // Portfolio
    'portfolio.title': 'Our Portfolio',
    'portfolio.subtitle': 'Projects that delivered extraordinary results for our clients',
    'portfolio.filter_title': 'Filter by Category',
    'portfolio.view_project': 'View project',
    'portfolio.no_projects': 'No projects found with the selected filters.',
    
    // Footer
    'footer.copyright': '© 2025 Notkode.',
    'footer.rights': 'All rights reserved.',
    'footer.made_with': 'Made with',
    'footer.by_notkode': 'by Notkode',
    'footer.location': 'São Paulo, SP - Brazil',
    'footer.cnpj': 'CNPJ: 12.345.678/0001-90',
    
    // CTA Section
    'cta.empresas.title': 'Ready to accelerate your company?',
    'cta.empresas.subtitle': 'Contact us and discover how we can transform your idea into a successful technology solution.',
    'cta.parcerias.title': 'Ready to scale your agency?',
    'cta.parcerias.subtitle': 'Contact us and discover how we can help you offer more services to your clients without increasing your costs.',
    'cta.sobre.title': 'Ready to transform your company?',
    'cta.sobre.complete': 'Complete Solution',
    'cta.sobre.complete_desc': 'From conception to implementation, we take care of your entire technology project journey.',
    'cta.sobre.agility': 'Agility',
    'cta.sobre.agility_desc': 'We deliver fast results without compromising quality, using the best development practices.',
    'cta.sobre.support': 'Continuous Support',
    'cta.sobre.support_desc': 'We follow your project\'s growth with technical support and constant improvements.',
    'cta.sobre.measurable': 'Measurable Results',
    'cta.sobre.measurable_desc': 'We focus on delivering real value to your business, with clear metrics and tangible results.',
    'cta.sobre.international': 'International Experience',
    'cta.sobre.international_desc': 'We serve companies in Brazil, United States, Canada and England with the same excellence.',
    'cta.sobre.final_text': 'Whether you are a company looking to grow or an agency wanting to expand your services, we are here to help you write the next chapter of your success story.',
    'cta.button': 'Get started now',

    // Common
    'common.contact': 'Contact us',
    'common.learn_more': 'Learn more',
    'common.technologies': 'Technologies used',
    'common.revenue': 'Revenue',
    'common.year': 'Year',
    'common.category': 'Category',
    'common.description': 'Description',
    'common.link': 'Project link',
    
    // Portfolio Projects
    'portfolio.autoagentes.description': 'AI Agents creation SaaS, focused on enabling small and medium business owners to automate customer service on WhatsApp, replacing the hiring of human employees and making their company more efficient.',
    'portfolio.ativa.description': 'SaaS focused on enabling small and medium business owners to increase results through mass campaigns conducted via email and WhatsApp. The great advantage of this product is that all content sent is 100% personalized by Ativa Clientes AI using the context of that respective contact, making each email or WhatsApp much more relevant from the customer\'s perspective.',
    'portfolio.zapinside.description': 'What if you could see everything that happens in your team\'s WhatsApp conversations that handle customer service? This is the challenge this SaaS solves. WhatsApp conversations reveal everything you need to know about your leads and your sales or customer service team. We analyze everything for you — and deliver actionable insights in a clear, fast and practical way. All with AI and zero manual effort.',
    'portfolio.noodrops.description': 'E-commerce dedicated to commercializing Noodrops Smart Pills, the perfect option for you to take care of your brain, whether for performance or brain health. We are the #1 Smart Pill in Brazil, the most loved and most recommended.',
    'portfolio.loss.description': 'Consulting company with more than 20 years in the market, where we carried out in collaboration with the Loss Prevention team, the complete modernization of the commercial process: including the development of the new website, structuring the entire commercial process in AirTable with mass email sending already integrated with Sendgrid, ensuring an email sending server focused on performance. It was automated via form and n8n, when the lead fills out the interest form, the conditions of the respective course are automatically sent and automatic collection of enrollment (sale) for the student.',
    'portfolio.solojet.description': 'Solojet Aviação is the only executive aviation group in Brazil that offers a complete solution, from the sale and sharing of aircraft to specialized management and maintenance. Solojet\'s ambassador is Álvaro Garnero: businessman, television presenter, investor and Brazilian business administrator. Together we designed the entire new website to ensure that regardless of the desired product or service line, the customer now easily finds the answers they seek and can easily get in touch to proceed on their purchasing journey with low effort. When showing interest, the lead fills out the form and the developed integration takes their data to RD Station, notifying the person responsible for handling the sale with the lead already qualified.',
    
    // Categories
    'category.saas': 'SaaS (Software Development)',
    'category.ecommerce': 'E-commerce',
    'category.website': 'Website',
    
    // Testimonials
    'testimonial.bruno.text': 'Notkode was essential for the rapid launch of my project. From the first contact with Camila, I had extraordinary attention, from negotiation, during the project and the delivery of the website itself. Highest quality, technical expertise, agility and seriousness. I highly recommend!',
    'testimonial.rodrigo.text': 'Extremely attentive service, attentive to every detail and idea, always with logical and efficient counterpoints. The project was delivered on time and the quality was perfect. I definitely recommend.',
    'testimonial.fernando.text': 'I really liked the whole process, everything was very professional and we were able to quickly transform the ideas I had into reality. I am very happy with the result.',
    'testimonial.giovanna.text': 'NotKode was fundamental for the launch of ZapInside. In a short time we had already started developing the idea and in three weeks we were already receiving our first client. I highly recommend it to all entrepreneurs who need to get their idea off the ground!',
    'testimonial.walter.text': 'After you reach the first 10 thousand in revenue with your SaaS, you need to improve your entire funnel, from the website to the product, to be able to continue growing and getting a good LTV. Notkode was fundamental to optimize the entire customer journey and develop the ideal software for us to overcome our challenge.',
    
    // Process Steps
    'process.step1.title': 'Business Diagnosis',
    'process.step1.description': 'We dive into your business to understand challenges, opportunities and objectives. We map current processes and identify how the desired solution will directly impact results.',
    'process.step2.title': 'Smart Strategy',
    'process.step2.description': 'We define the ideal architecture, choose the most suitable technologies and create our action plan where each decision is designed to achieve the best possible delivery time and maximize your investment return.',
    'process.step3.title': 'Agile Development',
    'process.step3.description': 'Using the most modern approaches, we build your solution in record time. Incremental deliveries allow you to track in real time, ensuring you see progress and can adjust course when needed.',
    'process.step4.title': 'Launch & Growth',
    'process.step4.description': 'Time to take off! Our go-live strategy includes continuous support, performance monitoring and improvements based on real usage data, all designed so your new solution starts its cycle on the right foot.',
    'process.step5.description': 'The perfect formula that delivers technology solutions that really impact your results, the way your company needs, in record time.',
    
    // CTA Features
    'cta.feature1.title': 'Free Diagnosis',
    'cta.feature1.desc': 'Complete analysis of your business',
    'cta.feature2.title': 'Fast Delivery',
    'cta.feature2.desc': 'Projects in record time',
    'cta.feature3.title': 'Dedicated Support',
    'cta.feature3.desc': 'Total project follow-up',
    
    // Common Labels
    'common.launch': 'Project Launch',
  }
};

// Auto-detect language based on location
const detectLanguage = (): Language => {
  try {
    const userLanguage = navigator.language || 'en';
    return userLanguage.startsWith('pt') ? 'pt' : 'en';
  } catch {
    return 'en';
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('notkode-language');
    if (stored && (stored === 'pt' || stored === 'en')) {
      return stored as Language;
    }
    return detectLanguage();
  });

  useEffect(() => {
    localStorage.setItem('notkode-language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};