'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MessageCircle } from 'lucide-react';

/** Número comercial usado em todos os links de WhatsApp do site. */
export const WHATSAPP_NUMBER = '5511951381254';

/**
 * Botão flutuante de WhatsApp, presente em todas as páginas.
 *
 * Antes, o único link de WhatsApp do site ficava na tela de sucesso do formulário,
 * ou seja, só chegava nele quem já tinha completado todas as etapas. Quem não quer
 * responder formulário saía sem nenhum caminho para falar com a gente.
 * O formulário continua sendo o caminho principal; isto é a saída de baixo atrito.
 */
export function WhatsAppFloat() {
  const t = useTranslations('Contact');
  const [visible, setVisible] = useState(false);

  // Só aparece depois de um scroll curto: não compete com o hero na primeira dobra.
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t('whatsappFallbackMessage'))}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cta="whatsapp-flutuante"
      aria-label={t('whatsappFallbackCta')}
      title={t('whatsappFallbackCta')}
      className={`fixed bottom-5 right-5 lg:bottom-7 lg:right-7 z-[90] flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white transition-all duration-300 hover:-translate-y-0.5 ${
        visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
      style={{ boxShadow: '0 10px 30px -8px rgba(37,211,102,0.55)' }}
    >
      <MessageCircle className="w-7 h-7" strokeWidth={2} />
    </a>
  );
}
