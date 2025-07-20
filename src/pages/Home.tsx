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
        <div className="absolute inset-0 opacity-20" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`,
               backgroundSize: '200px 200px',
               mixBlendMode: 'soft-light'
             }}>
        </div>
        
        {/* Giant Radiating Circles - Almost Full Screen Width */}
        <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[120vw] h-[120vw] max-w-[1400px] max-h-[1400px] bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-transparent rounded-full blur-3xl animate-[magical-pulse_8s_ease-in-out_infinite]"></div>
        
        <div className="absolute -bottom-1/2 right-1/2 translate-x-1/2 w-[110vw] h-[110vw] max-w-[1300px] max-h-[1300px] bg-gradient-to-tl from-orange-500/25 via-pink-500/20 to-transparent rounded-full blur-3xl animate-[magical-pulse_12s_ease-in-out_infinite_reverse] animation-delay-2000"></div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] max-w-[1200px] max-h-[1200px] bg-gradient-to-r from-primary/15 via-secondary/20 to-accent/15 rounded-full blur-2xl animate-[magical-pulse_10s_ease-in-out_infinite] animation-delay-4000"></div>
        
        {/* Secondary Radiating Layer */}
        <div className="absolute top-1/4 right-1/4 w-[80vw] h-[80vw] max-w-[1000px] max-h-[1000px] bg-gradient-to-bl from-purple-400/20 via-blue-400/15 to-transparent rounded-full blur-2xl animate-[magical-pulse_14s_ease-in-out_infinite_reverse] animation-delay-6000"></div>
        
        <div className="absolute bottom-1/4 left-1/4 w-[85vw] h-[85vw] max-w-[1100px] max-h-[1100px] bg-gradient-to-tr from-pink-400/20 via-orange-400/15 to-transparent rounded-full blur-2xl animate-[magical-pulse_16s_ease-in-out_infinite] animation-delay-8000"></div>
        
        {/* Irradiation Effect Layers */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-secondary/5 animate-[magical-pulse_6s_ease-in-out_infinite]"></div>
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-accent/3 to-transparent animate-[magical-pulse_8s_ease-in-out_infinite_reverse] animation-delay-3000"></div>
        
        {/* Glass morphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/10 via-transparent to-background/10 backdrop-blur-[0.5px]"></div>
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