/** Opção de empresa para o autocomplete do formulário de negócio. */
export type OrgOption = { id: string; name: string };

/** Normaliza nome de empresa para comparação: minúsculas, sem acentos, espaços colapsados. */
export function normalizeOrgName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}
