import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, ArrowRight, Zap, Code, Brain } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import WhatsAppButton from '@/components/WhatsAppButton';

const Home: React.FC = () => {
  const { t } = useLanguage();

  const impactNumbers = [
    { number: "50+", label: "Projetos Entregues" },
    { number: "3", label: "Anos de Experiência" },
    { number: "R$ 300k+", label: "Faturamento dos Clientes" },
    { number: "100%", label: "Satisfação dos Clientes" }
  ];

  const technologies = [
    { name: "IA & Automação", icon: Brain },
    { name: "No-Code/Low-Code", icon: Zap },
    { name: "Desenvolvimento Full-Stack", icon: Code }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient py-20 px-4">
        <div className="container mx-auto text-center">
          {/* Logo Animation */}
          <div className="animate-glass-float mb-8">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl">
              <span className="text-white font-bold text-3xl">N</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="font-sora font-bold text-4xl md:text-6xl mb-8 animate-fade-in-up">
            <span className="text-gradient">{t('home.title')}</span>
          </h1>

          {/* Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            <Link to="/empresas" className="selection-card group">
              <div className="flex items-center justify-center mb-4">
                <Building2 className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-sora font-bold text-xl mb-2">{t('home.company.title')}</h3>
              <p className="text-muted-foreground mb-4">{t('home.company.desc')}</p>
              <div className="flex items-center justify-center text-primary group-hover:translate-x-2 transition-transform">
                <span className="mr-2">Explorar</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            <Link to="/parcerias" className="selection-card group">
              <div className="flex items-center justify-center mb-4">
                <Users className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-sora font-bold text-xl mb-2">{t('home.agency.title')}</h3>
              <p className="text-muted-foreground mb-4">{t('home.agency.desc')}</p>
              <div className="flex items-center justify-center text-primary group-hover:translate-x-2 transition-transform">
                <span className="mr-2">Explorar</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>

          {/* WhatsApp CTA */}
          <div className="animate-fade-in-up">
            <WhatsAppButton className="text-lg px-8 py-4" />
          </div>
        </div>
      </section>

      {/* Impact Numbers Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {impactNumbers.map((item, index) => (
              <div key={index} className="glass-card text-center group hover:scale-105">
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                  {item.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Highlights */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto">
          <h2 className="font-sora font-bold text-3xl md:text-4xl text-center mb-12">
            <span className="text-gradient">Tecnologias de Ponta</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {technologies.map((tech, index) => (
              <div key={index} className="glass-card text-center group">
                <div className="flex items-center justify-center mb-4">
                  <tech.icon className="w-16 h-16 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="font-sora font-semibold text-lg">{tech.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="font-sora font-bold text-3xl md:text-4xl mb-8">
            Pronto para <span className="text-gradient">transformar</span> sua ideia?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Entre em contato conosco e descubra como podemos acelerar seu negócio com tecnologia de ponta.
          </p>
          <WhatsAppButton className="text-lg px-8 py-4" />
        </div>
      </section>
    </div>
  );
};

export default Home;