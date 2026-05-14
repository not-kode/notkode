import type { PricingSchema } from '@/components/ui/pricing-form';

const TYPE_BASE: Record<string, [number, number]> = {
  novo:        [6000, 14000],
  migracao:    [5000, 11000],
  otimizacao:  [3500, 7500],
};

const CATALOG_MULT: Record<string, number> = {
  pequeno: 1.0,    // até 50 SKUs
  medio:   1.25,   // 50–500 SKUs
  grande:  1.6,    // 500+ SKUs
};

const PER_INTEGRATION = 900;

const URGENCY_MULT: Record<string, number> = {
  normal:   1.0,
  rapido:   1.2,
  urgente:  1.45,
};

function calc(sel: Record<string, string | string[]>): [number, number] {
  const type = (sel.type as string) ?? 'novo';
  const catalog = (sel.catalog as string) ?? 'pequeno';
  const integrations = (sel.integrations as string[]) ?? [];
  const urgency = (sel.urgency as string) ?? 'normal';

  const [baseMin, baseMax] = TYPE_BASE[type] ?? TYPE_BASE.novo;
  const catMult = CATALOG_MULT[catalog] ?? 1;
  const integCost = integrations.length * PER_INTEGRATION;
  const mult = URGENCY_MULT[urgency] ?? 1;

  const min = Math.round((baseMin * catMult + integCost) * mult);
  const max = Math.round((baseMax * catMult + integCost * 1.4) * mult);
  return [min, max];
}

export const ecommercePricingSchema: PricingSchema = {
  serviceTag: 'ecommerce',
  copy: {
    eyebrow: 'Orçamento de E-commerce',
    revealTitle: 'Investimento estimado',
    revealSubtitle:
      'Faixa preliminar com base nas suas escolhas. Para receber a proposta detalhada com plataforma sugerida e cronograma, deixe seu contato.',
    submitLabel: 'Receber proposta',
  },
  fields: [
    {
      id: 'type',
      type: 'single',
      label: 'Qual o cenário?',
      hint: 'Selecione o que melhor descreve seu projeto.',
      default: 'novo',
      options: [
        { value: 'novo',       label: 'Loja nova do zero',       hint: 'Não tem loja virtual ainda' },
        { value: 'migracao',   label: 'Migração de plataforma',  hint: 'Já tem loja, quer trocar' },
        { value: 'otimizacao', label: 'Otimização de conversão', hint: 'Loja existe mas converte pouco' },
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
};
