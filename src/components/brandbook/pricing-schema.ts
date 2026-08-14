import type { InclusionGroup, PricingSchema } from '@/components/ui/pricing-form';
import { escolhasReais, OPCAO_NENHUMA } from '@/lib/pricing-multi';

// Sem preço no formulário: escopo, estágio e aplicações servem só para qualificar o
// lead. Aqui havia uma tabela que somava por aplicação marcada e multiplicava por
// urgência, e era o último formulário do site que ainda calculava faixa na tela.

const APP_LABEL: Record<string, string> = {
  papelaria:     'Papelaria (cartão, assinatura de e-mail)',
  social:        'Templates de redes sociais',
  apresentacao:  'Template de apresentação',
  sinalizacao:   'Sinalização e ambientação',
  embalagem:     'Embalagem ou rótulo',
  merchandising: 'Merchandising (uniforme, brindes)',
};

function inclusions(sel: Record<string, string | string[]>): InclusionGroup[] {
  const scope = (sel.scope as string) ?? 'essencial';
  const applications = escolhasReais(sel.applications);

  const principal: string[] = [];
  if (scope === 'logo') {
    principal.push('Marca principal + variações (horizontal, vertical, monograma, reduzida)');
    principal.push('Arquivos vetoriais (SVG, PDF, PNG)');
  }
  if (scope === 'essencial') {
    principal.push('Logo + variações completas');
    principal.push('Sistema de cores (primária, secundária, neutras) com hex/RGB');
    principal.push('Tipografia escolhida pra marca (display + corpo)');
  }
  if (scope === 'completo') {
    principal.push('Logo + variações completas');
    principal.push('Paleta de cores e sistema tipográfico completos');
    principal.push('Brandbook (manual de uso, espaçamento, proporções, usos corretos e proibidos)');
    principal.push('Diretrizes de tom de voz e aplicações práticas');
  }

  const groups: InclusionGroup[] = [
    { title: 'Escopo principal', items: principal },
  ];

  if (applications.length > 0) {
    groups.push({
      title: `Aplicações (${applications.length})`,
      items: applications.map((a) => APP_LABEL[a] ?? a),
    });
  }

  groups.push({
    title: 'Entrega final',
    items: ['Arquivos editáveis vetoriais', 'PDF do brandbook pronto pra equipe usar', 'Sem dependência de software pago'],
  });

  return groups;
}

function reportTitle(sel: Record<string, string | string[]>): string {
  const scope = (sel.scope as string) ?? 'essencial';
  const stage = (sel.stage as string) ?? 'nova';
  if (stage === 'rebrand') return 'Seu rebrand';
  if (scope === 'logo')      return 'Sua marca essencial';
  if (scope === 'completo')  return 'Seu brandbook completo';
  return 'Sua identidade essencial';
}

export const brandbookPricingSchema: PricingSchema = {
  serviceTag: 'brandbook',
  copy: {
    eyebrow: 'Sua identidade',
    revealTitle: 'É isso que você precisa?',
    revealSubtitle:
      'Confira o que anotamos. A gente volta com a proposta e o valor conforme o escopo, numa conversa rápida.',
    submitLabel: 'Enviar para a Notkode',
  },
  fields: [
    {
      id: 'scope',
      type: 'single',
      label: 'Qual o escopo da identidade?',
      hint: 'Selecione o pacote que mais se aproxima do que precisa.',
      default: 'essencial',
      options: [
        { value: 'logo',      label: 'Apenas logo',       hint: 'Marca principal + variações' },
        { value: 'essencial', label: 'Essencial',         hint: 'Logo + paleta + tipografia' },
        { value: 'completo',  label: 'Brandbook completo',hint: 'Manual de marca + aplicações' },
      ],
    },
    {
      id: 'stage',
      type: 'single',
      label: 'Marca nova ou rebrand?',
      hint: 'Rebrand exige alinhamento com a equipe e referências existentes.',
      default: 'nova',
      options: [
        { value: 'nova',     label: 'Marca nova',  hint: 'Empresa começando agora' },
        { value: 'rebrand',  label: 'Rebrand',     hint: 'Revisar identidade existente' },
      ],
    },
    {
      id: 'applications',
      type: 'multi',
      label: 'Quais aplicações você quer incluir?',
      hint: 'Aplicações entregues prontas para uso.',
      default: [],
      min: 1,
      options: [
        { value: 'papelaria',     label: 'Papelaria (cartão, assinatura e-mail)' },
        { value: 'social',        label: 'Templates de redes sociais' },
        { value: 'apresentacao',  label: 'Template de apresentação' },
        { value: 'sinalizacao',   label: 'Sinalização / ambientação' },
        { value: 'embalagem',     label: 'Embalagem ou rótulo' },
        { value: 'merchandising', label: 'Merchandising (uniforme, brindes)' },
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
