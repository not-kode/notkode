import type { InclusionGroup, PricingSchema } from '@/components/ui/pricing-form';
import { escolhasReais, OPCAO_NENHUMA } from '@/lib/pricing-multi';

// Sem preço no formulário: cenário, catálogo e integrações servem só para qualificar o
// lead. O valor sai na conversa, depois de entender a operação.

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
  // "Nenhuma dessas" é resposta, não integração: fora da lista de escopo.
  const integrations = escolhasReais(sel.integrations);

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
  copy: {
    eyebrow: 'Sua loja',
    revealTitle: 'É isso que você precisa?',
    revealSubtitle:
      'Confira o que anotamos. A gente volta com a proposta e o valor depois de entender sua operação.',
    submitLabel: 'Enviar para a Notkode',
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
      min: 1,
      options: [
        { value: 'pagamento',    label: 'Gateway de pagamento (Pagar.me, Stripe…)' },
        { value: 'frete',        label: 'Cálculo de frete (Correios, Melhor Envio…)' },
        { value: 'erp',          label: 'ERP / emissão fiscal (NF-e)' },
        { value: 'rastreamento', label: 'Rastreamento (Pixel, GA4)' },
        { value: 'email',        label: 'E-mail marketing (Mailchimp, RD)' },
        { value: 'whatsapp',     label: 'WhatsApp (carrinho / atendimento)' },
        { value: 'agente_ia',    label: 'Agente de IA' },
        { value: 'trafego',      label: 'Tráfego pago (Meta/Google)' },
        OPCAO_NENHUMA,
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
  inclusions,
  reportTitle,
};
