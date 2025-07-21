
import React from 'react';

const AnimatedBackgroundImages: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Logo circular N - múltiplas instâncias */}
      <div 
        className="absolute w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 animate-gentle-float-fade"
        style={{
          backgroundImage: 'url(/lovable-uploads/3b0bb47c-2b80-4678-bfb2-c9493caf546c.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '10%',
          left: '5%',
          animationDelay: '0s',
          animationDuration: '12s',
          filter: 'hue-rotate(0deg) brightness(1)',
          mixBlendMode: 'soft-light'
        }}
      />
      
      <div 
        className="absolute w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 animate-gentle-float-fade"
        style={{
          backgroundImage: 'url(/lovable-uploads/3b0bb47c-2b80-4678-bfb2-c9493caf546c.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '60%',
          right: '10%',
          animationDelay: '3s',
          animationDuration: '16s',
          filter: 'hue-rotate(180deg) brightness(0.4)',
          mixBlendMode: 'overlay'
        }}
      />
      
      <div 
        className="absolute w-18 h-18 md:w-22 md:h-22 lg:w-26 lg:h-26 animate-gentle-float-fade hidden md:block"
        style={{
          backgroundImage: 'url(/lovable-uploads/3b0bb47c-2b80-4678-bfb2-c9493caf546c.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          bottom: '20%',
          left: '70%',
          animationDelay: '6s',
          animationDuration: '14s',
          filter: 'hue-rotate(270deg) brightness(0.3)',
          mixBlendMode: 'multiply'
        }}
      />

      <div 
        className="absolute w-14 h-14 md:w-18 md:h-18 lg:w-22 lg:h-22 animate-gentle-float-fade"
        style={{
          backgroundImage: 'url(/lovable-uploads/3b0bb47c-2b80-4678-bfb2-c9493caf546c.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '80%',
          left: '15%',
          animationDelay: '9s',
          animationDuration: '18s',
          filter: 'hue-rotate(120deg) brightness(0.7)',
          mixBlendMode: 'soft-light'
        }}
      />

      {/* Carinha sorridente - múltiplas instâncias */}
      <div 
        className="absolute w-18 h-18 md:w-22 md:h-22 lg:w-26 lg:h-26 animate-gentle-float-fade"
        style={{
          backgroundImage: 'url(/lovable-uploads/62941b87-8228-4970-9150-e1b6d5a9f516.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '25%',
          right: '20%',
          animationDelay: '2s',
          animationDuration: '15s',
          filter: 'hue-rotate(60deg) brightness(1.1)',
          mixBlendMode: 'soft-light'
        }}
      />
      
      <div 
        className="absolute w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 animate-gentle-float-fade"
        style={{
          backgroundImage: 'url(/lovable-uploads/62941b87-8228-4970-9150-e1b6d5a9f516.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          bottom: '30%',
          left: '25%',
          animationDelay: '5s',
          animationDuration: '13s',
          filter: 'hue-rotate(200deg) brightness(0.3)',
          mixBlendMode: 'overlay'
        }}
      />
      
      <div 
        className="absolute w-22 h-22 md:w-26 md:h-26 lg:w-30 lg:h-30 animate-gentle-float-fade hidden lg:block"
        style={{
          backgroundImage: 'url(/lovable-uploads/62941b87-8228-4970-9150-e1b6d5a9f516.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '45%',
          right: '5%',
          animationDelay: '8s',
          animationDuration: '11s',
          filter: 'hue-rotate(320deg) brightness(0.5)',
          mixBlendMode: 'multiply'
        }}
      />

      <div 
        className="absolute w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 animate-gentle-float-fade hidden md:block"
        style={{
          backgroundImage: 'url(/lovable-uploads/62941b87-8228-4970-9150-e1b6d5a9f516.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '5%',
          left: '50%',
          animationDelay: '11s',
          animationDuration: '17s',
          filter: 'hue-rotate(140deg) brightness(0.8)',
          mixBlendMode: 'soft-light'
        }}
      />

      {/* Instâncias adicionais para desktop */}
      <div 
        className="absolute w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 animate-gentle-float-fade hidden xl:block"
        style={{
          backgroundImage: 'url(/lovable-uploads/3b0bb47c-2b80-4678-bfb2-c9493caf546c.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '35%',
          left: '80%',
          animationDelay: '4s',
          animationDuration: '20s',
          filter: 'hue-rotate(240deg) brightness(0.4)',
          mixBlendMode: 'multiply'
        }}
      />
      
      <div 
        className="absolute w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 animate-gentle-float-fade hidden xl:block"
        style={{
          backgroundImage: 'url(/lovable-uploads/62941b87-8228-4970-9150-e1b6d5a9f516.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          bottom: '15%',
          right: '40%',
          animationDelay: '7s',
          animationDuration: '19s',
          filter: 'hue-rotate(300deg) brightness(0.6)',
          mixBlendMode: 'soft-light'
        }}
      />
    </div>
  );
};

export default AnimatedBackgroundImages;
