import type { InclusionGroup, PricingSchema } from '@/components/ui/pricing-form';

// Modo "a partir de": só o PISO por tipo (min = max = piso).
// Dois níveis: E-commerce (loja pronta pra vender) e E-commerce + sistema próprio
// (CRM/cadastro de produto/operação sua). Catálogo, integrações e prazo servem
// só pra qualificar o lead — não mexem no valor.
const TYPE_FLOOR: Record<string, number> = {
  ecommerce: 6000,
  sistema:   10000,
};

function calc(sel: Record<string, string | string[]>): [number, number] {
  const type = (sel.type as string) ?? 'ecommerce';
  const floor = TYPE_FLOOR[type] ?? TYPE_FLOOR.ecommerce;
  return [floor, floor];
}

const TYPE_LABEL: Record<string, string> = {
  ecommerce: 'E-commerce',
  sistema:   'E-commerce + sistema próprio',
};

const CATALOG_LABEL: Record<string, string> = {
  pequeno: 'Catálogo compacto (até 50 SKUs)',
  medio:   'Catálogo médio (50–500 SKUs)',
  grande:  'Catálogo grande (500+ SKUs)',
};

const INTEG_LABEL: Record<string, string> = {
  pagamento:   'Gateway de pagamento',
  frete:       'Cálculo de frete',
  erp:         'ERP / emissão fiscal',
  rastreamento:'Rastreamento (Pixel, GA4)',
  email:       'E-mail marketing (Mailchimp, RD)',
  whatsapp:    'WhatsApp (carrinho / atendimento)',
  agente_ia:   'Agente de IA',
  trafego:     'Tráfego pago (Meta/Google)',
};

function inclusions(sel: Record<string, string | string[]>): InclusionGroup[] {
  const type = (sel.type as string) ?? 'ecommerce';
  const catalog = (sel.catalog as string) ?? 'medio';
  const integrations = (sel.integrations as string[]) ?? [];

  const principal: string[] = [];
  if (type === 'sistema') {
    principal.push('Loja + sistema próprio (checkout, CRM, cadastro de produto e gestão de pedidos)');
  } else {
    principal.push('Loja virtual sob medida, com checkout próprio e integrações');
  }
  principal.push(CATALOG_LABEL[catalog] ?? catalog);
  principal.push('Painel admin destravado pra equipe interna');
  principal.push('Acompanhamento de 30 dias após go-live');

  const groups: InclusionGroup[] = [
    { title: 'Escopo principal', items: principal },
  ];

  if (integrations.length > 0) {
    groups.push({
      title: 'Integrações',
      items: integrations.map((id) => INTEG_LABEL[id] ?? id),
    });
  }

  return groups;
}

function reportTitle(sel: Record<string, string | string[]>): string {
  const type = (sel.type as string) ?? 'ecommerce';
  return type === 'sistema' ? 'Sua loja com sistema próprio' : 'Sua loja virtual';
}

export const ecommercePricingSchema: PricingSchema = {
  serviceTag: 'ecommerce',
  priceMode: 'from',
  copy: {
    eyebrow: 'Orçamento de E-commerce',
    revealTitle: 'Investimento',
    revealSubtitle:
      'Piso pra esse tipo de loja. Validamos juntos numa conversa rápida antes de fechar o valor exato.',
    submitLabel: 'Receber proposta',
  },
  fields: [
    {
      id: 'type',
      type: 'single',
      label: 'Qual o cenário?',
      hint: 'Selecione o que melhor descreve seu projeto.',
      default: 'ecommerce',
      options: [
        { value: 'ecommerce', label: 'E-commerce',                   hint: 'Loja pronta pra vender, com checkout próprio e integrações' },
        { value: 'sistema',   label: 'E-commerce + sistema próprio', hint: 'CRM, cadastro de produto e operação 100% sua' },
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
      id: 'integrations',
      type: 'multi',
      label: 'Quais integrações você precisa?',
      hint: 'Marque tudo que precisa conectar à loja.',
      default: ['pagamento', 'frete'],
      min: 0,
      options: [
        { value: 'pagamento',    label: 'Gateway de pagamento (Pagar.me, Stripe…)' },
        { value: 'frete',        label: 'Cálculo de frete (Correios, Melhor Envio…)' },
        { value: 'erp',          label: 'ERP / emissão fiscal (NF-e)' },
        { value: 'rastreamento', label: 'Rastreamento (Pixel, GA4)' },
        { value: 'email',        label: 'E-mail marketing (Mailchimp, RD)' },
        { value: 'whatsapp',     label: 'WhatsApp (carrinho / atendimento)' },
        { value: 'agente_ia',    label: 'Agente de IA' },
        { value: 'trafego',      label: 'Tráfego pago (Meta/Google)' },
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
