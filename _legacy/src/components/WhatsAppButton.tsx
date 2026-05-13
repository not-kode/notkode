import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
interface WhatsAppButtonProps {
  className?: string;
  text?: string;
}
const WHATSAPP_URL = "https://wa.me/5511951381254?text=Ol%C3%A1%20equipe%20da%20Notkode%2C%20tudo%20bem%3F%0A%0ATenho%20interesse%20nos%20servi%C3%A7os%20oferecidos%2C%20podem%20me%20ajudar%20por%20favor%3F";
const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  className = "",
  text
}) => {
  const {
    t
  } = useLanguage();
  const handleClick = () => {
    window.open(WHATSAPP_URL, '_blank');
  };
  return <button onClick={handleClick} className={`whatsapp-button inline-flex items-center space-x-2 ${className}`}>
      <MessageCircle className="w-5 h-5" />
      <span className="text-base text-zinc-900">{text || t('home.whatsapp')}</span>
    </button>;
};
export default WhatsAppButton;