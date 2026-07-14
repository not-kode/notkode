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

// Estágios que viram COLUNAS no funil. Ganho/perdido são desfechos (tags), não colunas.
export const PIPELINE_STAGES = [
  'novo',
  'qualificado',
  'diagnostico',
  'proposta',
  'negociacao',
] as const satisfies readonly DealStage[];

export const STAGE_LABELS: Record<DealStage, string> = {
  novo: 'Novo',
  qualificado: 'Qualificado',
  diagnostico: 'Diagnóstico',
  proposta: 'Proposta',
  negociacao: 'Negociação',
  ganho: 'Ganho',
  perdido: 'Perdido',
};

// Produto/serviço do negócio (service_tag). Fonte única usada no modal de criação
// e no drawer de edição. value = o que grava no deal; label = texto legível.
export const SERVICE_TAGS = [
  'sistemas-ia', 'sites', 'agentes-automacao', 'ecommerce', 'identidade', 'manutencao',
] as const;

export type ServiceTag = (typeof SERVICE_TAGS)[number];

export const SERVICE_LABELS: Record<ServiceTag, string> = {
  'sistemas-ia': 'Sistema com IA',
  'sites': 'Site / Landing Page',
  'agentes-automacao': 'Agentes & Automação',
  'ecommerce': 'E-commerce',
  'identidade': 'Identidade & Brandbook',
  'manutencao': 'Plano de Manutenção',
};
