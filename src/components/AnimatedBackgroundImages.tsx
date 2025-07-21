
import React from 'react';

const AnimatedBackgroundImages: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Logo circular N - múltiplas instâncias */}
      <div 
        className="absolute w-20 h-20 md:w-28 md:h-28 lg:w-36 lg:h-36 animate-gentle-float-fade"
        style={{
          backgroundImage: 'url(/lovable-uploads/circular-n-logo.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '10%',
          left: '5%',
          animationDelay: '0s',
          animationDuration: '12s',
          filter: 'hue-rotate(0deg) brightness(1.2) contrast(1.2)',
          mixBlendMode: 'multiply',
          opacity: '0.7'
        }}
      />
      
      <div 
        className="absolute w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 animate-gentle-float-fade"
        style={{
          backgroundImage: 'url(/lovable-uploads/circular-n-logo.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '60%',
          right: '10%',
          animationDelay: '3s',
          animationDuration: '16s',
          filter: 'hue-rotate(180deg) brightness(0.8) contrast(1.5)',
          mixBlendMode: 'multiply',
          opacity: '0.6'
        }}
      />
      
      <div 
        className="absolute w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 animate-gentle-float-fade hidden md:block"
        style={{
          backgroundImage: 'url(/lovable-uploads/circular-n-logo.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          bottom: '20%',
          left: '70%',
          animationDelay: '6s',
          animationDuration: '14s',
          filter: 'hue-rotate(270deg) brightness(0.2)',
          mixBlendMode: 'darken'
        }}
      />

      <div 
        className="absolute w-20 h-20 md:w-28 md:h-28 lg:w-36 lg:h-36 animate-gentle-float-fade"
        style={{
          backgroundImage: 'url(/lovable-uploads/circular-n-logo.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '80%',
          left: '15%',
          animationDelay: '9s',
          animationDuration: '18s',
          filter: 'hue-rotate(120deg) brightness(0.4)',
          mixBlendMode: 'multiply'
        }}
      />

      {/* Carinha sorridente - múltiplas instâncias */}
      <div 
        className="absolute w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 animate-gentle-float-fade"
        style={{
          backgroundImage: 'url(/lovable-uploads/smiley-face.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '25%',
          right: '20%',
          animationDelay: '2s',
          animationDuration: '15s',
          filter: 'hue-rotate(60deg) brightness(1) contrast(1.3)',
          mixBlendMode: 'multiply',
          opacity: '0.8'
        }}
      />
      
      <div 
        className="absolute w-20 h-20 md:w-28 md:h-28 lg:w-36 lg:h-36 animate-gentle-float-fade"
        style={{
          backgroundImage: 'url(/lovable-uploads/smiley-face.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          bottom: '30%',
          left: '25%',
          animationDelay: '5s',
          animationDuration: '13s',
          filter: 'hue-rotate(200deg) brightness(0.25)',
          mixBlendMode: 'darken'
        }}
      />
      
      <div 
        className="absolute w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 animate-gentle-float-fade hidden lg:block"
        style={{
          backgroundImage: 'url(/lovable-uploads/smiley-face.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '45%',
          right: '5%',
          animationDelay: '8s',
          animationDuration: '11s',
          filter: 'hue-rotate(320deg) brightness(0.15)',
          mixBlendMode: 'multiply'
        }}
      />

      <div 
        className="absolute w-12 h-12 md:w-16 md:h-16 lg:w-24 lg:h-24 animate-gentle-float-fade hidden md:block"
        style={{
          backgroundImage: 'url(/lovable-uploads/smiley-face.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '5%',
          left: '50%',
          animationDelay: '11s',
          animationDuration: '17s',
          filter: 'hue-rotate(140deg) brightness(0.5)',
          mixBlendMode: 'overlay'
        }}
      />

      {/* Instâncias adicionais para desktop com efeitos mais escuros */}
      <div 
        className="absolute w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 animate-gentle-float-fade hidden xl:block"
        style={{
          backgroundImage: 'url(/lovable-uploads/circular-n-logo.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '35%',
          left: '80%',
          animationDelay: '4s',
          animationDuration: '20s',
          filter: 'hue-rotate(240deg) brightness(0.1) contrast(2)',
          mixBlendMode: 'darken'
        }}
      />
      
      <div 
        className="absolute w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 animate-gentle-float-fade hidden xl:block"
        style={{
          backgroundImage: 'url(/lovable-uploads/smiley-face.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          bottom: '15%',
          right: '40%',
          animationDelay: '7s',
          animationDuration: '19s',
          filter: 'hue-rotate(300deg) brightness(0.2) contrast(3)',
          mixBlendMode: 'darken'
        }}
      />
    </div>
  );
};

export default AnimatedBackgroundImages;
