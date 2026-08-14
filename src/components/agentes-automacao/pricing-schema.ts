import type { InclusionGroup, PricingSchema, TimelinePhase } from '@/components/ui/pricing-form';

// Este schema não desenha mais formulário nenhum: desde 13/07/2026 a página de Agentes
// usa o formulário de qualificação. Ele sobrevive porque a /api/lead ainda tira daqui a
// lista de "já vem incluso" e o título do e-mail do lead. A tabela de preço que existia
// aqui (base por escopo, por canal, por integração e multiplicador de urgência) saiu
// junto com o preço dos outros formulários.

const CHANNEL_LABEL: Record<string, string> = {
  whatsapp:  'WhatsApp',
  email:     'E-mail',
  instagram: 'Instagram DM',
  site:      'Chat no site',
  interno:   'Sistema interno',
};

const INTEG_LABEL: Record<string, string> = {
  crm:      'CRM (HubSpot, Pipedrive, RD…)',
  planilha: 'Google Sheets / Excel',
  erp:      'ERP / Financeiro',
  notion:   'Notion / Airtable',
  calendar: 'Google Calendar',
  custom:   'Outro sistema sob medida',
};

function inclusions(sel: Record<string, string | string[]>): InclusionGroup[] {
  const scope = (sel.scope as string) ?? 'intermed';
  const channels = (sel.channels as string[]) ?? [];
  const integrations = (sel.integrations as string[]) ?? [];

  const principal: string[] = [];
  if (scope === 'simples')  principal.push('1 fluxo automatizado direto, sem IA');
  if (scope === 'intermed') principal.push('2 a 3 fluxos automatizados com IA leve (classificação e resposta automática)');
  if (scope === 'avancado') principal.push('Agente de IA com lógica condicional e múltiplas integrações');
  principal.push('Handoff pra humano com contexto da conversa quando o agente não tiver confiança');
  principal.push('Documentação dos fluxos e treinamento do seu time');

  const groups: InclusionGroup[] = [
    { title: 'Escopo principal', items: principal },
  ];

  if (channels.length > 0) {
    groups.push({
      title: `Canais (${channels.length})`,
      items: channels.map((id) => CHANNEL_LABEL[id] ?? id),
    });
  }

  if (integrations.length > 0) {
    groups.push({
      title: `Integrações (${integrations.length})`,
      items: integrations.map((id) => INTEG_LABEL[id] ?? id),
    });
  }

  groups.push({
    title: 'Pós go-live',
    items: ['Monitoramento da primeira semana', 'Ajustes finos depois de ver o agente operando real'],
  });

  return groups;
}

function timeline(sel: Record<string, string | string[]>): TimelinePhase[] {
  const urgency = (sel.urgency as string) ?? 'normal';
  if (urgency === 'urgente') {
    return [
      { range: 'Dia 1–2', title: 'Mapeamento', desc: 'Diagrama do fluxo atual e do alvo.' },
      { range: 'Dia 3–6', title: 'Construção', desc: 'Integrações, prompts e gatilhos.' },
      { range: 'Dia 7',   title: 'Go-live',    desc: 'Subida em produção monitorada.' },
    ];
  }
  if (urgency === 'rapido') {
    return [
      { range: 'Semana 1',   title: 'Mapeamento', desc: 'Fluxo atual, decisões e ferramentas.' },
      { range: 'Semana 1–2', title: 'Construção', desc: 'Desenho do agente, integrações e testes.' },
      { range: 'Semana 2',   title: 'Go-live',    desc: 'Entrega + acompanhamento da primeira semana.' },
    ];
  }
  return [
    { range: 'Semana 1',   title: 'Mapeamento', desc: 'Fluxo atual, integrações e onde o humano entra.' },
    { range: 'Semana 1–2', title: 'Construção', desc: 'Desenho do agente, integrações e testes em homologação.' },
    { range: 'Semana 3',   title: 'Go-live',    desc: 'Produção + monitoramento da primeira semana + handoff.' },
  ];
}

function reportTitle(sel: Record<string, string | string[]>): string {
  const scope = (sel.scope as string) ?? 'intermed';
  if (scope === 'simples')  return 'Sua automação direta';
  if (scope === 'avancado') return 'Seu agente de IA';
  return 'Sua automação inteligente';
}

export const agentesPricingSchema: PricingSchema = {
  serviceTag: 'agentes-automacao',
  copy: {
    eyebrow: 'Sua automação',
    revealTitle: 'É isso que você precisa?',
    revealSubtitle:
      'Confira o que anotamos. A gente volta com a proposta conforme o escopo.',
    submitLabel: 'Enviar para a Notkode',
    successTitle: 'Recebemos seu pedido.',
    successBody:
      'Em algumas horas a gente volta no WhatsApp e no e-mail com escopo, prazo e valor.',
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
        { value: 'custom',  label: 'Outro sistema sob medida' },
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
  inclusions,
  timeline,
  reportTitle,
};
