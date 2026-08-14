/**
 * Validação de contato do lead, compartilhada pelo formulário e pela /api/lead.
 *
 * Estava duplicada nos dois formulários, e frouxa: o e-mail passava com qualquer coisa
 * antes e depois do @, e o WhatsApp só contava dígitos. Como o contato é a primeira
 * etapa e o único jeito de retornar para quem preencheu, dado torto aqui é lead perdido.
 */

/** Só os dígitos, no máximo os 11 de um celular brasileiro com DDD. */
export function digitosDoTelefone(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 11);
}

/** (11) 99999-9999 conforme a pessoa digita. */
export function formatarWhatsapp(raw: string): string {
  const d = digitosDoTelefone(raw);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// DDDs que existem de verdade. Sem isto, (00) 00000-0000 passava batido.
const DDDS_VALIDOS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19,
  21, 22, 24, 27, 28,
  31, 32, 33, 34, 35, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48, 49,
  51, 53, 54, 55,
  61, 62, 63, 64, 65, 66, 67, 68, 69,
  71, 73, 74, 75, 77, 79,
  81, 82, 83, 84, 85, 86, 87, 88, 89,
  91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

/**
 * Aceita celular (11 dígitos, com o 9 na frente do número) e fixo (10 dígitos, começando
 * de 2 a 5). Recusa DDD inexistente e sequências do tipo (11) 11111-1111.
 */
export function whatsappValido(raw: string): boolean {
  const d = digitosDoTelefone(raw);
  if (d.length !== 10 && d.length !== 11) return false;
  if (!DDDS_VALIDOS.has(Number(d.slice(0, 2)))) return false;
  if (/^(\d)\1+$/.test(d)) return false;
  const numero = d.slice(2);
  if (d.length === 11) return numero.startsWith('9');
  return /^[2-5]/.test(numero);
}

/**
 * Formato de e-mail sem frouxidão: um @, domínio com ponto, TLD de 2+ letras, sem espaço,
 * sem ponto duplicado e sem ponto colado no @.
 */
export function emailValido(raw: string): boolean {
  const v = raw.trim();
  if (!v || v.length > 254) return false;
  if (v.includes('..') || v.startsWith('.') || v.includes('.@') || v.includes('@.')) return false;
  return /^[^\s@]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/i.test(v);
}

// Erro de digitação que a gente vê no dia a dia. Não bloqueia, só sugere o certo.
const DOMINIOS_PARECIDOS: Record<string, string> = {
  'gmail.con': 'gmail.com', 'gmail.co': 'gmail.com', 'gmai.com': 'gmail.com',
  'gmial.com': 'gmail.com', 'gmail.com.br': 'gmail.com', 'gnail.com': 'gmail.com',
  'hotmail.con': 'hotmail.com', 'hotmial.com': 'hotmail.com', 'hotmail.co': 'hotmail.com',
  'outlook.con': 'outlook.com', 'outlok.com': 'outlook.com',
  'yahoo.con': 'yahoo.com', 'iclod.com': 'icloud.com', 'icloud.con': 'icloud.com',
  'uol.com': 'uol.com.br', 'bol.com': 'bol.com.br', 'terra.com': 'terra.com.br',
};

/** Devolve o e-mail corrigido quando o domínio parece erro de digitação, senão null. */
export function sugestaoDeEmail(raw: string): string | null {
  const v = raw.trim().toLowerCase();
  const at = v.lastIndexOf('@');
  if (at < 1) return null;
  const certo = DOMINIOS_PARECIDOS[v.slice(at + 1)];
  return certo ? `${v.slice(0, at)}@${certo}` : null;
}
