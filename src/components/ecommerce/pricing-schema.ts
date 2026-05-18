import type { BreakdownItem, InclusionGroup, PricingSchema, TimelinePhase } from '@/components/ui/pricing-form';

const fmtBRL = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);
const fmtRange = (a: number, b: number) => `${fmtBRL(a)} – ${fmtBRL(b)}`;

const TYPE_BASE: Record<string, [number, number]> = {
  integracoes:     [6000, 14000],   // loja com integrações (Shopify/Woo/custom)
  migracao:        [5000, 11000],   // migrar plataforma
  sistema_proprio: [18000, 38000],  // loja + sistema próprio (checkout, CRM)
};

const CATALOG_MULT: Record<string, number> = {
  pequeno: 1.0,    // até 50 SKUs
  medio:   1.25,   // 50–500 SKUs
  grande:  1.6,    // 500+ SKUs
};

const DESIGN_ADD: Record<string, [number, number]> = {
  template:    [0, 0],
  custom:      [3500, 7000],
  brandbook:   [0, 1500],
};

const CONTENT_ADD: Record<string, [number, number]> = {
  cliente:  [0, 0],
  notkode:  [2500, 6000],
  parcial:  [1200, 3000],
};

const PER_INTEGRATION = 900;

const URGENCY_MULT: Record<string, number> = {
  normal:   1.0,
  rapido:   1.2,
  urgente:  1.45,
};

function calc(sel: Record<string, string | string[]>): [number, number] {
  const type = (sel.type as string) ?? 'integracoes';
  const catalog = (sel.catalog as string) ?? 'medio';
  const integrations = (sel.integrations as string[]) ?? [];
  const design = (sel.design as string) ?? 'template';
  const content = (sel.content as string) ?? 'cliente';
  const urgency = (sel.urgency as string) ?? 'normal';

  const [baseMin, baseMax] = TYPE_BASE[type] ?? TYPE_BASE.integracoes;
  const catMult = CATALOG_MULT[catalog] ?? 1;
  const [dMin, dMax] = DESIGN_ADD[design] ?? [0, 0];
  const [cMin, cMax] = CONTENT_ADD[content] ?? [0, 0];
  const integCost = integrations.length * PER_INTEGRATION;
  const mult = URGENCY_MULT[urgency] ?? 1;

  const min = Math.round((baseMin * catMult + integCost + dMin + cMin) * mult);
  const max = Math.round((baseMax * catMult + integCost * 1.4 + dMax + cMax) * mult);
  return [min, max];
}

function breakdown(sel: Record<string, string | string[]>): BreakdownItem[] {
  const type = (sel.type as string) ?? 'integracoes';
  const catalog = (sel.catalog as string) ?? 'medio';
  const integrations = (sel.integrations as string[]) ?? [];
  const design = (sel.design as string) ?? 'template';
  const content = (sel.content as string) ?? 'cliente';
  const urgency = (sel.urgency as string) ?? 'normal';

  const TYPE_LABEL: Record<string, string> = {
    integracoes: 'Loja com integrações',
    migracao: 'Migração de plataforma',
    sistema_proprio: 'Loja + sistema próprio',
  };
  const CATALOG_LABEL: Record<string, string> = {
    pequeno: 'Catálogo compacto',
    medio: 'Catálogo médio',
    grande: 'Catálogo grande',
  };
  const DESIGN_LABEL: Record<string, string> = {
    template: 'Template adaptado',
    brandbook: 'Brandbook já existente',
    custom: 'Identidade do zero',
  };
  const CONTENT_LABEL: Record<string, string> = {
    cliente: 'Você fornece fotos e textos',
    parcial: 'Conteúdo parcial',
    notkode: 'Notkode produz conteúdo',
  };
  const URGENCY_LABEL: Record<string, string> = {
    normal: 'Prazo normal',
    rapido: 'Prazo rápido',
    urgente: 'Prazo urgente',
  };

  const items: BreakdownItem[] = [];

  const [bMin, bMax] = TYPE_BASE[type] ?? TYPE_BASE.integracoes;
  items.push({ label: TYPE_LABEL[type] ?? type, impact: `base ${fmtRange(bMin, bMax)}` });

  const catMult = CATALOG_MULT[catalog] ?? 1;
  items.push({
    label: CATALOG_LABEL[catalog] ?? catalog,
    impact: catMult === 1 ? '× 1.0 (sem mudança)' : `× ${catMult.toFixed(2)}`,
    muted: catMult === 1,
  });

  if (integrations.length > 0) {
    items.push({
      label: `${integrations.length} integraç${integrations.length === 1 ? 'ão' : 'ões'}`,
      impact: `+ ${fmtBRL(integrations.length * PER_INTEGRATION)}`,
    });
  } else {
    items.push({ label: 'Sem integrações marcadas', impact: '—', muted: true });
  }

  const [dMin, dMax] = DESIGN_ADD[design] ?? [0, 0];
  items.push({
    label: DESIGN_LABEL[design] ?? design,
    impact: dMin === 0 && dMax === 0 ? 'sem custo extra' : `+ ${fmtRange(dMin, dMax)}`,
    muted: dMin === 0 && dMax === 0,
  });

  const [cMin, cMax] = CONTENT_ADD[content] ?? [0, 0];
  items.push({
    label: CONTENT_LABEL[content] ?? content,
    impact: cMin === 0 && cMax === 0 ? 'sem custo extra' : `+ ${fmtRange(cMin, cMax)}`,
    muted: cMin === 0 && cMax === 0,
  });

  const uMult = URGENCY_MULT[urgency] ?? 1;
  items.push({
    label: URGENCY_LABEL[urgency] ?? urgency,
    impact: uMult === 1 ? '× 1.0 (sem mudança)' : `× ${uMult.toFixed(2)}`,
    muted: uMult === 1,
  });

  return items;
}

const INTEG_LABEL: Record<string, string> = {
  pagamento: 'Gateway de pagamento',
  frete:     'Cálculo de frete',
  fiscal:    'Emissão fiscal',
  marketing: 'Pixels & e-mail marketing',
  erp:       'ERP / sistema interno',
  whatsapp:  'WhatsApp p/ carrinho',
};

function inclusions(sel: Record<string, string | string[]>): InclusionGroup[] {
  const type = (sel.type as string) ?? 'integracoes';
  const catalog = (sel.catalog as string) ?? 'medio';
  const integrations = (sel.integrations as string[]) ?? [];
  const design = (sel.design as string) ?? 'template';
  const content = (sel.content as string) ?? 'cliente';

  const principal: string[] = [];
  if (type === 'integracoes')     principal.push('Loja virtual sob medida com plataforma escolhida em conjunto');
  if (type === 'migracao')        principal.push('Migração completa da loja atual sem perder SEO');
  if (type === 'sistema_proprio') principal.push('Loja + sistema próprio (checkout, CRM, gestão de pedidos)');

  principal.push(
    catalog === 'pequeno' ? 'Catálogo compacto (até 50 SKUs)' :
    catalog === 'medio'   ? 'Catálogo médio (50–500 SKUs)' :
                            'Catálogo grande (500+ SKUs)'
  );

  principal.push(
    design === 'template'  ? 'Visual adaptado a partir de template' :
    design === 'brandbook' ? 'Aplicação do seu brandbook existente' :
                             'Identidade visual criada do zero'
  );

  const conteudo: string[] = [];
  conteudo.push(
    content === 'cliente'  ? 'Você fornece fotos e textos prontos' :
    content === 'parcial'  ? 'Conteúdo parcialmente produzido pela Notkode' :
                             'Produção de fotos e textos pela Notkode'
  );
  conteudo.push('Painel admin destravado pra equipe interna');
  conteudo.push('Acompanhamento de 30 dias após go-live');

  const groups: InclusionGroup[] = [
    { title: 'Escopo principal', items: principal },
    { title: 'Conteúdo & pós-lançamento', items: conteudo },
  ];

  if (integrations.length > 0) {
    groups.push({
      title: `Integrações (${integrations.length})`,
      items: integrations.map((id) => INTEG_LABEL[id] ?? id),
    });
  }

  return groups;
}

function timeline(sel: Record<string, string | string[]>): TimelinePhase[] {
  const urgency = (sel.urgency as string) ?? 'normal';
  if (urgency === 'urgente') {
    return [
      { range: 'Semana 1',   title: 'Diagnóstico',  desc: 'Catálogo, integrações e identidade definidos.' },
      { range: 'Semana 2–3', title: 'Construção',   desc: 'Loja, pagamento, frete e fiscal em paralelo.' },
      { range: 'Semana 4',   title: 'Go-live',      desc: 'Lançamento e ajustes finos.' },
    ];
  }
  if (urgency === 'rapido') {
    return [
      { range: 'Semana 1–2', title: 'Diagnóstico',  desc: 'Plano de plataforma e integrações.' },
      { range: 'Semana 3–4', title: 'Construção',   desc: 'Loja, design e integrações.' },
      { range: 'Semana 5–6', title: 'Go-live',      desc: 'Lançamento + 30 dias acompanhados.' },
    ];
  }
  return [
    { range: 'Semana 1–2', title: 'Diagnóstico',  desc: 'Catálogo, gateway, fiscal, frete, ERP mapeados.' },
    { range: 'Semana 3–6', title: 'Construção',   desc: 'Design, integrações e testes de checkout.' },
    { range: 'Semana 7–10', title: 'Go-live',     desc: 'Lançamento + 30 dias de acompanhamento.' },
  ];
}

function reportTitle(sel: Record<string, string | string[]>): string {
  const type = (sel.type as string) ?? 'integracoes';
  if (type === 'sistema_proprio') return 'Sua loja com sistema próprio';
  if (type === 'migracao')        return 'Sua migração de plataforma';
  return 'Sua loja sob medida';
}

export const ecommercePricingSchema: PricingSchema = {
  serviceTag: 'ecommerce',
  copy: {
    eyebrow: 'Orçamento de E-commerce',
    revealTitle: 'Investimento estimado',
    revealSubtitle:
      'Faixa preliminar baseada nas suas escolhas. Vamos validar juntos numa conversa rápida antes de fechar o valor exato.',
    submitLabel: 'Receber proposta',
  },
  fields: [
    {
      id: 'type',
      type: 'single',
      label: 'Qual o cenário?',
      hint: 'Selecione o que melhor descreve seu projeto.',
      default: 'integracoes',
      options: [
        { value: 'integracoes',     label: 'Loja com integrações',        hint: 'Shopify/Woo/custom com pagamento, frete e marketing já configurados' },
        { value: 'migracao',        label: 'Migração de plataforma',      hint: 'Já tem loja, quer trocar de plataforma' },
        { value: 'sistema_proprio', label: 'Loja + sistema próprio',      hint: 'Checkout próprio, CRM e operação 100% sua' },
      ],
    },
    {
      id: 'catalog',
      type: 'single',
      label: 'Qual o tamanho do catálogo?',
      hint: 'Quantos produtos diferentes (SKUs) você vende.',
      default: 'medio',
      options: [
        { value: 'pequeno', label: 'Compacto', hint: 'até 50 SKUs' },
        { value: 'medio',   label: 'Médio',    hint: '50–500 SKUs' },
        { value: 'grande',  label: 'Grande',   hint: '500+ SKUs' },
      ],
    },
    {
      id: 'design',
      type: 'single',
      label: 'Como fica o visual da loja?',
      hint: 'Define quanto da identidade visual a gente cria do zero.',
      default: 'template',
      options: [
        { value: 'template',  label: 'Template adaptado',          hint: 'Partimos de uma base e adaptamos à sua marca' },
        { value: 'brandbook', label: 'Já tenho brandbook',         hint: 'Vocês têm identidade pronta, a gente aplica' },
        { value: 'custom',    label: 'Identidade do zero',         hint: 'Criamos o visual junto com a loja' },
      ],
    },
    {
      id: 'content',
      type: 'single',
      label: 'Quem entra com fotos e textos?',
      hint: 'Conteúdo de produto, descrições e fotos da loja.',
      default: 'cliente',
      options: [
        { value: 'cliente', label: 'Eu forneço tudo',     hint: 'Já tenho fotos e textos prontos' },
        { value: 'parcial', label: 'Parte sim, parte não', hint: 'A gente complementa o que faltar' },
        { value: 'notkode', label: 'Vocês produzem',       hint: 'Direção de arte, fotos e textos com a Notkode' },
      ],
    },
    {
      id: 'integrations',
      type: 'multi',
      label: 'Quais integrações você precisa?',
      hint: 'Marque tudo que precisa conectar à loja.',
      default: ['pagamento', 'frete'],
      min: 0,
      options: [
        { value: 'pagamento', label: 'Gateway de pagamento (Pagar.me, Stripe…)' },
        { value: 'frete',     label: 'Cálculo de frete (Correios, Melhor Envio…)' },
        { value: 'fiscal',    label: 'Emissão fiscal (NF-e, eNotas…)' },
        { value: 'marketing', label: 'Pixels & GA4 + Mailchimp/RD' },
        { value: 'erp',       label: 'ERP / sistema interno' },
        { value: 'whatsapp',  label: 'WhatsApp para recuperação de carrinho' },
      ],
    },
    {
      id: 'urgency',
      type: 'single',
      label: 'Qual o prazo?',
      default: 'normal',
      options: [
        { value: 'normal',  label: 'Normal',  hint: '6–10 semanas' },
        { value: 'rapido',  label: 'Rápido',  hint: '4–6 semanas' },
        { value: 'urgente', label: 'Urgente', hint: 'até 4 semanas' },
      ],
    },
  ],
  calc,
  breakdown,
  inclusions,
  timeline,
  reportTitle,
};
