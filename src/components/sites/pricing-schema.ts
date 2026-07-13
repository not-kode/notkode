import type { InclusionGroup, PricingSchema } from '@/components/ui/pricing-form';

// Modo "a partir de": mostramos só o PISO por tipo (min = max = piso).
// Landing e Site são coisas separadas. Perguntas de tamanho/prazo/necessidade
// servem só pra qualificar o lead — não mexem mais no valor.
const TYPE_FLOOR: Record<string, number> = {
  landing: 1800,
  site:    4000,
};

function calc(sel: Record<string, string | string[]>): [number, number] {
  const type = (sel.type as string) ?? 'site';
  const floor = TYPE_FLOOR[type] ?? TYPE_FLOOR.site;
  return [floor, floor];
}

function inclusions(): InclusionGroup[] {
  // "O que já vem incluso" — só o que é SEMPRE verdadeiro num site da Notkode.
  // (Camila vai confirmar/ajustar essa lista.)
  const incluso: string[] = [
    'Design responsivo (celular, tablet, computador)',
    'Hospedagem configurada',
    'Domínio próprio apontado',
    'SSL/HTTPS (cadeado de segurança)',
    'Performance otimizada',
  ];

  const groups: InclusionGroup[] = [
    { title: 'Já vem incluso', items: incluso },
  ];

  return groups;
}

function reportTitle(sel: Record<string, string | string[]>): string {
  const type = (sel.type as string) ?? 'site';
  return type === 'landing' ? 'Sua landing de conversão' : 'Seu site';
}

export const sitesPricingSchema: PricingSchema = {
  serviceTag: 'sites',
  priceMode: 'from',
  copy: {
    eyebrow: 'Orçamento de Site',
    revealTitle: 'Investimento',
    revealSubtitle:
      'Piso pra esse tipo de projeto. O valor final a gente fecha numa conversa rápida, conforme o escopo. Deixe seu contato pra receber a proposta.',
    submitLabel: 'Receber proposta',
  },
  fields: [
    {
      id: 'type',
      type: 'single',
      label: 'Landing Page ou Site?',
      hint: 'São coisas diferentes: landing é uma página focada em conversão; site é a presença completa da empresa.',
      default: 'site',
      options: [
        { value: 'landing', label: 'Landing Page', hint: '1 página focada em converter' },
        { value: 'site',    label: 'Site',         hint: 'Presença completa da empresa' },
      ],
    },
    {
      id: 'size',
      type: 'single',
      label: 'Qual o tamanho?',
      hint: 'Número estimado de páginas (vale mais pra site; landing é 1 página).',
      default: 'medio',
      options: [
        { value: 'pequeno', label: 'Compacto', hint: 'até 3 páginas' },
        { value: 'medio',   label: 'Médio',    hint: '4–7 páginas' },
        { value: 'grande',  label: 'Grande',   hint: '8–15 páginas' },
      ],
    },
    {
      id: 'needs',
      type: 'multi',
      label: 'O que o site precisa ter?',
      hint: 'Marque o que faz sentido pro seu objetivo.',
      default: [],
      min: 0,
      options: [
        { value: 'contato', label: 'Gerar contato com a lead' },
        { value: 'blog',    label: 'Blog / conteúdo' },
        { value: 'crm',     label: 'Integração com CRM' },
        { value: 'trafego', label: 'Tráfego pra trazer visitantes' },
      ],
    },
    {
      id: 'urgency',
      type: 'single',
      render: 'dropdown',
      label: 'É urgente?',
      hint: 'Só pra sabermos a prioridade — o prazo real a gente combina junto.',
      default: 'normal',
      options: [
        { value: 'urgente', label: 'Sim, tenho urgência' },
        { value: 'prazo',   label: 'Tenho um prazo em mente' },
        { value: 'normal',  label: 'Não, sem pressa' },
      ],
    },
  ],
  calc,
  inclusions,
  reportTitle,
};
