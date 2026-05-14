'use client';

import { QualificationForm, type QualificationSchema } from '@/components/ui/qualification-form';

const schema: QualificationSchema = {
  serviceTag: 'parcerias',
  whatsappMessage: 'Sou de agência, preenchi o form do site e quero conversar sobre parceria.',
  successTitle: 'Recebemos seu pedido.',
  successBody: 'Em até 24 horas alguém do nosso time entra em contato pelo e-mail e WhatsApp para alinhar como podemos ser braço técnico da sua agência.',
  needs: {
    title: 'Como você quer expandir o portfólio?',
    subtitle: 'Pode marcar mais de uma. Marca a última se ainda não sabe direito.',
    options: [
      { id: 'sites',          label: 'Sites e Landing Pages para meus clientes' },
      { id: 'ecommerce',      label: 'E-commerce para meus clientes' },
      { id: 'sistemas',       label: 'Sistemas internos com IA' },
      { id: 'agentes',        label: 'Agentes & Automação no WhatsApp' },
      { id: 'identidade',     label: 'Identidade visual / Brandbook' },
      { id: 'nao_sei',        label: 'Ainda não sei direito' },
    ],
  },
  identity: {
    title: 'Sobre a sua agência.',
    subtitle: 'Só o essencial pra a gente entender o contexto.',
    companySizes: ['Solo / 1–3 pessoas', '4–10 pessoas', '11–30 pessoas', '30+ pessoas'],
  },
  context: {
    title: 'Quando você quer começar?',
    subtitle: 'Indica se já tem demanda na fila ou se é exploração inicial.',
    timings: [
      { id: 'tenho_demanda',  label: 'Já tenho cliente esperando' },
      { id: '30dias',          label: 'Em até 30 dias' },
      { id: 'futuro',          label: 'Para projetos futuros' },
      { id: 'pesquisa',        label: 'Apenas pesquisando' },
    ],
  },
};

export function ParceriasQualificationForm() {
  return <QualificationForm schema={schema} />;
}
