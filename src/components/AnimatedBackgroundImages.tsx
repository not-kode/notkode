
import React from 'react';

const AnimatedBackgroundImages: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Primeira imagem - múltiplas instâncias com tamanhos maiores */}
      <div 
        className="absolute w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 opacity-20 animate-float-across-screen"
        style={{
          backgroundImage: 'url(/lovable-uploads/4a4eb7de-ae89-4685-a4bf-338864e5c5bb.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '10%',
          left: '5%',
          animationDelay: '0s',
          animationDuration: '12s',
          filter: 'hue-rotate(0deg) brightness(1.2)',
          mixBlendMode: 'soft-light'
        }}
      />
      
      <div 
        className="absolute w-20 h-20 md:w-28 md:h-28 lg:w-36 lg:h-36 opacity-15 animate-float-across-screen"
        style={{
          backgroundImage: 'url(/lovable-uploads/4a4eb7de-ae89-4685-a4bf-338864e5c5bb.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '60%',
          right: '10%',
          animationDelay: '2s',
          animationDuration: '16s',
          filter: 'hue-rotate(90deg) brightness(0.8)',
          mixBlendMode: 'overlay'
        }}
      />
      
      <div 
        className="absolute w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 opacity-25 animate-float-across-screen hidden md:block"
        style={{
          backgroundImage: 'url(/lovable-uploads/4a4eb7de-ae89-4685-a4bf-338864e5c5bb.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '30%',
          left: '70%',
          animationDelay: '4s',
          animationDuration: '14s',
          filter: 'hue-rotate(180deg) brightness(1.1)',
          mixBlendMode: 'multiply'
        }}
      />

      <div 
        className="absolute w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 opacity-18 animate-float-across-screen"
        style={{
          backgroundImage: 'url(/lovable-uploads/4a4eb7de-ae89-4685-a4bf-338864e5c5bb.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          bottom: '20%',
          left: '15%',
          animationDelay: '6s',
          animationDuration: '18s',
          filter: 'hue-rotate(270deg) brightness(0.9)',
          mixBlendMode: 'soft-light'
        }}
      />

      {/* Segunda imagem - múltiplas instâncias com tamanhos maiores */}
      <div 
        className="absolute w-22 h-22 md:w-30 md:h-30 lg:w-38 lg:h-38 opacity-20 animate-float-across-screen"
        style={{
          backgroundImage: 'url(/lovable-uploads/a97f81a7-0a6b-470d-8708-68f23ab8f500.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '15%',
          right: '5%',
          animationDelay: '1s',
          animationDuration: '15s',
          filter: 'hue-rotate(45deg) brightness(1.3)',
          mixBlendMode: 'soft-light'
        }}
      />
      
      <div 
        className="absolute w-26 h-26 md:w-34 md:h-34 lg:w-42 lg:h-42 opacity-18 animate-float-across-screen"
        style={{
          backgroundImage: 'url(/lovable-uploads/a97f81a7-0a6b-470d-8708-68f23ab8f500.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          bottom: '25%',
          left: '5%',
          animationDelay: '3s',
          animationDuration: '13s',
          filter: 'hue-rotate(135deg) brightness(0.9)',
          mixBlendMode: 'overlay'
        }}
      />
      
      <div 
        className="absolute w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 opacity-22 animate-float-across-screen hidden lg:block"
        style={{
          backgroundImage: 'url(/lovable-uploads/a97f81a7-0a6b-470d-8708-68f23ab8f500.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          bottom: '10%',
          right: '20%',
          animationDelay: '5s',
          animationDuration: '11s',
          filter: 'hue-rotate(225deg) brightness(1.0)',
          mixBlendMode: 'multiply'
        }}
      />

      <div 
        className="absolute w-18 h-18 md:w-26 md:h-26 lg:w-34 lg:h-34 opacity-16 animate-float-across-screen"
        style={{
          backgroundImage: 'url(/lovable-uploads/a97f81a7-0a6b-470d-8708-68f23ab8f500.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '5%',
          left: '50%',
          animationDelay: '7s',
          animationDuration: '17s',
          filter: 'hue-rotate(315deg) brightness(1.1)',
          mixBlendMode: 'soft-light'
        }}
      />

      {/* Instâncias adicionais espalhadas pela tela */}
      <div 
        className="absolute w-14 h-14 md:w-20 md:h-20 lg:w-28 lg:h-28 opacity-12 animate-float-across-screen hidden md:block"
        style={{
          backgroundImage: 'url(/lovable-uploads/4a4eb7de-ae89-4685-a4bf-338864e5c5bb.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '75%',
          right: '30%',
          animationDelay: '8s',
          animationDuration: '20s',
          filter: 'hue-rotate(60deg) brightness(0.7)',
          mixBlendMode: 'overlay'
        }}
      />
      
      <div 
        className="absolute w-20 h-20 md:w-28 md:h-28 lg:w-36 lg:h-36 opacity-14 animate-float-across-screen hidden lg:block"
        style={{
          backgroundImage: 'url(/lovable-uploads/a97f81a7-0a6b-470d-8708-68f23ab8f500.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '40%',
          left: '85%',
          animationDelay: '9s',
          animationDuration: '19s',
          filter: 'hue-rotate(120deg) brightness(1.0)',
          mixBlendMode: 'soft-light'
        }}
      />

      <div 
        className="absolute w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 opacity-10 animate-float-across-screen hidden xl:block"
        style={{
          backgroundImage: 'url(/lovable-uploads/4a4eb7de-ae89-4685-a4bf-338864e5c5bb.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '50%',
          left: '30%',
          animationDelay: '10s',
          animationDuration: '22s',
          filter: 'hue-rotate(200deg) brightness(0.8)',
          mixBlendMode: 'multiply'
        }}
      />
    </div>
  );
};

export default AnimatedBackgroundImages;
