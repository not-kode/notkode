import type { PricingSchema } from '@/components/ui/pricing-form';

// Faixas preliminares — ajustar com base no histórico real de propostas.
// Estrutura: base + adicional por canal + adicional por integração + multiplicador por urgência.

const SCOPE_BASE: Record<string, [number, number]> = {
  simples:    [1500, 3000],   // 1 fluxo direto, sem IA
  intermed:   [3500, 7000],   // 2–3 fluxos com IA leve (resposta automática, classificação)
  avancado:   [8000, 18000],  // agente com IA + várias integrações + lógica condicional
};

const PER_CHANNEL = 600;       // por canal adicional além do primeiro
const PER_INTEGRATION = 900;   // por integração adicional além da primeira

const URGENCY_MULT: Record<string, number> = {
  normal:   1.0,   // 2–3 semanas
  rapido:   1.2,   // 1–2 semanas
  urgente:  1.45,  // < 1 semana
};

function calc(sel: Record<string, string | string[]>): [number, number] {
  const scope = (sel.scope as string) ?? 'intermed';
  const channels = (sel.channels as string[]) ?? [];
  const integrations = (sel.integrations as string[]) ?? [];
  const urgency = (sel.urgency as string) ?? 'normal';

  const [baseMin, baseMax] = SCOPE_BASE[scope] ?? SCOPE_BASE.intermed;
  const extraChannels = Math.max(0, channels.length - 1) * PER_CHANNEL;
  const extraIntegrations = Math.max(0, integrations.length - 1) * PER_INTEGRATION;
  const mult = URGENCY_MULT[urgency] ?? 1;

  const min = Math.round((baseMin + extraChannels + extraIntegrations) * mult);
  const max = Math.round((baseMax + extraChannels * 1.4 + extraIntegrations * 1.4) * mult);
  return [min, max];
}

export const agentesPricingSchema: PricingSchema = {
  serviceTag: 'agentes-automacao',
  copy: {
    eyebrow: 'Orçamento de Automação',
    revealTitle: 'Investimento estimado',
    revealSubtitle:
      'Faixa preliminar baseada nas suas escolhas. Deixe seu contato para receber a proposta detalhada — sem call obrigatória.',
    submitLabel: 'Receber proposta',
    successTitle: 'Recebemos seu pedido.',
    successBody:
      'Em algumas horas você recebe a proposta detalhada no WhatsApp e e-mail, com escopo, prazo e investimento final.',
  },
  fields: [
    {
      id: 'scope',
      type: 'single',
      label: 'Qual o tamanho do escopo?',
      hint: 'Escolha o que melhor descreve o que você precisa automatizar.',
      default: 'intermed',
      options: [
        { value: 'simples',  label: 'Automação simples',  hint: '1 fluxo direto, sem IA' },
        { value: 'intermed', label: 'Intermediário',      hint: '2–3 fluxos com IA leve' },
        { value: 'avancado', label: 'Avançado',           hint: 'Agente de IA + várias integrações' },
      ],
    },
    {
      id: 'channels',
      type: 'multi',
      label: 'Onde o agente vai operar?',
      hint: 'Marque todos os canais que precisam funcionar.',
      default: ['whatsapp'],
      options: [
        { value: 'whatsapp', label: 'WhatsApp' },
        { value: 'email',    label: 'E-mail' },
        { value: 'instagram',label: 'Instagram DM' },
        { value: 'site',     label: 'Chat no site' },
        { value: 'interno',  label: 'Sistema interno' },
      ],
    },
    {
      id: 'integrations',
      type: 'multi',
      label: 'Quais sistemas precisa integrar?',
      hint: 'Onde o agente precisa ler/escrever dado.',
      default: [],
      options: [
        { value: 'crm',     label: 'CRM (HubSpot, Pipedrive, RD...)' },
        { value: 'planilha',label: 'Google Sheets / Excel' },
        { value: 'erp',     label: 'ERP / Financeiro' },
        { value: 'notion',  label: 'Notion / Airtable' },
        { value: 'calendar',label: 'Google Calendar' },
        { value: 'custom',  label: 'API custom' },
      ],
    },
    {
      id: 'urgency',
      type: 'single',
      label: 'Qual o prazo?',
      default: 'normal',
      options: [
        { value: 'normal',  label: 'Normal',  hint: '2–3 semanas' },
        { value: 'rapido',  label: 'Rápido',  hint: '1–2 semanas' },
        { value: 'urgente', label: 'Urgente', hint: 'até 1 semana' },
      ],
    },
  ],
  calc,
};
