/**
 * De onde a pessoa clicou, escrito na própria mensagem do WhatsApp.
 *
 * O clique em WhatsApp vira evento no nosso analytics, mas o link abre uma
 * conversa qualquer no celular: não há nada que ligue aquele clique a esta
 * conversa. Então a origem viaja no único lugar que chega junto com a pessoa —
 * o texto que ela envia.
 *
 * O rótulo sai do próprio caminho da página, com nome à mão só para as rotas
 * que têm nome comercial. Rota nova que ninguém lembrar de cadastrar aqui
 * aparece humanizada ("agentes-automacao" → "Agentes automacao"), que é pior
 * que o nome certo e muito melhor que nada.
 */

const ROTULOS: Record<string, string> = {
  '': 'Home',
  'sistemas-ia': 'Sistemas com IA',
  sites: 'Sites',
  'agentes-automacao': 'Agentes & Automação',
  ecommerce: 'E-commerce',
  identidade: 'Identidade & Brandbook',
  brandbook: 'Identidade & Brandbook',
  manutencao: 'Plano de Manutenção',
  apps: 'Apps',
  sobre: 'Sobre',
  parcerias: 'Parcerias',
  servicos: 'Serviços',
};

/** Tira o locale do começo do caminho: "/pt/sistemas-ia" → "sistemas-ia". */
function semLocale(pathname: string): string {
  const partes = pathname.split('/').filter(Boolean);
  if (partes.length && /^[a-z]{2}$/.test(partes[0])) partes.shift();
  return partes.join('/');
}

function humanizar(slug: string): string {
  const s = slug.replace(/-/g, ' ').trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Home';
}

/** Nome legível da página, para entrar na mensagem do WhatsApp. */
export function rotuloDaPagina(pathname: string): string {
  const caminho = semLocale(pathname);
  if (ROTULOS[caminho]) return ROTULOS[caminho];

  // Página de app ("apps/fala-que-eu-te-escuto"): o que importa é qual app.
  const partes = caminho.split('/').filter(Boolean);
  if (partes.length > 1) return `${ROTULOS[partes[0]] ?? humanizar(partes[0])} · ${humanizar(partes[partes.length - 1])}`;
  return humanizar(caminho);
}

/**
 * Link do WhatsApp com a mensagem já escrita: o texto de sempre mais a linha de
 * origem. `numero` sem sinais, só dígitos.
 */
export function whatsappHref(numero: string, mensagem: string, origem: string): string {
  const texto = origem ? `${mensagem}\n\n${origem}` : mensagem;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}
