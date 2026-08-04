// Peças comuns às métricas de site: rótulo de serviço e classificação de origem.
// Ficam aqui porque o Dashboard (origem das visitas, leads por serviço) e a aba
// Formulários do Analytics (de onde veio quem chegou a cada etapa) leem a mesma
// coisa dos mesmos eventos — duas cópias divergiriam na primeira mudança.

export const SERVICE_LABELS: Record<string, string> = {
  'sistemas-ia': 'Sistema com IA', 'sites': 'Site / Landing Page',
  'agentes-automacao': 'Agentes & Automação', 'ecommerce': 'E-commerce',
  'identidade': 'Identidade & Brandbook', 'manutencao': 'Plano de Manutenção',
};

/** Nome da página/serviço para leitura humana; sem rótulo conhecido, arruma o slug. */
export const prettyService = (s: string) =>
  SERVICE_LABELS[s] ?? s.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// Classifica a origem de uma visita a partir do utm_source (prioritário) e, na
// falta, do host do referrer de entrada. Sem referrer externo → "Direto".
const HOST_SOURCES: [test: (h: string) => boolean, label: string][] = [
  [(h) => h.includes('google'), 'Google'],
  [(h) => h.includes('instagram') || h === 'ig', 'Instagram'],
  [(h) => h.includes('facebook') || h === 'fb.me', 'Facebook'],
  [(h) => h.includes('linkedin') || h === 'lnkd.in', 'LinkedIn'],
  [(h) => h === 't.co' || h.includes('twitter') || h === 'x.com', 'X (Twitter)'],
  [(h) => h.includes('bing'), 'Bing'],
  [(h) => h.includes('duckduckgo'), 'DuckDuckGo'],
  [(h) => h.includes('youtube'), 'YouTube'],
  [(h) => h.includes('whatsapp') || h === 'wa.me', 'WhatsApp'],
];

export function classifySource(referrer: string | null, utmSource: string | null): string {
  if (utmSource) {
    const s = utmSource.toLowerCase();
    if (s.includes('insta') || s === 'ig') return 'Instagram';
    if (s.includes('google')) return 'Google';
    if (s.includes('face') || s === 'fb') return 'Facebook';
    if (s.includes('linkedin')) return 'LinkedIn';
    if (s.includes('whats')) return 'WhatsApp';
    return utmSource;
  }
  if (!referrer) return 'Direto';
  let host: string;
  try {
    host = new URL(referrer).host.replace(/^www\./, '').toLowerCase();
  } catch {
    return 'Direto';
  }
  if (!host || host.includes('notkode')) return 'Direto';
  for (const [test, label] of HOST_SOURCES) if (test(host)) return label;
  return host;
}
