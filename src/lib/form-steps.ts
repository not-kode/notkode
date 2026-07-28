// Rótulos das etapas dos formulários do site, usados por dois lados:
// os formulários (ao emitir o evento form_step) e o dashboard (ao desenhar o funil).
// Ficar num módulo só evita o que acontecia antes: cada formulário nomeava a etapa
// do seu jeito (um mandava a pergunta inteira, outro um rótulo curto) e a tela do
// admin ficava com duas linguagens misturadas.

/**
 * Versão da SEQUÊNCIA de etapas. Sobe de número toda vez que a ordem ou a
 * composição das etapas muda. Sem isso, medição velha e nova caem na mesma
 * posição do funil e o painel mostra uma ordem que não é a do formulário de hoje.
 *
 * v1 → contato no fim (até 28/07/2026)
 * v2 → contato na primeira etapa, nos dois formulários
 */
export const FORM_VERSION = 2;

/** Rótulo curto por etapa. A chave é o id do campo no schema do formulário. */
const LABELS: Record<string, string> = {
  contato: 'Contato',
  necessidades: 'Necessidades',
  prazo: 'Prazo',
  proposta: 'Proposta',
  // campos dos formulários de orçamento
  type: 'Tipo',
  size: 'Tamanho',
  needs: 'Requisitos',
  urgency: 'Prazo',
  catalog: 'Catálogo',
  integrations: 'Integrações',
  scope: 'Escopo',
  stage: 'Estágio',
  applications: 'Aplicações',
  channels: 'Canais',
};

/** Rótulo curto de uma etapa; id desconhecido vira o próprio id capitalizado. */
export function stepLabel(id: string): string {
  return LABELS[id] ?? id.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Label do evento form_step: "Orçamento::v2::1::Contato". */
export function stepEventLabel(form: string, position: number, id: string): string {
  return `${form}::v${FORM_VERSION}::${position}::${stepLabel(id)}`;
}

export type ParsedStep = { form: string; version: number; pos: number; name: string };

/**
 * Lê o label do evento. Aceita o formato antigo de 3 partes ("Orçamento::1::Prazo"),
 * tratado como v1, para o histórico não sumir do painel.
 */
export function parseStepEventLabel(label: string | null): ParsedStep | null {
  const parts = (label ?? '').split('::');
  if (parts.length === 4 && /^v\d+$/.test(parts[1])) {
    return { form: parts[0], version: Number(parts[1].slice(1)), pos: Number(parts[2]), name: parts[3] };
  }
  if (parts.length === 3) return { form: parts[0], version: 1, pos: Number(parts[1]), name: parts[2] };
  return null;
}
