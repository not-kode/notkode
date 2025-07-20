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
    
    // Common
    'common.contact': 'Entre em contato',
    'common.learn_more': 'Saiba mais',
    'common.technologies': 'Tecnologias utilizadas',
    'common.revenue': 'Faturamento',
    'common.year': 'Ano',
    'common.category': 'Categoria',
    'common.description': 'Descrição',
    'common.link': 'Link do projeto',
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
    
    // Common
    'common.contact': 'Contact us',
    'common.learn_more': 'Learn more',
    'common.technologies': 'Technologies used',
    'common.revenue': 'Revenue',
    'common.year': 'Year',
    'common.category': 'Category',
    'common.description': 'Description',
    'common.link': 'Project link',
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