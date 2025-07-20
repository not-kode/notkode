import React from 'react';
import { Link } from 'react-router-dom';
import { Building, Handshake, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Home: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Magical Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background">
        {/* Noise Texture for Liquid Glass Effect */}
        <div className="absolute inset-0 opacity-40" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`,
               backgroundSize: '200px 200px',
               mixBlendMode: 'soft-light'
             }}>
        </div>
        
        {/* Large Magical Floating Circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-gradient-to-br from-primary/20 to-secondary/10 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite]"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-tl from-secondary/25 to-accent/15 rounded-full blur-3xl animate-[float_12s_ease-in-out_infinite_reverse] animation-delay-2000"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-accent/15 to-primary/20 rounded-full blur-2xl animate-[float_10s_ease-in-out_infinite] animation-delay-4000"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-gradient-to-tr from-primary/30 to-secondary/20 rounded-full blur-2xl animate-[float_14s_ease-in-out_infinite_reverse] animation-delay-6000"></div>
        
        {/* Medium Floating Elements */}
        <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-gradient-to-r from-primary/15 to-transparent rounded-full blur-xl animate-[float_9s_ease-in-out_infinite] animation-delay-1000"></div>
        <div className="absolute bottom-1/3 right-1/3 w-56 h-56 bg-gradient-to-l from-secondary/20 to-transparent rounded-full blur-xl animate-[float_11s_ease-in-out_infinite_reverse] animation-delay-3000"></div>
        
        {/* Smaller Accent Circles */}
        <div className="absolute top-20 left-1/2 w-32 h-32 bg-primary/25 rounded-full blur-lg animate-[float_7s_ease-in-out_infinite] animation-delay-500"></div>
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-secondary/20 rounded-full blur-lg animate-[float_13s_ease-in-out_infinite_reverse] animation-delay-7000"></div>
        
        {/* Magical Glow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 animate-pulse"></div>
        
        {/* Glass morphism layers */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-background/10 to-transparent backdrop-blur-[0.5px]"></div>
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