import type { QualificationSchema } from '@/components/ui/qualification-form';

// Agentes & Automação não tem preço fixo: depende demais do que o cliente quer.
// Por isso usa o formulário de QUALIFICAÇÃO (necessidade → contato → prazo),
// igual ao "Sistemas com IA". Strings em PT literal (não passam por tradução,
// mesmo padrão dos schemas de preço).
export const agentesQualificationSchema: QualificationSchema = {
  serviceTag: 'agentes-automacao',
  successTitle: 'Recebemos seu pedido.',
  needs: {
    title: 'O que você quer automatizar?',
    subtitle: 'Marque tudo que faz sentido. A partir disso a gente desenha a solução certa pro seu caso.',
    options: [
      { id: 'atendimento', label: 'Atender automático nos canais (WhatsApp, Instagram)' },
      { id: 'qualificacao', label: 'Qualificar e distribuir leads' },
      { id: 'cobranca',     label: 'Cobrança e follow-up automático' },
      { id: 'processo',     label: 'Automatizar processo interno repetitivo' },
      { id: 'nao_sei',      label: 'Ainda não sei, quero uma ideia' },
    ],
  },
  context: {
    timings: [
      { id: 'urgente', label: 'Sim, tenho urgência' },
      { id: 'prazo',   label: 'Tenho um prazo em mente' },
      { id: 'normal',  label: 'Não, sem pressa' },
    ],
  },
};
