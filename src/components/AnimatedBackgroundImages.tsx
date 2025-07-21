import React, { useState, useEffect } from 'react';

const AnimatedBackgroundImages: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getTransform = (index: number) => {
    const intensity = 0.5; // Intensidade do movimento
    const offsetX = (mousePosition.x - 50) * intensity * (index + 1) * 0.1;
    const offsetY = (mousePosition.y - 50) * intensity * (index + 1) * 0.1;
    return `translate(${offsetX}px, ${offsetY}px)`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Primeira imagem - Logo circular N */}
      <div 
        className="absolute w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 animate-gentle-float-fade transition-transform duration-500 ease-out"
        style={{
          backgroundImage: 'url(/lovable-uploads/circular-n-logo.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '20%',
          left: '15%',
          animationDelay: '0s',
          animationDuration: '8s',
          filter: 'brightness(0.7) contrast(1.2)',
          mixBlendMode: 'multiply',
          transform: getTransform(0)
        }}
      />
      
      {/* Segunda imagem - Carinha sorridente */}
      <div 
        className="absolute w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 animate-gentle-float-fade transition-transform duration-700 ease-out"
        style={{
          backgroundImage: 'url(/lovable-uploads/2e0ed293-e64d-4833-842c-b28785ba67e5.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          top: '60%',
          right: '20%',
          animationDelay: '3s',
          animationDuration: '10s',
          filter: 'brightness(0.6) contrast(1.3)',
          mixBlendMode: 'multiply',
          transform: getTransform(1)
        }}
      />
      
      {/* Terceira imagem - Logo circular N */}
      <div 
        className="absolute w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 animate-gentle-float-fade transition-transform duration-600 ease-out"
        style={{
          backgroundImage: 'url(/lovable-uploads/circular-n-logo.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          bottom: '25%',
          left: '60%',
          animationDelay: '6s',
          animationDuration: '12s',
          filter: 'brightness(0.5) contrast(1.4)',
          mixBlendMode: 'multiply',
          transform: getTransform(2)
        }}
      />
    </div>
  );
};

export default AnimatedBackgroundImages;