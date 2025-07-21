
import React from 'react';
import { Link } from 'react-router-dom';
import { Building, Handshake, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Home: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden pt-20 pb-8 md:pt-16 md:pb-16">
      {/* Animated Magical Background */}
      <div className="absolute inset-0">
        {/* Noise Texture for Liquid Glass Effect */}
        <div className="absolute inset-0 opacity-20" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`,
               backgroundSize: '200px 200px',
               mixBlendMode: 'soft-light'
             }}>
        </div>
        
        {/* Giant Radiating Circles - Using Notkode Palette */}
        <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[120vw] h-[120vw] max-w-[1400px] max-h-[1400px] bg-gradient-to-br from-primary/25 via-primary/10 to-transparent rounded-full blur-3xl animate-[magical-pulse_8s_ease-in-out_infinite]"></div>
        
        <div className="absolute -bottom-1/2 right-1/2 translate-x-1/2 w-[110vw] h-[110vw] max-w-[1300px] max-h-[1300px] bg-gradient-to-tl from-secondary/20 via-secondary/10 to-transparent rounded-full blur-3xl animate-[magical-pulse_12s_ease-in-out_infinite_reverse] animation-delay-2000"></div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] max-w-[1200px] max-h-[1200px] bg-gradient-to-r from-primary/15 via-muted/10 to-secondary/15 rounded-full blur-2xl animate-[magical-pulse_10s_ease-in-out_infinite] animation-delay-4000"></div>
        
        {/* Secondary Radiating Layer */}
        <div className="absolute top-1/4 right-1/4 w-[80vw] h-[80vw] max-w-[1000px] max-h-[1000px] bg-gradient-to-bl from-primary/20 via-muted/8 to-transparent rounded-full blur-2xl animate-[magical-pulse_14s_ease-in-out_infinite_reverse] animation-delay-6000"></div>
        
        <div className="absolute bottom-1/4 left-1/4 w-[85vw] h-[85vw] max-w-[1100px] max-h-[1100px] bg-gradient-to-tr from-secondary/18 via-primary/8 to-transparent rounded-full blur-2xl animate-[magical-pulse_16s_ease-in-out_infinite] animation-delay-8000"></div>
        
        {/* Irradiation Effect Layers */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/8 via-transparent to-secondary/5 animate-[magical-pulse_6s_ease-in-out_infinite]"></div>
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-muted/3 to-transparent animate-[magical-pulse_8s_ease-in-out_infinite_reverse] animation-delay-3000"></div>
      </div>

      <div className="container mx-auto max-w-[1200px] px-8 text-center relative z-10 flex-grow flex flex-col justify-center">
        {/* Main Title */}
        <div className="font-sora font-bold text-2xl md:text-5xl lg:text-6xl mb-6 md:mb-8 leading-tight">
          <div className="whitespace-nowrap"><span className="text-primary">{t('home.main_title_1').split(' ')[0]}</span> {t('home.main_title_1').split(' ').slice(1).join(' ')}</div>
          <div className="whitespace-nowrap">{t('home.main_title_2').split(' ').slice(0, -2).join(' ')} <span className="text-gradient">{t('home.main_title_2').split(' ').slice(-2, -1)[0]}</span> <span className="text-primary">{t('home.main_title_2').split(' ').slice(-1)[0]}</span></div>
        </div>
        
        {/* Subtitle - Console Style */}
        <div className="mb-8 md:mb-16 max-w-[1000px] mx-auto">
          <div className="bg-notkode-deep-navy/90 border border-primary/30 rounded-lg p-4 md:p-6 backdrop-blur-sm">
            <div className="flex items-center mb-3 md:mb-4">
              <div className="flex space-x-1 mr-3">
                <div className="w-2 h-2 md:w-3 md:h-3 bg-red-500 rounded-full"></div>
                <div className="w-2 h-2 md:w-3 md:h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-xs text-muted-foreground font-mono">terminal</span>
            </div>
            <p className="font-mono text-base md:text-lg md:text-xl text-primary/90 leading-relaxed mb-4 md:mb-6">
              <span className="text-secondary">$</span> echo "{t('home.terminal_echo')}"
            </p>
            
            {/* Options inside terminal */}
            <div className="grid md:grid-cols-2 gap-3 md:gap-4">
              {/* Empresas Option */}
              <Link 
                to="/companies" 
                className="glass-card group hover:scale-105 transition-all duration-300 p-4 md:p-6 text-left bg-background/10 hover:bg-background/20"
              >
                <div className="flex items-center mb-2 md:mb-3">
                  <Building className="w-5 h-5 md:w-6 md:h-6 text-primary mr-2 md:mr-3 group-hover:scale-110 transition-transform" />
                  <h2 className="font-sora font-bold text-white text-[20px]">{t('home.companies_title')}</h2>
                </div>
                <p className="mb-3 md:mb-4 text-[16px]" style={{ color: '#8A8A8A' }}>
                  {t('home.companies_desc')}
                </p>
                <div className="flex items-center text-primary font-semibold text-xs md:text-sm">
                  {t('home.companies_cta')}
                  <ArrowRight className="ml-1 md:ml-2 w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </Link>
              
              {/* Parcerias Option */}
              <Link 
                to="/agencies" 
                className="glass-card group hover:scale-105 transition-all duration-300 p-4 md:p-6 text-left bg-background/10 hover:bg-background/20"
              >
                <div className="flex items-center mb-2 md:mb-3">
                  <Handshake className="w-5 h-5 md:w-6 md:h-6 text-primary mr-2 md:mr-3 group-hover:scale-110 transition-transform" />
                  <h2 className="font-sora font-bold text-white text-[20px]">{t('home.agencies_title')}</h2>
                </div>
                <p className="mb-3 md:mb-4 text-[16px]" style={{ color: '#8A8A8A' }}>
                  {t('home.agencies_desc')}
                </p>
                <div className="flex items-center text-primary font-semibold text-xs md:text-sm">
                  {t('home.agencies_cta')}
                  <ArrowRight className="ml-1 md:ml-2 w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Futuristic Neon Lovable Tag */}
        <div className="relative inline-block mb-8 md:mb-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 blur-md rounded-full animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 border border-primary/40 rounded-full px-4 md:px-6 py-2 backdrop-blur-sm w-[700px]">
            <p className="relative text-xs md:text-sm font-medium tracking-wide font-mono" style={{ color: '#272B37' }}>
              <span className="inline-block w-1.5 h-1.5 md:w-2 md:h-2 bg-primary rounded-full mr-2 animate-pulse"></span>
              {t('home.lovable_tag')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
