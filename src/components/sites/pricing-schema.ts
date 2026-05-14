import type { PricingSchema } from '@/components/ui/pricing-form';

const TYPE_BASE: Record<string, [number, number]> = {
  landing:       [1800, 3500],
  institucional: [3500, 7000],
  blog:          [6000, 11000],
  multilingue:   [8500, 15000],
};

const PAGES_MULT: Record<string, number> = {
  pequeno: 1.0,    // até 3 páginas
  medio:   1.25,   // 4–7 páginas
  grande:  1.6,    // 8–15 páginas
};

const PER_EXTRA = 700;

const URGENCY_MULT: Record<string, number> = {
  normal:   1.0,
  rapido:   1.2,
  urgente:  1.45,
};

function calc(sel: Record<string, string | string[]>): [number, number] {
  const type = (sel.type as string) ?? 'institucional';
  const size = (sel.size as string) ?? 'pequeno';
  const extras = (sel.extras as string[]) ?? [];
  const urgency = (sel.urgency as string) ?? 'normal';

  const [baseMin, baseMax] = TYPE_BASE[type] ?? TYPE_BASE.institucional;
  const sizeMult = PAGES_MULT[size] ?? 1;
  const extrasCost = extras.length * PER_EXTRA;
  const mult = URGENCY_MULT[urgency] ?? 1;

  const min = Math.round((baseMin * sizeMult + extrasCost) * mult);
  const max = Math.round((baseMax * sizeMult + extrasCost * 1.4) * mult);
  return [min, max];
}

export const sitesPricingSchema: PricingSchema = {
  serviceTag: 'sites',
  copy: {
    eyebrow: 'Orçamento de Site',
    revealTitle: 'Investimento estimado',
    revealSubtitle:
      'Faixa preliminar com base nas suas escolhas. Deixe seu contato para receber a proposta detalhada e o cronograma.',
    submitLabel: 'Receber proposta',
  },
  fields: [
    {
      id: 'type',
      type: 'single',
      label: 'Que tipo de site você precisa?',
      hint: 'Selecione a opção que mais se aproxima do seu objetivo.',
      default: 'institucional',
      options: [
        { value: 'landing',       label: 'Landing Page',                hint: '1 página focada em conversão' },
        { value: 'institucional', label: 'Site Institucional',          hint: 'Apresentação completa da empresa' },
        { value: 'blog',          label: 'Site + Blog',                 hint: 'Institucional com seção de conteúdo' },
        { value: 'multilingue',   label: 'Site Multilíngue',            hint: 'Conteúdo em 2+ idiomas' },
      ],
    },
    {
      id: 'size',
      type: 'single',
      label: 'Qual o tamanho?',
      hint: 'Número estimado de páginas internas.',
      default: 'medio',
      options: [
        { value: 'pequeno', label: 'Compacto',  hint: 'até 3 páginas' },
        { value: 'medio',   label: 'Médio',     hint: '4–7 páginas' },
        { value: 'grande',  label: 'Grande',    hint: '8–15 páginas' },
      ],
    },
    {
      id: 'extras',
      type: 'multi',
      label: 'Quais extras você quer incluir?',
      hint: 'Tudo opcional. Marque o que faz sentido para o projeto.',
      default: [],
      min: 0,
      options: [
        { value: 'copy',       label: 'Copywriting profissional' },
        { value: 'seo',        label: 'SEO técnico avançado' },
        { value: 'analytics',  label: 'GA4 + Pixel + Hotjar' },
        { value: 'whatsapp',   label: 'Integração WhatsApp' },
        { value: 'crm',        label: 'Integração com CRM (RD, HubSpot…)' },
        { value: 'animacoes',  label: 'Animações premium' },
      ],
    },
    {
      id: 'urgency',
      type: 'single',
      label: 'Qual o prazo?',
      default: 'normal',
      options: [
        { value: 'normal',  label: 'Normal',  hint: '3–5 semanas' },
        { value: 'rapido',  label: 'Rápido',  hint: '2–3 semanas' },
        { value: 'urgente', label: 'Urgente', hint: 'até 2 semanas' },
      ],
    },
  ],
  calc,
};
