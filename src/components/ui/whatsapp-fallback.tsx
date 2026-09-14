'use client';

import { useTranslations } from 'next-intl';
import { MessageCircle } from 'lucide-react';

/** Número comercial usado em todos os links de WhatsApp do site. */
export const WHATSAPP_NUMBER = '5511951381254';

/**
 * Saída de baixo atrito ao lado do formulário.
 *
 * Antes, o link de WhatsApp só existia na tela de sucesso, ou seja, só chegava nele
 * quem já tinha completado o formulário inteiro. Quem não quer responder etapas
 * simplesmente saía do site sem nenhum caminho para falar com a gente.
 * O formulário segue sendo o caminho principal; isto é a válvula de escape.
 */
export function WhatsAppFallback({ serviceTag }: { serviceTag?: string | null }) {
  const t = useTranslations('Contact');
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t('whatsappFallbackMessage'))}`;

  return (
    <p className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center">
      <span className="font-mono text-[11px] text-text-dim">
        {t('whatsappFallbackLabel')}
      </span>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-cta="whatsapp-direto"
        data-service={serviceTag ?? undefined}
        className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
      >
        <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.8} />
        {t('whatsappFallbackCta')}
      </a>
    </p>
  );
}
