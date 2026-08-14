import type { InclusionGroup, PricingSchema } from '@/components/ui/pricing-form';
import { OPCAO_NENHUMA } from '@/lib/pricing-multi';

// Sem preço no formulário: as perguntas servem só para qualificar o lead. Valor sai na
// conversa, com o escopo na mão, nunca de uma tabela que o site calcula sozinho.

function inclusions(): InclusionGroup[] {
  // "O que já vem incluso" — só o que é SEMPRE verdadeiro num site da Notkode.
  // (Camila vai confirmar/ajustar essa lista.)
  const incluso: string[] = [
    'Design responsivo (celular, tablet, computador)',
    'Hospedagem configurada',
    'Domínio próprio apontado',
    'SSL/HTTPS (cadeado de segurança)',
    'Performance otimizada',
  ];

  const groups: InclusionGroup[] = [
    { title: 'Já vem incluso', items: incluso },
  ];

  return groups;
}

function reportTitle(sel: Record<string, string | string[]>): string {
  const type = (sel.type as string) ?? 'site';
  return type === 'landing' ? 'Sua landing de conversão' : 'Seu site';
}

export const sitesPricingSchema: PricingSchema = {
  serviceTag: 'sites',
  copy: {
    eyebrow: 'Seu site',
    revealTitle: 'É isso que você precisa?',
    revealSubtitle:
      'Confira o que anotamos. A gente volta com a proposta e o valor conforme o escopo, numa conversa rápida.',
    submitLabel: 'Enviar para a Notkode',
  },
  fields: [
    {
      id: 'type',
      type: 'single',
      label: 'Landing Page ou Site?',
      hint: 'São coisas diferentes: landing é uma página focada em conversão; site é a presença completa da empresa.',
      default: 'site',
      options: [
        { value: 'landing', label: 'Landing Page', hint: '1 página focada em converter' },
        { value: 'site',    label: 'Site',         hint: 'Presença completa da empresa' },
      ],
    },
    {
      id: 'size',
      type: 'single',
      label: 'Qual o tamanho?',
      hint: 'Número estimado de páginas (vale mais pra site; landing é 1 página).',
      default: 'medio',
      options: [
        { value: 'pequeno', label: 'Compacto', hint: 'até 3 páginas' },
        { value: 'medio',   label: 'Médio',    hint: '4–7 páginas' },
        { value: 'grande',  label: 'Grande',   hint: '8–15 páginas' },
      ],
    },
    {
      id: 'needs',
      type: 'multi',
      label: 'O que o site precisa ter?',
      hint: 'Marque o que faz sentido pro seu objetivo.',
      default: [],
      min: 1,
      options: [
        { value: 'contato', label: 'Gerar contato com a lead' },
        { value: 'blog',    label: 'Blog / conteúdo' },
        { value: 'crm',     label: 'Integração com CRM' },
        { value: 'trafego', label: 'Tráfego pra trazer visitantes' },
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
