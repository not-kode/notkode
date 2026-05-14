import type { PricingSchema } from '@/components/ui/pricing-form';

const SCOPE_BASE: Record<string, [number, number]> = {
  logo:      [1200, 2500],   // só logo + variações
  essencial: [2500, 5000],   // logo + paleta + tipografia
  completo:  [5000, 10000],  // brandbook completo + aplicações
};

const PER_APPLICATION = 450;

const URGENCY_MULT: Record<string, number> = {
  normal:   1.0,
  rapido:   1.2,
  urgente:  1.45,
};

function calc(sel: Record<string, string | string[]>): [number, number] {
  const scope = (sel.scope as string) ?? 'essencial';
  const applications = (sel.applications as string[]) ?? [];
  const stage = (sel.stage as string) ?? 'nova';
  const urgency = (sel.urgency as string) ?? 'normal';

  const [baseMin, baseMax] = SCOPE_BASE[scope] ?? SCOPE_BASE.essencial;
  const appsCost = applications.length * PER_APPLICATION;
  // rebrand (revisão de marca) costuma exigir alinhamento extra: +10%
  const stageMult = stage === 'rebrand' ? 1.1 : 1.0;
  const urgMult = URGENCY_MULT[urgency] ?? 1;

  const min = Math.round((baseMin + appsCost) * stageMult * urgMult);
  const max = Math.round((baseMax + appsCost * 1.4) * stageMult * urgMult);
  return [min, max];
}

export const brandbookPricingSchema: PricingSchema = {
  serviceTag: 'brandbook',
  copy: {
    eyebrow: 'Orçamento de Identidade',
    revealTitle: 'Investimento estimado',
    revealSubtitle:
      'Faixa preliminar baseada nas suas escolhas. Para receber a proposta detalhada e o cronograma, deixe seu contato.',
    submitLabel: 'Receber proposta',
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
      hint: 'Tudo opcional. Aplicações entregues prontas para uso.',
      default: [],
      min: 0,
      options: [
        { value: 'papelaria',     label: 'Papelaria (cartão, assinatura e-mail)' },
        { value: 'social',        label: 'Templates de redes sociais' },
        { value: 'apresentacao',  label: 'Template de apresentação' },
        { value: 'sinalizacao',   label: 'Sinalização / ambientação' },
        { value: 'embalagem',     label: 'Embalagem ou rótulo' },
        { value: 'merchandising', label: 'Merchandising (uniforme, brindes)' },
      ],
    },
    {
      id: 'urgency',
      type: 'single',
      label: 'Qual o prazo?',
      default: 'normal',
      options: [
        { value: 'normal',  label: 'Normal',  hint: '3–4 semanas' },
        { value: 'rapido',  label: 'Rápido',  hint: '2–3 semanas' },
        { value: 'urgente', label: 'Urgente', hint: 'até 2 semanas' },
      ],
    },
  ],
  calc,
};
