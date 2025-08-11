import React, { useState, useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
const Portfolio: React.FC = () => {
  const {
    t
  } = useLanguage();

  // Filter state - only category
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  // State for managing expanded descriptions
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<number, boolean>>({});
  const portfolio = [{
    name: "AutoAgentes",
    category: "SaaS (Desenvolvimento de software)",
    description: "portfolio.autoagentes.description",
    revenue: "+70 mil reais",
    year: "2025",
    technologies: "WeWeb, Xano, ASAAS, Posthog, OpenAI, Anthropic (Claude), n8n, Sendgrid, MegaAPI",
    link: "https://www.autoagentes.com.br/",
    image: "https://cdn.weweb.io/designs/4de8406f-3cb0-4cd7-ba3b-e924323d9c29/sections/Aug_11_Screenshot_from_Squoosh.webp?_wwcv=1754931180342",
    gradient: "from-blue-500 to-purple-600"
  }, {
    name: "Solojet Aviação",
    category: "Website",
    description: "portfolio.solojet.description",
    revenue: "💸 Cliente: Empresa multinacional de médio porte",
    year: "2024",
    technologies: "WeWeb, Google Maps API (GCP), Google Sheets, PostHog, RD Station, n8n",
    link: "https://www.solojetaviacao.com.br/pt/",
    image: "https://cdn.weweb.io/designs/50e5be05-9b56-4b9f-a534-8ee1bc77dcdc/sections/Screenshot_2025-07-31_at_09.01.39.jpg?_wwcv=1753963527702",
    gradient: "from-cyan-500 to-blue-600"
  }, {
    name: "Noodrops",
    category: "E-commerce",
    description: "portfolio.noodrops.description",
    revenue: "+80 mil reais / mês",
    year: "2023",
    technologies: "WooCommerce, Wordpress, GA4, Pagar.me, Yampi, Voxuy, Microsoft Clarity",
    link: "https://noodrops.com.br/",
    image: "https://cdn.weweb.io/designs/50e5be05-9b56-4b9f-a534-8ee1bc77dcdc/sections/Screenshot_2025-07-31_at_09.00.40.png?_wwcv=1753963420076",
    gradient: "from-purple-500 to-pink-600"
  }, {
    name: "Agência Cotton",
    category: "Website",
    description: "portfolio.cotton.description",
    revenue: "💸 Cliente: Agência de branding e design",
    year: "2025",
    technologies: "Framer, Google Analytics 4, WhatsApp Business API, Hotjar, Zapier",
    link: "https://agenciacotton.com.br/",
    image: "https://cdn.weweb.io/designs/50e5be05-9b56-4b9f-a534-8ee1bc77dcdc/sections/Screenshot_2025-07-31_at_09.00.20_1.jpg?_wwcv=1753963620297",
    gradient: "from-indigo-500 to-blue-600"
  }, {
    name: "ZapInside",
    category: "SaaS (Desenvolvimento de software)",
    description: "portfolio.zapinside.description",
    revenue: "+2 mil reais",
    year: "2025",
    technologies: "WeWeb, Xano, ASAAS, Posthog, OpenAI, Anthropic (Claude), MegaApi",
    link: "https://www.zapinside.com.br/",
    image: "https://cdn.weweb.io/designs/50e5be05-9b56-4b9f-a534-8ee1bc77dcdc/sections/Screenshot_2025-07-31_at_09.02.12.png?_wwcv=1753963420041",
    gradient: "from-orange-500 to-red-600"
  }, {
    name: "Ponto Patta",
    category: "E-commerce",
    description: "portfolio.pontopatta.description",
    revenue: "+R$ 150 mil/mês",
    year: "2023",
    technologies: "WooCommerce, WordPress, Google Analytics 4, Facebook Pixel, PagSeguro, Correios API, Mailchimp, Yoast SEO",
    link: "https://pontopatta.com.br/",
    image: "https://cdn.weweb.io/designs/50e5be05-9b56-4b9f-a534-8ee1bc77dcdc/sections/Screenshot_2025-08-05_at_17.33.32.png?_wwcv=1754426054294",
    gradient: "from-pink-500 to-rose-600"
  }, {
    name: "Azure Investimentos",
    category: "Website",
    description: "portfolio.azure.description",
    revenue: "💸 Cliente: Assessoria de investimentos",
    year: "2024",
    technologies: "Framer, Google Analytics 4, WhatsApp Business API, Make",
    link: "https://azureinvestimentos.com/",
    image: "https://cdn.weweb.io/designs/50e5be05-9b56-4b9f-a534-8ee1bc77dcdc/sections/Screenshot_2025-08-05_at_17.32.25_1.png?_wwcv=1754426246762",
    gradient: "from-blue-500 to-cyan-600"
  }, {
    name: "Ativa Clientes",
    category: "SaaS (Desenvolvimento de software)",
    description: "portfolio.ativa.description",
    revenue: "+40 mil reais",
    year: "2024",
    technologies: "WeWeb, Xano, Stripe, Posthog, OpenAI, Gemini, Postmark, APIBrasil",
    link: "https://www.youtube.com/watch?v=D4rfmBY5_UQ&t=312s",
    image: "https://cdn.weweb.io/designs/50e5be05-9b56-4b9f-a534-8ee1bc77dcdc/sections/Screenshot_2025-07-31_at_09.10.28.png?_wwcv=1753963863256",
    gradient: "from-green-500 to-teal-600"
  }, {
    name: "Peki Marketing",
    category: "Website",
    description: "portfolio.peki.description",
    revenue: "💸 Cliente: Agência especializada em gastronomia",
    year: "2024",
    technologies: "Framer, Google Analytics 4, Facebook Pixel, Hotjar, WhatsApp Business API, ActiveCampaign, Cloudflare",
    link: "https://www.pekimarketing.com.br/",
    image: "https://cdn.weweb.io/designs/50e5be05-9b56-4b9f-a534-8ee1bc77dcdc/sections/Screenshot_2025-08-05_at_17.33.02.png?_wwcv=1754426054292",
    gradient: "from-emerald-500 to-green-600"
  }];

  // Extract unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(portfolio.map(project => project.category)));
  }, []);

  // Filter portfolio based on selected category only
  const filteredPortfolio = useMemo(() => {
    return portfolio.filter(project => {
      return !selectedCategory || project.category === selectedCategory;
    });
  }, [selectedCategory]);

  // Toggle description expansion
  const toggleDescription = (index: number) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Function to truncate text to approximately 3 lines (around 200 characters)
  const getTruncatedText = (text: string, isExpanded: boolean) => {
    if (isExpanded || text.length <= 200) return text;
    return text.substring(0, 200) + '...';
  };
  return <section className="py-[60px] px-[20px] md:py-20 md:px-8 bg-background">
  <div className="w-full md:max-w-[1440px] md:mx-auto">
        <h2 className="font-sora font-bold text-4xl text-center mb-4">
          <span className="text-gradient">{t('portfolio.title')}</span>
        </h2>
        <p className="text-xl text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
          {t('portfolio.subtitle')}
        </p>

        {/* Filter Section */}
        <div className="mb-12 max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="font-sora font-semibold text-xl text-foreground mb-4">{t('portfolio.filter_title')}</h3>
            <div className="flex justify-center gap-2 flex-wrap pb-2">
              <button onClick={() => setSelectedCategory('')} className={`px-4 py-2 text-base font-medium rounded-full transition-all duration-300 transform hover:scale-105 whitespace-nowrap ${!selectedCategory ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30' : 'bg-background/50 backdrop-blur hover:bg-primary/10'}`}>
                {t('portfolio.filters.all')}
              </button>
              {categories.map(category => <button key={category} onClick={() => setSelectedCategory(category)} className={`px-4 py-2 text-base font-medium rounded-full transition-all duration-300 transform hover:scale-105 whitespace-nowrap ${selectedCategory === category ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30' : 'bg-background/50 backdrop-blur hover:bg-primary/10'}`}>
                  {t(`category.${category.toLowerCase().includes('saas') ? 'saas' : category.toLowerCase() === 'e-commerce' ? 'ecommerce' : 'website'}`)}
                </button>)}
            </div>
          </div>
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 w-full">
          {filteredPortfolio.length > 0 ? filteredPortfolio.map((project, index) => <div key={index} className="portfolio-card group hover:scale-[1.02] hover:z-10 transition-all duration-300 w-full max-w-full">
                {/* Project Header */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 border-b border-border/20 pb-4">
  <div className="flex-1">
    <h3 className="font-sora font-bold text-xl leading-tight mb-2 whitespace-nowrap">{project.name}</h3>
    <span className="px-3 py-1.5 bg-secondary/10 text-secondary text-xs font-medium rounded-full border border-secondary/20 inline-block whitespace-nowrap">
      {t(`category.${project.category.toLowerCase().includes('saas') ? 'saas' : project.category.toLowerCase() === 'e-commerce' ? 'ecommerce' : 'website'}`)}
    </span>
  </div>
  <div className="flex flex-col md:items-end gap-2 w-full">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20 whitespace-nowrap">
                      <span>🚀</span>
                      <span>{t('common.launch')}:</span>
                      <span className="font-semibold">{project.year}</span>
                    </div>
                   <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-600 text-xs font-medium rounded-full border border-green-500/20">
  {!project.revenue.startsWith('💸 Cliente:') && <span>💸</span>}
  <span>{project.revenue.startsWith('💸 Cliente:') ? '' : `${t('common.revenue')}:`}</span>
  <span className="font-semibold break-words max-w-full">{project.revenue}</span>
              </div>
                  </div>
                </div>

                {/* Project Image */}
                <div className="mb-6 rounded-lg overflow-hidden">
                  <img src={project.image} alt={project.name} className="w-full h-[200px] md:h-[300px] object-cover hover:scale-105 transition-transform duration-300" />
                </div>

                {/* Description */}
                <div className="mb-4">
                  <div className="min-h-[72px]">
                    <p className="text-muted-foreground text-base leading-relaxed">
                      {getTruncatedText(t(project.description), expandedDescriptions[index] || false)}
                    </p>
                  </div>
                  {t(project.description).length > 200 && <button onClick={() => toggleDescription(index)} className="mt-2 transition-colors text-sm font-normal text-sky-200">
                      {expandedDescriptions[index] ? t('common.read_less') : t('common.read_more')}
                    </button>}
                </div>

                {/* Technologies */}
                <div className="mb-6">
                  <h4 className="font-semibold text-base mb-2 text-[#101420] dark:text-[#FFFFFF]">
                    {t('common.technologies')}:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.split(', ').map((tech, techIndex) => <span key={techIndex} className="px-3 py-1 bg-[#B8F6FF]/24 text-[#A5A5A5] text-[13px] font-medium rounded-[100px] border border-[#86F0FF]">
                        {tech}
                      </span>)}
                  </div>
                </div>

                {/* Link */}
                <div className="flex items-center justify-between">
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors font-semibold text-base group-hover:scale-105 transition-transform">
                    <span>{t('portfolio.view_project')}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>) : <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-base">{t('portfolio.no_projects')}</p>
            </div>}
        </div>
      </div>
    </section>;
};
export default Portfolio;