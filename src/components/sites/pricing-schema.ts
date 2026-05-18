import type { InclusionGroup, PricingSchema, TimelinePhase } from '@/components/ui/pricing-form';

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

const TYPE_LABEL: Record<string, string> = {
  landing:       'Landing Page',
  institucional: 'Site Institucional',
  blog:          'Site + Blog',
  multilingue:   'Site Multilíngue',
};

const SIZE_LABEL: Record<string, string> = {
  pequeno: 'até 3 páginas',
  medio:   '4 a 7 páginas',
  grande:  '8 a 15 páginas',
};

const EXTRA_LABEL: Record<string, string> = {
  copy:      'Copywriting profissional',
  seo:       'SEO técnico avançado',
  analytics: 'GA4 + Pixel + Hotjar',
  whatsapp:  'Integração WhatsApp',
  crm:       'Integração com CRM',
  animacoes: 'Animações premium',
};

function inclusions(sel: Record<string, string | string[]>): InclusionGroup[] {
  const type = (sel.type as string) ?? 'institucional';
  const size = (sel.size as string) ?? 'medio';
  const extras = (sel.extras as string[]) ?? [];

  const principal: string[] = [
    TYPE_LABEL[type] ?? type,
    `Estrutura ${SIZE_LABEL[size] ?? size}`,
    'Design responsivo (mobile, tablet, desktop)',
    'Painel pra editar conteúdo sem chamar dev',
  ];

  const tecnico: string[] = [
    'Hospedagem configurada (Vercel ou similar)',
    'Domínio próprio apontado',
    'SSL/HTTPS ativo',
    'Performance otimizada (Lighthouse 90+)',
  ];

  const groups: InclusionGroup[] = [
    { title: 'Escopo principal', items: principal },
    { title: 'Stack técnico', items: tecnico },
  ];

  if (extras.length > 0) {
    groups.push({
      title: `Extras (${extras.length})`,
      items: extras.map((e) => EXTRA_LABEL[e] ?? e),
    });
  }

  return groups;
}

function timeline(sel: Record<string, string | string[]>): TimelinePhase[] {
  const urgency = (sel.urgency as string) ?? 'normal';
  if (urgency === 'urgente') {
    return [
      { range: 'Semana 1',   title: 'Briefing + design', desc: 'Direção visual e wireframes aprovados.' },
      { range: 'Semana 1–2', title: 'Construção',         desc: 'Páginas, conteúdo e integrações.' },
      { range: 'Semana 2',   title: 'Go-live',            desc: 'Revisão final e ar.' },
    ];
  }
  if (urgency === 'rapido') {
    return [
      { range: 'Semana 1',   title: 'Briefing + design', desc: 'Moodboard, wireframes e protótipo.' },
      { range: 'Semana 2',   title: 'Construção',         desc: 'Todas as páginas e integrações.' },
      { range: 'Semana 3',   title: 'Go-live',            desc: 'Revisão final, lançamento e ajustes.' },
    ];
  }
  return [
    { range: 'Semana 1',   title: 'Briefing + design', desc: 'Direção visual, wireframes e protótipo aprovados.' },
    { range: 'Semana 2–4', title: 'Construção',         desc: 'Páginas, conteúdo, integrações e testes.' },
    { range: 'Semana 5',   title: 'Go-live',            desc: 'Revisão final, lançamento e ajustes pós-go-live.' },
  ];
}

function reportTitle(sel: Record<string, string | string[]>): string {
  const type = (sel.type as string) ?? 'institucional';
  if (type === 'landing')     return 'Sua landing de conversão';
  if (type === 'blog')        return 'Seu site com blog';
  if (type === 'multilingue') return 'Seu site multilíngue';
  return 'Seu site institucional';
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
  inclusions,
  timeline,
  reportTitle,
};
