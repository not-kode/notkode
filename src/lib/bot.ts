// Detecção de robôs pelo user agent, usada na ingestão de analytics (/api/track)
// e de gravações (/api/rec). Crawlers e previews de link executam o site por ~1s
// e poluíam as Sessões e as métricas de visita com "sessões de 0s".
// Agentes de IA e clientes HTTP entram nomeados: a palavra "bot" pega GPTBot,
// ClaudeBot e PerplexityBot, mas os agentes que buscam a página a pedido de um
// usuário (ChatGPT-User, Claude-User, Perplexity-User) e as bibliotecas de
// requisição (curl, python-requests, axios) não têm "bot" no nome e passavam como
// visita de gente.
const BOT_RE =
  /bot|crawl|spider|slurp|headlesschrome|phantomjs|lighthouse|pingdom|uptimerobot|gtmetrix|facebookexternalhit|meta-externalagent|meta-externalfetcher|whatsapp|telegrambot|skypeuripreview|linkedinbot|twitterbot|discordbot|slackbot|embedly|vercel-screenshot|vercelbot|bytespider|petalbot|semrush|ahrefs|mj12bot|dotbot|applebot|amazonbot|yandex|baiduspider|duckduckbot|bingpreview|chatgpt-user|oai-searchbot|claude-user|claude-searchbot|anthropic-ai|perplexity|google-extended|cohere-ai|firecrawl|scrapy|python-requests|python-urllib|aiohttp|httpx|node-fetch|axios|got |okhttp|go-http-client|java\/|libwww-perl|wget|curl/i;

/** true quando o user agent é de robô conhecido (ou está vazio, o que browser real não faz). */
export function isBotUA(ua: string | null): boolean {
  if (!ua || !ua.trim()) return true;
  return BOT_RE.test(ua);
}
