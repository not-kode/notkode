import React from 'react';
import { Link } from 'react-router-dom';
import { Building, Handshake, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Home: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background">
        {/* Noise Texture Overlay */}
        <div className="absolute inset-0 opacity-30" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
               backgroundSize: '180px 180px',
               mixBlendMode: 'overlay'
             }}>
        </div>
        
        {/* Floating Circles */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-[float_6s_ease-in-out_infinite]"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-secondary/15 rounded-full blur-lg animate-[float_8s_ease-in-out_infinite_reverse] animation-delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-40 h-40 bg-accent/8 rounded-full blur-2xl animate-[float_10s_ease-in-out_infinite] animation-delay-2000"></div>
        <div className="absolute top-1/6 right-1/6 w-20 h-20 bg-primary/20 rounded-full blur-md animate-[float_7s_ease-in-out_infinite] animation-delay-3000"></div>
        <div className="absolute bottom-1/4 left-1/6 w-28 h-28 bg-secondary/12 rounded-full blur-lg animate-[float_9s_ease-in-out_infinite_reverse] animation-delay-4000"></div>
        
        {/* Glass morphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/5 to-transparent backdrop-blur-[1px]"></div>
      </div>

      <div className="container mx-auto max-w-4xl text-center relative z-10">
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