
import React, { useState, useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Portfolio: React.FC = () => {
  const { t } = useLanguage();
  
  // Filter state - only category
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const portfolio = [
    {
      name: "AutoAgentes",
      category: "SaaS (Desenvolvimento de software)",
      description: "portfolio.autoagentes.description",
      revenue: "+70 mil reais",
      year: "2025",
      technologies: "WeWeb, Xano, ASAAS, Posthog, OpenAI, Anthropic (Claude), n8n, Sendgrid, MegaAPI",
      link: "https://www.autoagentes.com.br/",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      name: "Ativa Clientes",
      category: "SaaS (Desenvolvimento de software)",
      description: "portfolio.ativa.description",
      revenue: "+40 mil reais",
      year: "2024",
      technologies: "WeWeb, Xano, Stripe, Posthog, OpenAI, Gemini, Postmark, APIBrasil",
      link: "https://www.youtube.com/watch?v=D4rfmBY5_UQ&t=312s",
      gradient: "from-green-500 to-teal-600"
    },
    {
      name: "ZapInside",
      category: "SaaS (Desenvolvimento de software)",
      description: "portfolio.zapinside.description",
      revenue: "+2 mil reais",
      year: "2025",
      technologies: "WeWeb, Xano, ASAAS, Posthog, OpenAI, Anthropic (Claude), MegaApi",
      link: "https://www.zapinside.com.br/",
      gradient: "from-orange-500 to-red-600"
    },
    {
      name: "Noodrops",
      category: "E-commerce",
      description: "portfolio.noodrops.description",
      revenue: "+80 mil reais / mês",
      year: "2023",
      technologies: "WooCommerce, Wordpress, GA4, Pagar.me, Yampi, Voxuy, Microsoft Clarity",
      link: "https://noodrops.com.br/",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      name: "Loss Prevention",
      category: "Website",
      description: "portfolio.loss.description",
      revenue: "+100 mil reais / mês",
      year: "2023",
      technologies: "Framer, GA4, Typeform, AirTable, SendGrid, n8n",
      link: "https://www.lossprevention.com.br/",
      gradient: "from-indigo-500 to-blue-600"
    },
    {
      name: "Solojet",
      category: "Website",
      description: "portfolio.solojet.description",
      revenue: "Empresa multinacional de médio porte",
      year: "2024",
      technologies: "WeWeb, Google Maps API (GCP), Google Sheets, PostHog, RD Station, n8n",
      link: "https://www.solojetaviacao.com.br/pt/",
      gradient: "from-cyan-500 to-blue-600"
    }
  ];

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

  return (
    <section className="py-20 px-8 bg-background">
      <div className="container mx-auto">
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
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 text-base font-medium rounded-full transition-all duration-300 transform hover:scale-105 whitespace-nowrap ${
                  !selectedCategory 
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30' 
                    : 'bg-background/50 backdrop-blur hover:bg-primary/10'
                }`}
              >
                {t('portfolio.filters.all')}
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 text-base font-medium rounded-full transition-all duration-300 transform hover:scale-105 whitespace-nowrap ${
                    selectedCategory === category 
                      ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30' 
                      : 'bg-background/50 backdrop-blur hover:bg-primary/10'
                  }`}
                >
                  {t(`category.${category.toLowerCase().includes('saas') ? 'saas' : category.toLowerCase() === 'e-commerce' ? 'ecommerce' : 'website'}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Portfolio Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {filteredPortfolio.length > 0 ? (
            filteredPortfolio.map((project, index) => (
              <div key={index} className="portfolio-card group hover:scale-105 transition-all duration-300">
                {/* Project Header */}
                <div className="flex items-start justify-between mb-6 border-b border-border/20 pb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-sora font-bold text-xl leading-tight mb-2">{project.name}</h3>
                    <span className="px-3 py-1.5 bg-secondary/10 text-secondary text-xs font-medium rounded-full border border-secondary/20 inline-block">
                      {t(`category.${project.category.toLowerCase().includes('saas') ? 'saas' : project.category.toLowerCase() === 'e-commerce' ? 'ecommerce' : 'website'}`)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20 whitespace-nowrap">
                      <span>🚀</span>
                      <span>{t('common.launch')}:</span>
                      <span className="font-semibold">{project.year}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-600 text-xs font-medium rounded-full border border-green-500/20 whitespace-nowrap">
                      <span>💸</span>
                      <span>{t('common.revenue')}:</span>
                      <span className="font-semibold">{project.revenue}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-muted-foreground text-base mb-4 leading-relaxed">
                  {t(project.description)}
                </p>

                {/* Technologies */}
                <div className="mb-6">
                  <h4 className="font-semibold text-base mb-2 text-primary">
                    {t('common.technologies')}:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.split(', ').map((tech, techIndex) => (
                      <span 
                        key={techIndex}
                        className="px-3 py-1 bg-primary/10 text-primary text-base font-medium rounded-full border border-primary/20"
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
                    className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors font-semibold text-base group-hover:scale-105 transition-transform"
                  >
                    <span>{t('portfolio.view_project')}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-base">{t('portfolio.no_projects')}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
