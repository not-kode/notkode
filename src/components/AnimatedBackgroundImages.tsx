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
          filter: 'hue-rotate(270deg) brightness(0.5) contrast(1.8)',
          mixBlendMode: 'multiply',
          opacity: '0.5'
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
          filter: 'hue-rotate(120deg) brightness(0.6) contrast(1.6)',
          mixBlendMode: 'multiply',
          opacity: '0.6'
        }}
      />

      {/* Carinha sorridente - múltiplas instâncias */}
      <div 
        className="absolute w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 animate-gentle-float-fade"
        style={{
          backgroundImage: 'url(/lovable-uploads/2e0ed293-e64d-4833-842c-b28785ba67e5.png)',
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
          backgroundImage: 'url(/lovable-uploads/2e0ed293-e64d-4833-842c-b28785ba67e5.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          bottom: '30%',
          left: '25%',
          animationDelay: '5s',
          animationDuration: '13s',
          filter: 'hue-rotate(200deg) brightness(0.6) contrast(1.5)',
          mixBlendMode: 'multiply',
          opacity: '0.7'
        }}
      />
      
      <div 
        className="absolute w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 animate-gentle-float-fade hidden lg:block"
        style={{
          backgroundImage: 'url(/lovable-uploads/2e0ed293-e64d-4833-842c-b28785ba67e5.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '45%',
          right: '5%',
          animationDelay: '8s',
          animationDuration: '11s',
          filter: 'hue-rotate(320deg) brightness(0.4) contrast(2)',
          mixBlendMode: 'multiply',
          opacity: '0.5'
        }}
      />

      <div 
        className="absolute w-12 h-12 md:w-16 md:h-16 lg:w-24 lg:h-24 animate-gentle-float-fade hidden md:block"
        style={{
          backgroundImage: 'url(/lovable-uploads/2e0ed293-e64d-4833-842c-b28785ba67e5.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '5%',
          left: '50%',
          animationDelay: '11s',
          animationDuration: '17s',
          filter: 'hue-rotate(140deg) brightness(0.8) contrast(1.2)',
          mixBlendMode: 'multiply',
          opacity: '0.6'
        }}
      />

      {/* Novas instâncias adicionais */}
      <div 
        className="absolute w-18 h-18 md:w-26 md:h-26 lg:w-34 lg:h-34 animate-gentle-float-fade"
        style={{
          backgroundImage: 'url(/lovable-uploads/circular-n-logo.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '75%',
          right: '25%',
          animationDelay: '13s',
          animationDuration: '22s',
          filter: 'hue-rotate(45deg) brightness(0.9) contrast(1.1)',
          mixBlendMode: 'multiply',
          opacity: '0.7'
        }}
      />

      <div 
        className="absolute w-14 h-14 md:w-20 md:h-20 lg:w-28 lg:h-28 animate-gentle-float-fade hidden md:block"
        style={{
          backgroundImage: 'url(/lovable-uploads/2e0ed293-e64d-4833-842c-b28785ba67e5.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '40%',
          left: '10%',
          animationDelay: '16s',
          animationDuration: '14s',
          filter: 'hue-rotate(220deg) brightness(0.7) contrast(1.4)',
          mixBlendMode: 'multiply',
          opacity: '0.6'
        }}
      />

      <div 
        className="absolute w-22 h-22 md:w-30 md:h-30 lg:w-38 lg:h-38 animate-gentle-float-fade hidden lg:block"
        style={{
          backgroundImage: 'url(/lovable-uploads/circular-n-logo.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          bottom: '45%',
          right: '8%',
          animationDelay: '19s',
          animationDuration: '16s',
          filter: 'hue-rotate(120deg) brightness(0.5) contrast(1.6)',
          mixBlendMode: 'multiply',
          opacity: '0.5'
        }}
      />

      <div 
        className="absolute w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 animate-gentle-float-fade"
        style={{
          backgroundImage: 'url(/lovable-uploads/2e0ed293-e64d-4833-842c-b28785ba67e5.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '18%',
          left: '75%',
          animationDelay: '22s',
          animationDuration: '18s',
          filter: 'hue-rotate(270deg) brightness(0.8) contrast(1.3)',
          mixBlendMode: 'multiply',
          opacity: '0.6'
        }}
      />

      <div 
        className="absolute w-26 h-26 md:w-34 md:h-34 lg:w-42 lg:h-42 animate-gentle-float-fade hidden xl:block"
        style={{
          backgroundImage: 'url(/lovable-uploads/circular-n-logo.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          bottom: '60%',
          left: '50%',
          animationDelay: '25s',
          animationDuration: '21s',
          filter: 'hue-rotate(330deg) brightness(0.4) contrast(2)',
          mixBlendMode: 'multiply',
          opacity: '0.4'
        }}
      />

      <div 
        className="absolute w-18 h-18 md:w-26 md:h-26 lg:w-34 lg:h-34 animate-gentle-float-fade hidden md:block"
        style={{
          backgroundImage: 'url(/lovable-uploads/2e0ed293-e64d-4833-842c-b28785ba67e5.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '85%',
          right: '50%',
          animationDelay: '28s',
          animationDuration: '19s',
          filter: 'hue-rotate(100deg) brightness(0.7) contrast(1.5)',
          mixBlendMode: 'multiply',
          opacity: '0.5'
        }}
      />

      <div 
        className="absolute w-20 h-20 md:w-28 md:h-28 lg:w-36 lg:h-36 animate-gentle-float-fade"
        style={{
          backgroundImage: 'url(/lovable-uploads/circular-n-logo.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '35%',
          left: '85%',
          animationDelay: '31s',
          animationDuration: '15s',
          filter: 'hue-rotate(240deg) brightness(0.6) contrast(1.7)',
          mixBlendMode: 'multiply',
          opacity: '0.6'
        }}
      />
    </div>
  );
};

export default AnimatedBackgroundImages;