
import React from 'react';

const AnimatedBackgroundImages: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Smile Icon Instances */}
      <div 
        className="absolute w-16 h-16 md:w-24 md:h-24 opacity-20 animate-float"
        style={{
          backgroundImage: 'url(/lovable-uploads/459ff3f4-6202-469d-b8e5-fb2c5a1cc2e7.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '10%',
          left: '15%',
          animationDelay: '0s',
          animationDuration: '8s',
          filter: 'hue-rotate(180deg) brightness(1.2)',
          mixBlendMode: 'soft-light'
        }}
      />
      
      <div 
        className="absolute w-12 h-12 md:w-20 md:h-20 opacity-15 animate-float"
        style={{
          backgroundImage: 'url(/lovable-uploads/459ff3f4-6202-469d-b8e5-fb2c5a1cc2e7.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '60%',
          right: '20%',
          animationDelay: '2s',
          animationDuration: '12s',
          filter: 'hue-rotate(90deg) brightness(0.8)',
          mixBlendMode: 'overlay'
        }}
      />
      
      <div 
        className="absolute w-20 h-20 md:w-28 md:h-28 opacity-25 animate-float hidden md:block"
        style={{
          backgroundImage: 'url(/lovable-uploads/459ff3f4-6202-469d-b8e5-fb2c5a1cc2e7.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '30%',
          left: '70%',
          animationDelay: '4s',
          animationDuration: '10s',
          filter: 'hue-rotate(270deg) brightness(1.1)',
          mixBlendMode: 'multiply'
        }}
      />

      {/* Circular N Logo Instances */}
      <div 
        className="absolute w-14 h-14 md:w-22 md:h-22 opacity-20 animate-float"
        style={{
          backgroundImage: 'url(/lovable-uploads/6beced90-2174-433f-9c99-a27a4e5372e8.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '20%',
          right: '10%',
          animationDelay: '1s',
          animationDuration: '14s',
          filter: 'hue-rotate(45deg) brightness(1.3)',
          mixBlendMode: 'soft-light'
        }}
      />
      
      <div 
        className="absolute w-18 h-18 md:w-26 md:h-26 opacity-18 animate-float"
        style={{
          backgroundImage: 'url(/lovable-uploads/6beced90-2174-433f-9c99-a27a4e5372e8.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          bottom: '25%',
          left: '10%',
          animationDelay: '3s',
          animationDuration: '11s',
          filter: 'hue-rotate(135deg) brightness(0.9)',
          mixBlendMode: 'overlay'
        }}
      />
      
      <div 
        className="absolute w-16 h-16 md:w-24 md:h-24 opacity-22 animate-float hidden lg:block"
        style={{
          backgroundImage: 'url(/lovable-uploads/6beced90-2174-433f-9c99-a27a4e5372e8.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          bottom: '15%',
          right: '25%',
          animationDelay: '5s',
          animationDuration: '9s',
          filter: 'hue-rotate(225deg) brightness(1.0)',
          mixBlendMode: 'multiply'
        }}
      />

      {/* Additional smaller instances for depth */}
      <div 
        className="absolute w-8 h-8 md:w-12 md:h-12 opacity-12 animate-float hidden md:block"
        style={{
          backgroundImage: 'url(/lovable-uploads/459ff3f4-6202-469d-b8e5-fb2c5a1cc2e7.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '70%',
          left: '80%',
          animationDelay: '6s',
          animationDuration: '16s',
          filter: 'hue-rotate(315deg) brightness(0.7)',
          mixBlendMode: 'soft-light'
        }}
      />
      
      <div 
        className="absolute w-10 h-10 md:w-16 md:h-16 opacity-15 animate-float hidden lg:block"
        style={{
          backgroundImage: 'url(/lovable-uploads/6beced90-2174-433f-9c99-a27a4e5372e8.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '5%',
          left: '50%',
          animationDelay: '7s',
          animationDuration: '13s',
          filter: 'hue-rotate(60deg) brightness(1.1)',
          mixBlendMode: 'overlay'
        }}
      />
    </div>
  );
};

export default AnimatedBackgroundImages;
