/** Contato principal de uma empresa, para preencher o formulário automaticamente. */
export type OrgContact = { id: string; name: string | null; email: string | null; whatsapp: string | null };

/** Opção de empresa para o autocomplete do formulário de negócio. */
export type OrgOption = { id: string; name: string; contact: OrgContact | null };

/** Produto/serviço vindo da tabela products (editável pelo sistema). */
export type Product = { key: string; name: string; active: boolean };

/** Normaliza nome de empresa para comparação: minúsculas, sem acentos, espaços colapsados. */
export function normalizeOrgName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}
