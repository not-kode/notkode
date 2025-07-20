import React from 'react';
import { Link } from 'react-router-dom';
import { Building, Handshake, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Home: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="container mx-auto max-w-4xl text-center">
        {/* Main Title */}
        <h1 className="font-sora font-bold text-4xl md:text-6xl lg:text-7xl mb-8 leading-tight">
          Acelere seu negócio com{' '}
          <span className="text-gradient">tecnologia</span>{' '}
          sob medida
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-16 max-w-3xl mx-auto leading-relaxed">
          Escolha como podemos ajudar você a crescer
        </p>
        
        {/* Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Empresas Option */}
          <Link 
            to="/empresas" 
            className="glass-card group hover:scale-105 transition-all duration-300 p-8 text-left"
          >
            <div className="flex items-center mb-4">
              <Building className="w-8 h-8 text-primary mr-3 group-hover:scale-110 transition-transform" />
              <h2 className="font-sora font-bold text-2xl">Para Empresas</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Soluções tecnológicas personalizadas para acelerar seu negócio
            </p>
            <div className="flex items-center text-primary font-semibold">
              Explorar Soluções
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>
          
          {/* Parcerias Option */}
          <Link 
            to="/parcerias" 
            className="glass-card group hover:scale-105 transition-all duration-300 p-8 text-left"
          >
            <div className="flex items-center mb-4">
              <Handshake className="w-8 h-8 text-primary mr-3 group-hover:scale-110 transition-transform" />
              <h2 className="font-sora font-bold text-2xl">Para Agências</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Seja nosso parceiro e ofereça desenvolvimento sem contratar equipe
            </p>
            <div className="flex items-center text-primary font-semibold">
              Explorar Parceria
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;