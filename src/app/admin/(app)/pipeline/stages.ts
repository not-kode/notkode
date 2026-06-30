// Constantes compartilhadas do pipeline. Módulo "normal" (sem 'use server')
// para poder ser importado tanto por server actions quanto por client components.

export const DEAL_STAGES = [
  'novo',
  'qualificado',
  'diagnostico',
  'proposta',
  'negociacao',
  'ganho',
  'perdido',
] as const;

export type DealStage = (typeof DEAL_STAGES)[number];

export const STAGE_LABELS: Record<DealStage, string> = {
  novo: 'Novo',
  qualificado: 'Qualificado',
  diagnostico: 'Diagnóstico',
  proposta: 'Proposta',
  negociacao: 'Negociação',
  ganho: 'Ganho',
  perdido: 'Perdido',
};
