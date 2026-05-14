import type { QualificationSchema } from '@/components/ui/qualification-form';

export const sistemasQualificationSchema: QualificationSchema = {
  serviceTag: 'sistemas-ia',
  whatsappMessage:
    'Acabei de preencher o formulário de Sistemas com IA no site, quero acelerar.',
  successTitle: 'Recebemos seu pedido.',
  needs: {
    title: 'O que você precisa resolver?',
    subtitle: 'Pode marcar mais de uma. Marca a última se ainda não sabe direito.',
    options: [
      { id: 'centralizar',  label: 'Centralizar várias ferramentas num só sistema' },
      { id: 'crm',          label: 'CRM / Vendas sob medida' },
      { id: 'atendimento',  label: 'Atendimento com IA integrado' },
      { id: 'operacao',     label: 'Operação / Pedidos / Logística' },
      { id: 'relatorios',   label: 'Relatórios e BI internos' },
      { id: 'nao_sei',      label: 'Ainda não sei direito' },
    ],
  },
  identity: {
    title: 'Quem é você?',
    subtitle: 'Só o essencial pra a gente entrar em contato.',
  },
  context: {
    title: 'Contexto do projeto.',
    subtitle: 'Quanto mais detalhes, melhor preparamos a conversa.',
    timings: [
      { id: 'imediato', label: 'Quero começar agora' },
      { id: '30dias',   label: 'Em até 30 dias' },
      { id: '60dias',   label: 'Em 60+ dias' },
      { id: 'pesquisa', label: 'Apenas pesquisando' },
    ],
  },
};
